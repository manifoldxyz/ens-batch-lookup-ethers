import { Interface } from '@ethersproject/abi';
import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { dnsEncode, namehash } from '@ethersproject/hash';
import { BaseProvider } from '@ethersproject/providers';
import {
  ENS_REGISTRY_ABI,
  ENS_REGISTRY_ADDRESS,
  EXTENDED_RESOLVER_ABI,
  NAME_RESOLVER_ABI,
  REVERSE_NODE_NAME,
  REVERSE_RECORDS_ABI,
  REVERSE_RECORDS_ADDRESS_MAP,
} from './constants';

/**
 * Resolve ENSIP-19 `default.reverse` primary names.
 *
 * The ReverseRecords contract only reads the legacy `<addr>.addr.reverse` namespace. Since
 * ENSIP-19 (final, Aug 2025) an account can instead set a single primary name under
 * `<addr>.default.reverse` covering mainnet and every L2 — and that is now the default flow in
 * the ENS manager app. Those accounts resolve to nothing under the legacy lookup.
 *
 * `default.reverse` is not a plain registry entry: it is served by an ENSIP-10 wildcard
 * resolver registered at the `reverse` node.
 *
 * @see https://docs.ens.domains/ensip/19
 */
async function lookupDefaultReverseNames(
  provider: BaseProvider,
  addresses: string[]
): Promise<{ [address: string]: string }> {
  const results: { [address: string]: string } = {};
  if (!addresses.length) return results;

  const registry = new Contract(ENS_REGISTRY_ADDRESS, ENS_REGISTRY_ABI, provider);
  const wildcardResolverAddress: string = await registry.resolver(namehash(REVERSE_NODE_NAME));
  if (!wildcardResolverAddress || wildcardResolverAddress === AddressZero) {
    // No wildcard resolver registered on this network — nothing to fall back to.
    return results;
  }

  const wildcardResolver = new Contract(wildcardResolverAddress, EXTENDED_RESOLVER_ABI, provider);
  const nameInterface = new Interface(NAME_RESOLVER_ABI);

  const resolved = await Promise.all(
    addresses.map(async (address) => {
      try {
        const reverseName = `${address.toLowerCase().replace(/^0x/, '')}.default.reverse`;
        const callData = nameInterface.encodeFunctionData('name', [namehash(reverseName)]);

        const encoded: string = await wildcardResolver.resolve(dnsEncode(reverseName), callData);
        const [name] = nameInterface.decodeFunctionResult('name', encoded);
        if (!name) return null;

        // ENSIP-19 steps 7-10: a reverse record is only a claim. The name is the primary name
        // if and only if it forward-resolves back to the same address. Without this check a
        // caller could display a name the account does not own. ReverseRecords performs the
        // equivalent verification internally, so skipping it here would make this fallback
        // weaker than the path it extends.
        const forward = await provider.resolveName(name);
        if (!forward || forward.toLowerCase() !== address.toLowerCase()) return null;

        return { address, name };
      } catch {
        // Per-address failure is non-critical; report no name for this one.
        return null;
      }
    })
  );

  for (const entry of resolved) {
    if (entry) {
      results[entry.address] = entry.name;
    }
  }

  return results;
}

/**
 * Resolve ENS primary names for a batch of addresses.
 *
 * Reads the legacy `addr.reverse` namespace in a single batched call, then falls back to an
 * ENSIP-19 `default.reverse` lookup for any address that came back empty.
 *
 * @param provider  - an ethers v5 provider
 * @param addresses - addresses to resolve
 * @returns           names positionally matching `addresses`; `null` where no verified
 *                    primary name exists
 */
export async function lookupAddresses(
  provider: BaseProvider,
  addresses: string[] | Promise<string[]>
): Promise<(string | null)[]> {
  const network = await provider.getNetwork();
  const reverseRecordsAddress = REVERSE_RECORDS_ADDRESS_MAP[network.chainId];

  if (!network.ensAddress || !reverseRecordsAddress) {
    throw new Error('Unsupported network');
  }

  const reverseRecordsContract = new Contract(reverseRecordsAddress, REVERSE_RECORDS_ABI, provider);

  addresses = await addresses;
  addresses = addresses.map((address) => getAddress(address));

  const names: string[] = await reverseRecordsContract.getNames(addresses);

  // Addresses with no legacy record may still have an ENSIP-19 default primary name.
  const unresolved = addresses.filter((_address, i) => !names[i]);
  let defaultReverseNames: { [address: string]: string } = {};
  if (unresolved.length) {
    try {
      defaultReverseNames = await lookupDefaultReverseNames(provider, unresolved);
    } catch {
      // Non-critical: fall through and report no name for these addresses.
    }
  }

  return addresses.map((address, i) => names[i] || defaultReverseNames[address] || null);
}

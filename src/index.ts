import { getAddress } from '@ethersproject/address';
import { Contract } from '@ethersproject/contracts';
import { namehash } from '@ethersproject/hash';
import { Provider } from '@ethersproject/providers';
import { BATCH_LOOKUP_ABI, BATCH_LOOKUP_ADDRESS_MAP } from './constants';

export async function lookupAddresses(provider: Provider, addresses: string[]) {
  const network = await provider.getNetwork();
  const ensAddress = network.ensAddress;
  const batchLookupAddress = BATCH_LOOKUP_ADDRESS_MAP[network.chainId];

  if (!network.ensAddress || !batchLookupAddress) {
    throw new Error('Unsupported network');
  }

  const batchContract = new Contract(batchLookupAddress, BATCH_LOOKUP_ABI, provider);

  addresses = await addresses;
  addresses = addresses.map((address) => getAddress(address));

  // Get resolvers for addresses
  const reverseAddressHashes = addresses.map((address) =>
    namehash(address.substring(2).toLowerCase() + '.addr.reverse')
  );
  const addressResolvers: string[] = await batchContract.resolvers(
    ensAddress,
    reverseAddressHashes
  );

  // Lookup names
  const nameLookups: any[] = [];
  for (let i = 0; i < reverseAddressHashes.length; i++) {
    nameLookups.push([addressResolvers[i], reverseAddressHashes[i]]);
  }
  const names: string[] = await batchContract.names(nameLookups);

  // Get resolvers for names
  const nameHashes = names.map((name) => namehash(name));
  const nameResolvers: string[] = await batchContract.resolvers(ensAddress, nameHashes);

  // Lookup addresses
  const addrLookups: any[] = [];
  for (let i = 0; i < nameHashes.length; i++) {
    addrLookups.push([nameResolvers[i], nameHashes[i]]);
  }
  const addrs = await batchContract.addrs(addrLookups);

  // Verify addresses match
  const validNames: any[] = [];
  for (let i = 0; i < addresses.length; i++) {
    if (addrs[i].toLowerCase() === addresses[i].toLowerCase()) {
      validNames[i] = names[i];
    } else {
      validNames[i] = null;
    }
  }

  return validNames;
}

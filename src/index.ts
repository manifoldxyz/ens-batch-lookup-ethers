import { getAddress } from '@ethersproject/address';
import { Contract } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/providers';
import { REVERSE_RECORDS_ABI, REVERSE_RECORDS_ADDRESS_MAP } from './constants';

export async function lookupAddresses(provider: Provider, addresses: string[] | Promise<string[]>) {
  const network = await provider.getNetwork();
  const reverseRecordsAddress = REVERSE_RECORDS_ADDRESS_MAP[network.chainId];

  if (!network.ensAddress || !reverseRecordsAddress) {
    throw new Error('Unsupported network');
  }

  const reverseRecordsContract = new Contract(reverseRecordsAddress, REVERSE_RECORDS_ABI, provider);

  addresses = await addresses;
  addresses = addresses.map((address) => getAddress(address));

  const names: string[] = await reverseRecordsContract.getNames(addresses);

  return names.map((name) => (name ? name : null));
}

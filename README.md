# ens-batch-lookup-ethers

This package contains a `lookupAddresses` function that can be used to resolve ENS names for a batch of addresses. This leverages ENS's [reverse records contract](https://github.com/ensdomains/reverse-records/blob/master/contracts/ReverseRecords.sol) to resolve the names in a single contract call, rather than a call per address.

## Usage
```
import { lookupAddresses } from "@manifoldxyz/ens-batch-lookup-ethers"

...

const provider = new ethers.providers.JsonRpcProvider(...)
const addresses = ['0xFoo', '0xBar', ...]
const ensNames = lookupAddresses(provider, addresses)
```

# ens-batch-lookup-ethers

This package contains a `lookupAddresses` function that can be used to resolve ENS primary names for a batch of addresses.

Resolution covers both reverse namespaces:

- **`<addr>.addr.reverse`** (ENSIP-3, mainnet only) — resolved via ENS's [reverse records contract](https://github.com/ensdomains/reverse-records/blob/master/contracts/ReverseRecords.sol) in a single contract call, rather than a call per address.
- **`<addr>.default.reverse`** ([ENSIP-19](https://docs.ens.domains/ensip/19), covers mainnet and every L2) — resolved through the ENSIP-10 wildcard resolver registered at the `reverse` node, for any address the batch call returned nothing for.

ENSIP-19 became final in August 2025 and is now the default flow in the ENS manager app, so a user who sets a primary name today is likely to be resolvable only through the second path.

Names are returned positionally, with `null` where no verified primary name exists. A reverse record is only a claim, so every name is forward-verified — it must resolve back to the same address before being returned. Addresses that fail this check are reported as `null`.

## Usage
```
import { lookupAddresses } from "@manifoldxyz/ens-batch-lookup-ethers"

...

const provider = new ethers.providers.JsonRpcProvider(...)
const addresses = ['0xFoo', '0xBar', ...]
const ensNames = await lookupAddresses(provider, addresses)
```

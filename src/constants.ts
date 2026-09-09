export const REVERSE_RECORDS_ADDRESS_MAP = {
  1: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
  3: '0x72c33B247e62d0f1927E8d325d0358b8f9971C68',
  4: '0x196eC7109e127A353B709a20da25052617295F6f',
  5: '0x333Fc8f550043f239a2CF79aEd5e9cF4A20Eb41e',
};

export const REVERSE_RECORDS_ABI = [
  {
    inputs: [{ internalType: 'contract ENS', name: '_ens', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [{ internalType: 'address[]', name: 'addresses', type: 'address[]' }],
    name: 'getNames',
    outputs: [{ internalType: 'string[]', name: 'r', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
];

/**
 * The ENS registry. Same address on every network ENS is deployed to.
 */
export const ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';

export const ENS_REGISTRY_ABI = ['function resolver(bytes32 node) view returns (address)'];

/**
 * ENSIP-10 wildcard resolution, used to reach the `default.reverse` namespace.
 */
export const EXTENDED_RESOLVER_ABI = [
  'function resolve(bytes name, bytes data) view returns (bytes)',
];

export const NAME_RESOLVER_ABI = ['function name(bytes32 node) view returns (string)'];

/**
 * Parent node owning the ENSIP-10 wildcard resolver for the reverse namespaces.
 *
 * Note this is `reverse`, NOT `default.reverse` — the latter has no resolver of its own in
 * the registry and returns the zero address.
 */
export const REVERSE_NODE_NAME = 'reverse';

export const BATCH_LOOKUP_ADDRESS_MAP = {
  5: '0xB4c2551A9972c72AE46629Dcf871F6C3A35F1eF3',
};

export const BATCH_LOOKUP_ABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'resolver',
            type: 'address',
          },
          {
            internalType: 'bytes32',
            name: 'nameHash',
            type: 'bytes32',
          },
        ],
        internalType: 'struct BatchENSLookup.AddrLookup[]',
        name: 'lookups',
        type: 'tuple[]',
      },
    ],
    name: 'addrs',
    outputs: [
      {
        internalType: 'address[]',
        name: 'result',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'resolver',
            type: 'address',
          },
          {
            internalType: 'bytes32',
            name: 'reverseAddressHash',
            type: 'bytes32',
          },
        ],
        internalType: 'struct BatchENSLookup.NameLookup[]',
        name: 'lookups',
        type: 'tuple[]',
      },
    ],
    name: 'names',
    outputs: [
      {
        internalType: 'string[]',
        name: 'result',
        type: 'string[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'ensRegistry',
        type: 'address',
      },
      {
        internalType: 'bytes32[]',
        name: 'hashes',
        type: 'bytes32[]',
      },
    ],
    name: 'resolvers',
    outputs: [
      {
        internalType: 'address[]',
        name: 'result',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

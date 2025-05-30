// Contract ABI (consistent across chains)
export const contractABI = [
  {
    inputs: [{ internalType: "string", name: "_uniqueSignature", type: "string" }],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "string", name: "message", type: "string" }],
    name: "GMSaid",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "string", name: "message", type: "string" }],
    name: "GNSaid",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "string", name: "message", type: "string" }],
    name: "HiSaid",
    type: "event"
  },
  { inputs: [], name: "getUniqueSignature", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "sayGM", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "sayGN", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "sayHi", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "uniqueSignature", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" }
];

// Chain emojis
export const chainEmojis = {
  ink: "✨",
  base: "🌈",
  arbitrum: "💥",
  berachain: "🐻",
  bnb: "🌟",
  op: "🔥",
  soneium: "🎉",
  unichain: "🚀",
  mantle: "🪐",
  bob: "🛠️",
  sei: "🌊",
  telos: "🌐",
  polygon: "⬣",
  avax: "❄️",
  superposition: "⚛️",
  story: "📖",
  polygonzkevm: "💫",
  cronos: "⏳",
  ethereum: "Ξ",
  sonic: "🎵",
  celo: "🌿",
  etherlink: "🔗",
  zircuit: "⚡️",
  expanse: "🌍",
  degen: "😈",
  hyperevm: "🌌",
  fraxtal: "💎",
  superseed: "🌱",
  swanchain: "🦢"
};

// Chain display names
export const displayNames = {
  ink: "Ink",
  base: "Base",
  arbitrum: "Arbitrum",
  berachain: "Berachain",
  bnb: "BNB",
  op: "OP",
  soneium: "Soneium",
  unichain: "Unichain",
  mantle: "Mantle",
  bob: "BOB",
  sei: "Sei",
  telos: "Telos",
  polygon: "Polygon",
  avax: "AVAX",
  superposition: "Superposition",
  story: "Story",
  polygonzkevm: "PolygonZK",
  cronos: "Cronos",
  ethereum: "Ethereum",
  sonic: "Sonic",
  celo: "Celo",
  etherlink: "Etherlink",
  zircuit: "Zircuit",
  expanse: "Expanse",
  degen: "Degen",
  hyperevm: "HyperEVM",
  fraxtal: "Fraxtal",
  superseed: "Superseed",
  swanchain: "Swanchain"
};

// Chain configurations
export const chains = {
  ink: { chainId: 57073, address: "0xaAeb1abf363615E8676EAB48f5d08E3FCE70dBe0", abi: contractABI },
  base: { chainId: 8453, address: "0xc7C32Af9cE7dB3e06638761ee6691AD95419a69C", abi: contractABI },
  arbitrum: { chainId: 42161, address: "0xC738E5886706C58E73eaa28a8e9Ed631F8868331", abi: contractABI },
  berachain: { chainId: 80094, address: "0x616e666f49C2651A1028f774c9f4fF4C27524Dc5", abi: contractABI },
  bnb: { chainId: 56, address: "0x6fbe16D026Cda317507D426Fc4C28CE3b3A8f93A", abi: contractABI },
  op: { chainId: 10, address: "0x39b1c43Da4840877c0cDfc2Afc854952c27F28B3", abi: contractABI },
  soneium: { chainId: 1868, address: "0x52301b0437E168f0af1d8b13fF578F2cbC357CdF", abi: contractABI },
  unichain: { chainId: 130, address: "0xDb028404288330CDC7641add7531ed495b5dAFab", abi: contractABI },
  mantle: { chainId: 5000, address: "0xfC2444c375499330cA99CDc54fD7866c23768299", abi: contractABI },
  bob: { chainId: 60808, address: "0x704D2431dE69f72D238B8AD1014901636eD0AF3D", abi: contractABI },
  sei: { chainId: 1329, address: "0x710593070a91C52786A111a26AD6436B846cc561", abi: contractABI },
  telos: { chainId: 40, address: "0x899C8D339CcABa7C1260453419e8a661f1df5F2C", abi: contractABI },
  polygon: { chainId: 137, address: "0x252294F81C909c90291e002e95894DdF020ca2d5", abi: contractABI },
  avax: { chainId: 43114, address: "0x901C4523CdDEb0A7EA8104Cb0454708dfb0142c5", abi: contractABI },
  superposition: { chainId: 55244, address: "0x25e86c4547C526a4D4eC04E808be561B13078013", abi: contractABI },
  story: { chainId: 1514, address: "0x8654507A3e06c41BD5eF53c9B76452949511eB41", abi: contractABI },
  polygonzkevm: { chainId: 1101, address: "0xf2Ab98c7EE971f9B9eb612e1501fefA2fB087F82", abi: contractABI },
  cronos: { chainId: 25, address: "0xD34418c860ADdBB614Ccfe836D889B5C93817891", abi: contractABI },
  ethereum: { chainId: 1, address: "0x1C658890D050C4d0159CBc8C30e804Bf0807D443", abi: contractABI },
  sonic: { chainId: 146, address: "0x68659df332eca683b9a64cef777f9ec799f2d9bf", abi: contractABI },
  celo: { chainId: 42220, address: "0x5D4b404ad61A5d66c389d46781Ae407824536b90", abi: contractABI },
  etherlink: { chainId: 42793, address: "0x85bF0e5C33b6927266fDDe48c56DE358d7f6b3Fa", abi: contractABI },
  zircuit: { chainId: 48900, address: "0x49351058EB55f54B1ed1Dd4855c2Cf274EED484c", abi: contractABI },
  expanse: { chainId: 2, address: "0xfcd96b0033ce5433a7550e59e8ab628f2564f01d", abi: contractABI },
  degen: { chainId: 666666666, address: "0x2D2f709A6a4A808Bc379e27C6e17F8C1700A6821", abi: contractABI },
  hyperevm: { chainId: 999, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  fraxtal: { chainId: 252, address: "0x6a1a98510a2eb1181cc9759bE96495118c1790F1", abi: contractABI },
  superseed: { chainId: 5330, address: "0x3eeBF0A07e3833B4dF5042aF0E12854921938Bc1", abi: contractABI },
  swanchain: { chainId: 254, address: "0x2D2f709A6a4A808Bc379e27C6e17F8C1700A6821", abi: contractABI }
};

// Block explorer URLs
export const explorerUrls = {
  ink: "https://explorer.inkonchain.com/",
  base: "https://basescan.org/tx/",
  arbitrum: "https://arbiscan.io/tx/",
  berachain: "https://berascan.com/",
  bnb: "https://bscscan.com/",
  op: "https://optimistic.etherscan.io/",
  soneium: "https://soneium.blockscout.com/",
  unichain: "https://unichain.blockscout.com/",
  mantle: "https://mantlescan.xyz/tx/",
  bob: "https://explorer.gobob.xyz/tx/",
  sei: "https://seitrace.com/tx/?chain=pacific-1",
  telos: "https://www.teloscan.io/tx/",
  polygon: "https://polygonscan.com/tx/",
  avax: "https://snowtrace.io/tx/",
  superposition: "https://explorer.superposition.so/tx/",
  story: "https://explorer.story.network/tx/",
  polygonzkevm: "https://zkevm.polygonscan.com/tx/",
  cronos: "", // Placeholder until explorer URL is provided
  ethereum: "https://etherscan.io/tx/",
  sonic: "https://sonicscan.org/",
  celo: "https://celo.blockscout.com/",
  etherlink: "https://explorer.etherlink.com/tx/",
  zircuit: "https://explorer.zircuit.com/tx/",
  expanse: "https://explorer.expanse.tech/tx/",
  degen: "https://explorer.degen.tips/tx/",
  hyperevm: "https://purrsec.com/tx/",
  fraxtal: "https://fraxscan.com/tx/"
}; 
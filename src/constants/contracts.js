// Contract ABI for SayHi contract
export const SAYHI_CONTRACT_ABI = [
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
  { 
    inputs: [], 
    name: "getUniqueSignature", 
    outputs: [{ internalType: "string", name: "", type: "string" }], 
    stateMutability: "view", 
    type: "function" 
  },
  { 
    inputs: [], 
    name: "sayGM", 
    outputs: [], 
    stateMutability: "nonpayable", 
    type: "function" 
  },
  { 
    inputs: [], 
    name: "sayGN", 
    outputs: [], 
    stateMutability: "nonpayable", 
    type: "function" 
  },
  { 
    inputs: [], 
    name: "sayHi", 
    outputs: [], 
    stateMutability: "nonpayable", 
    type: "function" 
  },
  { 
    inputs: [], 
    name: "uniqueSignature", 
    outputs: [{ internalType: "string", name: "", type: "string" }], 
    stateMutability: "view", 
    type: "function" 
  }
]; 
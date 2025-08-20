import dotenv from 'dotenv';
dotenv.config();


export const chainConfig = {
  1: { // Ethereum Mainnet
    rpcUrl: process.env.ETH_RPC,
    contractAddress: "0x0318707ae4fab3a921ab9497baf996c3c7b5e505"
  },
  56: { // BNB Smart Chain
    rpcUrl: process.env.BSC_RPC,
    contractAddress: "0x459fff3c70c99eb48622ce1fb8ef6a1adccbdffe"
  },
  137: { // Polygon PoS
    rpcUrl: process.env.POLYGON_RPC,
    contractAddress: "0x0318707ae4fab3a921ab9497baf996c3c7b5e505"
  },
  42161: { // Arbitrum One
    rpcUrl: process.env.ARBITRUM_RPC,
    contractAddress: "0x0318707ae4fab3a921ab9497baf996c3c7b5e505"
  },
  8453: { // Base
    rpcUrl: process.env.BASE_RPC,
    contractAddress: "0x0318707ae4fab3a921ab9497baf996c3c7b5e505"
  },
  324: { // zkSync Era
    rpcUrl: process.env.ZKSYNC_RPC,
    contractAddress: "0x0318707ae4fab3a921ab9497baf996c3c7b5e505"
  }
};


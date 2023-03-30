// src/config.ts
import fetch from "node-fetch";
import { AddressConfiguration, AddressConfigurationInput, NetworkConfigurations } from "./types";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import erc20Abi from "./erc20Abi.json"; // Make sure you have the ERC20 ABI JSON file in your project


const API_URL = 'https://api-leaderboard.dev.svcs.ferrumnetwork.io/api/v1/currencies/token/data';

const tokenContractAddress = "0xa719b8ab7ea7af0ddb4358719a34631bb79d15dc";
const chainId = 56;

interface ChainIdToNetwork {
  [key: string]: {
    jsonRpcUrl: string;
    name: string;
  };
}

export const chainIdToNetworkMap: ChainIdToNetwork = {
  "1": {
    jsonRpcUrl: "https://nd-770-685-838.p2pify.com/e30d3ea257d1588823179ce4d5811a61",
    name: "Ethereum"
  },
  "56": {
    jsonRpcUrl: "https://nd-605-906-592.p2pify.com/df9065025f5e18317e708040b1f2ab13",
    name: "BSC"
  },
  "137": {
    jsonRpcUrl: "https://nd-662-671-431.p2pify.com/72aea5a70bbd5482f9a498540072b1e1",
    name: "Polygon"
  },
  "42161": {
    jsonRpcUrl: "https://nd-674-145-610.p2pify.com/bc9acaa6f1386224186fb1e794c40c14",
    name: "Arbitrum One"
  },
  "43114": {
    jsonRpcUrl: "https://nd-900-134-973.p2pify.com/0a4e07e77ebc245f0bf7839745b4803b/ext/bc/C/rpc",
    name: "Avalanche"
  }
};

interface ApiResponse {
  body: {
    currencyAddressesByNetworks: {
      network: {
        chainId: string;
      };
      tokenContractAddress: string;
    }[];
  };
}

async function getNetworkConfigurations(): Promise<NetworkConfigurations> {
  const url = `${API_URL}?tokenContractAddress=${tokenContractAddress}&chainId=${chainId}&offset=0`;
  const response = await fetch(url);
  const data: ApiResponse = await response.json();

  const networks: NetworkConfigurations = {};

  for (const item of data.body.currencyAddressesByNetworks) {
    const network = chainIdToNetworkMap[item.network.chainId];
    if (network) {
      networks[network.name] = {
        jsonRpcUrl: network.jsonRpcUrl,
        tokenContractAddress: item.tokenContractAddress,
        chainId: item.network.chainId
      };
    }
  }
  return networks;
}

const nonCirculatingSupplyAddressesConfigInput: AddressConfigurationInput[] = [
  {
    name: "Deployer",
    address: "0xc2fdcb728170192c72ada2c08957f2e9390076b7",
    chainId: "1"
  },
  {
    name: "Treasury",
    address: "0x517873ca1edaaa0f6403a0dab2cb0162433de9d1",
    chainId: "56"
  },
  {
    name: "Deployer",
    address: "0xc2fdcb728170192c72ada2c08957f2e9390076b7",
    chainId: "137"
  },
  {
    name: "Deployer",
    address: "0xc2fdcb728170192c72ada2c08957f2e9390076b7",
    chainId: "43114"
  },
  // {
  //   name: "Deployer",
  //   address: "bnb1um8ntkgwle8yrdk0yn5hwdf7hckjpyjjg29k2p",
  //   chainId: "bnbBeaconChain"
  // },
  {
    name: "Treasury",
    address: "0xe42b80dA58ccEAbe0A6ECe8e3311AE939Ef6b96c",
    chainId: "42161"
  },
  {
    name: "Bridge Pool",
    address: "0x8e01cc26d6dd73581347c4370573ce9e59e74802",
    chainId: "1"
  },
  {
    name: "Bridge Pool",
    address: "0x8e01cc26d6dd73581347c4370573ce9e59e74802",
    chainId: "56"
  },
  {
    name: "Bridge Pool",
    address: "0x8e01cc26d6dd73581347c4370573ce9e59e74802",
    chainId: "137"
  },
  {
    name: "Bridge Pool",
    address: "0x8e01cc26d6dd73581347c4370573ce9e59e74802",
    chainId: "43114"
  }
];

async function getNonCirculatingSupplyAddressConfigurations(): Promise<AddressConfiguration[]> {
  const url = `${API_URL}?tokenContractAddress=${tokenContractAddress}&chainId=${chainId}&offset=0`;
  const response = await fetch(url);
  const data: ApiResponse = await response.json();

  const nonCirculatingSupplyAddresses: AddressConfiguration[] = [];

  for (const item of nonCirculatingSupplyAddressesConfigInput) {
    const network = chainIdToNetworkMap[item.chainId]
    let networkItemFromGatewayConfig = data.body.currencyAddressesByNetworks.find(i => i.network.chainId === item.chainId);
      nonCirculatingSupplyAddresses.push(
        {
          name: item.name,
          address: item.address,
          tokenContractAddress: networkItemFromGatewayConfig?.tokenContractAddress as string,
          jsonRpcUrl: network.jsonRpcUrl,
          chainId: item.chainId
        }
      )
  }

  return nonCirculatingSupplyAddresses;
}


export { getNetworkConfigurations, getNonCirculatingSupplyAddressConfigurations };
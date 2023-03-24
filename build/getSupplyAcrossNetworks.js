"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalSupplyAcrossNetworks = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const web3_1 = __importDefault(require("web3"));
const getTotalSupplyAcrossNetworks = (networks) => __awaiter(void 0, void 0, void 0, function* () {
    const erc20ABI = [
        // Some parts of the ABI have been removed for brevity
        {
            constant: true,
            inputs: [],
            name: "totalSupply",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: true,
            inputs: [],
            name: "decimals",
            outputs: [{ name: "", type: "uint8" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
    ];
    const supplyPerNetwork = {};
    let totalSupply = new bignumber_js_1.default(0);
    for (const network in networks) {
        const config = networks[network];
        const web3 = new web3_1.default(config.jsonRpcUrl);
        const tokenContract = new web3.eth.Contract(erc20ABI, config.tokenContractAddress);
        try {
            const [supply, decimals] = yield Promise.all([
                tokenContract.methods.totalSupply().call(),
                tokenContract.methods.decimals().call(),
            ]);
            const supplyBN = new bignumber_js_1.default(supply);
            const decimalsBN = new bignumber_js_1.default(10).pow(decimals);
            const supplyInEther = supplyBN.div(decimalsBN);
            totalSupply = totalSupply.plus(supplyInEther);
            supplyPerNetwork[network] = supplyInEther.toString();
        }
        catch (error) {
            console.error(`Error getting total supply for ${network}:`, error.message);
        }
    }
    return Object.assign(Object.assign({}, supplyPerNetwork), { total: totalSupply.toString() });
});
exports.getTotalSupplyAcrossNetworks = getTotalSupplyAcrossNetworks;

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
// src/server.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const getSupplyAcrossNetworks_1 = require("./getSupplyAcrossNetworks");
const config_1 = require("./config");
const cacheMiddleware_1 = __importDefault(require("./cacheMiddleware"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
// const cache = new NodeCache({ stdTTL: 60 }); // 60 seconds TTL
app.use(body_parser_1.default.json());
// const cacheMiddleware = (duration: number) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const key = req.originalUrl;
//     const cachedResponse = cache.get(key);
//     if (cachedResponse) {
//       res.send(cachedResponse);
//     } else {
//       const originalSend = res.send.bind(res);
//       res.send = ((body: any) => {
//         cache.set(key, body, duration);
//         originalSend(body);
//       }) as Response['send'];
//       next();
//     }
//   };
// }
app.get("/totalSupplyAcrossNetworks", (0, cacheMiddleware_1.default)(60), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenContractAddress, chainId } = req.query;
        if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
            res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
            return;
        }
        const networks = yield (0, config_1.getNetworkConfigurations)(tokenContractAddress, Number(chainId));
        const totalSupplyData = yield (0, getSupplyAcrossNetworks_1.getTotalSupplyAcrossNetworks)(networks);
        res.json(totalSupplyData);
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the total supply.' });
    }
}));
app.get('/totalSupply', (0, cacheMiddleware_1.default)(60), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenContractAddress, chainId } = req.query;
        if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
            res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
            return;
        }
        const networks = yield (0, config_1.getNetworkConfigurations)(tokenContractAddress, Number(chainId));
        const totalSupplyData = yield (0, getSupplyAcrossNetworks_1.getTotalSupplyAcrossNetworks)(networks);
        res.send(totalSupplyData.total);
    }
    catch (error) {
        console.error('Error getting total supply:', error);
        res.status(500).send('Error getting total supply');
    }
}));
app.get("/nonCirculatingSupplyAddresses", (0, cacheMiddleware_1.default)(60), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tokenContractAddress, chainId } = req.query;
    if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
        res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
        return;
    }
    const nonCirculatingSupplyAddressConfigurations = yield (0, config_1.getNonCirculatingSupplyAddressConfigurations)(tokenContractAddress, Number(chainId));
    res.json(nonCirculatingSupplyAddressConfigurations);
}));
app.get('/nonCirculatingSupplyBalancesByAddress', (0, cacheMiddleware_1.default)(60), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenContractAddress, chainId } = req.query;
        if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
            res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
            return;
        }
        const nonCirculatingSupplyBalances = yield (0, getSupplyAcrossNetworks_1.getNonCirculatingSupplyBalances)(tokenContractAddress, Number(chainId));
        res.json(nonCirculatingSupplyBalances);
    }
    catch (error) {
        console.error('Error fetching non-circulating supply balances:', error);
        res.status(500).json({ error: 'Failed to fetch non-circulating supply balances' });
    }
}));
app.get('/nonCirculatingSupplyBalance', (0, cacheMiddleware_1.default)(60), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenContractAddress, chainId } = req.query;
        if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
            res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
            return;
        }
        const { balances } = yield (0, getSupplyAcrossNetworks_1.getNonCirculatingSupplyBalances)(tokenContractAddress, Number(chainId));
        const totalBalance = balances.reduce((sum, balance) => sum.plus(balance.balance), new bignumber_js_1.default(0));
        res.send(totalBalance.toString());
    }
    catch (error) {
        console.error('Error fetching non-circulating supply balances:', error);
        res.status(500).json({ error: 'Failed to fetch non-circulating supply balances' });
    }
}));
app.get('/circulatingSupplyBalance', (0, cacheMiddleware_1.default)(60), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenContractAddress, chainId } = req.query;
        if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
            res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
            return;
        }
        const networks = yield (0, config_1.getNetworkConfigurations)(tokenContractAddress, Number(chainId));
        const totalSupplyData = yield (0, getSupplyAcrossNetworks_1.getTotalSupplyAcrossNetworks)(networks);
        const totalSupply = new bignumber_js_1.default(totalSupplyData.total);
        const { balances } = yield (0, getSupplyAcrossNetworks_1.getNonCirculatingSupplyBalances)(tokenContractAddress, Number(chainId));
        const nonCirculatingSupply = balances.reduce((sum, balance) => sum.plus(balance.balance), new bignumber_js_1.default(0));
        const circulatingSupply = totalSupply.minus(nonCirculatingSupply);
        res.send(circulatingSupply.toString());
    }
    catch (error) {
        console.error('Error fetching circulating supply balance:', error);
        res.status(500).json({ error: 'Failed to fetch circulating supply balance' });
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

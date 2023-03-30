// src/server.ts
import express from "express";
import bodyParser from 'body-parser';
import BigNumber from "bignumber.js";
import { getTotalSupplyAcrossNetworks, getNonCirculatingSupplyBalances } from "./getSupplyAcrossNetworks";
import { getNetworkConfigurations, getNonCirculatingSupplyAddressConfigurations } from "./config";
import { NonCirculatingSupplyBalance } from './types';



const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.get("/totalSupplyAcrossNetworks", async (req, res) => {
  try {
    const networks = await getNetworkConfigurations();
    const totalSupplyData = await getTotalSupplyAcrossNetworks(networks);
    res.json(totalSupplyData);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the total supply.' });
  }
});

app.get('/totalSupply', async (req, res) => {
  try {
    const networks = await getNetworkConfigurations();
    const totalSupplyData = await getTotalSupplyAcrossNetworks(networks);
    res.send(totalSupplyData.total);
  } catch (error) {
    console.error('Error getting total supply:', error);
    res.status(500).send('Error getting total supply');
  }
});

app.get("/nonCirculatingSupplyAddresses", async (req, res) => {
  const nonCirculatingSupplyAddressConfigurations = await getNonCirculatingSupplyAddressConfigurations();
  res.json(nonCirculatingSupplyAddressConfigurations);
});

app.get('/nonCirculatingSupplyBalancesByAddress', async (req, res) => {
  try {
    const nonCirculatingSupplyBalances = await getNonCirculatingSupplyBalances();
    res.json(nonCirculatingSupplyBalances);
  } catch (error) {
    console.error('Error fetching non-circulating supply balances:', error);
    res.status(500).json({ error: 'Failed to fetch non-circulating supply balances' });
  }
});

app.get('/nonCirculatingSupplyBalance', async (req, res) => {
  try {
    const { balances }: { balances: NonCirculatingSupplyBalance[] } = await getNonCirculatingSupplyBalances();
    const totalBalance = balances.reduce((sum, balance) => sum.plus(balance.balance), new BigNumber(0));
    res.send(totalBalance.toString());
  } catch (error) {
    console.error('Error fetching non-circulating supply balances:', error);
    res.status(500).json({ error: 'Failed to fetch non-circulating supply balances' });
  }
});

app.get('/circulatingSupplyBalance', async (req, res) => {
  try {
    const networks = await getNetworkConfigurations();
    const totalSupplyData = await getTotalSupplyAcrossNetworks(networks);
    const totalSupply = new BigNumber(totalSupplyData.total);

    const { balances }: { balances: NonCirculatingSupplyBalance[] } = await getNonCirculatingSupplyBalances();
    const nonCirculatingSupply = balances.reduce((sum, balance) => sum.plus(balance.balance), new BigNumber(0));

    const circulatingSupply = totalSupply.minus(nonCirculatingSupply);
    res.send(circulatingSupply.toString());
  } catch (error) {
    console.error('Error fetching circulating supply balance:', error);
    res.status(500).json({ error: 'Failed to fetch circulating supply balance' });
  }
});





app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

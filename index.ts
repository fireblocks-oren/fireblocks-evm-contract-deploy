import { deploy } from "./src/deploy";
import { FireblocksSDK } from "fireblocks-sdk";
import fs from 'fs';

const PRIVATE_KEY_LOCATION = '';
const API_KEY = '';
const apiSecret = fs.readFileSync(PRIVATE_KEY_LOCATION, 'utf-8');
const fireblocksApiClient = new FireblocksSDK(apiSecret, API_KEY);
const rpcUrl = '';

const abi = JSON.parse('');
const bytecode = "";
const deployArgs = [];

const assetId = 'ETH_TEST';
const vaultId = '';

(async () => {
    await deploy(fireblocksApiClient, rpcUrl, vaultId, assetId, bytecode, abi, deployArgs);
})();
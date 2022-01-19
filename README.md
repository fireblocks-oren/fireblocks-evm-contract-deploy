# fireblocks-evm-contract-deploy
Fireblocks contract deployment on supported EVM chains

## Scripts Parameters
Change the following values in `index.ts` file:
* `PRIVATE_KEY_LOCATION`: Location of your RSA-4096 private key for the required API User ID
* `API_KEY` - Your API User ID
* `rpcUrl` - Your JSON/RPC URL endpoint
* `abi` - The contract's ABI
* `bytecode` - The contract's compiled bytecode
* `deployArgs` - The contract's constructor arguments
* `assetId` - The required Asset ID to use for this signature
* `vaultId` - The required Vault ID to use for this signature

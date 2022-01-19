import { initWeb3Instance }  from "./web3_instance";
import { FireblocksSDK } from "fireblocks-sdk";

export async function deploy(apiClient: FireblocksSDK, httpProviderUrl: string, vaultAccountId: string, assetId: string, bytecode, abi, ...args) {

    const sender = (await apiClient.getDepositAddresses(vaultAccountId, assetId))[0];
    const web3 = await initWeb3Instance(apiClient, httpProviderUrl, vaultAccountId, assetId);

    let rawTransaction;

    const gasPrice = web3.utils.toBN(await web3.eth.getGasPrice());
    console.log('Gas Price: ', gasPrice.toString());
    const gasLimit = 1500000;
    const contract = new web3.eth.Contract(abi);

    const data = contract.deploy({
        data: bytecode,
        arguments: args
    }).encodeABI(( { from: web3.eth.defaultAccount }))

    rawTransaction = await web3.eth.signTransaction({ 
        from: web3.eth.defaultAccount,
        data: data,
        value: web3.utils.toBN("0x00"),
        gasPrice: gasPrice,
        gasLimit: gasLimit
    });

    console.log(rawTransaction);    

    const txHash = await web3.eth.sendSignedTransaction(rawTransaction);

    console.log(vaultAccountId, txHash);    

}
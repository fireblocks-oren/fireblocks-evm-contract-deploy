​import { Transaction } from '@ethereumjs/tx';
import Common from '@ethereumjs/common';
import { PeerType, TransactionStatus, TransactionOperation, FireblocksSDK} from "fireblocks-sdk";
const Web3 = require('web3');


export async function initWeb3Instance(fireblocksApiClient, httpProviderUrl, vaultAccountId, assetId ='ETH') {
    const webProvider = new Web3.providers.HttpProvider(httpProviderUrl);
​
    let web3;
​
    const rpcProxy = {
        eth_signTransaction: async ([txData]) => {
            
            const chainId = await web3.eth.getChainId();
            const customChainParams = { name: 'custom', chainId, networkId: chainId }
            const common = Common.forCustomChain('mainnet', customChainParams, 'byzantium')

            
            const nonce = await web3.eth.getTransactionCount(web3.eth.defaultAccount);
            const tx = new Transaction({ ...txData, nonce },  { common });

            const content = tx.getMessageToSign().toString("hex");

            const { status, id } = await fireblocksApiClient.createTransaction({
                operation: TransactionOperation.RAW,
                assetId,
                source: {
                    type: PeerType.VAULT_ACCOUNT,
                    id: vaultAccountId  
                },
                note: `Deploy smart contract from vault ${vaultAccountId}`,
                extraParameters: {
                    rawMessageData: {
                        messages: [{
                            content
                        }]
                    }
                }
            });

            let currentStatus = status;
            let txInfo;
            
            while(currentStatus != TransactionStatus.COMPLETED && currentStatus != TransactionStatus.FAILED) {
                try {
                    console.log("keep polling for tx " + id + "; status: " + currentStatus);
                    txInfo = await fireblocksApiClient.getTransactionById(id);
                    currentStatus = txInfo.status;
                } catch (err) {
                    console.log("err", err);
                }
                await new Promise(r => setTimeout(r, 1000));    
            };
​
            if(currentStatus == TransactionStatus.FAILED) {
                throw "Transaction failed";
            }
​
            // raw transaction signed
            const signature = txInfo.signedMessages[0].signature;

            console.log(signature);
            
            const signedTransaction = new Transaction({
                    nonce: tx.nonce,
                    gasPrice: tx.gasPrice,
                    gasLimit: tx.gasLimit,
                    to: tx.to,
                    value: tx.value,
                    data: tx.data,
                    s: web3.utils.toBN('0x' + signature.s),
                    r: web3.utils.toBN('0x' + signature.r),
                    v: chainId * 2 + (signature.v + 35)
            }, { common });

            console.log(signedTransaction);
            ​
            return '0x' + signedTransaction.serialize().toString('hex');
        }
    }
​
    const provider = {
        send: (input, callback) => {
            if (rpcProxy[input.method] != undefined) {
                rpcProxy[input.method](input.params).then(result => callback(null, {
                    id: input.id,
                    jsonrpc: "2.0",
                    result
                })).catch(err => callback(err));
            } else {
                webProvider.send(input, callback);                
            }
        }
    };
    web3 = new Web3(provider);
    const accountAddresses = await fireblocksApiClient.getDepositAddresses(vaultAccountId, assetId);
    web3.eth.defaultAccount = accountAddresses[0].address;
​
    return web3;
};

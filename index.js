var request = require("request");
var Web3 = require('web3');
var web3;

// console.log(web3.eth);
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    // web3.setProvider(new web3.providers.HttpProvider('http://localhost:8104'));
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8104"));
  }
console.log(web3.eth.accounts);
console.log(web3.eth.coinbase);
console.log(web3.eth.blockNumber);
console.log('isConnected: ' + web3.isConnected());
console.log('getBlock: ' + JSON.stringify(web3.eth.getBlock(68), null, 2));
console.log('getTransaction: '
    + JSON.stringify(web3.eth.getTransaction('0x0eac236fcbb569f2412706ace8cf12527d3de03828aa42b98ad4561baa7588c4'), null, 2));


//curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[1],"id":11111}' localhost:8104 -v
//echo '{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":1}' | nc -U /Users/pentatonic/Library/Ethereum/geth.ipc

request({
    url: 'http://localhost:8104',
    method: 'POST',
    json: {"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":11111}
}, function (error, response, body) {
    if (!error && response.statusCode === 200) {
        console.log(body)
    }
    else {

        console.log("error: " + error)
        console.log("response.statusCode: " + response.statusCode)
        console.log("response.statusText: " + response.statusText)
    }
})
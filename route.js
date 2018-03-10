const debug = require('debug')('route');
const path = require('path');
const helmet = require('helmet');
const bodyparser = require('body-parser');
const request = require("request");
const _ = require('lodash');
const Web3 = require('web3');
const RateLimit = require('express-rate-limit');


let web3;
let RPC_SERVER = process.env.RPC_SERVER || "http://localhost:8333";

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
}
else {
    web3 = new Web3(new Web3.providers.HttpProvider(RPC_SERVER));
}

module.exports = (app, session) => {

    app.use(helmet());
    app.use(bodyparser.urlencoded({ extended: false }));
    app.use(bodyparser.json());
    app.use(session);
    var limiter = new RateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        delayMs: 0 // disable delaying - full speed until the max limit is reached
    });
    //  apply to all requests
    app.use(limiter);

    app.get('/node', (req, res, next) => {
        debug('/node');
        request({
            url: RPC_SERVER,
            method: 'POST',
            json: { "jsonrpc": "2.0", "method": "admin_nodeInfo", "params": [], "id": 11111 }
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                debug(JSON.stringify(body.result, null, 2))
                let ret = _.pick(body.result, ['enode', 'name']);
                ret.result = 0;
                res.status(200).send(JSON.stringify(ret));
            }
            else {
                res.status(500).send({
                    result: -2,
                    msg: "Something went wrong!"
                });
                debug("error: " + error)
                debug("response.statusCode: " + response.statusCode)
                debug("response.statusText: " + response.statusText)
            }
        });
    });

    app.get('/block/:num', (req, res, next) => {
        debug('/block/', req.params.num);
        let block = web3.eth.getBlock(req.params.num);
        if (block) {
            let ret = _.pick(block, ['difficulty', 'gasLimit', 'gasUsed', 'hash', 'miner', 'parentHash', 'totalDifficulty']);
            ret.result = 0;
            res.status(200).send(JSON.stringify(ret));
        }
        else {
            ret = { result: -1, msg: 'Not found.' };
            res.status(404).send(JSON.stringify(ret));
        }
    });

    app.get('/transaction/:hash', (req, res, next) => {
        debug('/transaction/', req.params.hash.length, req.params.hash);
        let tran = web3.eth.getTransaction(req.params.hash);
        debug(tran);
        if (tran) {
            let ret = _.pick(tran, ['blockHash', 'blockNumber', 'from', 'gas', 'gasPrice', 'hash', 'nonce', 'to', 'value']);
            ret.result = 0;
            res.status(200).send(JSON.stringify(ret));
        }
        else {
            ret = { result: -1, msg: 'Not found.' };
            res.status(404).send(JSON.stringify(ret));
        }
    });

    app.put('/miner', (req, res, next) => {
        debug('miner start');
        request({
            url: RPC_SERVER,
            method: 'POST',
            json: { "jsonrpc": "2.0", "method": "miner_start", "params": [1], "id": 11111 }
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                debug(JSON.stringify(body.result, null, 2))
                res.status(200).send({ result: 0, msg: '' });
            }
            else {
                res.status(500).send({
                    result: -2,
                    msg: "Something went wrong!"
                });
                debug("error: " + error)
                debug("response.statusCode: " + response.statusCode)
                debug("response.statusText: " + response.statusText)
            }
        });
    });

    app.delete('/miner', (req, res, next) => {
        debug('miner stop');
        request({
            url: RPC_SERVER,
            method: 'POST',
            json: { "jsonrpc": "2.0", "method": "miner_stop", "params": [], "id": 11111 }
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                debug(JSON.stringify(body.result, null, 2))
                if (body.result == true) {
                    res.status(200).send({ result: 0, msg: '' });
                }
                else {
                    res.status(500).send({
                        result: -2,
                        msg: "failed to stop miner!"
                    });
                }
            }
            else {
                res.status(500).send({
                    result: -2,
                    msg: "Something went wrong!"
                });
                debug("error: " + error)
                debug("response.statusCode: " + response.statusCode)
                debug("response.statusText: " + response.statusText)
            }
        });
    });

    app.use((err, req, res, next) => {
        if (err) {
            debug(err.stack);
            let msg = "Something went wrong!";
            if (!web3.isConnected()) {
                msg = "RPC not connected!";
            }
            return res.status(500).send({
                result: -2,
                msg: msg
            });
        }
        next(err);
    });
}

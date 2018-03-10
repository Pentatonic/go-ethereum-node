const debug = require('debug')('index');
const express = require('express');
const session = require('express-session');


const sessionMW = session({
    secret: 'keep going',
    resave: true,
    saveUninitialized: true,
    //cookie: {maxAge: 60*24*60*60*1000},
});

const app = express();
let server = null;
debug('NODE_ENV %s', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
    // not implemented yet
    debug('using https...');
}
else {
    server = require('http').createServer(app);
    debug('using http...');
}

require('./route')(app, sessionMW);

const port = process.env.PORT || 8080;
server.listen(port, () => {
    debug('Server started on port: ' + port);
});

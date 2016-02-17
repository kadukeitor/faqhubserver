'use strict';

var config = require('./lib/config'),
    express = require('express'),
    app = express(),
    bluemix = require('./config/bluemix'),
    watson = require('watson-developer-cloud'),
    Cloudant = require('cloudant');

// Bootstrap application settings

require('./config/express')(app);

// Allow headers

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//  Cloudant

var cloudant = Cloudant({
    account: config.cloudant.account,
    password: config.cloudant.password
});

// Authentication

var authentication = require('./lib/authentication')(app, cloudant);

// Crud

var crud = require('./lib/cloudant')(app, cloudant, authentication);

// Translation

var translation = require('./lib/translation')(app, watson);

// Text to Speech

var text_to_speech = require('./lib/text-to-speech')(watson);

// Speech to Text

var speech_to_text = require('./lib/speech-to-text')(app, watson);

// Dialog

var dialog = require('./lib/dialog')(app, watson, bluemix, translation, text_to_speech);

// Editor ( Generator )

//var editor = require('./lib/editor')(app, watson, crud, dialog);

// Error-Handler settings

require('./config/error-handler')(app);

var port = process.env.VCAP_APP_PORT || 3000;

app.listen(port);

console.log('listening at:', port);

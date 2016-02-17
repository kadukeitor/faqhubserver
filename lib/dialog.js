var config = require('./config');
var extend = require('util')._extend, async = require('async');

module.exports = function (app, watson, bluemix, translation, text_to_speech) {

    var credentials = extend({
        url: config.dialog.url,
        username: config.dialog.username,
        password: config.dialog.password,
        version: config.dialog.version
    }, bluemix.getServiceCreds('dialog'));

    var dialog_id = config.dialog.dialog_id;

    var dialog = watson.dialog(credentials);

    app.post('/conversation', function (req, res, next) {

        var params = extend({dialog_id: dialog_id}, req.body);
        var language = params.language ? params.language : 'en';
        var talk = params.talk ? (params.talk == 'true') : false;

        async.waterfall([
            function (callback) {
                if (language == 'en' || !params.input) {
                    callback(null, params);
                } else {
                    translation.translate(params.input, language, 'en', function (translation) {
                        params.input = translation;
                        callback(null, params);
                    });
                }
            },
            function (params, callback) {
                conversation(params, function (results) {
                    callback(null, results);
                })
            },
            function (results, callback) {

                if (!results || !results.response) {
                    callback(null, {error: 'Error in Conversation'});
                    return false;
                }

                var text = results.response.join(' ');
                if (language == 'en') {
                    if (talk)
                        text_to_speech.convertTextToSpeech(text, function (speech) {
                            callback(null, {dialog_id: dialog_id, conversation: results, text_to_speech: speech});
                        });
                    else
                        callback(null, {dialog_id: dialog_id, conversation: results})
                } else {
                    translation.translate(text, 'en', language, function (translation) {
                        callback(null, {dialog_id: dialog_id, conversation: results, translation: translation})
                    })
                }

            }
        ], function (err, result) {
            res.json(result);
        });

    });

    app.post('/profile', function (req, res, next) {
        var params = extend({dialog_id: dialog_id}, req.body);
        dialog.getProfile(params, function (err, results) {
            if (err)
                return next(err);
            else
                res.json(results);
        });
    });

    function conversation(params, callback) {
        dialog.conversation(params, function (err, results) {
            if (err)
                callback(err);
            else {
                callback(results);
            }
        });
    }

    return {
        dialog: dialog
    };

};
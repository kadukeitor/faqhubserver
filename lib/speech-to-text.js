var config = require('./config');

module.exports = function (app, watson) {

    var authService = watson.authorization(config.speech_to_text);

    app.post('/speech-to-text/token', function (req, res, next) {
        authService.getToken({url: config.speech_to_text.url}, function (err, token) {
            if (err)
                next(err);
            else
                res.send(token);
        });
    });

};
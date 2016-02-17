var config = require('./config');

module.exports = function (app, watson) {

    var language_translation = watson.language_translation({
        username: config.translation.username,
        password: config.translation.password,
        version: config.translation.version
    });

    app.post('/languages', function (req, res, next) {
        language_translation.getIdentifiableLanguages(null,
            function (err, languages) {
                if (err)
                    return next(err);
                else {
                    res.json(languages);
                }
            });
    });

    return {
        translate: function (text, source, target, callback) {
            language_translation.translate(
                {
                    text: text, source: source, target: target
                },
                function (err, translation) {
                    if (err)
                        callback(text);
                    else {
                        if (translation.translations.length) {
                            callback(translation.translations[0].translation)
                        } else
                            callback(text);
                    }

                });
        }
    }

};
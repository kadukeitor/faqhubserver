var config = require('./config');
var aws = require('aws-sdk'), Readable = require('stream').Readable, crypto = require('crypto');

module.exports = function (watson) {

    var AWS_ACCESS_KEY = config.text_to_speech.aws_access_key;
    var AWS_SECRET_KEY = config.text_to_speech.aws_secret_key;
    var S3_BUCKET = config.text_to_speech.aws_s3_bucket;

    var cloudconvert = new (require('cloudconvert'))(config.text_to_speech.cloudconvert);

    var textToSpeech = watson.text_to_speech({
        version: config.text_to_speech.version,
        username: config.text_to_speech.username,
        password: config.text_to_speech.password
    });

    return {
        convertTextToSpeech: function (text, callback) {

            aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});

            var hash = crypto.createHash('md5').update(text).digest("hex");
            var s3Path = 'https://s3.amazonaws.com/' + S3_BUCKET + '/' + hash + '.mp3';
            var s3obj = new aws.S3({params: {Bucket: S3_BUCKET, Key: hash + '.ogg'}});

            s3obj.getObject({}, function (err, data) {
                if (!err) {
                    callback(s3Path);
                } else {
                    var body = new Readable().wrap(textToSpeech.synthesize({text: text}));
                    s3obj.upload({Body: body}, function () {
                        cloudconvert.convert({
                                "file": hash + ".ogg",
                                "inputformat": "ogg",
                                "outputformat": "mp3",
                                "input": {
                                    "s3": {
                                        "accesskeyid": AWS_ACCESS_KEY,
                                        "secretaccesskey": AWS_SECRET_KEY,
                                        "bucket": S3_BUCKET,
                                        "region": "us-east-1"
                                    }
                                },
                                "output": {
                                    "s3": {
                                        "accesskeyid": AWS_ACCESS_KEY,
                                        "secretaccesskey": AWS_SECRET_KEY,
                                        "bucket": S3_BUCKET,
                                        "region": "us-east-1",
                                        "acl": "public-read"
                                    }
                                }
                            })
                            .on('finished', function (data) {
                                callback(s3Path);
                            })
                    });
                }
            });

        }
    }

};
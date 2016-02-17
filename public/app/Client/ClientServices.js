'use strict';

angular
    .module('client')
    .factory('ClientSvc', ClientSvc);

function ClientSvc($q, $http, $window, $rootScope, SocketSvc) {

    var SERVER = "";
    var conversation_id, client_id;
    var speech_to_text_mic, speech_to_text_model, speech_to_text_token, speech_to_text_listening;

    return {


        language: function (language) {

            if (language)
                $window.localStorage['faqhub_language'] = language;
            else
                return $window.localStorage['faqhub_language'] || 'en';

        },

        languages: function () {

            var deferred = $q.defer();

            var req = {
                method: 'POST',
                url: (SERVER + '/languages'),
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            };

            $http(req)
                .then(function (response) {
                    deferred.resolve(response.data.languages);
                }, function (error) {
                    return deferred.reject(error);
                });

            return deferred.promise;
        },

        reload: function () {

            conversation_id = null;
            client_id = null;

        },

        talk: function (talk) {

            if (typeof talk != 'undefined')
                $window.localStorage['faqhub_talk'] = talk;
            else
                return $window.localStorage['faqhub_talk'] == 'true' || false;

        },

        conversation: function (text) {

            var deferred = $q.defer();

            var data = {input: text, language: this.language(), talk: this.talk()};
            if (conversation_id) {
                data.conversation_id = conversation_id;
                data.client_id = client_id;
            }

            var req = {
                method: 'POST',
                url: (SERVER + '/conversation'),
                data: $.param(data),
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            };

            $http(req)
                .then(function (response) {
                    conversation_id = response.data.conversation.conversation_id;
                    client_id = response.data.conversation.client_id;
                    deferred.resolve(response.data);
                }, function (error) {
                    return deferred.reject(error);
                });

            return deferred.promise;

        },

        text_to_speech: function (speech) {

            var audio;
            var src = speech;

            audio = $('.audio').get(0);
            audio.pause();
            try {
                audio.currentTime = 0;
            } catch (ex) {

            }
            audio.src = src;
            audio.play();

        },

        speech_to_text_init: function () {

            var deferred = $q.defer();

            var req = {
                method: 'POST',
                url: (SERVER + '/speech-to-text/token'),
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            };

            $http(req)
                .then(function (response) {
                    speech_to_text_mic = new Microphone({
                        bufferSize: 8192
                    });
                    speech_to_text_token = response.data;
                    deferred.resolve(response.data);
                }, function (error) {
                    speech_to_text_token = null;
                    return deferred.reject(error);
                });

            return deferred.promise;

        },

        speech_to_text: function (listen) {

            if (!speech_to_text_token)
                return false;

            var self = this;

            if (listen && !speech_to_text_listening) {

                if (self.language() == 'en')
                    speech_to_text_model = 'en-US_BroadbandModel';
                if (self.language() == 'es')
                    speech_to_text_model = 'es-ES_BroadbandModel';

                self.speech_to_text_handle_mic(speech_to_text_token, speech_to_text_model, speech_to_text_mic, function (err) {
                    if (err) {
                        speech_to_text_listening = false;
                    } else {
                        speech_to_text_mic.record();
                        speech_to_text_listening = true;
                    }
                });

            } else {

                SocketSvc.stop();
                speech_to_text_mic.stop();
                speech_to_text_listening = false;

            }

        },

        speech_to_text_handle_mic: function (token, model, mic, callback) {

            if (model.indexOf('Narrowband') > -1) {
                var err = new Error('Microphone transcription cannot accomodate narrowband models, ' +
                    'please select another');
                callback(err, null);
                return false;
            }

            var options = {};
            options.token = token;
            options.message = {
                'action': 'start',
                'content-type': 'audio/l16;rate=16000',
                'interim_results': true,
                'continuous': true,
                'word_confidence': true,
                'timestamps': true,
                'max_alternatives': 3,
                'inactivity_timeout': 600
            };
            options.model = model;

            SocketSvc.init(options,
                // onOpen
                function (socket) {
                    //console.log('Mic socket: opened');
                    callback(null, socket);
                },
                //onListening
                function (socket) {
                    mic.onAudio = function (blob) {
                        if (socket.readyState < 2) {
                            socket.send(blob);
                        }
                    };
                },
                //onMessage
                function (msg) {
                    if (msg.results) {
                        var text = msg.results[0].alternatives[0].transcript || '';
                        $rootScope.$broadcast('textToSpeechIncoming', text);
                    }
                },
                // onError
                function (err) {
                    console.log('Mic socket err: ', err);
                },
                //onClose
                function (evt) {
                    //console.log('Mic socket: closed');
                    $rootScope.$broadcast('textToSpeechEnd');
                }
            );

        }

    }

}

'use strict';

angular
    .module('client')
    .factory('SocketSvc', SocketSvc);

function SocketSvc() {

    var listening;
    var socket, token, model, message, sessionPermissions, url;

    return {

        init: function (options, onopen, onlistening, onmessage, onerror, onclose) {

            var self = this;


            function withDefault(val, defaultVal) {
                return typeof val === 'undefined' ? defaultVal : val;
            }

            token = options.token;
            model = options.model || 'en-US_BroadbandModel';
            message = options.message || {'action': 'start'};
            sessionPermissions = withDefault(options.sessionPermissions, true);

            //var sessionPermissionsQueryParam = sessionPermissions ? '0' : '1';
            // TODO: add '&X-Watson-Learning-Opt-Out=' + sessionPermissionsQueryParam once
            // we find why it's not accepted as query parameter
            url = options.serviceURI || 'wss://stream.watsonplatform.net/speech-to-text/api/v1/recognize?watson-token=' + token + '&model=' + model;

            //console.log('URL model', model);

            try {
                socket = new WebSocket(url);
            } catch (err) {
                console.error('WS connection error: ', err);
            }

            socket.onopen = function () {

                listening = false;

                socket.send(JSON.stringify(message));

                onopen(socket);
            };

            socket.onmessage = function (evt) {

                var msg = JSON.parse(evt.data);

                if (msg.error) {
                    this.stop();
                    //console.log(msg.error);
                    //$.publish('hardsocketstop');
                    return;
                }
                if (msg.state === 'listening') {
                    // Early cut off, without notification
                    if (!listening) {
                        onlistening(socket);
                        listening = true;
                    } else {
                        //console.log('MICROPHONE: Closing socket.');
                        socket.close();
                    }
                }
                onmessage(msg, socket);
            };

            socket.onerror = function (evt) {
                //console.log('Application error ' + evt.code + ': please refresh your browser and try again');
                //$.publish('clearscreen');
                onerror(evt);
            };

            socket.onclose = function (evt) {
                //console.log('WS onclose: ', evt);
                if (evt.code === 1006) {
                    //// Authentication error, try to reconnect
                    ////console.log('generator count', tokenGenerator.getCount());
                    //if (tokenGenerator.getCount() > 1) {
                    //    //$.publish('hardsocketstop');
                    //    throw new Error('No authorization token is currently available');
                    //}
                    //tokenGenerator.getToken(function (err, token) {
                    //    if (err) {
                    //        //$.publish('hardsocketstop');
                    //        return false;
                    //    }
                    //    //console.log('Fetching additional token...');
                    //    options.token = token;
                    //    self.init(options, onopen, onlistening, onmessage, onerror, onclose);
                    //});
                    return false;
                }
                if (evt.code === 1011) {
                    //console.error('Server error ' + evt.code + ': please refresh your browser and try again');
                    return false;
                }
                if (evt.code > 1000) {
                    //console.error('Server error ' + evt.code + ': please refresh your browser and try again');
                    return false;
                }
                // Made it through, normal close
                onclose(evt);
            };

        },

        stop: function () {
            //console.log('MICROPHONE: close.');
            socket.send(JSON.stringify({action: 'stop'}));
            socket.close();
        }

    }

}
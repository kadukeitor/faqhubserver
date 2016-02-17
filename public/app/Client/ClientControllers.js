'use strict';

angular
    .module('client')
    .controller('ClientCtrl', ClientCtrl)
;

function ClientCtrl($scope, $state, $timeout, $mdDialog, ClientSvc) {

    $scope.listening = false;
    $scope.languages = [];
    $scope.talk = ClientSvc.talk();
    $scope.busy = false;
    $scope.message = {text: '', type: 0};
    $scope.messages = [];

    $scope.reload = function () {
        $scope.busy = true;
        $scope.messages = [];
        ClientSvc.reload();
        ClientSvc
            .conversation()
            .then(function (response) {
                incomingData(response);
            });
    };

    $scope.send = function (message) {
        if (message.text) {

            $scope.busy = true;
            ClientSvc
                .conversation(message.text)
                .then(function (response) {
                    incomingData(response);
                });

            $scope.messages.push({text: message.text});
            message.text = "";

            // Scroll Down
            $("#messages").animate({scrollTop: $("#messages").get(0).scrollHeight}, "slow");
        }
    };

    $scope.showLanguages = function () {
        $mdDialog
            .show({
                templateUrl: 'app/Client/ClientLanguages.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: true,
                scope: $scope,
                preserveScope: true,
                controller: function ClientLanguagesCtrl($scope, $mdDialog, ClientSvc) {
                    ClientSvc
                        .languages()
                        .then(function (languages) {
                            $scope.language = ClientSvc.language();
                            $scope.languages = languages;
                        });
                    $scope.select = function (language) {
                        ClientSvc.language(language);
                        $mdDialog.hide();
                    };
                    $scope.close = function () {
                        $mdDialog.hide();
                    }
                }
            });
    };

    $scope.toggleTalk = function () {
        $scope.talk = !$scope.talk;
        ClientSvc.talk($scope.talk);
    };

    $scope.manager = function () {
        $state.go('base.entities');
    };

    // Init
    $timeout(function () {
        // Languages
        ClientSvc
            .languages()
            .then(function (languages) {
                $scope.languages = languages;
            });
        // Speech to Text
        ClientSvc
            .speech_to_text_init();
        // Reload Dialog
        $scope.reload();
    });

    // Process Incoming Data
    function incomingData(response) {

        if (response.error)
            return false;

        // Text
        var text = response.translation ? response.translation : response.conversation.response.join(' ');
        // Add Message
        $scope.messages.push({text: text, type: 1});
        // Text to Speech
        if ($scope.talk && response.text_to_speech) {
            ClientSvc
                .text_to_speech(response.text_to_speech);
        }
        // Indicator
        $scope.busy = false;
        // Scroll Down
        $("#messages").animate({scrollTop: $("#messages").get(0).scrollHeight}, "slow");
        // Focus
        $timeout(function () {
            $("#input").focus();
        });

    }


    // Speech to Text

    $scope.startListen = function () {
        $scope.listening = true;
        ClientSvc
            .speech_to_text(true);
    };

    $scope.stopListen = function () {
        $scope.listening = false;
        $timeout(function () {
            ClientSvc
                .speech_to_text(false);
        }, 1000);
    };

    $scope.$on('textToSpeechIncoming', function (err, text) {
        $scope.message.text = text;
        $scope.$apply();
    });

    $scope.$on('textToSpeechEnd', function (err, text) {
        $scope.send($scope.message);
    });

}

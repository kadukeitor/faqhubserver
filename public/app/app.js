angular

    .module('FaqHub', [
        'ui',
        'ui.router',
        'ngMaterial',
        'satellizer',
        'client',
        'login',
        'base',
        'entities',
        'help'
    ])

    .run(function ($location, $window) {

        if ($location.protocol() !== 'https' && $location.host() != 'localhost') {
            $window.location.href = $location.absUrl().replace('http', 'https');
        }

    })

    .config(function ($stateProvider, $urlRouterProvider, $authProvider) {

        $authProvider.google({
            clientId: '845157008524-sth5s7k13u96iim3d3pciohgr0oqsla6.apps.googleusercontent.com'
        });

        $authProvider.github({
            clientId: '16827944b942f0b91e81'
        });

        $authProvider.linkedin({
            clientId: '771w46krmztlix'
        });

        $authProvider.facebook({
            clientId: '1557539541231915'
        });

        $urlRouterProvider.otherwise('/base/entities');

    })


;
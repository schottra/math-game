'use strict'

angular.module('mathgame.adapters',[])
angular.module('mathgame.app', [
#  'ngCookies',
#  'ngResource',
#  'ngSanitize',
  'ngRoute',
  'mathgame.adapters'
])
  .config ($routeProvider, $locationProvider) ->
    $routeProvider
      .when '/',
        templateUrl: 'partials/main'
        controller: 'MainCtrl'
      .when '/play/:gameId',
        templateUrl: 'partials/play'
        controller: 'PlayCtrl'
      
      .otherwise
        redirectTo: '/'

    $locationProvider.html5Mode true
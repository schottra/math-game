'use strict'

angular.module('mathGameServices',[])

angular.module('mathGameApp', [
#  'ngCookies',
#  'ngResource',
#  'ngSanitize',
  'ngRoute',
  'mathGameServices'
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
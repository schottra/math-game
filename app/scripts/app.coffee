'use strict'

angular.module('mathGameApp', [
#  'ngCookies',
#  'ngResource',
#  'ngSanitize',
  'ngRoute'
])
  .config ($routeProvider, $locationProvider) ->
    $routeProvider
      .when '/',
        templateUrl: 'partials/main'
        controller: 'MainCtrl'
      .when '/play',
        templateUrl: 'partials/play'
        controller: 'PlayCtrl'
      
      .otherwise
        redirectTo: '/'

    $locationProvider.html5Mode true
'use strict'

angular.module('mathGameApp')
  .controller 'MainCtrl', ($scope, $location, $http) ->
    class MainController
      newGame: ->
        $http.post('/api/game')
        .then (res)->
          if res?.data?.id then $location.url "/play/#{res.data.id}"

    $scope.main = new MainController()


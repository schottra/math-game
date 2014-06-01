'use strict'

angular.module('mathGameApp')
  .controller 'MainCtrl', ($scope, $location) ->
    class MainController
      newGame: ->
        console.log 'snarf'
        $location.url '/play'

    $scope.main = new MainController()

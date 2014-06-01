'use strict'

angular.module('mathGameApp')
  .controller 'PlayCtrl', ($scope) ->
    socket = null

    openSocket = ->
      socket = io('/game')

    class PlayController
      constructor: ->
        openSocket()



    return new PlayController()



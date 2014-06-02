'use strict'

angular.module('mathGameApp')
  .controller 'PlayCtrl', ($scope, $q, $location, $routeParams) ->
    socket = null
    gameId = $routeParams['gameId']

    openSocket = ->
      d = $q.defer()
      socket = io('/game')
      socket.on('connect', -> d.resolve())
      socket.on('connect_error', (error)-> d.reject(error))
      return d.promise

    class PlayController
      constructor: ->
        openSocket()
        .then ->
          socket.join(gameId)


    return new PlayController()



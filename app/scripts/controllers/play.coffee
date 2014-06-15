'use strict'

angular.module('mathGameApp')
  .controller 'PlayCtrl', ($scope, $window, $timeout, $q, $location, $routeParams) ->
    socket = null
    gameId = $routeParams['gameId']

    openSocket = ->
      d = $q.defer()
      socket = $window.io('/game')
      socket.on('connect', -> d.resolve())
      socket.on('connect_error', (error)-> d.reject(error))
      return d.promise

    class PlayController
      constructor: ->
        @players = {}
        @activePlayers = []
        @userName= "User"
        openSocket()
        .then =>
          socket.emit('joinGame', {gameId, userName: @userName}, @_onJoinResponse)
          socket.on('userJoined', @_onUserJoined)
          socket.on('userLeft', @_onUserLeft)

      _onUserJoined: (data) =>
        $timeout(=> @players[data.id] = data.userInfo)

      _onUserLeft: (userId) =>
        $timeout =>
          delete @players[userId]

      _onJoinResponse: (response)=>
        if response instanceof Error then return $location.url('/')

        $timeout( => @players = response.players )


    ctrl = new PlayController()
    $scope.game = ctrl
    return ctrl
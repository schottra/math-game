'use strict'

angular.module('mathGameApp')
  .controller 'PlayCtrl', ($scope, $window, $timeout, $q, $location, $routeParams) ->
    socket = null
    userId = null
    gameId = $routeParams['gameId']

    openSocket = ->
      d = $q.defer()
      socket = $window.io('/game')
      socket.on('connect', -> d.resolve())
      socket.on('connect_error', (error)-> d.reject(error))
      socket.on('userId assigned', (id)->userId = id)
      return d.promise

    class PlayController
      constructor: ->
        @info = {}
        @userName= "User"
        openSocket()
        .then =>
          socket.emit('joinGame', {gameId, userName: @userName}, @_onJoinResponse)
          socket.on('userJoined', @_onUserJoined)
          socket.on('userLeft', @_onUserLeft)

      _parseGame: (data) =>
        @info = data

      _onUserJoined: (userInfo) =>
        $timeout =>
          for player in @info.players
            if player.id is userInfo.id then return
          @info.players.push(userInfo) if userInfo.id isnt userId

      _onUserLeft: (userId) =>
        $timeout =>
          for player, i in @info.players
            if player.id is userId then return @info.players.splice(i,1)

      _onJoinResponse: (response)=>
        if response instanceof Error then return $location.url('/')

        $timeout( => @_parseGame(response) )


    ctrl = new PlayController()
    $scope.game = ctrl
    return ctrl
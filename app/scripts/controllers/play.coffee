'use strict'

angular.module('mathGameApp')
  .controller 'PlayCtrl', ($scope, $window, $q, $location, $routeParams, SocketAdapter) ->
    socket = new SocketAdapter('/game')
    gameId = $routeParams['gameId']

    class PlayController
      constructor: ->
        @info = {}
        @userName= "User"
        @processingAnswer = false
        @currentAnswer = ''
        @userId = ''
        socket.waitForConnection()
        .then =>
          @userId = socket.id
          socket.emit('joinGame', {gameId, userName: @userName}, @_onJoinResponse)
          socket.on('userJoined', @_onUserJoined)
          socket.on('userLeft', @_onUserLeft)
          socket.on('answerGraded', @_onAnswerGraded)
          socket.on('questionEnded', @_onQuestionEnded)

      _parseGame: (data) =>
        @info = data

      _clearAnswerState: =>
        @processingAnswer = false
        @currentAnswer = ''

    #### Socket events
      _onUserJoined: (userInfo) =>
        for player in @info.players
          if player.id is userInfo.id then return
        @info.players.push(userInfo) if userInfo.id isnt @userId

      _onUserLeft: (userId) =>
        for player, i in @info.players
          if player.id is userId then return @info.players.splice(i,1)

      _onJoinResponse: (response)=>
        if response instanceof Error then return $location.url('/')

        @_parseGame(response)

      _onAnswerGraded: (result) =>
        @_clearAnswerState()

      _onQuestionEnded: (result) =>
        @_clearAnswerState()


    #### Public functions
      submitAnswer: =>
        if @processingAnswer then return

        @processingAnswer = true
        answerData =
          gameId: gameId
          answer: @currentAnswer
        socket.emit('answerQuestion', answerData )


    ctrl = new PlayController()
    $scope.game = ctrl
    return ctrl
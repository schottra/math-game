'use strict'

angular.module('mathgame.app')
  .controller 'PlayCtrl', ($scope, $window, $q, $location, $routeParams, SocketAdapter) ->
    socket = new SocketAdapter('/game')
    gameId = $routeParams['gameId']

    class PlayController
      constructor: ->
        @info = {}
        @userName= "User"
        @processingAnswer = false
        @currentAnswer = ''
        @showIncorrectAnswerNotice = false
        @userId = ''
        socket.on 'userId assigned', (id)=> @userId = id
        socket.waitForConnection()
        .then =>
          socket.emit('joinGame', {gameId, userName: @userName}, @_onJoinResponse)
          socket.on('userJoined', @_onUserJoined)
          socket.on('userLeft', @_onUserLeft)
          socket.on('answerIncorrect', @_onAnswerIncorrect)
          socket.on('questionEnded', @_onQuestionEnded)
          socket.on('newQuestion', @_onNewQuestion)

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
        if response?.error is 'gameNotFound' then $location.url('/')
        @_parseGame(response)

      _onAnswerIncorrect: =>
        @showIncorrectAnswerNotice = true
        @_clearAnswerState()

      _onQuestionEnded: (updatedQuestion) =>
        @_clearAnswerState()
        @info.currentQuestion = updatedQuestion

      _onNewQuestion: (newQuestion) =>
        @info.currentQuestion = newQuestion

    #### Public functions
      submitAnswer: =>
        if @processingAnswer then return

        @showIncorrectAnswerNotice = false
        @processingAnswer = true
        answerData =
          gameId: gameId
          answer: @currentAnswer
        socket.emit('answerQuestion', answerData )


    ctrl = new PlayController()
    $scope.game = ctrl
    return ctrl
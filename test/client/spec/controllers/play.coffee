'use strict'
_mocks = window._mocks

describe 'Controller: PlayCtrl', () ->

  # load the controller's module
  beforeEach module 'mathgame.specs'

  PlayCtrl = {}
  scope = {}
  $httpBackend = {}
  $location = {}
  routeParams = {}
  socket = {}
  window = {}
  socketAdapterMock = {}

  # Initialize the controller and a mock scope
  beforeEach inject (_$httpBackend_, $controller, $rootScope, _$location_, socketMock) ->
    $httpBackend = _$httpBackend_
    $location = _$location_

    socket = socketMock()
    socketAdapterMock = jasmine.createSpy('SocketAdapter').and.returnValue(socket)
    socket.id = 'validSocketId'

    spyOn(socket, 'on').and.callThrough()
    spyOn(socket, 'emit').and.callThrough()

    routeParams.gameId = 'randomString'

    scope = $rootScope.$new()
    PlayCtrl = $controller 'PlayCtrl', {
      $scope: scope
      SocketAdapter: socketAdapterMock
      $routeParams: routeParams
      $window: window
    }

  invokeEvent = (name, data) ->
    socket.listeners[name][0](data)

  connect = ->
    socket.connectionPromise.resolve()
    scope.$digest()


  it 'should expose itself as a scope property', ->
    expect(scope.game).toBe PlayCtrl

  it 'should connect to the game socket', ->
    expect(socketAdapterMock).toHaveBeenCalledWith '/game'

  it 'should emit a join message for the game after connecting', ->
    connect()
    expect(socket.emit).toHaveBeenCalledWith('joinGame',
      jasmine.objectContaining {userName: PlayCtrl.userName, gameId: 'randomString'}
      jasmine.any Function
    )

  it 'should handle failed game join message', ->
    socket.emit.and.callFake (event, data, cb) -> cb(new Error())
    connect()
    expect($location.url()).toBe '/'

  describe 'after joining', ->
    players = []
    gameData = {}

    beforeEach ->
      players = [
        {id: 'validUserId1', name: 'validUserName1'}
        {id: 'validUserId2', name: 'validUserName2'}
      ]

      gameData =
        players: players

      socket.emit.and.callFake (event, data, cb) -> cb(gameData) if event is 'joinGame'
      connect()

    it 'should attach to the appropriate events after joining a game', ->
      expectedListeners = [
        'userJoined'
        'userLeft'
        'answerIncorrect'
        'questionEnded'
        'newQuestion'
      ]

      expect(socket.on).toHaveBeenCalledWith(eName, jasmine.any(Function)) for eName in expectedListeners

    it 'should populate the scope with received game data after joining a game', ->
      expect(scope.game.info.players).toEqual players

    it 'should add a player when receiving the userJoined message', ->
      invokeEvent 'userJoined', {id: 'validUserId3', name: 'validUserName3'}
      expect(scope.game.info.players).toContain jasmine.objectContaining({id:'validUserId3'})

    it 'should not add duplicate player entries', ->
      invokeEvent 'userJoined', players[0]
      expect(scope.game.info.players.length).toBe 2

    it 'should remove a player when receiving the userLeft message', ->
      invokeEvent 'userLeft', 'validUserId1'
      expect(scope.game.info.players).not.toContain jasmine.objectContaining({id: 'validUserId1'})

    it 'should clear incorrect answer flag when submitting a new answer', ->
      scope.game.showIncorrectAnswerNotice = true
      scope.game.processingAnswer = false
      scope.game.currentAnswer = 'someAnswer'
      scope.game.submitAnswer()
      expect(scope.game.showIncorrectAnswerNotice).toBe false

    it 'should update current question when newQuestion event is received', ->
      newQuestion =
        text: 'question text'
        hasBeenAnswered: false
      invokeEvent 'newQuestion', newQuestion
      expect(scope.game.info.currentQuestion).toEqual newQuestion

    describe 'when answering a question', ->
      beforeEach ->
        gameData.currentQuestion =
          hasBeenAnswered: false
          text: "some question text"

        socket.emit.calls.reset()
        scope.game.currentAnswer = 'theAnswer'
        scope.game.submitAnswer()

      it 'should send game id when answering a question', ->
        expect(socket.emit).toHaveBeenCalledWith 'answerQuestion', jasmine.objectContaining({gameId: routeParams.gameId})

      it 'should set a processing state while a question is being graded', ->
        expect(scope.game.processingAnswer).toBe true

      it 'should not allow submission of another answer while the current answer is being graded', ->
        scope.game.currentAnsewr = 'theSecondAnswer'
        scope.game.submitAnswer()
        expect(socket.emit.calls.count()).toEqual 1

      it 'should clear processing state and current answer if answer is incorrect', ->
        expect(scope.game.processingAnswer).toBe true
        invokeEvent('answerIncorrect')
        expect(scope.game.processingAnswer).toBe false
        expect(scope.game.currentAnswer).toEqual ''

      it 'should set a flag when answer is incorrect', ->
        invokeEvent('answerIncorrect')
        expect(scope.game.showIncorrectAnswerNotice).toBe true

      it 'should clear processing state and currentAnswer when the question ends', ->
        invokeEvent('questionEnded', {winner: 'winnerId'})
        expect(scope.game.processingAnswer).toBe false
        expect(scope.game.currentAnswer).toBe ''

      it 'should update game infomation when the question ends', ->
        updatedQuestion =
          winner: 'winnerId'
          hasBeenAnswered: true
          text: 'someText'
          answer: 'theAnswer'
        invokeEvent('questionEnded', updatedQuestion)
        expect(scope.game.info.currentQuestion).toEqual updatedQuestion






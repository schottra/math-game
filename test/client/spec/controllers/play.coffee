'use strict'
_mocks = window._mocks

describe 'Controller: PlayCtrl', () ->

  # load the controller's module
  beforeEach module 'mathGameApp'

  PlayCtrl = {}
  scope = {}
  $httpBackend = {}
  $timeout = {}
  $location = {}
  routeParams = {}
  socket = {}
  window = {}

  # Initialize the controller and a mock scope
  beforeEach inject (_$httpBackend_, $controller, $rootScope, _$timeout_, _$location_) ->
    $httpBackend = _$httpBackend_
    $timeout = _$timeout_
    $location = _$location_

    socket = _mocks.socket()
    socket.id = 'validSocketId'

    window.io = -> socket
    spyOn(window, 'io').and.callThrough()
    spyOn(socket, 'on').and.callThrough()
    spyOn(socket, 'emit').and.callThrough()

    routeParams.gameId = 'randomString'

    scope = $rootScope.$new()
    PlayCtrl = $controller 'PlayCtrl', {
      $scope: scope
      $routeParams: routeParams
      $window: window
    }

  afterEach ->
    window.io = null

  invokeEvent = (name, data) ->
    socket.listeners[name][0](data)
    $timeout.flush()

  connect = ->
    invokeEvent('connect')
    scope.$digest()


  it 'should expose itself as a scope property', ->
    expect(scope.game).toBe PlayCtrl

  it 'should connect to the game socket', ->
    expect(window.io).toHaveBeenCalledWith '/game'

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
      expect(socket.on).toHaveBeenCalledWith 'userJoined', jasmine.any(Function)
      expect(socket.on).toHaveBeenCalledWith 'userLeft', jasmine.any(Function)

    it 'should populate the scope with received game data after joining a game', ->
      expect(scope.game.players).toEqual players

    it 'should add a player when receiving the userJoined message', ->
      invokeEvent 'userJoined', {id: 'validUserId3', name: 'validUserName3'}
      expect(scope.game.players).toContain jasmine.objectContaining({id:'validUserId3'})

    it 'should not add duplicate player entries', ->
      invokeEvent 'userJoined', players[0]
      expect(scope.game.players.length).toBe 2

    it 'should remove a player when receiving the userLeft message', ->
      invokeEvent 'userLeft', 'validUserId1'
      expect(scope.game.players).not.toContain jasmine.objectContaining({id: 'validUserId1'})




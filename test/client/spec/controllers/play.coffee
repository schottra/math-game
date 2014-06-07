'use strict'
_mocks = window._mocks

describe 'Controller: PlayCtrl', () ->

  # load the controller's module
  beforeEach module 'mathGameApp'

  PlayCtrl = {}
  scope = {}
  $httpBackend = {}
  routeParams = {}
  socket = {}

  # Initialize the controller and a mock scope
  beforeEach inject (_$httpBackend_, $controller, $rootScope) ->
    $httpBackend = _$httpBackend_

    socket = _mocks.socket()

    window.io = -> socket
    spyOn(window, 'io').and.callThrough()
    spyOn(socket, 'on').and.callThrough()
    spyOn(socket, 'in').and.returnValue(socket)
    spyOn(socket, 'emit').and.callThrough()

    routeParams.gameId = 'randomString'

    scope = $rootScope.$new()
    PlayCtrl = $controller 'PlayCtrl', {
      $scope: scope
      $routeParams: routeParams
    }

  afterEach ->
    window.io = null


  it 'should connect to the game socket', ->
    expect(window.io).toHaveBeenCalledWith('/game')

  it 'should join the game room upon successful connection', ->
    spyOn(socket, 'join').and.callThrough()
    socket.listeners['connect'][0]()
    scope.$digest()
    expect(socket.join).toHaveBeenCalledWith('randomString')

  it 'should emit a join message for the game after connecting', ->
    socket.listeners['connect'][0]()
    scope.$digest()
    expect(socket.emit).toHaveBeenCalledWith('joinGame',
      jasmine.objectContaining({userName: PlayCtrl.userName, gameId: 'randomString'}))


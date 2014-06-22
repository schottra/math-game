'use strict'

describe 'Controller: MainCtrl', () ->

  # load the controller's module
  beforeEach module 'mathGameSpecs'

  MainCtrl = {}
  scope = {}
  $httpBackend = {}
  $location = {}

  # Initialize the controller and a mock scope
  beforeEach inject (_$httpBackend_, $controller, $rootScope, _$location_) ->
    $httpBackend = _$httpBackend_
    $location = _$location_
    scope = $rootScope.$new()
    MainCtrl = $controller 'MainCtrl', {
      $scope: scope
    }

  it 'should request a new game via the api when starting', ->
    $httpBackend.expectPOST('/api/game').respond(201, {id: 'randomString'})
    MainCtrl.newGame()
    $httpBackend.flush()

  it 'should navigate to play page once game is created', ->
    $httpBackend.expectPOST('/api/game').respond(201, {id: 'randomString'})
    MainCtrl.newGame()
    $httpBackend.flush()
    expect($location.url()).toBe('/play/randomString')


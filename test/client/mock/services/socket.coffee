angular.module('mathgame.mocks').factory('socketMock', ($q)->
  return ->
    mock =
      connectionPromise: $q.defer()
      listeners: {}
      on: (e, fn) ->
        (@listeners[e] ?= []).push(fn)
      in: -> null
      emit: -> null
      join: -> null
      waitForConnection: -> @connectionPromise.promise
    return mock
)


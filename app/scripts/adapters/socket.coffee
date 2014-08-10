angular.module('mathgame.adapters').factory 'SocketAdapter', ($window, $q, $timeout) ->
  #todo: tests
  class SocketAdapter
    constructor: (address) ->
      @address = address
      @id = null
      @_socketConnected = $q.defer()
      @_socket = $window.io @address
      @_socket.on 'connect', => @_socketConnected.resolve()
      @_socket.on 'connect_error', (error)=> @_socketConnected.reject(error)

    waitForConnection: => @_socketConnected.promise

    emit: (eventName, data, fn)=>
      cb = if not fn? then null else ->
        args = arguments
        $timeout -> fn.apply(null, args)
      @_socket.emit(eventName, data, cb)

    # wrapping a $timeout around all socket events to ensure $digest loop will occur
    on: (eventName, fn)=>
      @_socket.on eventName, ->
        args = arguments
        $timeout -> fn.apply(null, args)

  return SocketAdapter

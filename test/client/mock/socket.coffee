window._mocks ?= {}
window._mocks.socket = ->
  listeners: {}
  on: (e, fn) ->
    (@listeners[e] ?= []).push(fn)
  in: -> null
  emit: -> null
  join: -> null


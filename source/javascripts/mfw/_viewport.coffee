#= require ./_drawable
#= require ./_viewport_events

class MFW.Viewport extends MFW.Drawable
  constructor: (drawable_id, options) ->
    super drawable_id, options
  init: ->
    super
    @event_manager = new MFW.ViewportEvents(this)
  render: (context) ->
    @validations.children = false
    super context
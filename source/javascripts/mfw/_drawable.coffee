class MFW.Drawable
  constructor: (drawable_id) ->
    @drawable = @get_drawing_area(drawable_id)
    @context = @get_context(@drawable)
    @init()
  get_drawing_area: (id) ->
    document.getElementById id
  get_context: (drawable) ->
    throw("Browser doesn't support canvas") if !drawable.getContext
    drawable.getContext("2d")
  init: ->
    window.addEventListener "resize", @on_resize

    @resize()
    @draw()
    return false


  # Public Methods

  resize: =>
    @drawable.width = window.innerWidth;
    @drawable.height = window.innerHeight;
  draw: ->
    # Drawing code goes here
  

  # Event Listeners

  on_resize: =>
    @resize()
    @draw()

#= require ./_display_list
class MFW.Drawable extends MFW.DisplayList
  constructor: (drawable_id, options) ->
    super options
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
    @render(@context)
    return false


  # Public Methods

  resize: =>
    @width = window.innerWidth;
    @height = window.innerHeight;
    @invalidate "size"

  render: ->
    @context.clearRect 0, 0, @width, @height
    super @context
    if !@validations.size
      @drawable.width = @width
      @drawable.height = @height
      @validate "size"
  
  # Event Listeners

  on_resize: =>
    @resize()
    @render()

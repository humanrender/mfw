class MFW.DisplayObject
  width: 0
  height: 0
  x: 0
  y: 0
  parent: null

  constructor: (options) ->
    @validations = {}
    if options
      _.extend(this, options)

  invalidate: (param) ->
    @validations[param] = false
  validate: (param) ->
    @validations[param] = true

  render: (context) ->

  remove: ->
    if @parent
      @parent.remove_child(this)
  destroy: ->
    @remove()
    @validations = null
    @parent = null

class MFW.DisplayList extends MFW.DisplayObject
  constructor: (options)->
    super options
    @children = []

  render: (context) ->
    super
    @update_display_list(context)
  update_display_list: (context) ->
    if !@validations.children
      for child, i in @children
        child.render (context)
      @validate "children"

  append: (child) ->
    @append_at(child)

  append_at: (child, index = -1)->
    if @children.indexOf child != -1
      if index == -1
        index = @children.length
      @children.splice(index, 0 , child)
      child.parent = this
      @invalidate "children"

  remove_child: (child) ->
    index = @children.indexOf(child)
    if(index != -1)
      @children.splice(index,1)

  destroy: ->
    super
    for child, i in @children
      children.destroy
    @children = null
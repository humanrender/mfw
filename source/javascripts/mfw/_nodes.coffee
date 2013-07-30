#= require ./_node
class MFW.Nodes
  constructor: ->
    @children = []
  append: (child) ->
    if @children.indexOf child != -1
      @children.push child
      return child

MFW.Nodes.instance = ->
  if !@_instance
    @_instance = new MFW.Nodes()
  @_instance

MFW.Nodes.create_node = (options) ->
  instance = @instance()
  instance.append new MFW.Node(options)
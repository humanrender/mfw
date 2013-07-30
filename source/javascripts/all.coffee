#= require ./_environment
#= require_tree ./mfw

class MFW.Application
  constructor: ->
    @viewport = new MFW.Viewport "viewport"

    @node = node = MFW.Nodes.create_node()
    @viewport.append node
    node.start()
    @node.x = node.parent.width/2
    @node.y = node.parent.height/2

    @play()

  play: ->
    requestAnimationFrame @on_play
  on_play: =>
    @viewport.render()
    requestAnimationFrame @on_play

new MFW.Application()
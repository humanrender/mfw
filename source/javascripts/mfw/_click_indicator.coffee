#= require ./_display_list
class MFW.ClickIndicator extends MFW.DisplayObject
  width: 0
  speed: 1
  opacity: 1
  constructor: (x, y) ->
    @x = x
    @y = y
    @opacity = 1
  render: (context)->
    super context
    context.beginPath();
    context.arc @x, @y, @width/2, 0, 2 * Math.PI, false;
    context.lineWidth = 2;
    context.strokeStyle = "rgba(48,38,28,#{@opacity})";
    context.stroke();

  start: ->
    TweenLite.to(this, 2, {
      width: 300, 
      opacity:0,
      ease:Expo.easeOut,
      onComplete: @on_complete})

  on_complete: =>
    @destroy()
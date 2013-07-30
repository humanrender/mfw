class MFW.Node extends MFW.DisplayObject
  width: 50
  height: 50

  speed: .5

  constructor: (options) ->
    super options
  render: (context) ->
    super context

    context.beginPath();
    context.arc @x, @y, @width/2, 0, 2 * Math.PI, false;
    context.fillStyle = '#0B8185';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#36544F';
    context.stroke();

  start: ->
    width = @width
    @width = 0
    @animate "width", width
  animate: (prop, val, options = {})->
    options[prop] = val
    TweenLite.to(this, @speed, options);
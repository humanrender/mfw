//= require ./_environment
//= require_tree ./mfw

class MFW.Viewport extends MFW.Drawable
  draw: ->
    @context.strokeStyle = "#000000";
    @context.fillStyle = "#FFFF00";
    @context.beginPath();
    @context.arc(100,100,50,0,Math.PI*2,true);
    @context.closePath();
    @context.stroke();
    @context.fill();

new MFW.Viewport "viewport"
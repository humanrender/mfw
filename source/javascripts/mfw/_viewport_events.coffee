#= require ./_click_indicator

class MFW.ViewportEvents
  constructor: (viewport) ->
    @prevent_click = false;
    @viewport = viewport;
    @viewport.drawable.addEventListener("click", _.throttle(@on_click,500))
    @viewport.drawable.addEventListener("touchstart", _.throttle(@on_touch_start, 500))
    
  on_click: (event)=>
    if !@prevent_click
      @new_click_indicator_at(event.clientX, event.clientY)
    else
      @prevent_click = false
    event.preventDefault()

  new_click_indicator_at: (x, y) ->
    click_indicator = new MFW.ClickIndicator(x, y)
    @viewport.append_at(click_indicator, 0)
    click_indicator.start()

  on_touch_start: (event)=>
    @prevent_click = true;
    touch = event.touches[0]
    @new_click_indicator_at(touch.clientX, touch.clientY)
    event.preventDefault();
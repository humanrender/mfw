#= require ./_click_indicator

class MFW.ViewportEvents
  constructor: (viewport) ->
    @viewport = viewport;
    @viewport.drawable.addEventListener("click", @on_click)
    
  on_click: (event)=>
    click_indicator = new MFW.ClickIndicator(event.clientX, event.clientY)
    @viewport.append_at(click_indicator, 0);
    click_indicator.start()
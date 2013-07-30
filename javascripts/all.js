var MFW;

(function() {
  var requestAnimationFrame;
  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  return window.requestAnimationFrame = requestAnimationFrame;
})();

MFW = {};
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MFW.DisplayObject = (function() {
  DisplayObject.prototype.width = 0;

  DisplayObject.prototype.height = 0;

  DisplayObject.prototype.x = 0;

  DisplayObject.prototype.y = 0;

  DisplayObject.prototype.parent = null;

  function DisplayObject(options) {
    this.validations = {};
    if (options) {
      _.extend(this, options);
    }
  }

  DisplayObject.prototype.invalidate = function(param) {
    return this.validations[param] = false;
  };

  DisplayObject.prototype.validate = function(param) {
    return this.validations[param] = true;
  };

  DisplayObject.prototype.render = function(context) {};

  DisplayObject.prototype.remove = function() {
    if (this.parent) {
      return this.parent.remove_child(this);
    }
  };

  DisplayObject.prototype.destroy = function() {
    this.remove();
    this.validations = null;
    return this.parent = null;
  };

  return DisplayObject;

})();

MFW.DisplayList = (function(_super) {
  __extends(DisplayList, _super);

  function DisplayList(options) {
    DisplayList.__super__.constructor.call(this, options);
    this.children = [];
  }

  DisplayList.prototype.render = function(context) {
    DisplayList.__super__.render.apply(this, arguments);
    return this.update_display_list(context);
  };

  DisplayList.prototype.update_display_list = function(context) {
    var child, i, _i, _len, _ref;
    if (!this.validations.children) {
      _ref = this.children;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        child = _ref[i];
        child.render(context);
      }
      return this.validate("children");
    }
  };

  DisplayList.prototype.append = function(child) {
    return this.append_at(child);
  };

  DisplayList.prototype.append_at = function(child, index) {
    if (index == null) {
      index = -1;
    }
    if (this.children.indexOf(child !== -1)) {
      if (index === -1) {
        index = this.children.length;
      }
      this.children.splice(index, 0, child);
      child.parent = this;
      return this.invalidate("children");
    }
  };

  DisplayList.prototype.remove_child = function(child) {
    var index;
    index = this.children.indexOf(child);
    if (index !== -1) {
      return this.children.splice(index, 1);
    }
  };

  DisplayList.prototype.destroy = function() {
    var child, i, _i, _len, _ref;
    DisplayList.__super__.destroy.apply(this, arguments);
    _ref = this.children;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      child = _ref[i];
      children.destroy;
    }
    return this.children = null;
  };

  return DisplayList;

})(MFW.DisplayObject);
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MFW.ClickIndicator = (function(_super) {
  __extends(ClickIndicator, _super);

  ClickIndicator.prototype.width = 0;

  ClickIndicator.prototype.speed = 1;

  ClickIndicator.prototype.opacity = 1;

  function ClickIndicator(x, y) {
    this.on_complete = __bind(this.on_complete, this);
    this.x = x;
    this.y = y;
    this.opacity = 1;
  }

  ClickIndicator.prototype.render = function(context) {
    ClickIndicator.__super__.render.call(this, context);
    context.beginPath();
    context.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI, false);
    context.lineWidth = 2;
    context.strokeStyle = "rgba(48,38,28," + this.opacity + ")";
    return context.stroke();
  };

  ClickIndicator.prototype.start = function() {
    return TweenLite.to(this, 2, {
      width: 300,
      opacity: 0,
      ease: Expo.easeOut,
      onComplete: this.on_complete
    });
  };

  ClickIndicator.prototype.on_complete = function() {
    return this.destroy();
  };

  return ClickIndicator;

})(MFW.DisplayObject);
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MFW.Drawable = (function(_super) {
  __extends(Drawable, _super);

  function Drawable(drawable_id, options) {
    this.on_resize = __bind(this.on_resize, this);
    this.resize = __bind(this.resize, this);
    Drawable.__super__.constructor.call(this, options);
    this.drawable = this.get_drawing_area(drawable_id);
    this.context = this.get_context(this.drawable);
    this.init();
  }

  Drawable.prototype.get_drawing_area = function(id) {
    return document.getElementById(id);
  };

  Drawable.prototype.get_context = function(drawable) {
    if (!drawable.getContext) {
      throw "Browser doesn't support canvas";
    }
    return drawable.getContext("2d");
  };

  Drawable.prototype.init = function() {
    window.addEventListener("resize", this.on_resize);
    this.resize();
    this.render(this.context);
    return false;
  };

  Drawable.prototype.resize = function() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    return this.invalidate("size");
  };

  Drawable.prototype.render = function() {
    this.context.clearRect(0, 0, this.width, this.height);
    Drawable.__super__.render.call(this, this.context);
    if (!this.validations.size) {
      this.drawable.width = this.width;
      this.drawable.height = this.height;
      return this.validate("size");
    }
  };

  Drawable.prototype.on_resize = function() {
    this.resize();
    return this.render();
  };

  return Drawable;

})(MFW.DisplayList);
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MFW.Node = (function(_super) {
  __extends(Node, _super);

  Node.prototype.width = 50;

  Node.prototype.height = 50;

  Node.prototype.speed = .5;

  function Node(options) {
    Node.__super__.constructor.call(this, options);
  }

  Node.prototype.render = function(context) {
    Node.__super__.render.call(this, context);
    context.beginPath();
    context.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI, false);
    context.fillStyle = '#0B8185';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#36544F';
    return context.stroke();
  };

  Node.prototype.start = function() {
    var width;
    width = this.width;
    this.width = 0;
    return this.animate("width", width);
  };

  Node.prototype.animate = function(prop, val, options) {
    if (options == null) {
      options = {};
    }
    options[prop] = val;
    return TweenLite.to(this, this.speed, options);
  };

  return Node;

})(MFW.DisplayObject);
MFW.Nodes = (function() {
  function Nodes() {
    this.children = [];
  }

  Nodes.prototype.append = function(child) {
    if (this.children.indexOf(child !== -1)) {
      this.children.push(child);
      return child;
    }
  };

  return Nodes;

})();

MFW.Nodes.instance = function() {
  if (!this._instance) {
    this._instance = new MFW.Nodes();
  }
  return this._instance;
};

MFW.Nodes.create_node = function(options) {
  var instance;
  instance = this.instance();
  return instance.append(new MFW.Node(options));
};
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

MFW.ViewportEvents = (function() {
  function ViewportEvents(viewport) {
    this.on_touch_start = __bind(this.on_touch_start, this);
    this.on_click = __bind(this.on_click, this);
    this.prevent_click = false;
    this.viewport = viewport;
    this.viewport.drawable.addEventListener("click", _.throttle(this.on_click, 500));
    this.viewport.drawable.addEventListener("touchstart", _.throttle(this.on_touch_start, 500));
  }

  ViewportEvents.prototype.on_click = function(event) {
    if (!this.prevent_click) {
      this.new_click_indicator_at(event.clientX, event.clientY);
    } else {
      this.prevent_click = false;
    }
    return event.preventDefault();
  };

  ViewportEvents.prototype.new_click_indicator_at = function(x, y) {
    var click_indicator;
    click_indicator = new MFW.ClickIndicator(x, y);
    this.viewport.append_at(click_indicator, 0);
    return click_indicator.start();
  };

  ViewportEvents.prototype.on_touch_start = function(event) {
    var touch;
    this.prevent_click = true;
    touch = event.touches[0];
    this.new_click_indicator_at(touch.clientX, touch.clientY);
    return event.preventDefault();
  };

  return ViewportEvents;

})();
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MFW.Viewport = (function(_super) {
  __extends(Viewport, _super);

  function Viewport(drawable_id, options) {
    Viewport.__super__.constructor.call(this, drawable_id, options);
  }

  Viewport.prototype.init = function() {
    Viewport.__super__.init.apply(this, arguments);
    return this.event_manager = new MFW.ViewportEvents(this);
  };

  Viewport.prototype.render = function(context) {
    this.validations.children = false;
    return Viewport.__super__.render.call(this, context);
  };

  return Viewport;

})(MFW.Drawable);
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

MFW.Application = (function() {
  function Application() {
    this.on_play = __bind(this.on_play, this);
    var node;
    this.viewport = new MFW.Viewport("viewport");
    this.node = node = MFW.Nodes.create_node();
    this.viewport.append(node);
    node.start();
    this.node.x = node.parent.width / 2;
    this.node.y = node.parent.height / 2;
    this.play();
  }

  Application.prototype.play = function() {
    return requestAnimationFrame(this.on_play);
  };

  Application.prototype.on_play = function() {
    this.viewport.render();
    return requestAnimationFrame(this.on_play);
  };

  return Application;

})();

new MFW.Application();

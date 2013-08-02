(function( $ ){
  var methods = {

    init : function( options ) { 
     	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data("jquery.swipe");
			
			if (!plugin) {
				plugin = new Swipe(item, options);
				$this.data("jquery.swipe", plugin);
			}
			else if(plugin && options) {
				plugin.updateOptions(options);
			}
    	});
    }
  };
  
  function Swipe(element, options) {
  	  this.SwipeLeftHandler = undefined;
	  this.SwipeRightHandler = undefined;
	  this.SwipeUpHandler = undefined;
	  this.SwipeDownHandler = undefined;
	  
	  var LEFT = 0, RIGHT = 1, UP = 2, DOWN = 3;	
	
	  this.$element = undefined;
	
	  this.startTime = 0, endTime = 0;
	  this.startPosition = {x:0,y:0};
	  this.endPosition = {x:0, y:0};
	  this.delta = {x:0, y:0};
	  this.deltaDirection = {x: 0, y: 0};
	  this.touched = false;
	
	  this.duration = 0;
	  this.direction = -1;
	  this.swipeThreshold = 10;
	  this.durationThreshold = 1000;
	  
	  if(options.threshold) this.swipeThreshold = options.threshold;
      if(options.durationThreshold) this.durationThreshold = options.durationThreshold;
      if(options.swipeLeft) this.SwipeLeftHandler = options.swipeLeft;
      if(options.swipeRight) this.SwipeRightHandler = options.swipeRight;
      if(options.swipeDown) this.SwipeDownHandler = options.swipeDown;
      if(options.swipeUp) this.SwipeUpHandler = options.swipeUp;
      
      this.$element = $(element);
      
      this.init = function() {
		var _this = this;
		this.$element[0].addEventListener("touchend", function(e) {
			_this.touchEnd(e);
		}, false);
		this.$element[0].addEventListener("touchstart", function(e) {
			_this.touchStart(e)
		}, false);
		this.$element[0].addEventListener("touchmove", function(e) {
			_this.touchMove(e)
		}, true);
      };
	  
	  /** Prevent the dragstart on the element **/
	  //$element.bind("dragstart", function(e) { e.preventDefault(); });
	  
	  this.updateOptions = function(options) {
		  if(options.threshold) this.swipeThreshold = options.threshold;
		  if(options.durationThreshold) this.durationThreshold = options.durationThreshold;
		  if(options.swipeLeft) this.SwipeLeftHandler = options.swipeLeft;
		  if(options.swipeRight) this.SwipeRightHandler = options.swipeRight;
		  if(options.swipeDown) this.SwipeDownHandler = options.swipeDown;
		  if(options.swipeUp) this.SwipeUpHandler = options.swipeUp;
	  };
	  
	  this.touchStart = function(event) {
	  		var clientX = event.pageX;
	  		var clientY = event.pageY;
	  		
	  		if(event.targetedTouches)
	  		{
                first = event.targetedTouches[0];
	
				clientX = first.pageX;
				clientY = first.pageY;
	  		}
	  
			this.startTime = this.endTime = Date.now();
			this.startPosition.x = this.endPosition.x = clientX;
			this.startPosition.y = this.endPosition.y = clientY;
			
			this.duration = 0;
			this.direction = -1;
			
			this.touched = true;
	  };
	  
	  this.touchMove = function(event) {
	  		var clientX = event.pageX;
	  		var clientY = event.pageY;
	
	  		if(event.targetedTouches)
	  		{
                first = event.targetedTouches[0];
	
				clientX = first.pageX;
				clientY = first.pageY;
	  		}
	  
	  		this.endTime = Date.now();
			this.endPosition.x = clientX;
			this.endPosition.y = clientY;
			
			this.delta.x = Math.abs(this.endPosition.x - this.startPosition.x);
			this.delta.y = Math.abs(this.endPosition.y - this.startPosition.y);
			this.deltaDirection.x = this.endPosition.x - this.startPosition.x;
			this.deltaDirection.y = this.endPosition.y - this.startPosition.y;
	  		
	  		this.direction = this.getDirection();
			this.duration = this.getDuration();
	
            if(this.direction == UP && this.SwipeUpHandler) {
                this.touchEnd(event);
            }
            else if(this.direction == DOWN && this.SwipeDownHandler) {
            	this.touchEnd(event);
            }
            else if(this.direction == LEFT && this.SwipeLeftHandler) {
            	this.touchEnd(event);
            }
            else if(this.direction == RIGHT && this.SwipeRightHandler) {
            	this.touchEnd(event);
            }
	  };
	
	  this.touchEnd = function(event) {
	  		event.stopPropagation();
            event.preventDefault();
            
            if(this.touched) {
				var clientX = event.pageX;
				var clientY = event.pageY;
	  
				if(event.changedTouches)
				{
					first = event.changedTouches[0];
	
					clientX = first.pageX;
					clientY = first.pageY;
				}
	  
				this.endTime = Date.now();
				this.endPosition.x = clientX;
				this.endPosition.y = clientY;
			
				this.delta.x = Math.abs(this.endPosition.x - this.startPosition.x);
				this.delta.y = Math.abs(this.endPosition.y - this.startPosition.y);
				this.deltaDirection.x = this.endPosition.x - this.startPosition.x;
				this.deltaDirection.y = this.endPosition.y - this.startPosition.y;
			
				this.direction = this.getDirection();
				this.duration = this.getDuration();
			
				if(this.direction != -1) {
					this.triggerHandler(event);
					this.touched = false;
				}
			}
	  };
	  
	  this.triggerHandler = function(event) {
	  		var _this = this;
			if(this.direction == LEFT)
			{
				if(this.SwipeLeftHandler) {
					setTimeout(function() {
						_this.SwipeLeftHandler.call(_this.$element[0], event, _this.duration);
					}, 0);
				}
			}
			else if(this.direction == RIGHT)
			{
				if(this.SwipeRightHandler) {
					setTimeout(function() {
						_this.SwipeRightHandler.call(_this.$element[0], event, _this.duration);
					}, 0);
				}
			}
			else if(this.direction == DOWN)
			{
				if(this.SwipeDownHandler) {
					setTimeout(function() {
						_this.SwipeDownHandler.call(_this.$element[0], event, _this.duration);
					}, 0);
				}
			}
			else if(this.direction == UP)
			{
				if(this.SwipeUpHandler) {
					setTimeout(function() {
						_this.SwipeUpHandler.call(_this.$element[0], event, _this.duration);
					}, 0);
				}
			}
	  };
	  
	  this.getDuration = function() {
			return this.endTime - this.startTime;
	  };
	  
	  this.getDirection = function() {
			if(this.delta.x > this.swipeThreshold && this.delta.y < this.swipeThreshold) {
				if(this.deltaDirection.x > 0)
					return RIGHT;
				else if(this.deltaDirection.x < 0)
					return LEFT;
			}
			else if(this.delta.y > this.swipeThreshold && this.delta.x < this.swipeThreshold) {
				if(this.deltaDirection.y > 0)
					return DOWN;
				else if(this.deltaDirection.y < 0)
					return UP;
			}
			else
			{
				return -1;
			}
	  };
	  
	  this.init();
  }
  
  $.fn.swipe = function( method ) {
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.swipe' );
    }    
  
  };

})( jQuery );
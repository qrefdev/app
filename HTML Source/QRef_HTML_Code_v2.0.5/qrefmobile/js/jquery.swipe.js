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
    	});
    }
  };
  
  function Swipe(element, options) {
  	  var SwipeLeftHandler = undefined;
	  var SwipeRightHandler = undefined;
	  var SwipeUpHandler = undefined;
	  var SwipeDownHandler = undefined;
	  
	  var LEFT = 0, RIGHT = 1, UP = 2, DOWN = 3;	
	
	  var $element = undefined;
	
	  var startTime = 0, endTime = 0;
	  var startPosition = {x:0,y:0};
	  var endPosition = {x:0, y:0};
	  var delta = {x:0, y:0};
	  var deltaDirection = {x: 0, y: 0};
	  var touched = false;
	
	  var duration = 0;
	  var direction = -1;
	  var swipeThreshold = 20;
	  var durationThreshold = 1000;
	  
	  if(options.threshold) swipeThreshold = options.threshold;
      if(options.durationThreshold) durationThreshold = options.durationThreshold;
      if(options.swipeLeft) SwipeLeftHandler = options.swipeLeft;
      if(options.swipeRight) SwipeRightHandler = options.swipeRight;
      if(options.swipeDown) SwipeDownHandler = options.swipeDown;
      if(options.swipeUp) SwipeUpHandler = options.swipeUp;
      
      $element = $(element);
      
      $element.mouseup(touchEnd);
      $element.mousedown(touchStart);
      $element.mousemove(touchMove);
		
	  function touchMove(event) {
		if(touched)
			event.preventDefault();
	  }
	  
	  function touchStart(event) {
			event.preventDefault();
			startTime = endTime = Date.now();
			startPosition.x = endPosition.x = event.pageX;
			startPosition.y = endPosition.y = event.pageY;
			
			duration = 0;
			direction = -1;
			
			touched = true;
	  }
	  
	  function touchEnd(event) {
			event.preventDefault();
			endTime = Date.now();
			endPosition.x = event.pageX;
			endPosition.y = event.pageY;
			
			delta.x = Math.abs(endPosition.x - startPosition.x);
			delta.y = Math.abs(endPosition.y - startPosition.y);
			deltaDirection.x = endPosition.x - startPosition.x;
			deltaDirection.y = endPosition.y - startPosition.y;
			
			direction = getDirection();
			duration = getDuration();
			
			if(duration < durationThreshold && direction != -1) {
				triggerHandler(event);
			}
			
			touched = false;
	  }
	  
	  function triggerHandler(event) {
			if(direction == LEFT)
			{
				if(SwipeLeftHandler) SwipeLeftHandler.call($element, event, duration);
			}
			else if(direction == RIGHT)
			{
				if(SwipeRightHandler) SwipeRightHandler.call($element, event, duration);
			}
			else if(direction == DOWN)
			{
				if(SwipeDownHandler) SwipeDownHandler.call($element, event, duration);
			}
			else if(direction == UP)
			{
				if(SwipeUpHandler) SwipeUpHandler.call($element, event, duration);
			}
	  }
	  
	  function getDuration() {
			return endTime - startTime;
	  }
	  
	  function getDirection() {
			if(delta.x > swipeThreshold && delta.y < swipeThreshold) {
				if(deltaDirection.x > 0)
					return RIGHT;
				else if(deltaDirection.x < 0)
					return LEFT;
			}
			else if(delta.y > swipeThreshold && delta.x < swipeThreshold) {
				if(deltaDirection.y > 0)
					return DOWN;
				else if(deltaDirection.y < 0)
					return UP;
			}
			else
			{
				return -1;
			}
	  }

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
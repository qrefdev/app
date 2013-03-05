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
	  var swipeThreshold = 10;
	  var durationThreshold = 1000;
	  
	  if(options.threshold) swipeThreshold = options.threshold;
      if(options.durationThreshold) durationThreshold = options.durationThreshold;
      if(options.swipeLeft) SwipeLeftHandler = options.swipeLeft;
      if(options.swipeRight) SwipeRightHandler = options.swipeRight;
      if(options.swipeDown) SwipeDownHandler = options.swipeDown;
      if(options.swipeUp) SwipeUpHandler = options.swipeUp;
      
      $element = $(element);
      
      //if(typeof TouchEvent == 'undefined' || typeof Touch == "undefined")
      //{
      	//$element.mouseup(touchEnd);
      	//$element.mousedown(touchStart);
      //}
      //else
      //{
      	  $element[0].addEventListener("touchend", touchEnd, false);
		  $element[0].addEventListener("touchstart", touchStart, false);
		  $element[0].addEventListener("touchmove", touchMove, true);
  	  //}
	  
	  /** Prevent the dragstart on the element **/
	  //$element.bind("dragstart", function(e) { e.preventDefault(); });
	  
	  this.updateOptions = function(options) {
		  if(options.threshold) swipeThreshold = options.threshold;
		  if(options.durationThreshold) durationThreshold = options.durationThreshold;
		  if(options.swipeLeft) SwipeLeftHandler = options.swipeLeft;
		  if(options.swipeRight) SwipeRightHandler = options.swipeRight;
		  if(options.swipeDown) SwipeDownHandler = options.swipeDown;
		  if(options.swipeUp) SwipeUpHandler = options.swipeUp;
	  };
	  
	  function touchStart(event) {
	  		var clientX = event.pageX;
	  		var clientY = event.pageY;
	  		
	  		if(event.targetedTouches)
	  		{
                first = event.targetedTouches[0];
	
				clientX = first.pageX;
				clientY = first.pageY;
	  		}
	  
			startTime = endTime = Date.now();
			startPosition.x = endPosition.x = clientX;
			startPosition.y = endPosition.y = clientY;
			
			duration = 0;
			direction = -1;
			
			touched = true;
	  }
	  
	  function touchMove(event) {
	  		var clientX = event.pageX;
	  		var clientY = event.pageY;
	
	  		if(event.targetedTouches)
	  		{
                first = event.targetedTouches[0];
	
				clientX = first.pageX;
				clientY = first.pageY;
	  		}
	  
	  		endTime = Date.now();
			endPosition.x = clientX;
			endPosition.y = clientY;
			
			delta.x = Math.abs(endPosition.x - startPosition.x);
			delta.y = Math.abs(endPosition.y - startPosition.y);
			deltaDirection.x = endPosition.x - startPosition.x;
			deltaDirection.y = endPosition.y - startPosition.y;
	  		
	  		direction = getDirection();
			duration = getDuration();
	
            if(direction == UP && SwipeUpHandler)
                event.preventDefault();
            else if(direction == DOWN && SwipeDownHandler)
                event.preventDefault();
            else if(direction == LEFT && SwipeLeftHandler)
                event.preventDefault();
            else if(direction == RIGHT && SwipeRightHandler)
                event.preventDefault();
	  }
	
	  function touchEnd(event) {
	  		var clientX = event.pageX;
	  		var clientY = event.pageY;
	  
	  		if(event.changedTouches)
	  		{
                first = event.changedTouches[0];
	
				clientX = first.pageX;
				clientY = first.pageY;
	  		}
	  
			endTime = Date.now();
			endPosition.x = clientX;
			endPosition.y = clientY;
			
			delta.x = Math.abs(endPosition.x - startPosition.x);
			delta.y = Math.abs(endPosition.y - startPosition.y);
			deltaDirection.x = endPosition.x - startPosition.x;
			deltaDirection.y = endPosition.y - startPosition.y;
			
			direction = getDirection();
			duration = getDuration();
			
			if(direction != -1) {
				triggerHandler(event);
			}
			
			touched = false;
	  }
	  
	  function triggerHandler(event) {
			if(direction == LEFT)
			{
				if(SwipeLeftHandler) SwipeLeftHandler.call($element[0], event, duration);
			}
			else if(direction == RIGHT)
			{
				if(SwipeRightHandler) SwipeRightHandler.call($element[0], event, duration);
			}
			else if(direction == DOWN)
			{
				if(SwipeDownHandler) SwipeDownHandler.call($element[0], event, duration);
			}
			else if(direction == UP)
			{
				if(SwipeUpHandler) SwipeUpHandler.call($element[0], event, duration);
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
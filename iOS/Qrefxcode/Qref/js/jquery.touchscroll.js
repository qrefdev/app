(function( $ ){	
  var methods = {

    init : function( options ) { 
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data("jquery.touchscroll");
			
			if (!plugin) {
				plugin = new TouchScroll(item, options);
				$this.data("jquery.touchscroll", plugin);
			}
    	});
    },
    
    disableScroll : function() {
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data("jquery.touchscroll");
			
			if (plugin) {
				plugin.disableScroll();
			}
    	});
    },
    
    enableScroll : function() {
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data("jquery.touchscroll");
			
			if (plugin) {
				plugin.enableScroll();
			}
    	});
    }
  };
  
  function TouchScroll(element, options) {
  	  var $element = undefined;
	  var $container = undefined;

	  var bottomReachedHandler = undefined;
	  var beforeScrollHandler = undefined;
	  var afterScrollHandler = undefined;

	  var startTime = 0, endTime = 0;
	
	  var disableScroll = false;
	
	  var threshold = 250;
	  var direction = "vertical"
	  var deltaDirection = {x: 0, y: 0};
	  var startPosition = {x: 0, y: 0};
	  var previousPosition = {x: 0, y: 0};
	  var endPosition = {x: 0, y: 0};
	  var touched = false;
	  
	  if(options.threshold) threshold = options.threshold;
      if(typeof options.direction === "string") direction = options.direction; 
      if(options.onEndReached) bottomReachedHandler = options.onEndReached;
      if(options.onBeforeScroll) beforeScrollHandler = options.onBeforeScroll;
      if(options.onAfterScroll) afterScrollHandler = options.onAfterScroll;
      
      $element = $(element);
       
      var $window = $(window);
      
     /* if(typeof TouchEvent == 'undefined' || typeof Touch == "undefined")
      {
      	$element.mouseup(touchEnd);
      	$element.mousemove(touchMove);
      	$element.mousedown(touchStart);
      	
      	$window.mouseup(function(e) {
  	  		touched = false;
  	  	});
  	  }
  	  else
  	  {*/
		  $element[0].addEventListener("touchend", touchEnd, false);
		  $element[0].addEventListener("touchstart", touchStart, false);
		  $element[0].addEventListener("touchmove", touchMove, false);
		  
		 
		  window.addEventListener("touchend", function(e) {
				touchEnd(e);
		  }, true);
  	  //}

  	  
  
  	   /** Prevent the dragstart on the element **/
	  $element.bind("dragstart", function(e) { e.preventDefault(); });
  
  	  this.disableScroll = function() {
  	  	disableScroll = true;
  	  };
  	  
  	  this.enableScroll = function() {
  	  	disableScroll = false;
  	  };
  
	  function touchStart(event) {
	  		var clientX = event.pageX;
	  		var clientY = event.pageY;
	  		
	  		if(event.touches)
	  		{
				first = event.touches[0]
				
				clientX = first.pageX;
				clientY = first.pageY;
	  		}
	  		
			startTime = endTime = Date.now();
			startPosition.x = endPosition.x = previousPosition.x = clientX;
			startPosition.y = endPosition.y = previousPosition.y = clientY;

			touched = true;
	  }
	  
	  function touchMove(event) {
	  		var clientX = event.pageX;
	  		var clientY = event.pageY;
	  
	  		event.preventDefault();
	  
	  		if(event.touches)
	  		{
				first = event.touches[0]
				
				clientX = first.pageX;
				clientY = first.pageY;
	  		}
	  
			endTime = Date.now();
			var duration = getDuration();
			endPosition.x = clientX;
			endPosition.y = clientY;
			
			calculateDirection();
			
			if(beforeScrollHandler) {
				setTimeout(function() {
					beforeScrollHandler.call($element, event);
				}, 1 / 60);
			}
			
			if(touched && duration > threshold && !disableScroll) {
				scroll();	
			}
	  }
	  
	  function touchEnd(event) {
			endTime = Date.now();
			
			var duration = getDuration();
			calculateDirection();
			touched = false;
			
			if(duration > threshold && !disableScroll) {
				scroll();
			}
	  }
	  
	  function scroll() {
	  		if(touched)
	  		{
	  			if(direction == "vertical")
	  			{
	  				scrollVertical();
	  			}
	  			else
	  			{
	  				scrollHorizontal();
	  			}
	  		}
	  		else
	  		{
	  			if(getDuration() < 500) {
					if(direction == "vertical")
					{
						scrollVerticalAuto();
					}
					else
					{
						scrollHorizontalAuto();
					}
	  			}
	
	  			if(afterScrollHandler) {
	  				setTimeout(function() {
	  					afterScrollHandler.call($element);
	  				}, 1 / 60);
	  			}
	  		}
	  }
	  
	  function scrollVertical() {
			var duration = getDuration();
			
			var velocity = deltaDirection.y / (duration / 1000);
			var momentum = 0.01 * velocity;
			
			var deltaY = (endPosition.y - previousPosition.y) + momentum;
            var deltaYNoMomentum = (endPosition.y - previousPosition.y);
 
            var scrollHeight = $element[0].scrollHeight - $element.innerHeight();
			var scrollTop = $element.scrollTop();
            var top = $element.position().top;
 
			$element.stop(true);
			
	  		if(deltaDirection.y < 0)
			{
				if(scrollTop - deltaY < scrollHeight)
				{
					$element.scrollTop(scrollTop - deltaY);
				}
				else {
					$element.scrollTop(scrollHeight);
					
					$element.css({top: (top + (deltaYNoMomentum - momentum)) + 'px'});
					
					if(bottomReachedHandler) {
						setTimeout(function() {
							bottomReachedHandler.call($element);
						}, 1 / 60);
					}
				}
			}
			else if(deltaDirection.y > 0)
			{
				if(scrollTop - deltaY > 0) {
					$element.scrollTop(scrollTop - deltaY);
				}
				else {
					$element.scrollTop(0);
					$element.css({top: (top + (deltaYNoMomentum - momentum)) + 'px'});
				}
			}
			
			previousPosition.y = endPosition.y;
	  }
	  
	   function scrollVerticalAuto() {
			var duration = getDuration();
			
			var velocity = deltaDirection.y / (duration / 1000);
			var momentum = 0.45 * velocity;
			
			var deltaY = (endPosition.y - previousPosition.y) + momentum;;
			
			var scrollHeight = $element[0].scrollHeight - $element.innerHeight();
			var scrollTop = $element.scrollTop();
			
	  		if(deltaDirection.y < 0)
			{
				if(scrollTop - deltaY < scrollHeight)
				{
                    $element.css({top: '0px'});
					$element.animate({scrollTop: scrollTop - deltaY}, 850, 'easeOutCirc');
				}
				else {
                    $element.animate({top: '0px'}, "slow", "easeOutBounce");
 
					$element.animate({scrollTop: scrollHeight},850, 'easeOutCirc', function() {
						if(bottomReachedHandler) {
							setTimeout(function() {
								bottomReachedHandler.call($element);
							}, 1 / 60);
						}
					});
				}
			}
			else if(deltaDirection.y > 0)
			{
				if(scrollTop - deltaY > 0) {
                    $element.css({top: '0px'});
					$element.animate({scrollTop: scrollTop - deltaY}, 850, 'easeOutCirc');
				}
				else {
                    $element.animate({top: '0px'}, "slow", "easeOutBounce");
					$element.animate({scrollTop: 0}, 850, 'easeOutCirc');
				}
			}
	  }
	  
	  function scrollHorizontal() {
			var duration = getDuration();
			
			var velocity = deltaDirection.x / (duration / 1000);
			var momentum = 0.05 * velocity;
			
			var deltaX = (endPosition.x - previousPosition.x) + momentum;
			
			var scrollWidth = $element[0].scrollWidth;
			var scrollLeft = $element.scrollLeft();
			
	  		if(deltaDirection.x < 0)
			{
				if(scrollLeft - deltaX < scrollWidth)
				{
					$element.scrollLeft(scrollLeft - deltaX);
				}
				else
				{
					$element.scrollLeft(scrollWidth);
					
					if(bottomReachedHandler) {
						setTimeout(function() {
							bottomReachedHandler.call($element);
						}, 1 / 60);
					}
				}
			}
			else if(deltaDirection.x > 0)
			{
				if(scrollLeft - deltaX > 0) {
					$element.scrollLeft(scrollTop - deltaX);
				}
				else
				{
					$element.scrollLeft(0);
				}
			}
			
			previousPosition.x = endPosition.x;
	  }
	  
	  function scrollHorizontalAuto() {
	  		var duration = getDuration();
			
			var velocity = deltaDirection.x / (duration / 1000);
			var momentum = 0.5 * velocity;
			
			var deltaX = (endPosition.x - previousPosition.x) + momentum;
			
			var scrollWidth = $element[0].scrollWidth;
			var scrollLeft = $element.scrollLeft();
			
	  		if(deltaDirection.x < 0)
			{
				if(scrollLeft - deltaX < scrollWidth)
				{
					$element.animate({scrollLeft: scrollLeft - deltaX}, 100);
				}
				else
				{
					$element.animate({scrollLeft: scrollWidth}, 100, function() {
						if(bottomReachedHandler) {
							setTimeout(function() {
								bottomReachedHandler.call($element);
							}, 1 / 60);
						}
					});
				}
			}
			else if(deltaDirection.x > 0)
			{
				if(scrollLeft - deltaX > 0) {
					$element.animate({scrollLeft: scrollTop - deltaX}, 100);
				}
				else
				{
					$element.animate({scrollLeft: 0}, 100);
				}
			}
	  }
	  
	  function getDistance() {
	  	var distance = {x: 0, y: 0};
	  	
	  	distance.x = Math.abs(endPosition.x - startPosition.x);
	  	distance.y = Math.abs(endPosition.y - startPosition.y);
	  	
	  	return distance; 
	  }
	  
	  function calculateDirection() {
	  	 deltaDirection.x = endPosition.x - startPosition.x;
	  	 deltaDirection.y = endPosition.y - startPosition.y;
	  }
	  
	  function getDuration() {
			return endTime - startTime;
	  }
  }

  $.fn.touchScroll = function( method ) {
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.touchScroll' );
    }    
  
  };

})( jQuery );
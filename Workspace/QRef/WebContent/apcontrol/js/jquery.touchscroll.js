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
    },
    
    enableReverseScroll : function() {
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data("jquery.touchscroll");
			
			if (plugin) {
				plugin.enableReverseScroll();
			}
    	});
    },
    
    disableReverseScroll : function() {
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data("jquery.touchscroll");
			
			if (plugin) {
				plugin.disableReverseScroll();
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
	  var reverseScroll = false;
	
	  var threshold = 200;
	  var direction = "vertical"
	  var previousDistance = {x: 0, y:0};
	  var deltaDirection = {x: 0, y: 0};
	  var startPosition = {x: 0, y: 0};
	  var endPosition = {x: 0, y: 0};
	  var touched = false;
	  
	  if(options.threshold) threshold = options.threshold;
      if(typeof options.direction === "string") direction = options.direction; 
      if(options.onEndReached) bottomReachedHandler = options.onEndReached;
      if(options.onBeforeScroll) beforeScrollHandler = options.onBeforeScroll;
      if(options.onAfterScroll) afterScrollHandler = options.onAfterScroll;
      
      $element = $(element);
      $container = $($element.find(".container")[0]);
      
      var hasContainer = ($container.length > 0) ? true : false; 
      var $window = $(window);
      
      if(typeof TouchEvent == 'undefined' || typeof Touch == "undefined")
      {
      	$element.mouseup(touchEnd);
      	$element.mousemove(touchMove);
      	$element.mousedown(touchStart);
      	
      	$window.mouseup(function(e) {
  	  		touched = false;
  	  	});
  	  }
  	  else
  	  {
		  $element[0].addEventListener("touchend", touchEnd, true);
		  $element[0].addEventListener("touchstart", touchStart, true);
		  $element[0].addEventListener("touchmove", touchMove, true);
		  
		 
		  window.addEventListener("touchend", function(e) {
				touched = false;
		  }, true);
  	  }

  	  
  
  	   /** Prevent the dragstart on the element **/
	  $element.bind("dragstart", function(e) { e.preventDefault(); });
  	  $container.bind("dragstart", function(e) { e.preventDefault(); });
  
  	  this.disableScroll = function() {
  	  	disableScroll = true;
  	  };
  	  
  	  this.enableScroll = function() {
  	  	disableScroll = false;
  	  };
  
  	  this.enableReverseScroll = function() {
  	  	reverseScroll = true;
  	  };
  	  
  	  this.disableReverseScroll = function() {
  	  	reverseScroll = false;
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
			startPosition.x = endPosition.x = clientX;
			startPosition.y = endPosition.y = clientY;
			
			previousDistance.x = 0;
			previousDistance.y = 0;
			touched = true;
	  }
	  
	  function touchMove(event) {
	  		var clientX = event.pageX;
	  		var clientY = event.pageY;
	  
	  		if(event.touches)
	  		{
				first = event.touches[0]
				
				clientX = first.pageX;
				clientY = first.pageY;
				
				event.preventDefault();
	  		}
	  
			endTime = Date.now();
			var duration = getDuration();
			endPosition.x = clientX;
			endPosition.y = clientY;
			
			calculateDirection();
			
			if(beforeScrollHandler)
				beforeScrollHandler.call($element, event);
			
			if(touched && duration > threshold && hasContainer && !disableScroll) {
				scroll(event);	
			}
	  }
	  
	  function touchEnd(event) {
			endTime = Date.now();
			
			
			var duration = getDuration();
			calculateDirection();
			touched = false;
			
			if(duration > threshold && hasContainer && !disableScroll) {
				scroll();
			}
	  }
	  
	  function scroll(event) {
	  		if(touched)
	  		{
	  			if(direction == "vertical")
	  			{
	  				if(reverseScroll)
	  				{
	  					reverseScrollVertical(event);
					}
					else
					{
	  					scrollVertical(event);
	  				}
	  			}
	  			else
	  			{
	  				if(reverseScroll)
	  				{
	  					reverseScrollHorizontal(event);
					}
					else
					{
	  					scrollHorizontal(event);
	  				}
	  			}
	  		}
	  		else
	  		{
	  			if(direction == "vertical")
	  			{
	  				if(!reverseScroll)
	  					scrollVerticalAuto();
	  			}
	  			else
	  			{
	  				if(!reverseScroll)
	  					scrollHorizontalAuto();
	  			}
	  				
	  			if(afterScrollHandler)
	  				afterScrollHandler.call($element);
	  		}
	  }
	  
	  function scrollVertical(event) {
			var distance = getDistance();
			var offscreen = $container.height() - $element.height();
			var offset = $container.position().top;
			
			var extraScroll = Math.abs(distance.y - previousDistance.y);
			previousDistance = distance;
			
			if(deltaDirection.y < 0)
			{
				if(offscreen > 0)
				{
					if(offset > -offscreen)
					{
						event.stopPropagation();
						offset = offset - extraScroll;
						if(offset < -offscreen) offset = -offscreen;
						
						$container.css({top: offset + "px"});
					}
					else
					{
						$container.css({top: -offscreen + "px"});
						if(bottomReachedHandler)
							bottomReachedHandler.call($element);
					}	
				}
			}
			else if(deltaDirection.y > 0)
			{
				if(offscreen > 0)
				{
					if(offset < 0)
					{
						event.stopPropagation();
						offset = offset + extraScroll;
						
						if(offset > 0) offset = 0;
						$container.css({top: offset + "px"});
					}
					else
					{
						$container.css({top: "0px"});
					}	
				}
			}
	  }
	  
	  function reverseScrollVertical(event) {
			var distance = getDistance();
			var offscreen = $container.height() - $element.height();
			var offset = $container.position().top;
			
			var extraScroll = Math.abs(distance.y - previousDistance.y);
			previousDistance = distance;
			
			if(deltaDirection.y > 0)
			{
				if(offscreen > 0)
				{
					if(offset > -offscreen)
					{
						event.stopPropagation();
						offset = offset - extraScroll;
						if(offset < -offscreen) offset = -offscreen;
						
						$container.css({top: offset + "px"});
					}
					else
					{
						$container.css({top: -offscreen + "px"});
						if(bottomReachedHandler)
							bottomReachedHandler.call($element);
					}	
				}
			}
			else if(deltaDirection.y < 0)
			{
				if(offscreen > 0)
				{
					if(offset < 0)
					{
						event.stopPropagation();
						offset = offset + extraScroll;
						
						if(offset > 0) offset = 0;
						$container.css({top: offset + "px"});
					}
					else
					{
						$container.css({top: "0px"});
					}	
				}
			}
	  }
	  
	  function scrollHorizontal(event) {
	  		var distance = getDistance();
			var offscreen = $container.width() - $element.width();
			var offset = $container.position().left;
			
			var extraScroll = Math.abs(distance.x - previousDistance.x);
			previousDistance = distance;
			
			if(deltaDirection.x < 0)
			{
				if(offscreen > 0)
				{
					if(offset > -offscreen)
					{
						event.stopPropagation();
						offset = offset - extraScroll;
						if(offset < -offscreen) offset = -offscreen;
						
						$container.css({left: offset + "px"});
					}
					else
					{
						$container.css({left: -offscreen + "px"});
						if(bottomReachedHandler)
							bottomReachedHandler.call($element);
					}	
				}
			}
			else if(deltaDirection.x > 0)
			{
				if(offscreen > 0)
				{
					if(offset < 0)
					{
						event.stopPropagation();
						offset = offset + extraScroll;
						
						if(offset > 0) offset = 0;
						$container.css({left: offset + "px"});
					}
					else
					{
						$container.css({left: "0px"});
					}	
				}
			}
	  }
	  
	  function reverseScrollHorizontal(event) {
	  		var distance = getDistance();
			var offscreen = $container.width() - $element.width();
			var offset = $container.position().left;
			
			var extraScroll = Math.abs(distance.x - previousDistance.x);
			previousDistance = distance;
			
			if(deltaDirection.x > 0)
			{
				if(offscreen > 0)
				{
					if(offset > -offscreen)
					{
						event.stopPropagation();
						offset = offset - extraScroll;
						if(offset < -offscreen) offset = -offscreen;
						
						$container.css({left: offset + "px"});
					}
					else
					{
						$container.css({left: -offscreen + "px"});
						if(bottomReachedHandler)
							bottomReachedHandler.call($element);
					}	
				}
			}
			else if(deltaDirection.x < 0)
			{
				if(offscreen > 0)
				{
					if(offset < 0)
					{
						event.stopPropagation();
						offset = offset + extraScroll;
						
						if(offset > 0) offset = 0;
						$container.css({left: offset + "px"});
					}
					else
					{
						$container.css({left: "0px"});
					}	
				}
			}
	  }
	  
	  
	  function scrollVerticalAuto() {
			var distance = getDistance();
			var duration = getDuration();
			var extraScroll = (distance.y * duration + ((0.5 * (duration * duration)) / 2)) / 1000;
			
			var offscreen = $container.height() - $element.height();
			var offset = $container.position().top;
			
	  		if(deltaDirection.y < 0)
			{
				if(offscreen > 0)
				{
					if(offset > -offscreen)
					{
						offset = offset - extraScroll;
						if(offset < -offscreen) offset = -offscreen;
						
						$container.animate({top: offset + "px"});
					}
					else
					{
						$container.css({top: -offscreen + "px"});
						if(bottomReachedHandler)
							bottomReachedHandler.call($element);
					}	
				}
			}
			else if(deltaDirection.y > 0)
			{
				if(offscreen > 0)
				{
					if(offset < 0)
					{
						offset = offset + extraScroll;
						
						if(offset > 0) offset = 0;
						$container.animate({top: offset + "px"});
					}
					else
					{
						$container.css({top: "0px"});
					}	
				}
			}
	  }
	  
	  function scrollHorizontalAuto() {
			var distance = getDistance();
			var duration = getDuration();
			var extraScroll = (distance.x * duration + ((0.5 * (duration * duration)) / 2)) / 1000;
			
			var offscreen = $container.width() - $element.width();
			var offset = $container.position().left;
			
	  		if(deltaDirection.x < 0)
			{
				if(offscreen > 0)
				{
					if(offset > -offscreen)
					{
						offset = offset - extraScroll;
						if(offset < -offscreen) offset = -offscreen;
						
						$container.animate({left: offset + "px"});
					}
					else
					{
						$container.css({left: -offscreen + "px"});
						if(bottomReachedHandler)
							bottomReachedHandler.call($element);
					}	
				}
			}
			else if(deltaDirection.x > 0)
			{
				if(offscreen > 0)
				{
					if(offset < 0)
					{
						offset = offset + extraScroll;
						
						if(offset > 0) offset = 0;
						$container.animate({left: offset + "px"});
					}
					else
					{
						$container.css({left: "0px"});
					}	
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
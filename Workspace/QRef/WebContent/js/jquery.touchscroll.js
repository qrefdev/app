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
      $container = $element.find(".container");
      
      var hasContainer = ($container.length > 0) ? true : false; 
      
      $element.mouseup(touchEnd);
      $element.mousemove(touchMove);
      $element.mousedown(touchStart);
  
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
			event.preventDefault();
			startTime = endTime = Date.now();
			startPosition.x = endPosition.x = event.pageX;
			startPosition.y = endPosition.y = event.pageY;
			
			previousDistance.x = 0;
			previousDistance.y = 0;
			touched = true;
	  }
	  
	  function touchMove(event) {
	  		event.preventDefault();
			endTime = Date.now();
			var duration = getDuration();
			endPosition.x = event.pageX;
			endPosition.y = event.pageY;
			
			calculateDirection();
			
			if(beforeScrollHandler)
				beforeScrollHandler.call($element, event);
			
			if(touched && duration > threshold && hasContainer && !disableScroll) {
				scroll();	
			}
	  }
	  
	  function touchEnd(event) {
			event.preventDefault();
			endTime = Date.now();
			
			
			var duration = getDuration();
			calculateDirection();
			touched = false;
			
			if(duration > threshold && hasContainer && !disableScroll) {
				scroll();
			}
	  }
	  
	  function scroll() {
	  		if(touched)
	  		{
	  			if(direction == "vertical")
	  			{
	  				if(reverseScroll)
	  				{
	  					reverseScrollVertical();
					}
					else
					{
	  					scrollVertical();
	  				}
	  			}
	  			else
	  			{
	  				if(reverseScroll)
	  				{
	  					reverseScrollHorizontal();
					}
					else
					{
	  					scrollHorizontal();
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
	  
	  function scrollVertical() {
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
	  
	  function reverseScrollVertical() {
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
	  
	  function scrollHorizontal() {
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
	  
	  function reverseScrollHorizontal() {
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
      $.error( 'Method ' +  method + ' does not exist on jQuery.tap' );
    }    
  
  };

})( jQuery );
(function( $ ){	
  var methods = {

    init : function( options ) { 
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data("jquery.mousescroll");
			
			if (!plugin) {
				plugin = new MouseScroll(item, options);
				$this.data("jquery.mousecroll", plugin);
			}
    	});
    },
    
    disableScroll : function() {
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data("jquery.mousescroll");
			
			if (plugin) {
				plugin.disableScroll();
			}
    	});
    },
    
    enableScroll : function() {
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data("jquery.mousescroll");
			
			if (plugin) {
				plugin.enableScroll();
			}
    	});
    },
    
    enableReverseScroll : function() {
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data("jquery.mousescroll");
			
			if (plugin) {
				plugin.enableReverseScroll();
			}
    	});
    },
    
    disableReverseScroll : function() {
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data("jquery.mousescroll");
			
			if (plugin) {
				plugin.disableReverseScroll();
			}
    	});
    }
    
  };
  
  function MouseScroll(element, options) {
  	  var $element = undefined;
	  var $container = undefined;

	  var bottomReachedHandler = undefined;
	  var beforeScrollHandler = undefined;
	  var afterScrollHandler = undefined;

	  var startTime = 0, endTime = 0;
	
	  var disableScroll = false;
	  var reverseScroll = false;
	
	  var direction = "vertical"
	  var scrollAmount = 2;
	  
	  if(options.scrollAmount) scrollAmount = options.scrollAmount;
      if(typeof options.direction === "string") direction = options.direction; 
      if(options.onEndReached) bottomReachedHandler = options.onEndReached;
      if(options.onBeforeScroll) beforeScrollHandler = options.onBeforeScroll;
      if(options.onAfterScroll) afterScrollHandler = options.onAfterScroll;
      
      $element = $(element);
      $container = $($element.find(".container")[0]);
      
      var hasContainer = ($container.length > 0) ? true : false; 
      
      $element.mousewheel(onWheelScroll);
  
  	  function onWheelScroll(event, delta, deltaX, deltaY) {  	  		
  	  		if(beforeScrollHandler)
  	  			beforeScrollHandler.call($element, event, delta);
  	  		
  	  		if(!disableScroll)
  	  			scroll(delta, event);
  	  		
  	  		if(afterScrollHandler)
  	  			afterScrollHandler.call($element, event);
  	  }
  
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
	  
	  function scroll(delta, event) {
			if(direction == "vertical")
			{
				if(reverseScroll)
				{
					reverseScrollVertical(delta, event);
				}
				else
				{
					scrollVertical(delta, event);
				}
			}
			else
			{
				if(reverseScroll)
				{
					reverseScrollHorizontal(delta, event);
				}
				else
				{
					scrollHorizontal(delta, event);
				}
			}
	  }
	  
	  function scrollVertical(delta,event) {
			var offscreen = $container.height() - $element.height();
			var offset = $container.position().top;
			
			if(delta < 0)
			{
				if(offscreen > 0)
				{
					if(offset > -offscreen)
					{
						event.stopPropagation();
						event.preventDefault();
						offset = offset - scrollAmount;
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
			else if(delta > 0)
			{
				if(offscreen > 0)
				{
					if(offset < 0)
					{
						event.stopPropagation();
						event.preventDefault();
						offset = offset + scrollAmount;
						
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
	  
	  function reverseScrollVertical(delta,event) {
			var offscreen = $container.height() - $element.height();
			var offset = $container.position().top;
			
			if(delta > 0)
			{
				if(offscreen > 0)
				{
					if(offset > -offscreen)
					{
						event.stopPropagation();
						event.preventDefault();
						offset = offset - scrollAmount;
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
			else if(delta < 0)
			{
				if(offscreen > 0)
				{
					if(offset < 0)
					{
						event.stopPropagation();
						event.preventDefault();
						offset = offset + scrollAmount;
						
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
	  
	  function scrollHorizontal(delta,event) {
			var offscreen = $container.width() - $element.width();
			var offset = $container.position().left;
			
			if(delta < 0)
			{
				if(offscreen > 0)
				{
					if(offset > -offscreen)
					{
						event.stopPropagation();
						event.preventDefault();
						offset = offset - scrollAmount;
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
			else if(delta > 0)
			{
				if(offscreen > 0)
				{
					if(offset < 0)
					{
						event.stopPropagation();
						event.preventDefault();
						offset = offset + scrollAmount;
						
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
	  
	  function reverseScrollHorizontal(delta,event) {
			var offscreen = $container.width() - $element.width();
			var offset = $container.position().left;
			
			if(delta > 0)
			{
				if(offscreen > 0)
				{
					if(offset > -offscreen)
					{
						event.stopPropagation();
						event.preventDefault();
						offset = offset - scrollAmount;
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
			else if(delta < 0)
			{
				if(offscreen > 0)
				{
					if(offset < 0)
					{
						event.stopPropagation();
						event.preventDefault();
						offset = offset + scrollAmount;
						
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
  }

  $.fn.mouseScroll = function( method ) {
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.mouseScroll' );
    }    
  
  };

})( jQuery );
(function( $ ){	
  var methods = {

    init : function( options ) { 
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data("jquery.tap");
			
			if (!plugin) {
				plugin = new Tap(item, options);
				$this.data("jquery.tap", plugin);
			}
			else if(plugin && !options)
			{
				plugin.triggerTap();
			}
			else if(plugin && options)
			{
				plugin.updateOptions(options);
			}
    	});
    }
  };
  
  function Tap(element, options) {
  	  var $element = undefined;

	  var startTime = 0, endTime = 0;
	
	  var duration = 0;
	  var threshold = 250;
	  
	  var moved = false;
	  
	  var TapHandler = undefined;	

	  var tapHadActive = false;
  	
  	  TapHandler = options;
      
      $element = $(element);
      
      if(typeof TouchEvent == 'undefined' || typeof Touch == "undefined")
      {
      	$element.mouseup(touchEnd);
      	$element.mousemove(touchMove);
      	$element.mousedown(touchStart);
      }
      else
      {
      	$element.bind("touchstart", touchStart);
      	$element.bind("touchend", touchEnd);
      	$element.bind("touchmove", touchMove);
  	  }
  	  
	  function touchStart(event) {
			startTime = endTime = Date.now();
			duration = 0;
			
			var clientX = event.pageX;
			var clientY = event.pageY;
			
			if(event.touches) {
				clientX = event.touches[0].pageX;
				clientY = event.touches[0].pageY;
			}
			
			if(!$element.hasClass('active')) {
				$element.addClass('active');
				tapHadActive = false;
			}
			else {
				tapHadActive = true;
			}
			
			moved = false;
	  }
	  
	  function touchMove(event) {
			moved = true;
	  }
	  
	  this.updateOptions = function(options) {
	  		TapHandler = options;
	  };
	  
	  this.triggerTap = function() {
			trigger();
	  };
	  
	  function touchEnd(event) {
			if(!moved) {
                event.stopPropagation();
				endTime = Date.now();
			
				duration = getDuration();
			
				if(duration < threshold) {
					triggerHandler(event);
				}
			}
			
			if(!tapHadActive) {
				$element.removeClass('active');
			}
			else {
				tapHadActive = false;
			}
	  }
	  
	  function trigger() {
	  		if(typeof TouchEvent == 'undefined' || typeof Touch == "undefined")
	  		{
				$element.mousedown();
				$element.mouseup();
			}
			else
			{
				$element.trigger("touchstart");
				$element.trigger("touchend");
			}
	  }
	  
	  function triggerHandler(event) {
		if(TapHandler) {
            TapHandler.call($element[0], event);
		}
	  }
	  
	  function getDuration() {
			return endTime - startTime;
	  }
  }

  $.fn.tap = function( method ) {
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || typeof method == "function" || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.tap' );
    }    
  
  };

})( jQuery );
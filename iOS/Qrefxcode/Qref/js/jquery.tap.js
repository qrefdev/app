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
	  var threshold = 1000;
 var startPosition = {x: 0, y: 0};
	
	  var moved = false;
	  
	  var TapHandler = undefined;	

	  var tapHadActive = false;
  	
  	  TapHandler = options;
      
      $element = $(element);
 
      	$element[0].addEventListener("touchstart", touchStart, false);
      	$element[0].addEventListener("touchend", touchEnd, false);
      	$element[0].addEventListener("touchmove", touchMove, false);
  	  
	  function touchStart(event) {
			startTime = endTime = Date.now();
			duration = 0;
			
			var clientX = event.pageX;
			var clientY = event.pageY;
			
			if(event.touches) {
				clientX = event.touches[0].pageX;
				clientY = event.touches[0].pageY;
			}

 startPosition.x = clientX;
 startPosition.y = clientY;
 
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
 
         var clientX = event.pageX;
         var clientY = event.pageY;
         
         if(event.touches) {
            clientX = event.touches[0].pageX;
            clientY = event.touches[0].pageY;
         }
 
            if(Math.abs(clientX - startPosition.x) >= 15 || Math.abs(clientY - startPosition.y) >= 15)
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
				$element.trigger("touchstart");
				$element.trigger("touchend");
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
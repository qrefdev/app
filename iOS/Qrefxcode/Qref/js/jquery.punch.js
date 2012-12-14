(function( $ ){	
	var methods = {
	
		init : function() { 
			return this.each(function(index, item) {
				var $this = $(item);
	
				//Check we havent already initialised the plugin
				var plugin = $this.data("jquery.punch");
				
				if (!plugin) {
					plugin = new punchHandler(item);
					$this.data("jquery.punch", plugin);
				}
			});
		}
	};
		function punchHandler(element) {
			element.addEventListener("touchstart", touchHandler, true);
			element.addEventListener("touchmove", touchHandler, true);
			element.addEventListener("touchend", touchHandler, true);
	
			function touchHandler(event)
			{
				var touches = event.changedTouches,
					 first = touches[0],
					 type = "";
			
				switch(event.type)
				{
					case "touchstart": type = "mousedown"; break;
					case "touchmove":  type = "mousemove"; break;        
					case "touchend":   type = "mouseup"; break;
					default: return;
				}
		
				
				var simulatedEvent = document.createEvent("MouseEvent");
				simulatedEvent.initMouseEvent(type, true, true, window, 1, 
									   first.screenX, first.screenY, 
									   first.clientX, first.clientY, false, 
									   false, false, false, 0,null);
			
				event.preventDefault();
				first.target.dispatchEvent(simulatedEvent);
			} 
		}
		
	  $.fn.punch = function( method ) {
    
		// Method calling logic
		if ( methods[method] ) {
		  return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
		  return methods.init.apply( this, arguments );
		} else {
		  $.error( 'Method ' +  method + ' does not exist on jQuery.punch' );
		}    
  
 	 };
 })(jQuery);
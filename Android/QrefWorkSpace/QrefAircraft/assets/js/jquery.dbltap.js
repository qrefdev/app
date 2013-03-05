(function( $ ){	
  var methods = {

    init : function( options ) { 
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data("jquery.dbltap");
			
			if (!plugin) {
				plugin = new DoubleTap(item, options);
				$this.data("jquery.dbltap", plugin);
			}
			else if(plugin && options) {
				plugin.updateOptions(options);
			}
    	});
    }
  };
  
  function DoubleTap(element, options) {
  	  var $element = undefined;

	  var tapOneStartTime = 0, tapTwoEndTime = 0;
	
	  var duration = 0;
	  var threshold = 400;
	  
	  var waitingSecondTap = false;
	  var TapHandler = undefined;	
  		
  	  TapHandler = options;
      
      $element = $(element);
      
    /*  if(typeof TouchEvent == 'undefined' || typeof Touch == "undefined")
      {
      	$element.mouseup(touchEnd);
      	$element.mousedown(touchStart);
      }
      else
      {*/
      	$element.bind("touchstart", touchStart);
      	$element.bind("touchend", touchEnd);
  	  //}
  
  	this.updateOptions = function(options) {
  		TapHandler = options;
  	};
  
	function touchStart(event) {

		if(!waitingSecondTap)
		{
			tapOneStartTime = tapTwoEndTime = Date.now();
		}
		else
		{
			duration = Math.abs(Date.now() - tapOneStartTime);
			
			if(duration > threshold)
			{
				tapOneStartTime = tapTwoEndTime = Date.now();
				waitingSecondTap = false;
			}
		}
	}
	  
	  function touchEnd(event) {
			
			if(waitingSecondTap)
			{
				waitingSecondTap = false;
				tapTwoEndTime = Date.now();
			
				duration = getDuration();
				
				if(duration < threshold) {
					triggerHandler(event);
				}
			}
			else
			{
				duration = Math.abs(Date.now() - tapOneStartTime);
			
				if(duration < threshold)
				{
					waitingSecondTap = true;
				}
			}
	  }
	  
	  function triggerHandler(event) {
		if(TapHandler)
			TapHandler.call($element[0], event);
	  }
	  
	  function getDuration() {
			return Math.abs(tapTwoEndTime - tapOneStartTime);
	  }
  }

  $.fn.dbltap = function( method ) {
    
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
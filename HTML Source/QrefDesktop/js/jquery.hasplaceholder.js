(function( $ ){	
	var methods = {
	
		placeHolder : function() { 
			var found = false;
			
			this.each(function(index, item) {
				var $this = $(item);
				
				if($this.val)
				{
					if($this.val().toLowerCase() == $this.attr("placeholder").toLowerCase())
						found = true;
				}
				else if($this.text)
				{
					if($this.text().toLowerCase() == $this.attr("placeholder").toLowerCase())
						found = true;
				}
			});
			
			return found;
		}
	};
		
	$.fn.hasPlaceHolder = function( method ) {
    
		// Method calling logic
		if ( methods[method] ) {
		  return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
		  return methods.placeHolder.apply( this, arguments );
		} else {
		  $.error( 'Method ' +  method + ' does not exist on jQuery.hasplaceholder' );
		}    
  
 	 };
 })(jQuery);
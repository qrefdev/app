 (function($) {
 
   var methods = {
		init : function( options ) { 
			return this.each(function(index, item) {
				var $this = $(item);
	
				//Check we havent already initialised the plugin
				var plugin = $this.data("jquery.scrollbar");
				
				if (!plugin) {
					plugin = new ScrollBar(item, options);
					$this.data("jquery.scrollbar", plugin);
				}
			});
		},
		
		refresh : function() {
			return this.each(function(index, item) {
				var $this = $(item);
				
				var plugin = $this.data("jquery.scrollbar");
				
				if(plugin) {
					plugin.calculateScrollBarHeight();
					plugin.calculateScrollBarPosition();
				}
			});
		}
  };
 
 function ScrollBar(element,endReached) {
 	this.element = $(element);
 	this.child = $(this.element.children().get(0));
 	this.scrollTop = 0;
 	this.scrollBar = undefined;
 	this.extra = 0;
 	this.touched = false;
 	this.beginTouch = {x: 0, y: 0};
 	this.deltaTouch = {x: 0, y: 0};
 	this.offsetTop = 0;
 	this.activity = false;
 	this.hideTimeout = false;
 	this.onBottomReached = endReached;
 	
 	this.addEventHandlers = function() {
 		var self = this;
 		
 		this.generateScrollBar();
 		
 		if(typeof TouchEvent == 'undefined' || typeof Touch == "undefined")
		{
			this.scrollBar.mouseup(function(e) {
				self.touchEnd(e);
			});
			this.scrollBar.mousemove(function(e) {
				self.touchMove(e);
			});
			this.scrollBar.mousedown(function(e) {
				self.touchStart(e)
			});
			
			$(window).mouseup(function(e) {
				self.touchEnd(e);
			});
		}
		else
		{
 		
			this.scrollBar[0].addEventListener("touchend", function(e) {
				self.touchEnd(e);
			}, false);
			this.scrollBar[0].addEventListener("touchstart", function(e) {
				self.touchStart(e);
			}, false);
			this.scrollBar[0].addEventListener("touchmove", function(e) {
				self.touchMove(e);
			}, false);
			 
			window.addEventListener("touchend", function(e) {
				self.touchEnd(e);
			}, false);
 		}
 	
 		this.scrollBar.bind("dragstart", function(e) { e.preventDefault(); });
 		
 		this.element.scroll(function(e) {
 			self.scrollTop = self.element.scrollTop();
 			self.calculateScrollBarHeight();
 			self.calculateScrollBarPosition();
 			self.hideScrollBar();
 			
 			if(self.element.scrollTop() >= self.extra) {
 				setTimeout(function() {
 					self.onBottomReached.call(self.element);
 				}, 1 / 60);
 			}
 		});
 	};
 	
 	this.hideScrollBar = function() {
 		var self = this;
 		
 		if(!this.hideTimeout) {
			this.hideTimeout = true;
			setTimeout(function() {
				if(!self.activity)
					self.scrollBar.fadeOut();
					
				self.hideTimeout = false;
			}, 5000);
 		}
 	};
 	
 	this.generateScrollBar = function() {
 		this.scrollBar = $('<div class="scrollbar"></div>');
 		this.element.parent().append(this.scrollBar);
 		this.scrollBar.hide();
 	};
 	
 	this.calculateScrollBarHeight = function() {
 		this.extra = this.child.height() - this.element.height();
 		var percentage = this.extra / this.child.height();
 		var height = this.element.parent().height() - this.extra;
 		
 		if(height < 45) height = 45;
 		
 		if(this.extra > 0) {
 			this.scrollBar.css({height: height + "px"});
 			this.scrollBar.fadeIn();
 		}
 		else {
 			this.scrollBar.fadeOut();
 		}
 	};
 	
 	this.calculateScrollBarPosition = function() {
 		var percentage = this.scrollTop / this.extra;
 		
 		var position = (this.element.parent().height() * percentage) - (this.scrollBar.height() / 2);
 		
 		if(position < 0) position = 0;
 		if(position >= this.element.parent().height() - this.scrollBar.height())
 			position = this.element.parent().height() - this.scrollBar.height();
 			
 		this.scrollBar.css({top: position + "px"});	
 	};
 	
 	this.touchEnd = function(event) {
 		this.touched = false;
 		this.activity = false;
 	};
 	
 	this.touchStart = function(event) {
 		this.touched = true;
 		
 		var clientX = event.pageX;
		var clientY = event.pageY;
  
		event.preventDefault();
  
		if(event.touches)
		{
			first = event.touches[0]
			
			clientX = first.pageX;
			clientY = first.pageY;
		}
		
		this.beginTouch.x = clientX;
		this.beginTouch.y = clientY;
		this.offsetTop = this.scrollBar.position().top;
 	};
 	
 	this.touchMove = function(event) {
 		if(this.touched) {
 			var clientX = event.pageX;
	  		var clientY = event.pageY;
	  
	  		this.activity = true;
	  
	  		event.preventDefault();
	  
	  		if(event.touches)
	  		{
				first = event.touches[0]
				
				clientX = first.pageX;
				clientY = first.pageY;
	  		}
	  		
	  		var scrollTop = this.element.scrollTop();
	  		
	  		var Top = -(this.beginTouch.y - clientY - this.offsetTop);
	  		
	  		this.scrollBar.css({top: top + "px"});
	  		
	  		var offsetPercent = 0;
	  		
	  		if(Top >= this.element.height() - this.scrollBar.height())
	  			offsetPercent = (Top + this.scrollBar.height()) / this.element.height();
	  		else if(top <= this.scrollBar.height()) 
	  			offsetPercent = (Top - this.scrollBar.height()) / this.element.height();
	  		else
	  			offsetPercent = (Top + (this.scrollBar.height() / 2)) / this.element.height();
	  		
	  		scrollTop = this.extra * offsetPercent;
	  		
	  		if(scrollTop < 0)
	  			scrollTop = 0;
	  		else if(scrollTop > this.extra)
	  			scrollTop = this.extra;
	  		
	  		this.element.scrollTop(scrollTop);
	  	}
 	};
 	
 	if(this.element.length > 0) {
 		this.addEventHandlers();
 	}
 }
 
 $.fn.scrollbar = function( method ) {
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || typeof method == "function" || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.scrollbar' );
    }    
  
  };

})( jQuery );
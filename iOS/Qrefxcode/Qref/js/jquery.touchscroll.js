(function( $ ){	
  var methods = {

    init : function( options ) { 
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data('jquery.touchscroll');
			
			if (!plugin) {
				plugin = new TouchScroll(item, options);
				$this.data('jquery.touchscroll', plugin);
			}
    	});
    },
    
    disable : function() {
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data('jquery.touchscroll');
			
			if (plugin) {
				plugin.disableScroll();
			}
    	});
    },
    
    enable : function() {
    	return this.each(function(index, item) {
    		var $this = $(item);

			//Check we havent already initialised the plugin
			var plugin = $this.data('jquery.touchscroll');
			
			if (plugin) {
				plugin.enableScroll();
			}
    	});
    }
  };
  
  function TouchScroll(element, options) { 
  	  this.disableScroll = function() {
  	  	this.disableScroll = true;
  	  };
  	  
  	  this.enableScroll = function() {
  	     this.disableScroll = false;
  	  };
      
      this.init = function(element, options) {
          var _this = this;
          this.element = null;
          this.container = null;
    
          this.bottomReachedHandler = null;
          this.beforeScrollHandler = null;
          this.afterScrollHandler = null;
    
          this.startTime = 0; 
          this.endTime = 0;
        
          this.disableScroll = false;
        
          this.threshold = 250;
          this.pullToRefreshThreshold = 50;
          this.direction = 'vertical'
          this.deltaDirection = {x: 0, y: 0};
          this.startPosition = {x: 0, y: 0};
          this.previousPosition = {x: 0, y: 0};
          this.endPosition = {x: 0, y: 0};
          this.touched = false;
          this.bounceVertical = true;
          this.bounceHorizontal = false;
          
          if(typeof options.threshold != 'undefined') this.threshold = options.threshold;
          if(typeof options.verticalBounce != 'undefined') this.bounceVertical = options.verticalBounce;
          if(typeof options.horizontalBounce != 'undefined') this.bounceHorizontal = options.horizontalBounce;
          if(options.pullToRefresh) this.pullToRefresh = options.pullToRefresh;
          if(typeof options.pullToRefreshThreshold != 'undefined') this.pullToRefreshThreshold = options.pullToRefreshThreshold;
          if(options.direction) this.direction = options.direction; 
          if(options.onEndReached) this.bottomReachedHandler = options.onEndReached;
          if(options.onBeforeScroll) this.beforeScrollHandler = options.onBeforeScroll;
          if(options.onAfterScroll) this.afterScrollHandler = options.onAfterScroll;
          
          this.element = $(element);
           
          this.window = $(window);
          
          if(!('ontouchstart' in document.documentElement))
          {
                this.element.mouseup(function(e) {
                    _this.touchEnd(e);
                });
                this.element.mousemove(function(e) {
                    _this.touchMove(e);
                });
                this.element.mousedown(function(e) {
                    _this.touchStart(e);
                });
                
                this.window.mouseup(function(e) {
                    _this.touchEnd(e);
                });
          }
          else
          {
                this.element[0].addEventListener('touchend', function(e) {
                  _this.touchEnd(e);
                }, true);
                this.element[0].addEventListener('touchstart', function(e) {
                  _this.touchStart(e);
                }, false);
                this.element[0].addEventListener('touchmove', function(e) {
                  _this.touchMove(e);
                }, false);
                
                
                this.window[0].addEventListener('touchend', function(e) {
                  _this.touchEnd(e);
                }, true);
          }

          this.element.on('dragstart', function(e) { e.preventDefault(); });      
      };
  
	  this.touchStart = function(event) {
	  		var clientX = event.pageX;
	  		var clientY = event.pageY;
            var _this = this;
	  		
	  		if(event.touches)
	  		{
				var first = event.touches[0];
				
				clientX = first.pageX;
				clientY = first.pageY;
	  		}
	  		this.originalScrollTop = this.element.scrollTop();
            this.originalScrollLeft = this.element.scrollLeft();
			this.startTime = this.endTime = Date.now();
			this.startPosition.x = this.endPosition.x = this.previousPosition.x = clientX;
			this.startPosition.y = this.endPosition.y = this.previousPosition.y = clientY;

			this.touched = true;
          
            if(this.beforeScrollHandler) {
                setTimeout(function() {
                    _this.beforeScrollHandler.call(_this.element, event);
                }, 1);
            }
	  };
	  
	  this.touchMove = function(event) {
          var clientX = event.pageX;
          var clientY = event.pageY;
          var _this = this;
          
          if(this.touched) {
                event.preventDefault();
                
                if(event.touches)
                {
                    var first = event.touches[0];
                    
                    clientX = first.pageX;
                    clientY = first.pageY;
                }
                
                this.endTime = Date.now();
                var duration = this.getDuration();
                this.endPosition.x = clientX;
                this.endPosition.y = clientY;
                
                this.calculateDirection();
                
                if(duration > this.threshold && !this.disableScroll) {
                    this.scroll();	
                }
          }
	  };
	  
	  this.touchEnd = function(event) {
			if(this.touched) {
                this.endTime = Date.now();
                
                var duration = this.getDuration();
                this.calculateDirection();
                this.touched = false;
                
                if(duration > this.threshold && !this.disableScroll) {
                    this.scroll();
                }
            }
	  };
	  
	  this.scroll = function() {
            var _this = this;
            this.element.stop();
            if(this.touched)
            {   
                if(this.direction == 'vertical')
                {
                    setTimeout(function() {
                        _this.scrollVertical();
                    }, 1);
                }
                else if(this.direction == 'horizontal')
                {
                    setTimeout(function() {
                        _this.scrollHorizontal();
                    }, 1);
                }
                else {
                    setTimeout(function() {
                        _this.scrollVertical();
                    }, 1);
                    setTimeout(function() {
                        _this.scrollHorizontal();
                    }, 1);
                }
            }
            else
            {
                if(this.direction == 'vertical') {
                    setTimeout(function() {
                        _this.scrollVerticalAuto();
                    }, 1);
                }
                else if(this.direction == 'horizontal') {
                    setTimeout(function() {
                        _this.scrollHorizontalAuto();
                    }, 1);
                }
                else {
                    setTimeout(function() {
                        _this.scrollBothAuto();
                    }, 1);
                }
            
                if(this.afterScrollHandler) {
                    setTimeout(function() {
                        _this.afterScrollHandler.call(_this.element);
                    }, 1);
                }
            }
	  };
	  
	  this.scrollVertical = function() {
            var _this = this;
			var duration = this.getDuration();
			
			var velocity = this.deltaDirection.y / (duration / 1000);
			var momentum = 0.01 * velocity;
			
			var deltaY = this.deltaDirection.y + momentum;
 
            var scrollHeight = this.element[0].scrollHeight - this.element.innerHeight();
			var scrollTop = this.element.scrollTop();
            var top = this.element.position().top;
			
	  		if(this.deltaDirection.y < 0)
			{
				if(this.originalScrollTop + Math.abs(deltaY) < scrollHeight)
				{
					this.element.scrollTop(this.originalScrollTop + Math.abs(deltaY));
				}
				else {
					this.element.scrollTop(scrollHeight);
					
                    if(deltaY >= -this.pullToRefreshThreshold) 
					   this.element.css({top: deltaY + 'px'});
					
					if(this.bottomReachedHandler) {
						setTimeout(function() {
							_this.bottomReachedHandler.call(this.element, 'bottom');
						}, 1);
					}
				}
			}
			else if(this.deltaDirection.y > 0)
			{
				if(this.originalScrollTop - deltaY > 0) {
                    this.element.scrollTop(this.originalScrollTop - deltaY);
                }
                else {
                    this.element.scrollTop(0);
                    
                    if(deltaY < this.pullToRefreshThreshold)
                        this.element.css({top: deltaY + 'px'});
                }
			}
			
			this.previousPosition.y = this.endPosition.y;
	  };
	  
      this.scrollVerticalAuto = function() {
            var _this = this;
			var duration = this.getDuration();
			
			var velocity = this.deltaDirection.y / (duration / 1000);
			var momentum = 0.45 * velocity;
			
			var deltaY = this.deltaDirection.y + momentum;
			
			var scrollHeight = this.element[0].scrollHeight - this.element.innerHeight();
			var scrollTop = this.element.scrollTop();
			
	  		if(this.deltaDirection.y < 0)
			{
				if(this.originalScrollTop + Math.abs(deltaY) < scrollHeight)
				{
                    this.element.css({top: '0px'});
                    
                    if(this.getDuration() < 500)
					   this.element.stop().animate({scrollTop: this.originalScrollTop + Math.abs(deltaY)}, 350);
				}
				else {
                    if(this.getDuration() < 500) {
                        this.element.stop().animate({scrollTop: scrollHeight}, 500, 'easeOutCirc', function() {
                            if(_this.bottomReachedHandler) {
                                setTimeout(function() {
                                    _this.bottomReachedHandler.call(_this.element, 'bottom');
                                }, 1);
                            }
                        });
                    }
                    else {
                        if(_this.bottomReachedHandler) {
                            setTimeout(function() {
                                _this.bottomReachedHandler.call(_this.element, 'bottom');
                            }, 1);
                        }
                    }
                    
                    if(this.element.position().top < 0) {
                        if(this.bounceVertical)
                            this.element.stop().animate({top: '0px'}, 250, 'easeOutBounce');
                        else 
                            this.element.stop().animate({top: '0px'});
                    }
				}
			}
			else if(this.deltaDirection.y > 0)
			{
				if(this.originalScrollTop - deltaY > 0) {
                    this.element.css({top: '0px'});
                    
                    if(this.getDuration() < 500)
					   this.element.stop().animate({scrollTop: this.originalScrollTop - deltaY}, 500, 'easeOutCirc');
				}
				else {
                    if(this.getDuration() < 500)
                        this.element.stop().animate({scrollTop: 0}, 500, 'easeOutCirc');
                    
                    if(this.element.position().top > 0) {
                        if(this.pullToRefresh) {
                                if(this.element.position().top >= this.pullToRefreshThreshold) {
                                    this.pullToRefresh.call(this, function() {
                                        if(_this.bounceVertical)
                                            _this.element.stop().animate({top: '0px'}, 250, 'easeOutBounce');
                                        else 
                                            _this.element.stop().animate({top: '0px'});
                                    });
                                }
                                else {
                                    if(this.bounceVertical)
                                        this.element.stop().animate({top: '0px'}, 250, 'easeOutBounce');
                                    else 
                                        this.element.stop().animate({top: '0px'});
                                }
                        }
                        else {
                            if(this.bounceVertical)
                                this.element.stop().animate({top: '0px'}, 250, 'easeOutBounce');
                            else 
                                this.element.stop().animate({top: '0px'});
                        }
                    }
				}
			}
	  };
	  
	  this.scrollHorizontal = function() {
            var _this = this;
			var duration = this.getDuration();
			
			var velocity = this.deltaDirection.x / (duration / 1000);
			var momentum = 0.01 * velocity;
			
			var deltaX = this.deltaDirection.x + momentum;
 
            var scrollWidth = this.element[0].scrollWidth - this.element.innerWidth();
            var left = this.element.position().left;
			
	  		if(this.deltaDirection.x < 0)
			{
				if(this.originalScrollLeft + Math.abs(deltaX) < scrollWidth)
				{
					this.element.scrollLeft(this.originalScrollLeft + Math.abs(deltaX));
				}
				else {
					this.element.scrollLeft(scrollWidth);
					
					if(deltaX >= -this.pullToRefreshThreshold) 
					   this.element.css({left: deltaX + 'px'});
					
					if(this.bottomReachedHandler) {
						setTimeout(function() {
							_this.bottomReachedHandler.call(this.element, 'right');
						}, 1);
					}
				}
			}
			else if(this.deltaDirection.x > 0)
			{
				if(this.originalScrollLeft - deltaX > 0) {
                    this.element.scrollLeft(this.originalScrollLeft - deltaX);
                }
                else {
                    this.element.scrollLeft(0);
                    
                    if(deltaX < this.pullToRefreshThreshold)
                        this.element.css({left: deltaX + 'px'});
                }
			}
			
			this.previousPosition.x = this.endPosition.x;
	  };
	  
      this.scrollHorizontalAuto = function() {
            var _this = this;
			var duration = this.getDuration();
			
			var velocity = this.deltaDirection.x / (duration / 1000);
			var momentum = 0.45 * velocity;
			
			var deltaX = this.deltaDirection.x + momentum;;
			
			var scrollWidth = this.element[0].scrollWidth - this.element.innerWidth();
			var scrollLeft = this.element.scrollLeft();
			
	  		if(this.deltaDirection.x < 0)
			{
				if(this.originalScrollLeft + Math.abs(deltaX) < scrollWidth)
				{
                    this.element.css({left: '0px'});
                    
                    if(this.getDuration() < 500)
					   this.element.animate({scrollLeft: this.originalScrollLeft + Math.abs(deltaX)}, 250);
				}
				else {
                    if(this.getDuration() < 500) {
                        this.element.animate({scrollLeft: scrollLeft},250, 'easeOutCirc', function() {
                            if(_this.bottomReachedHandler) {
                                setTimeout(function() {
                                    _this.bottomReachedHandler.call(_this.element, 'right');
                                }, 1);
                            }
                        });
                    }
                    else {
                        if(_this.bottomReachedHandler) {
                            setTimeout(function() {
                                _this.bottomReachedHandler.call(_this.element, 'right');
                            }, 1);
                        }
                    }
                    
                    if(this.bounceHorizontal)
                        this.element.animate({left: '0px'}, 250, 'easeOutBounce');
                    else 
                        this.element.animate({left: '0px'});
				}
			}
			else if(this.deltaDirection.x > 0)
			{
				if(this.originalScrollLeft - deltaX > 0) {
                    this.element.css({left: '0px'});
                    
                    if(this.getDuration() < 500)
					   this.element.animate({scrollLeft: this.originalScrollLeft - deltaX}, 250, 'easeOutCirc');
				}
				else {
                    if(this.getDuration() < 500)
                        this.element.animate({scrollLeft: 0}, 350);
                    
                    if(this.pullToRefresh) {
                        if(this.element.position().left >= this.pullToRefreshThreshold) {
                            this.pullToRefresh.call(this, function() {
                                if(_this.bounceHorizontal)
                                    _this.element.animate({left: '0px'}, 250, 'easeOutBounce');
                                else 
                                    _this.element.animate({left: '0px'});
                            });
                        }
                        else {
                            if(this.bounceHorizontal)
                                this.element.animate({left: '0px'}, 250, 'easeOutBounce');
                            else 
                                this.element.animate({left: '0px'});
                        }
                    }
                    else {
                        if(this.bounceHorizontal)
                            this.element.animate({left: '0px'}, 'slow', 'easeOutBounce');
                        else 
                            this.element.animate({left: '0px'});
                    }
				}
			}
	  };
      
      this.scrollBothAuto = function() {
            var _this = this;
            var duration = this.getDuration();
            
            var velocity = this.deltaDirection.x / (duration / 1000);
            var momentum = 0.45 * velocity;
            
            var deltaX = this.deltaDirection.x + momentum;;
            
            var scrollWidth = this.element[0].scrollWidth - this.element.innerWidth();
            var scrollLeft = this.element.scrollLeft();
            
            var deltaY = this.deltaDirection.y + momentum;
            
            var scrollHeight = this.element[0].scrollHeight - this.element.innerHeight();
            var scrollTop = this.element.scrollTop();
            
            var finalLeft = 0;
            var finalTop = 0;
            
            if(this.deltaDirection.x < 0)
            {
                if(this.originalScrollLeft + Math.abs(deltaX) < scrollWidth)
                {
                    this.element.css({left: '0px'});
                    finalLeft = this.originalScrollLeft + Math.abs(deltaX);
                }
                else {
                    finalLeft = scrollWidth;
                }
            }
            else if(this.deltaDirection.x > 0)
            {
                if(this.originalScrollLeft - deltaX > 0) {
                    finalLeft = this.originalScrollLeft - deltaX;
                }
                else {
                    finalLeft = 0;
                }
            }
          
            if(this.deltaDirection.y < 0)
            {
                if(this.originalScrollTop + Math.abs(deltaY) < scrollHeight)
                {
                    this.element.css({top: '0px'});
                    finalTop = this.originalScrollTop + Math.abs(deltaY);
                }
                else {
                    finalTop = scrollHeight;
                }
            }
            else if(this.deltaDirection.y > 0)
            {
                if(this.originalScrollTop - deltaY > 0) {
                    finalTop = this.originalScrollTop - deltaY;
                }
                else {
                    finalTop = 0;
                }
            }
          
            this.element.animate({scrollLeft: finalLeft, scrollTop: finalTop}, 250, 'easeOutCirc');
            this.element.animate({top: '0px', left: '0px'}, 250, 'easeOutBounce');
      };
	  
	  this.getDistance = function() {
	  	var distance = {x: 0, y: 0};
	  	
	  	distance.x = Math.abs(this.endPosition.x - this.startPosition.x);
	  	distance.y = Math.abs(this.endPosition.y - this.startPosition.y);
	  	
	  	return distance; 
	  };
	  
	  this.calculateDirection = function() {
	  	 this.deltaDirection.x = this.endPosition.x - this.startPosition.x;
	  	 this.deltaDirection.y = this.endPosition.y - this.startPosition.y;
	  };
	  
	  this.getDuration = function() {
			return this.endTime - this.startTime;
	  };
      
      this.init.apply(this, arguments);
  }

    $.fn.touchScroll = function( method ) {
    
        // Method calling logic
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.touchscroll' );
        }    
    
    };

})( jQuery );
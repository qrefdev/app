(function($) {
	var methods = {
		init: function(options) {
			return this.each(function(index, item) {
				var $this = $(item);
				
				var plugin = $this.data('jquery.sortable.absolute');
				
				if(!plugin) {
					plugin = new SortableAbsolute($this, options);
					plugin.init();
					$this.data('jquery.sortable.absolute', plugin);
				}
			});
		}
	};
	
	function SortableAbsolute(element, options) {
		this.element = element;
		this.options = options;
		
		this.handle = options.handle;
		this.scroll = options.scroll;
		this.axis = (options.axis) ? options.axis : 'y';
		this.stop = options.stop;
		this.start = options.start;
		
		this.item = null;
		this.updateInterval = null;
		this.dragStartY = 0;
		this.dragStartX = 0; 
		this.previousY = 0;
		this.previousX = 0;
		this.previousElements = [];
		this.nextElements = [];
		
		this.onstart = function(item) {
			if(this.start)
				this.start.call(this.element[0], this.item);
		};
		
		this.onstop = function() {
			if(this.stop)
				this.stop.call(this.element[0], this.item);
		};
		
		this.findElementUnderItem = function() {
			var _this = this;
			var children = this.element.children();
			for(var i = 0; i < children.length; i++) {
				$this = $(children.get(i));
				
				if($this[0] != _this.item[0] && $this.css('display') == 'block') {
					if(_this.axis == 'y') {
						var itemOffset = {top: parseFloat($this.css('top')), left: parseFloat($this.css('left'))};
						var draggingItem = {top: parseFloat(_this.item.css('top')), left: parseFloat(_this.item.css('left'))};
						
						if(draggingItem.top < itemOffset.top + ($this.height() / 2) && draggingItem.top > itemOffset.top) {
							return $this;
						}
					}
				}
			};
			
			return null;
		};
		
		function scrollY(o) {
			var _this = o;
			
			setTimeout(function() {
				if(_this.scroll && _this.item.data('isDragging')) {
					var offset = _this.item.position();
					var scrollableHeight = _this.scroll.height();
					var zoneDown = scrollableHeight - _this.item.height() - 35;
					var offsetDown = offset.top - _this.scroll.scrollTop();
					var offsetUp = offset.top - _this.scroll.scrollTop();
					var zoneUp = _this.item.height() + 15;
					
					if(offsetDown >= zoneDown) {
						_this.scroll.scrollTop(_this.scroll.scrollTop() + 2);
						scrollY(_this);
					}
					else if(offsetUp <= zoneUp) {
						_this.scroll.scrollTop(_this.scroll.scrollTop() - 2);
						scrollY(_this);
					}
				}
			}, 150);
		}
		
		this.init = function() {
			var _this = this;
			
			_this.updateInterval = setInterval(function() {
				_this.applyHandlers();
			}, 125);
		};
		
		this.applyHandlers = function() {
			var _this = this;
			var children = _this.element.children();
			
			if(_this.handle) {
				children.each(function() {
					var $ele = $(this);
					
					if(!$ele.data('hasHandlers')) {
						$ele.find(_this.handle).bind('mousedown', function(e) {
							e.preventDefault();
							e.stopPropagation();
							_this.item = $ele;
							_this.item.data('isDragging', true);
							_this.item.data('originalPosition', {top: parseFloat(_this.item.css('top')), left: parseFloat(_this.item.css('left'))});
							_this.item.data('topClosest', undefined);
							_this.item.data('bottomClosest', undefined);
						
							_this.element.children().each(function(ind, ele) {
								$element = $(ele);
							
								$element.data('startingPosition', {top: parseFloat($element.css('top')), left: parseFloat($element.css('left'))});
							});
						
							_this.previousElements = [];
							_this.nextElements = [];
						
							_this.item.prevAll().each(function(ind, ele) {
								_this.previousElements.push(ele);
							});
						
							_this.item.nextAll().each(function(ind, ele) {
								_this.nextElements.push(ele);
							});
						
							_this.onstart();
						
							if(_this.scroll) {
								_this.previousX = _this.dragStartX = e.clientX + _this.scroll.scrollLeft();
								_this.previousY = _this.dragStartY = e.clientY + _this.scroll.scrollTop();
							}
							else {
								_this.previousX = _this.dragStartX = e.clientX + window.pageXOffset;
								_this.previousY = _this.dragStartY = e.clientY + window.pageYOffset;
							}
						});
					
						$ele.find(_this.handle).bind('mousemove', function(e) {
							e.preventDefault();
							e.stopPropagation();
							if(_this.item.data('isDragging')) {
								var startingPosition = _this.item.data('originalPosition');
								if(_this.axis == 'y') {
									var y = e.clientY;
									
									if(_this.scroll) {
										y += _this.scroll.scrollTop();
									}
									else {
										y += window.pageYOffset;
									}
									
									var yOffset = startingPosition.top + (y - _this.dragStartY); 
								
									_this.item.css({top: yOffset + 'px'});
								
									var underItem = _this.findElementUnderItem();
								
									if(underItem) {
										var underTop = underItem.data('startingPosition').top;
								
										if(_this.nextElements.indexOf(underItem[0]) > -1) {
											if(_this.previousY - y < 0) {
												underItem.css({top: (underTop - _this.item.height()) + 'px'});
												_this.item.data('topClosest', underItem);
												_this.item.data('bottomClosest', underItem.next());
											}
											else {
												underItem.css({top: underItem.data('startingPosition').top + 'px'});
												_this.item.data('topClosest', underItem.prev());
												_this.item.data('bottomClosest', underItem);
											}
										}
										else if (_this.previousElements.indexOf(underItem[0]) > -1) {
											if(_this.previousY - y > 0) {
												underItem.css({top: (underTop + _this.item.height()) + 'px'});
												_this.item.data('bottomClosest', underItem);
												_this.item.data('topClosest', underItem.prev());
											}
											else {
												underItem.css({top: underItem.data('startingPosition').top + 'px'});
												_this.item.data('topClosest', underItem);
												_this.item.data('bottomClosest', underItem.next());
											}
										}
									}
									else {
										_this.item.data('topClosest', undefined);
										_this.item.data('bottomClosest', undefined);
									}
								
									_this.previousY = y;
								
									scrollY(_this);
								}
							}
						});
					
						$ele.find(_this.handle).bind('mouseup', function(e) {
							e.preventDefault();
							e.stopPropagation();
							if(_this.item.data('isDragging')) {
								if(_this.item.data('topClosest').length > 0 && _this.item.data('bottomClosest').length > 0) {
									var topClosest = _this.item.data('topClosest');
									if(topClosest[0] != _this.item[0]) {
										topClosest.after(_this.item.detach());
										var top = topClosest.position().top;
										var height = topClosest.height();
										_this.item.css({top: (top + height) + 'px'});
									}
									else {
										_this.item.css({top: _this.item.data('startingPosition').top + 'px'});
										_this.item.data('bottomClosest').css({top: _this.item.data('bottomClosest').data('startingPosition').top + 'px'});
										_this.item.data('topClosest').css({top: _this.item.data('topClosest').data('startingPosition').top + 'px'});
									}
								}
								else if(_this.item.data('topClosest').length > 0 && _this.item.data('bottomClosest').length == 0) {
									if(_this.item.data('topClosest')[0] != _this.item[0]) {
										_this.item.data('topClosest').after(_this.item.detach());
										_this.item.css({top: (_this.item.data('topClosest').position().top + _this.item.data('topClosest').height()) + 'px'});
									}
									else {
										_this.item.css({top: _this.item.data('startingPosition').top + 'px'});
										_this.item.data('topClosest').css({top: _this.item.data('topClosest').data('startingPosition').top + 'px'});
									}
									//_this.item.css({top: (_this.item.data('topClosest').position().top + _this.item.data('topClosest').height()) + 'px'});
								}
								else if(_this.item.data('topClosest').length == 0 && _this.item.data('bottomClosest').length > 0) {
									if(_this.item.data('bottomClosest')[0] != _this.item[0]) {
										_this.item.data('bottomClosest').before(_this.item.detach());
										_this.item.css({top: (_this.item.data('bottomClosest').position().top - _this.item.height()) + 'px'});
									}
									else {
										_this.item.css({top: _this.item.data('startingPosition').top + 'px'});
										_this.item.data('bottomClosest').css({top: _this.item.data('bottomClosest').data('startingPosition').top + 'px'});
									}
									//_this.item.css({top: (_this.item.data('bottomClosest').position().top - _this.item.height()) + 'px'});
								}
								else {
									if(_this.axis == 'y') {
										_this.element.children().each(function(ind, ele) {
											$element = $(ele);
										
											$element.css({top: $element.data('startingPosition').top + 'px'});
										});
									}
								}
							
								_this.onstop();
								_this.item.data('isDragging', false);
							}
						});
						
						$ele.data('hasHandlers', true);
					}
				});
			}
		};
	}
	
	$.fn.sortableabsolute = function( method ) {
    
		// Method calling logic
		if ( methods[method] ) {
		  return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || typeof method == "function" || ! method ) {
		  return methods.init.apply( this, arguments );
		} else {
		  $.error( 'Method ' +  method + ' does not exist on jQuery.sortable.absolute' );
		}    
  };
})(jQuery);
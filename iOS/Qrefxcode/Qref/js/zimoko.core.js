var zimoko = new (function() {})();

(function() {
	/**
	 * Provides requestAnimationFrame in a cross browser way.
	 * @author paulirish / http://paulirish.com/
	 */
	
	if ( !window.requestAnimationFrame ) {
		window.requestAnimationFrame = ( function() {
			return window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
				window.setTimeout( callback, 1000 / 60 );
			};
		} )();
	}
	
	/** Base Class **/
	zimoko.Class = function() {	
		if(this.init) {
			this.init.apply(this, arguments);
		}
	};
	
	zimoko.Class.extend = function(object) {
		var prototype = new this();
		
		var obj = object;
		
		if(typeof(object) == 'function') {
			obj = new object();
		}
		
		for(var name in obj) {
			prototype[name] = obj[name];
		}
		
		function Class() {
			if(this.init) {
				this.init.apply(this, arguments);
			}
		}
		
		Class.prototype = prototype;
		Class.prototype.constructor = Class;
		Class.prototype._original = obj;
		
		Class.extend = arguments.callee;
		
		return Class;
	};
	
	zimoko.Async = function() { };
	
	zimoko.Async.method = function(object, method, args) {
		this.object = object;
		this.method = method;
		this.args = args;
		
		this.exec = function() {
			var self = this;
			
			if(this.object) {
				setTimeout(function() {
					self.method.apply(self.object, self.args);
				}, 1 / 60);
			} else {
				self.method.apply(self, self.args);
			}
		};
	};
	
	zimoko.Async.dispatch = function(object, method, args) {
		var async = new zimoko.Async.method(object, method, args);
		async.exec();
	};
	
	zimoko.Async.each = function(items, callback) {
		
		var asyncEach = function(listItems, cb) {
			this.list = listItems;
			this.index = 0;
			this.cb = cb;
			
			this.next = function() {
				if(this.index < this.list.length) {
					var item = this.list[this.index];
 
                        if(typeof(this.cb) == 'function')
                            this.cb.call(item, this.index, item);
	
					this.index++;
					
					zimoko.Async.dispatch(this, this.next, []);		
				}
			};
			
			zimoko.Async.dispatch(this, this.next, []);
		};
		
		var process = new asyncEach(items, callback);
	};
	
	zimoko.ui = function() { };
	
	/** Parse an elements style string into a object **/
	zimoko.ui.parseStyleString = function(style) {
		var styles = style.split(';');
		
		var styleObject = {};
		
		for(var i = 0; i < styles.length; i++) {
			var pair = styles[i].split(':');
			
			if(pair.length == 2) {
				styleObject[pair[0].trim().replace(/\r\n|\r|\n|\t/g, '')] = pair[1].trim().replace(/\r\n|\r|\n|\t/g, '');
			}
		}
		
		return styleObject;
	};
	
	/** Generates any widgets found in the parent element **/
	zimoko.ui.generateWidgets = function(parentElement) {
		parentElement.find('[data-role="dropdown"]').zimokoDropDown();
		parentElement.find('[data-role="combobox"]').zimokoComboBox();
		parentElement.find('[data-role="numeric"]').zimokoNumericTextBox();
		parentElement.find('[data-role="autocomplete"]').zimokoAutoComplete();
		parentElement.find('[data-role="calendar"]').zimokoCalendar();
	};
	
	//Fixed issue where animation end was not being called.
	zimoko.ui.Animation = function(element, animation, callback) {
		this.element = element;
		this.animation = animation;
		this.callback = callback;
		//this.animating = false;
		this.listener = undefined;
		//this.classes = undefined;
		
		this.start = function() {
			var self = this;
			if(this.element.length > 0 && this.element.css('display') != 'none') {
	
				if(!this.element.data('classBeforeAnimation'))
					this.element.data('classBeforeAnimation', this.element.attr('class'));
				
				this.element.addClass('animated');
				this.element.addClass(this.animation);
				
				this.listener = function(e) {
					self.end($(this),e);
				};
					
				this.element.bind('animationend', this.listener);
				this.element.bind('webkitAnimationEnd', this.listener);
				this.element.bind('MSAnimationEnd', this.listener);
				this.element.bind('oAnimationEnd', this.listener);
					/*
					this.element.get(0).addEventListener('animationend', this.listener, false);
					this.element.get(0).addEventListener('webkitAnimationEnd', this.listener, false);
					this.element.get(0).addEventListener('MSAnimationEnd', this.listener, false);
					this.element.get(0).addEventListener('oAnimationEnd', this.listener, false);*/
			}
		};
		
		this.end = function(ele, e) {	
			var self = this;
			this.element.unbind('animationend', this.listener);
			this.element.unbind('webkitAnimationEnd', this.listener);
			this.element.unbind('MSAnimationEnd', this.listener);
			this.element.unbind('oAnimationEnd', this.listener);
			
			/*
			this.element.get(0).removeEventListener('animationend', this.listener, false);
			this.element.get(0).removeEventListener('webkitAnimationEnd', this.listener, false);
			this.element.get(0).removeEventListener('MSAnimationEnd', this.listener, false);
			this.element.get(0).removeEventListener('oAnimationEnd', this.listener, false);*/
			
			this.element.attr('class', '');
			this.element.attr('class', this.element.data('classBeforeAnimation'));
			
			if(this.callback) {
				this.callback.call(this, e);
			}
		};
	};
	
	zimoko.ui.animate = function(element, animation, callback) {
		var anim = new zimoko.ui.Animation(element,animation,callback);
		anim.start();
	};
	
	/** Base UI Widget class **/
	zimoko.ui.Widget = zimoko.Class.extend(function() {
		this.init = function(element, nameSpace) {
			this.bindings = []	
			
			this.element = element;
			
			this.nameSpace = nameSpace;
			
			if(this.element) {
				this.element.data('zimoko' + nameSpace, this);
			}
		};
		
		this.bind = function(event, object) {
			this.bindings.push({event: event, callback: object});
			this.element.bind(event, object);
		};
		
		this.dispose = function() {		
			this.constructor.prototype.dispose.call(this);
			
			this.element.data('zimoko' + nameSpace, undefined);
			
			this.unbindAll();
			
			this.element = undefined;
		};
		
		this.trigger = function(event, data) {
			this.element.trigger(event, [data]);
		};
		
		this.generate = function(options) {
		
		};
		
		this.unbind = function(event) {
			var removal = [];
			
			for(var i = 0; i < this.bindings.length; i++) {
				var binding = this.bindings[i];
				
				
				if(binding.event == event) {
					this.list.unbind(event, binding.callback);
					removal.push(binding);
				}	
			}
			
			for(var i = 0; i < removal.length; i++) {
				this.bindings.removeAt(this.bindings.indexOf(removal[i]));
			}
		};
		
		this.unbindAll = function() {
			for(var i = 0; i < this.bindings.length; i++) {
				var binding = this.bindings[i];
				
				this.list.unbind(binding.event, binding.callback);
			}
			
			this.bindings = [];
		};
	});
	
	/** Creates a jQuery plugin from the specified function **/
	/** The function becomes a sub class of ui.Widget **/
	/** The provided function or object is expected to have a .generate(options) function for initalizing it **/
	
	zimoko.ui.plugin = function(nameSpace, fn) {
		(function($) {
			var widgetFn = zimoko.ui.Widget.extend(fn);
				
			var methods = {
				init: function(options) {
					
					return this.each(function() {
						$ele = $(this);
						
						if(!$ele.data('zimoko' + nameSpace)) {
							var widget = new widgetFn($ele,nameSpace);
							widget.generate(options);
						}
					});
				}
			};
			
			var expression = '$.fn.zimoko' + nameSpace + ' = function(options) {' +
								'return methods.init.apply(this, arguments);' +
							 '};';	
			
			(new Function('$','methods','widgetFn', expression)).call(this,$,methods,widgetFn); 
		})(jQuery);
	};
	
	$(document).ready(function() {
		zimoko.ui.plugin('DropDown', zimoko.ui.DropDown);
		zimoko.ui.plugin('ComboBox', zimoko.ui.ComboBox);
		zimoko.ui.plugin('NumericTextBox', zimoko.ui.NumericTextBox);
		zimoko.ui.plugin('AutoComplete', zimoko.ui.AutoComplete);
		zimoko.ui.plugin('Calendar', zimoko.ui.Calendar);
		zimoko.ui.generateWidgets($('body'));
	});
})();
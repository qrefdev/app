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
	
	zimoko.ui.Animation = function(element, animation, callback) {
		this.element = element;
		this.animation = animation;
		this.callback = callback;
		this.animating = false;
		
		this.start = function() {
			if(!this.animating && this.element.length > 0) {
				this.animating = true;
				this.element.data('animationClassBefore', element.attr('class'));
				this.element.addClass('animated');
				this.element.addClass(this.animation);
				var raw = this.element[0];
				
				raw.addEventListener('animationend', this.end.bind(this), true);
				raw.addEventListener('webkitAnimationEnd', this.end.bind(this), true);
				raw.addEventListener('MSAnimationEnd', this.end.bind(this), true);
				raw.addEventListener('oAnimationEnd', this.end.bind(this), true);
			}
		};
		
		this.end = function(e) {
			var raw = this.element[0];
			var elem = this.element;
			
			e.stopPropagation();
			e.preventDefault();
			
			raw.removeEventListener('animationend', this.end);
			raw.removeEventListener('webkitAnimationEnd', this.end)
			raw.removeEventListener('MSAnimationEnd', this.end)
			raw.removeEventListener('oAnimationEnd', this.end);
		
			elem.attr('class', elem.data('animationClassBefore'));
			elem.data('animationClassBefore', undefined);
			
			if(this.callback) {
				this.callback.call(this, e);
				this.callback = undefined;
			}
			
			this.animating = false;
		};
	};
	
	zimoko.ui.animate = function(element, animation, callback) {
		var anim = new zimoko.ui.Animation(element,animation,callback);
		anim.start();
	}
	
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
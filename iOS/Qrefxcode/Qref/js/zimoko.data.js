(function() {
	if (!Array.prototype.indexOf)
	{
	  Array.prototype.indexOf = function(elt /*, from*/)
	  {
		var len = this.length >>> 0;
	
		var from = Number(arguments[1]) || 0;
		from = (from < 0)
			 ? Math.ceil(from)
			 : Math.floor(from);
		if (from < 0)
		  from += len;
	
		for (; from < len; from++)
		{
		  if (from in this &&
			  this[from] === elt)
			return from;
		}
		return -1;
	  };
	}
	
	Array.prototype.toObservableObjects = function() {
		var items = [];
		
		for(var i = 0; i < this.length; i++) {
			items.push(new zimoko.Observable(this[i]));
		}
		
		return items;
	};
	
	Array.prototype.deduplicate = function(field) {
		var toKeep = [];
		for(var i = 0; i < this.length; i++) {
			if(toKeep.indexOf(this[i][field]) == -1)
				toKeep.push(this[i][field]);
			else
				this.removeAt(i);
		}
		
		return this;
	};
	
	Object.keys = Object.keys || function(o) {
		var result = [];
		for(var name in o) {
			if (o.hasOwnProperty(name))
			  result.push(name);
		}
		return result;
	};
	
	Array.prototype.removeAt = function(index) {
	  return this.splice(index,1);
	};
	
	zimoko.Property = zimoko.Class.extend(function() {
		this.init = function(key, value, name) {	
			this.key = key;
			this.value = value;
			this.name = name;
		};
	});
	
	zimoko.Dictionary = zimoko.Class.extend(function() {	
		this.init = function() {
			this.keys = [];
			this.values = [];
		};
		
		this.containsKey = function(key) {
			return this.keys.indexOf(key) > -1;
		};
		
		this.get = function(key) {
			if (this.containsKey(key))
				return this[key];
			
			return undefined;
		};
		
		this.set = function(key, value) {
			this[key] = value;
			this.keys.push(key);
			this.values.push(value);
		};
		
		this.remove = function(key) {
			var removedItem = undefined;
			if(this.containsKey(key)) {
				removedItem = this[key];
				
				this.values.removeAt(this.values.indexOf(removedItem));
				this.keys.removeAt(this.keys.indexOf(key));
				this[key] = undefined;
			}
		};
		
		this.sortedKeys = function() {
			return this.keys.sort(function (item1, item2) {
				if (item1 < item2)
					return -1;
				else if (item1 === item2)
					return 0;
				else
					return 1;
			});
		};
		
		this.sortedValues = function() {
			return this.values.sort(function (item1, item2) {
				if(item1 < item2)
					return -1;
				else if(item1 === item2)
					return 0;
				else
					return 1;
			});
		};
	});
	
	zimoko.SortableCollection = zimoko.Class.extend(function() {		
		this.init = function(arr) {
			this.length = 0;
			
			if(arr instanceof Array)
			{
				for(var i = 0; i < arr.length; i++)
				{
					this.push(arr[i]);
				}
			}
		}
		
		this.sortBy = function(keys, direction) {
			var results = undefined;
			
			if(keys.length > 1)
			{
				results = this.sort(function(item,item2) {
					var lastValue = 0;
					
					for(var i = 0; i < keys.length; i++)
					{
						if(lastValue == 0)
						{
							var key = keys[i];
							var object = undefined;
							var object2 = undefined;
							
							if(key.indexOf(".") > -1)
							{
								subKeys = key.split(".");
								
								object = item[subKeys[0]];
								object2 = item2[subKeys[0]];
								
								for(var j = 1; j < subKeys.length; j++)
								{
									object = object[subKeys[j]];
									object2 = object2[subKeys[j]];
								}
								
							}
							else
							{
								object = item[key];
								object2 = item2[key];
							}
							
							if(direction == 'asc' || direction == 0) {
								if(object < object2)
									lastValue = -1;
								else if(object == object2)
									lastValue = 0;
								else
									lastValue = 1;
							}
							else if(direction == 'desc' || direction == 1) {
								if(object < object2)
									lastValue = 1;
								else if(object == object2)
									lastValue = 0;
								else
									lastValue = -1;
							}
						}
						else
						{
							break;
						}
					}
				
					return lastValue;
				});
			}
			else if (keys.length == 1)
			{
				if(direction == 'asc' || direction == 0) {
					results = this.sort(function(item,item2) {
						if(item[keys[0]] < item2[keys[0]])
							return -1;
						else if(item[keys[0]] == item2[keys[0]])
							return 0;
						else
							return 1;
					});
				}
				else if(direction == 'desc' || direction == 1) {
					results = this.sort(function(item,item2) {
						if(item[keys[0]] < item2[keys[0]])
							return 1;
						else if(item[keys[0]] == item2[keys[0]])
							return 0;
						else
							return -1;
					});
				}
			}
			else
			{
				results = this;
			}
			
			return results;
		};
		
		this.shift = function() {
			var firstItem = this[0];
			
			for(var i = 0; i < this.length - 1; i++)
			{
				this[i] = this[i + 1];
			}
			
			this[this.length - 1] = undefined;
			this.length--;
			
			return firstItem;
		};
		
		this.sort = function(comparator) {
			var mArray = this.toArray();
			
			mArray = mArray.sort(comparator);
			
			return new zimoko.SortableCollection(mArray);
		};
		
		this.slice = function(offset, end) {
			
			if(!offset)
				offset = 0;
				
			if(!end)
				end = this.length;
				
			var arr = new zimoko.SortableCollection();
			
			if(end > this.length)
				end = this.length;
			if(offset < 0)
				offset = 0;
			
			for(var i = offset; i < end; i++)
			{
				arr.push(this[i]);
			}		
			
			return arr;
		};
		
		this.splice = function(index, howMany /*,elements to add*/) {
			var elementsToAdd = [];
			
			if(arguments.length > 2)
			{
				for(var i = 2; i < arguments.length; i++)
				{
					elementsToAdd.push(arguments[i]);
				}
			}
			
			var elementsRemoved = [];
			
			if(howMany > this.length) howMany = this.length;
			if(howMany < 0) howMany = 0;
			
			for(var i = 0; i < howMany; i++)
			{
				elementsRemoved.push(this[index + i]);
			}

			for(var i = 0; i < elementsRemoved.length; i++)
			{
				this.removeAt(index);
			}
			
			for(var j = 0; j < elementsToAdd.length; j++)
			{
				 this.insert(index + j, elementsToAdd[j]);
			}
			
			return elementsRemoved;
		};
		
		this.removeAt = function(index) {
			for(var i = index; i < this.length - 1; i++)
			{
				this[i] = this[i + 1];
			}
			
			this[this.length - 1] = undefined;
			this.length--;
		};
		
		this.insert = function(index, item) {
			for(var i = this.length; i > index; i--)
			{
				this[i] = this[i - 1];
			}
			
			this[index] = item;
			this.length++;
		};
		
		this.toArray = function() {
			var array = new Array();
			
			for(var i = 0; i < this.length; i++)
			{
				array.push(this[i]);
			}
			
			return array;
		};
		
		this.copy = function() {
			var arr = new zimoko.SortableCollection();
			
			for(var i = 0; i < this.length; i++)
			{
				arr.push(this[i]);
			}
			
			return arr;
		};
		
		this.push = function(element) {
			this[this.length] = element;
			this.length++;
		};
		
		this.pop = function() {
			var object = this[this.length - 1];
			this[this.length - 1] = undefined;
			this.length--;
			return object;
		};
		
		this.reverse = function() {
			var array = this.toArray();
			
			for(var i = 0; i < this.length; i++) {
				this[i] = array[array.length - i - 1];
			}
		};
	});
	
	zimoko.Observable = zimoko.Class.extend(function() {		
		var self = this;
		
		this.init = function(object) {
			this.listeners = [];
			this.bindings = [];
			this.root = undefined;
			this.observableId = zimoko.createGuid();
			
			this.parent = undefined;
			self = this;
			
			this._original = object;
			
			for(var name in object) {
				this[name] = object[name];
			}
		};
		
		this.subscribe = function(listener) {
			this.listeners.push(listener);
		};
		
		this.unsubscribe = function(listener) {		
			this.listeners.removeAt(this.listeners.indexOf(listener));
		};
		
		this.unsubscribeAll = function() {
			this.listeners = [];
		};
		
		this.batchSet = function(object) {
			if(typeof(object) == 'object') {
				for(var name in object) {
					this.set(name, object[name]);
				}
			}
		};
		
		this.set = function(property, data) {
			if(this[property] != data) {
				this[property] = data;
				
				if(this._original)
					this._original[property] = data;
				
				_propertyChanged.call(this,property);
			}
		};
		
		this.get = function(property) {
			return this[property];
		};
		
		var _propertyChanged = function(property) {
			var observer = this;
			
			zimoko.Async.each(observer.listeners, function(index, listener) {
				if(listener.onPropertyChanged != undefined && typeof(listener.onPropertyChanged) == 'function') {
					listener.onPropertyChanged.call(listener, observer, property);
				}
			});
		};
		
		//Unbinds the observable from the current html element
		this.detach = function(element) {
			if(element != undefined) {
				if(element instanceof Array) {
					for(var i = 0; i < element.length; i++) {
						this.detach(element[i]);
					}
				}
				else {
					var toBeRemoved = [];
					
					for(var i = 0; i < this.bindings.length; i++) {
						var binding = this.bindings[i];
						
						if(binding.type === element) {
							toBeRemoved.push(binding);
						}
					}
					
					for(var i = 0; i < toBeRemoved.length; i++) {
						var binding = toBeRemoved[i];
						
						if(binding) {
							binding.detach();						
							this.bindings.removeAt(this.bindings.indexOf(binding));
						}
					}
				}
			} 
			else {	
				for(var i = 0; i < this.bindings.length; i++)
				{
					this.bindings[i].detach();
				}
				
				this.bindings = [];
			}
		};
		
		//Binds the observable to the specified HTML element
		this.attach = function(element) {
			var observable = this;
			
			if(element instanceof Array) {
				for(var i = 0; i < element.length; i++) {
					_bindChild.call(observable, element[i], element[i]);
				}
				
				if(observable.parent != undefined && observable.parent instanceof zimoko.Observable) {
					for(var i = 0; i < observable.bindings.length; i++) {
						var binding = observable.bindings[i];
						
						observable.parent.subscribe(binding);
					}
				}
				
				if(observable.root != undefined && observable.root instanceof zimoko.Observable) {
					for(var i = 0; i < observable.bindings.length; i++) {
						var binding = observable.bindings[i];
						
						observable.root.subscribe(binding);
					}
				}
			}
			else {
				if(typeof(element) != 'object') {
					element = $(element);
				}
				
				_bindChild.call(observable, element[0], element);
				element.attr('data-skip', 'true');
				
				if(observable.parent != undefined && observable.parent instanceof zimoko.Observable) {
					for(var i = 0; i < observable.bindings.length; i++) {
						var binding = observable.bindings[i];
						
						observable.parent.subscribe(binding);
					}
				}
				
				if(observable.root != undefined && observable.root instanceof zimoko.Observable) {
					for(var i = 0; i < observable.bindings.length; i++) {
						var binding = observable.bindings[i];
						
						observable.root.subscribe(binding);
					}
				}
			}
			
			return this;
		};
		
		var _bindChild = function(child, type) {
			var ele = $(child);
			var observable = this;
			
			if(ele.attr('data-bind') != undefined && !ele.attr('data-skip')) {
				var skipChildren = false;
				
				for(var i = 0; i < zimoko.Binding.ignoreChildrenOfHandler.length; i++) {
					var handler = zimoko.Binding.ignoreChildrenOfHandler[i];
					
					if(ele.attr('data-bind').indexOf(handler) > -1) {
						skipChildren = true;
						break;
					}
				}
				
				if(!skipChildren) {
					if(ele.children().length > 0) {
						ele.children().each(function() {
							_bindChild.call(observable, this, type);
						});
					}
				}
				
				var binding = new zimoko.Binding(observable, ele, type);
				observable.bindings.push(binding);
				binding.attach();
			}
			else if (!ele.attr('data-skip')) {
				if(ele.children().length > 0) {
					ele.children().each(function() {
						_bindChild.call(observable, this, type);
					});
				}
			}
		};
	});
		
	zimoko.ObservableCollection = zimoko.Class.extend(function() {
		var self = this;
		
		this.init = function(arr) {
			this.length = 0;
			this._internalCollection = [];
		
			this.parent = undefined;
		
			this.listeners = [];
			
			self = this;
			
			if(arr instanceof Array || arr instanceof zimoko.SortableCollection)
			{
				var added = [];
				for(var i = 0; i < arr.length; i++)
				{
					this._internalCollection.push(arr[i]);
					added.push({item: arr[i], index: i});
				}
				
				this.length = this._internalCollection.length;
				_itemsAdded.call(this,added);
			}
		}
		
		this.subscribe = function(listener) {
			this.listeners.push(listener);
		};
		
		this.unsubscribe = function(listener) {
			this.listeners.removeAt(this.listeners.indexOf(listener));
		};
		
		this.unsubscribeAll = function() {
			this.listeners = [];
		};
		
		this.elementAt = function(index) {
			if(index >= 0 && index < this._internalCollection.length)
				return this._internalCollection[index];
			
			return undefined;
		};
		
		this.toArray = function() {
			var arr = [];
			
			for(var i = 0; i < this._internalCollection.length; i++)
			{
				arr.push(this._internalCollection[i]);
			}
			
			return arr;
		};
		
		this.push = function(items) {
			if(items instanceof Array || items instanceof zimoko.SortableCollection) {
				var added = [];
				
				for(var i = 0; i < items.length; i++)
				{
					this._internalCollection.push(items[i]);
					added.push({item: items[i], index: this._internalCollection.length - 1});
				}
			
				_itemsAdded.call(this,added);
			}
			else if(items instanceof zimoko.ObservableCollection) {
				var added = [];
				
				for(var i = 0; i < items.length; i++)
				{
					this._internalCollection.push(items.elementAt(i));
					added.push({item: items.elementAt(i), index: this._internalCollection.length - 1});
				}
				
				_itemsAdded.call(this,added);
			}
			else
			{
				this._internalCollection.push(items);
				_itemsAdded.call(this,[{item: items, index: this._internalCollection.length - 1}]);
			}
			
			this.length = this._internalCollection.length;
		};
		
		this.indexOf = function(item) {
			return this._internalCollection.indexOf(item);
		};
		
		this.removeAt = function(index) {
			var removedItems = [];
		
			if(index >= 0 && index < this._internalCollection.length)
			{
				removedItems.push({item: this._internalCollection[index], index: index});
				this._internalCollection.removeAt(index);
			}
				
			this.length = this._internalCollection.length;
			
			_itemsRemoved.call(this,removedItems);
		};
		
		this.clear = function() {
			var removedItems = [];
			
			for(var i = 0; i < this._internalCollection.length; i++) {
				removedItems.push({item: this._internalCollection[i], index: i});
			}
			
			this._internalCollection = [];
			this.length = 0;
			_itemsRemoved.call(this,removedItems);
		};
		
		this.insertAt = function(item, index) {
			var added = [];
			
			added.push({item: item, index: index});
			
			this._internalCollection.splice(index,0,item);
			this.length = this._internalCollection.length;
			
			_itemsAdded.call(this,added);
		};
		
		this.pop = function() {
			var index = this._internalCollection.length - 1;
			var item = this._internalCollection.pop();
			
			
			_itemsRemoved.call(this,[{item: item, index: index}]);
			this.length = this._internalCollection.length;
			return item;
		};
		
		this.remove = function(items) {
			var removedItems = [];
			if(items instanceof Array || items instanceof zimoko.SortableCollection) {
				
				for(var i = 0; i < items.length; i++)
				{
					if(this._internalCollection.indexOf(items[i]) > -1) {
						removedItems.push({item: items[i], index: this._internalCollection.indexOf(items[i])});
						this._internalCollection.removeAt(this._internalCollection.indexOf(items[i]));
					}
				}
			
				_itemsRemoved.call(this,removedItems);
			}
			else if(items instanceof zimoko.ObservableCollection) {
				for(var i = 0; i < items.length; i++)
				{
					if(this._internalCollection.indexOf(items.elementAt(i)) > -1) {
						removedItems.push({item: items[i], index: this._internalCollection.indexOf(items.elementAt(i))});
						this._internalCollection.removeAt(this._internalCollection.indexOf(items.elementAt(i)));
					}
				}
				
				_itemsRemoved.call(this,removedItems);
			}
			else
			{
				if(this._internalCollection.indexOf(items) > -1) {
					removedItems.push({item: items, index: this._internalCollection.indexOf(items)});
					this._internalCollection.removeAt(this._internalCollection.indexOf(items));
					_itemsRemoved.call(this,removedItems);
				}
			}
			
			this.length = this._internalCollection.length;
		};
		
		var _itemsAdded = function(items) {
			var observer = this;
			
			zimoko.Async.each(observer.listeners, function(index, listener) {
				var it = items;
				if(listener.onItemsAdded != undefined && typeof(listener.onItemsAdded) == 'function') {
					listener.onItemsAdded.call(listener, observer, it);
				}
			});
		};
		
		var _itemsRemoved = function(items) {
			var observer = this;
			
			zimoko.Async.each(observer.listeners, function(index, listener) {
				var it = items;
				if(listener.onItemsRemoved != undefined && typeof(listener.onItemsRemoved) == 'function') {
					listener.onItemsRemoved.call(listener, observer, it);
				}
			});
		};
	});
		
	zimoko.ValuePair = zimoko.Class.extend(function() {
		this.init = function(key, value) {
			this.key = key;
			this.value = value;
		};
	});
	
	zimoko.Binding = zimoko.Class.extend(function() {
		var self = this;
		
		this.init = function(observable, element, type) {
			this.type = type;
			this.element = element;
			this.observable = observable;
			
			if(this.element)
				this.bindingString = this.element.attr("data-bind");
			else 
				this.bindingString = '';
				
			this.properties = [];
		};
		
		function getProperty(propertyName) {
			if(propertyName) {
				for(var i = 0; i < self.properties.length; i++) {
					var property = self.properties[i];
					
					if(property.name == propertyName || property.value.indexOf(propertyName) > -1)
						return property;
				}
			}
			
			return undefined;
		}
		
		this.onPropertyChanged = function(sender, property) {
			var self = this;
			for(var i = 0; i < this.properties.length; i++)
			{
				var aProperty = this.properties[i];
				
				if(aProperty.value.indexOf(property) > -1)
				{
					self.render(aProperty, false);
				}
			}
		};
		
		this.render = function(property, init) {
			var prop = property;
			var self = this;
		
			setTimeout(function() {
				if(!(property instanceof zimoko.Property)) {
					prop = getProperty(property);
				} 
		
				var handler = self.handlers[prop.key];
			
				if(handler) {
					if(init) {
						handler.init.call(self, self.element, new zimoko.ValueAccessor(self.observable, prop));
					}
					else {
						handler.update.call(self, self.element, new zimoko.ValueAccessor(self.observable, prop));
					}
				}
			}, 1 / 60);
		};
		
		this.detach = function() {
			var self = this;
			
			setTimeout(function() {
				for(var i = 0; i < this.properties.length; i++) {
					var property = self.properties[i];
				
					var handler = self.handlers[property.key];
			
					if(handler) {
						handler.remove.call(self, self.element, new zimoko.ValueAccessor(self.observable, property));
					}
				}
			}, 1 / 60);
			
			this.observable.unsubscribe(this);
			
			if(this.observable.parent) {
				this.observable.parent.unsubscribe(this);
			}
				
			if(this.observable.root) {
				this.observable.root.unsubscribe(this);
			}
		};
		
		this.attach = function() {
			var self = this;			
			self.parse();
		
			self.observable.subscribe(this);
		
			for(var i = 0; i < self.properties.length; i++)
			{
				var aProperty = self.properties[i];
			
				self.render(aProperty, true);
			}
		};
		
		this._parsePairs = function(str) {
			var bindingPairs = [];
			
			var characters = str.split('');
			
			var inPair = false;
			var totalParanthesis = 0;
			var totalBrackets = 0;
			var totalSquareBrackets = 0;
			var singleQuote = false;
			var quote = false;
			var buffer = '';
			
			for(var i = 0; i < characters.length; i++) {
				var c = characters[i];
				
				if(!inPair) {
					if(c == ':')
						inPair = true;
						
					buffer += c;
				}
				else if(inPair) {
					if(c == '(') { 
						totalParanthesis++;
						buffer += c;
					}
					else if(c == '{') { 
						totalBrackets++;
						buffer += c;
					}
					else if(c == '[') {
						totalSquareBrackets++;
						buffer += c;
					}
					else if(c == ')') {
						totalParanthesis--;
						buffer += c;
					}
					else if(c == '}') {
						totalBrackets--;
						buffer += c;
					}
					else if(c == ']') { 
						totalSquareBrackets--;
						buffer += c;
					}
					else if(c == '\'') {
						if(singleQuote)
							singleQuote = false;
						else
							singleQuote = true;
							
						buffer += c;
					}
					else if(c == '"') {
						if(quote)
							quote = false;
						else
							quote = true;
							
						buffer += c;
					}
					else if(c == ',' && totalBrackets <= 0 && totalParanthesis <= 0 
						&& totalSquareBrackets <= 0 && !quote && !singleQuote) {
						bindingPairs.push(buffer);
						buffer = '';
						inPair = false;
					} 
					else {
						buffer += c;
					}
				}
			}
			
			if(inPair)
				bindingPairs.push(buffer);
			
			return bindingPairs;
		};
		
		this.parse = function() {
			//reset properties
			this.properties = [];
			var bindingOptions = this.bindingString.replace(/\r|\n|\t|\r\n/g, '');	
			
			bindingOptions = this._parsePairs(bindingOptions);
			
			for(var i = 0; i < bindingOptions.length; i++)
			{
				var optionPair = bindingOptions[i].split(":");
				
				if(optionPair.length == 2)
				{
					var name = "";
					var names = [];
					var keys = Object.keys(this.observable);
					
					for(var p = 0; p < keys.length; p++)
					{
						if(optionPair[1].indexOf(keys[p]) > -1)
							names.push(keys[p]);
					}
					
					if(names.length > 0)
						name = names[0];
					
					this.properties.push(new zimoko.Property(optionPair[0].trim(), optionPair[1].trim(), name));
				} 
				else if (optionPair.length > 2) {
					var property = optionPair[0].trim();
					
					var realPropertyString = '';
					
					for(var p = 1; p < optionPair.length; p++) {
						realPropertyString += optionPair[p].trim() + ':';
					}
					
					realPropertyString = realPropertyString.substring(0, realPropertyString.length - 1);
					
					var name = "";
					var names = [];
					var keys = Object.keys(this.observable);
					
					for(var p = 0; p < keys.length; p++)
					{
						if(realPropertyString.indexOf(keys[p]) > -1)
							names.push(keys[p]);
					}
					
					if(names.length > 0)
						name = names[0];
						
					this.properties.push(new zimoko.Property(property, realPropertyString.trim(), name));
				}
			}
		};
	});
	
	zimoko.Binding.ignoreChildrenOfHandler = ['foreach:', 'droplist:', 'with:']
	
	zimoko.Binding.prototype.handlers = {
		'placeholder': {
			init: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				
				element.attr('placeholder', val);
				
				element.data('zimokoPlaceHolderValue', value);
			},
			update: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				
				var previous = element.data('zimokoPlaceHolderValue');
				
				if(previous.get() != val) {
					element.attr('placeholder', val);
					
					element.data('zimokoPlaceHolderValue', value);
				}
			},
			remove: function(element, value) {
				element.removeAttr('placeholder');
				element.data('zimokoPlaceHolderValue', undefined);
			}
		},
		'value': { 
			init: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				
				element.val(val);
				
				var changeFunction = function(e) {
					var ele = $(this);
					var changeValue = ele.data('zimokoChangeValue');
					
					changeValue.set(ele.val());
				};
				
				element.data('zimokoChangeValue', value);
				element.bind('change', changeFunction);
				element.data('zimokoChangeFunction', changeFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				
				element.data('zimokoChangeValue', value);
					
				if(element.val() !== val) {
					element.val(val);
				}
			},
			remove: function(element, value) {
				var changeFunction = element.data('zimokoChangeFunction');
				element.unbind('change', changeFunction);
				element.val('');
				element.data('zimokoChangeFunction', undefined);
				element.data('zimokoChangeValue', undefined);
			}
		},
		'selected': {
			init: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				
				var selectedFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoSelectedValue').get();
					
					var selectedOptions = ele.find('option');
					
					selectedOptions.each(function() {
						item = $(this);
						
						if(item.attr('selected')) {
							if(currentValue.indexOf(item.val()) == -1)
								currentValue.push(item.val());
						}
						else {
							if(currentValue.indexOf(item.val()) > -1)
								currentValue.removeAt(currentValue.indexOf(item.val()));
						}
					});
				};
				
				element.find('option').removeAttr('selected');
				
				if(val instanceof Array || val instanceof zimoko.SortableCollection) {
					for(var i = 0; i < val.length; i++) {
						var item = val[i];		
						
						var itemOption = element.find('option[value="' + item + '"]');
						
						if(itemOption.length > 0)
							itemOption.attr('selected', 'selected');
					}
				}
				else if (val instanceof zimoko.ObservableCollection) {
					var selectedListener = {
						onItemsAdded: function(sender, items) {
							for(var i = 0; i < items.length; i++) {
								var item = items[i].item;
								var itemOption = element.find('option[value="' + item + '"]');
					
								if(itemOption.length > 0)
									itemOption.attr('selected', 'selected');
							}
						},
						onItemsRemoved: function(sender, items) {
							for(var i = 0; i < items.length; i++) {
								var item = items[i].item;
								
								var itemOption = element.find('option[value="' + item + '"]');
					
								if(itemOption.length > 0)
									itemOption.removeAttr('selected');
							}
						}
					};
					
					for(var i = 0; i < val.length; i++) {
						var item = val.elementAt(i);
						
						var itemOption = element.find('option[value="' + item + '"]');
					
						if(itemOption.length > 0)
							itemOption.attr('selected', 'selected');
					}
				
					val.subscribe(selectedListener);
					val.parent = parent;
					
					element.data('zimokoSelectedListener', selectedListener);
				}
				
				element.data('zimokoSelectedValue', value);
				element.bind('change', selectedFunction);
				element.data('zimokoSelectedFunction', selectedFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				
				element.find('option').removeAttr('selected');
				
				var previousValue = element.data('zimokoSelectedValue').get();
				
				if(previousValue != val) {
					if(previousValue instanceof zimoko.ObservableCollection && element.data('zimokoSelectedListener')) {
						previousValue.unsubscribe(element.data('zimokoSelectedListener'));
						element.data('zimokoSelectedListener', undefined);
						previousValue.parent = undefined;
					}
				}
				
				if(val instanceof Array || val instanceof zimoko.SortableCollection) {
					for(var i = 0; i < val.length; i++) {
						var item = val[i];		
						
						var itemOption = element.find('option[value="' + item + '"]');
						
						if(itemOption.length > 0)
							itemOption.attr('selected', 'selected');
					}
				}
				else if (val instanceof zimoko.ObservableCollection) {
					if(previousValue != val) {
						var selectedListener = {
							onItemsAdded: function(sender, items) {
								for(var i = 0; i < items.length; i++) {
									var item = items[i].item;
									var itemOption = element.find('option[value="' + item + '"]');
						
									if(itemOption.length > 0)
										itemOption.attr('selected', 'selected');
								}
							},
							onItemsRemoved: function(sender, items) {
								for(var i = 0; i < items.length; i++) {
									var item = items[i].item;
									
									var itemOption = element.find('option[value="' + item + '"]');
						
									if(itemOption.length > 0)
										itemOption.removeAttr('selected');
								}
							}
						};
					
						for(var i = 0; i < val.length; i++) {
							var item = val.elementAt(i);
							
							var itemOption = element.find('option[value="' + item + '"]');
						
							if(itemOption.length > 0)
								itemOption.attr('selected', 'selected');
						}
					
						val.subscribe(selectedListener);
						val.parent = parent;
						
						element.data('zimokoSelectedListener', selectedListener);
					}
				}
				
				element.data('zimokoSelectedValue', value);
			},
			remove: function(element, value) {
				var selectedFunction = element.data('zimokoSelectedFunction');
				var val = value.get();
				element.unbind('change', selectedFunction);
				element.data('zimokoSelectedFunction', undefined);
				
				if(element.data('zimokoSelectedListener') && val instanceof zimoko.ObservableCollection) {
					val.unsubscribe(element.data('zimokoSelectedListener'));
					val.parent = undefined;
				}
				
				element.find('option').removeAttr('selected');
				
				element.data('zimokoSelectedListener', undefined);
			}
		},
		'options': {
			init: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				var dataValueField = element.attr('data-value-field');
				var dataTextField = element.attr('data-text-field');
				
				element.data('zimokoOptionsValue', value);
				
				if(val instanceof Array || val instanceof zimoko.SortableCollection) {
					element.html('');
					
					for(var i = 0; i < val.length; i++) {
						var option = document.createElement('option');
						var $option = $(option);
						
						if(dataValueField)
							$option.val(val[i][dataValueField]);
						else if(val[i].value)
							$option.val(val[i].value);
						else
							$option.val(val[i]);	
							
						if(dataTextField)
							$option.html(val[i][dataTextField]);
						else if(val[i].text)
							$option.html(val[i].text);
						else
							$option.html(val[i]);
						
						element.append($option);
					}
				}
				else if(val instanceof zimoko.ObservableCollection) {
					val.parent = parent;
					var optionsListener = {
						onItemsAdded: function(sender, items) {
							for(var i = 0; i < items.length; i++) {
								var option = document.createElement('option');
								var index = items[i].index;
								var $option = $(option);
								
								if(dataValueField)
									$option.val(items[i].item[dataValueField]);
								else if(items[i].item.value)
									$option.val(items[i].item.value);
								else
									$option.val(items[i].item);	
									
								if(dataTextField)
									$option.html(items[i].item[dataTextField]);
								else if(items[i].item.text)
									$option.html(items[i].item.text);
								else
									$option.html(items[i].item);
								
								if(index >= element.children().length) {
									element.append($option);
								}
								else {
									$ele = $(element.children().get(index));
									
									$ele.before($option);
								}
							}
							
							element.trigger('change');
						},
						onItemsRemoved: function(sender, items) {
							for(var i = 0; i < items.length; i++) {
								var index = items[i].index;
								
								$ele = $(element.children().get(index));
								$ele.remove();
							}
							
							element.trigger('change');
						}
					};
				
					for(var i = 0; i < val.length; i++) {
						var item = val.elementAt(i);
						
						var option = document.createElement('option');
						var $option = $(option);
						
						if(dataValueField)
							$option.val(item[dataValueField]);
						else if(item.value)
							$option.val(item.value);
						else
							$option.val(item);	
							
						if(dataTextField)
							$option.html(item[dataTextField]);
						else if(item.text)
							$option.html(item.text);
						else
							$option.html(item);
							
						element.append($option);
					}
				
					element.data('zimokoOptionsListener', optionsListener);
					
					val.subscribe(optionsListener);
				}
			},
			update: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				var dataValueField = element.attr('data-value-field');
				var dataTextField = element.attr('data-text-field');
				
				if(val instanceof Array || val instanceof zimoko.SortableCollection) {
					element.html('');
					
					for(var i = 0; i < val.length; i++) {
						var option = document.createElement('option');
						var $option = $(option);
						
						if(dataValueField)
							$option.val(val[i][dataValueField]);
						else if(val[i].value)
							$option.val(val[i].value);
						else
							$option.val(val[i]);	
							
						if(dataTextField)
							$option.html(val[i][dataTextField]);
						else if(val[i].text)
							$option.html(val[i].text);
						else
							$option.html(val[i]);
						
						element.append($option);
					}
				}
				else if(val instanceof zimoko.ObservableCollection) {
					var previousValue = element.data('zimokoOptionsValue').get();
					if(val !== previousValue) {
						element.html('');
						
						if(previousValue instanceof zimoko.ObservableCollection) {
							previousValue.unsubscribe(element.data('zimokoOptionsListener'));
							previousValue.parent = undefined;
						}
						
						val.parent = parent;
						var optionsListener = {
							onItemsAdded: function(sender, items) {
								for(var i = 0; i < items.length; i++) {
									var option = document.createElement('option');
									var index = items[i].index;
									var $option = $(option);
									
									if(dataValueField)
										$option.val(items[i].item[dataValueField]);
									else if(items[i].item.value)
										$option.val(items[i].item.value);
									else
										$option.val(items[i].item);	
										
									if(dataTextField)
										$option.html(items[i].item[dataTextField]);
									else if(items[i].item.text)
										$option.html(items[i].item.text);
									else
										$option.html(items[i].item);
									
									if(index >= element.children().length) {
										element.append($option);
									}
									else {
										$ele = $(element.children().get(index));
										
										$ele.before($option);
									}
								}
								
								element.trigger('change');
							},
							onItemsRemoved: function(sender, items) {
								for(var i = 0; i < items.length; i++) {
									var index = items[i].index;
									
									$ele = $(element.children().get(index));
									$ele.remove();
								}
								
								element.trigger('change');
							}
						};
					
						element.data('zimokoOptionsListener', optionsListener);
						
						for(var i = 0; i < val.length; i++) {
							var item = val.elementAt(i);
							
							var option = document.createElement('option');
							var $option = $(option);
							
							if(dataValueField)
								$option.val(item[dataValueField]);
							else if(item.value)
								$option.val(item.value);
							else
								$option.val(item);	
								
							if(dataTextField)
								$option.html(item[dataTextField]);
							else if(item.text)
								$option.html(item.text);
							else
								$option.html(item);
								
							element.append($option);
						}
						
						val.subscribe(optionsListener);
						
						element.data('zimokoOptionsValue', value);
					}
				}
			},
			remove: function(element, value) {
				var val = value.get();
				if(val instanceof zimoko.ObservableCollection) {
					val.parent = undefined;
					var listener = element.data('zimokoOptionsListener');
					
					if(listener) {
						val.unsubscribe(listener);
						element.data('zimokoOptionsListener', undefined);
					}
				}
				
				element.html('');
				
				element.data('zimokoOptionsValue', undefined);
			}
		},
		'foreach': {
			init: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				var isObservableCollection = (val instanceof zimoko.ObservableCollection);
				
				element.data('zimokoForeachValue', value);
				element.data('zimokoForeachTemplate', $(element.html()));
				element.html('');
				
				if(isObservableCollection) {
					val.parent = parent;
					var foreachListener = {
						onItemsAdded: function(sender, items) {
							for(var i = 0; i < items.length; i++) {
								var item = items[i].item;
								var index = items[i].index;
								var isObservable = (item instanceof zimoko.Observable);
							
								var itemTemplate = element.data('zimokoForeachTemplate').clone();
							
                                //itemTemplate.css({visibility: 'hidden'});
                                
								if(index >= element.children().length) {
									element.append(itemTemplate);
								}
								else {
									var $ele = $(element.children().get(index));
									$ele.before(itemTemplate);
								}
							
								if(isObservable) {
									item.parent = parent;
									item.attach(itemTemplate);
									itemTemplate.attr('data-observable', item.observableId);
									
									//item.attach(itemTemplate);
								}
							}
							
							/*
							for(var i = 0; i < items.length; i++) {
								var item = items[i].item;
								var index = items[i].index;
								var isObservable = (item instanceof zimoko.Observable);
							
								var itemTemplate = element.data('zimokoForeachTemplate').clone();
							
								if(index >= element.children().length) {
									zimoko.AsyncDispatch(element, element.append, [itemTemplate]);
								}
								else {
									var $ele = $(element.children().get(index));
								
									zimoko.AsyncDispatch($ele, $ele.before, [itemTemplate]);
									//$ele.before(itemTemplate);
								}
							
								if(isObservable) {
									item.parent = parent;
									zimoko.AsyncDispatch(item, item.attach, [itemTemplate]);
									
									//item.attach(itemTemplate);
								}
							}*/
						},
						onItemsRemoved: function(sender, items) {
							for(var i = 0; i < items.length; i++) {
								var index = items[i].index;
								var item = items[i].item;
					
								var $ele = element.find('[data-observable="' + item.observableId + '"]');
					
								if($ele) {
									if(item && item instanceof zimoko.Observable) 
										item.detach($ele);
					
									$ele.remove();
								}
							}
						}
					};	
					
					/*setTimeout(function() {
						for(var i = 0; i < val.length; i++) {
							var item = val.elementAt(i);
							var isObservable = (item instanceof zimoko.Observable);
						
							var itemTemplate = element.data('zimokoForeachTemplate').clone();
						
							element.append(itemTemplate);
						
							if(isObservable) {
								item.parent = parent;
								item.attach(itemTemplate);
							}
						}
					}, 1 / 60); */
					
					element.data('zimokoForeachListener', foreachListener);
					
					val.subscribe(foreachListener);
				}
				else if(val instanceof Array || val instanceof zimoko.SortableCollection) {
					for(var i = 0; i < val.length; i++) {
						var item = val[i];
						var isObservable = (item instanceof zimoko.Observable);
						var itemTemplate = element.data('zimokoForeachTemplate').clone();
				
                        //itemTemplate.css({visibility: 'hidden'});
                                      
						element.append(itemTemplate);
				
						if(isObservable) {
							item.parent = parent;
							
							item.attach(itemTemplate);
							//item.attach(itemTemplate);
						}
					}
					
					/*for(var i = 0; i < val.length; i++) {
						var item = val[i];
						var isObservable = (item instanceof zimoko.Observable);
						var itemTemplate = element.data('zimokoForeachTemplate').clone();
				
						zimoko.AsyncDispatch(element, element.append, [itemTemplate]);
						//element.append(itemTemplate);
				
						if(isObservable) {
							item.parent = parent;
							
							zimoko.AsyncDispatch(item, item.attach, [itemTemplate]);
							//item.attach(itemTemplate);
						}	
					}*/
				}
			},
			update: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				var isObservableCollection = (val instanceof zimoko.ObservableCollection);
				var previousValue = element.data('zimokoForeachValue').get();
				
				if(val === previousValue) return;
				
				if(val !== previousValue) {
					
					if(previousValue instanceof zimoko.ObservableCollection) {
						previousValue.unsubscribe(element.data('zimokoForeachListener'));
						previousValue.parent = undefined;
					
						for(var i = 0; i < previousValue.length; i++) {
							var item = previousValue.elementAt(i);
							var isObservable = (item instanceof zimoko.Observable);
                            var $ele = $(element.children().get(i));
 
 
							if(isObservable) {
								item.detach($ele);
								//item.detach($ele);
                            }
						}
					} 
					else if(previousValue instanceof Array || previousValue instanceof zimoko.SortableCollection) {
						for(var i = 0; i < previousValue.length; i++) {
							var item = previousValue[i];
							var isObservable = (item instanceof zimoko.Observable);
                            var $ele = $(element.children().get(i));
                            
							if(isObservable) {
								item.detach($ele);
								//item.detach($ele);
							}
						}
					}
					
					element.html('');
					
					element.data('zimokoForeachValue', value);
					
					if(isObservableCollection) {
						val.parent = parent;
						var foreachListener = {
							onItemsAdded: function(sender, items) {
								for(var i = 0; i < items.length; i++) {
									var item = items[i].item;
									var index = items[i].index;
									var isObservable = (item instanceof zimoko.Observable);
							
									var itemTemplate = element.data('zimokoForeachTemplate').clone();
							
                                    //itemTemplate.css({visibility: 'hidden'});
                                                  
									if(index >= element.children().length) {
										element.append(itemTemplate);
									}
									else {
										var $ele = $(element.children().get(index));
										$ele.before(itemTemplate);
									}
							
									if(isObservable) {
										item.parent = parent;
										item.attach(itemTemplate);
										itemTemplate.attr('data-observable', item.observableId);
										//item.attach(itemTemplate);
									}
								}
								
								/*
								for(var i = 0; i < items.length; i++) {
									var item = items[i].item;
									var index = items[i].index;
									var isObservable = (item instanceof zimoko.Observable);
							
									var itemTemplate = element.data('zimokoForeachTemplate').clone();
							
									if(index >= element.children().length) {
										zimoko.AsyncDispatch(element, element.append, [itemTemplate]);
									}
									else {
										var $ele = $(element.children().get(index));
								
										zimoko.AsyncDispatch($ele, $ele.before, [itemTemplate]);
										//$ele.before(itemTemplate);
									}
							
									if(isObservable) {
										item.parent = parent;
										zimoko.AsyncDispatch(item, item.attach, [itemTemplate]);
									
										//item.attach(itemTemplate);
									}
								}*/
							},
							onItemsRemoved: function(sender, items) {
								for(var i = 0; i < items.length; i++) {
									var index = items[i].index;
									var item = items[i].item;
						
									var $ele = element.find('[data-observable="' + item.observableId + '"]');
						
									if($ele) {
										if(item && item instanceof zimoko.Observable) 
											item.detach($ele);
						
										$ele.remove();
									}
								}
							}
						};	
						val.subscribe(foreachListener);
						element.data('zimokoForeachListener', foreachListener);
						var items = val.toArray();
						for(var i = 0; i < items.length; i++) {
							var item = items[i];
							var isObservable = (item instanceof zimoko.Observable);
						
							var itemTemplate = element.data('zimokoForeachTemplate').clone();
						
                            //itemTemplate.css({visibility: 'hidden'});
                                          
							element.append(itemTemplate);
						
							if(isObservable) {
								item.parent = parent;
								
								item.attach(itemTemplate);
								itemTemplate.attr('data-observable', item.observableId);
								//item.attach(itemTemplate);
                            }
						}
					}
				}
				
				if(val instanceof Array || val instanceof zimoko.SortableCollection) {
					for(var i = 0; i < val.length; i++) {
						var item = val[i];
						var isObservable = (item instanceof zimoko.Observable);
						var itemTemplate = element.data('zimokoForeachTemplate').clone();
					
                        //itemTemplate.css({visibility: 'hidden'});
                                      
						element.append(itemTemplate);
					
						if(isObservable) {
							item.parent = parent;
							
							item.attach(itemTemplate);
						}	
					}
					/*for(var i = 0; i < val.length; i++) {
						var item = val[i];
						var isObservable = (item instanceof zimoko.Observable);
						var itemTemplate = element.data('zimokoForeachTemplate').clone();
					
						zimoko.AsyncDispatch(element, element.append, [itemTemplate]);
						//element.append(itemTemplate);
					
						if(isObservable) {
							item.parent = parent;
							
							zimoko.AsyncDispatch(item, item.attach, [itemTemplate]);
							//item.attach(itemTemplate);
						}	
					}*/
				}
			},
			remove: function(element, value) {
				var previousValue = element.data('zimokoForeachValue').get();
					
				if(previousValue instanceof zimoko.ObservableCollection) {
					previousValue.unsubscribe(element.data('zimokoForeachListener'));
					previousValue.parent = undefined;
					
					for(var i = 0; i < previousValue.length; i++) {
						var item = previousValue.elementAt(i);
					
						var $ele = $(element.children().get(i));
							
						if(item && item instanceof zimoko.Observable)
							item.detach($ele);
					}
				}
				else if (previousValue instanceof Array || previousValue instanceof zimoko.SortableCollection) {
					for(var i = 0; i < previousValue.length; i++) {
						var item = previousValue[i];
					
						var $ele = $(element.children().get(i));
							
						if(item && item instanceof zimoko.Observable)
							item.detach($ele);

					}
				}
				
				element.html('');
				element.data('zimokoForeachValue', undefined);
				element.data('zimokoForeachListener', undefined);
			}
		},
		'virtualForeach': {
			init: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				var isObservableCollection = (val instanceof zimoko.ObservableCollection);
				
				element.data('zimokoForeachValue', value);
				element.data('zimokoForeachTemplate', $(element.html()));
				element.html('');
				
				if(isObservableCollection) {
					val.parent = parent;
					var foreachListener = {
						onItemsAdded: function(sender, items) {
							for(var i = 0; i < items.length; i++) {
								var item = items[i].item;
								var index = items[i].index;
								var isObservable = (item instanceof zimoko.Observable);
							
								var itemTemplate = element.data('zimokoForeachTemplate').clone();
							
                                //itemTemplate.css({visibility: 'hidden'});
                                
								if(index >= element.children().length) {
									element.append(itemTemplate);
								}
								else {
									var $ele = $(element.children().get(index));
									$ele.before(itemTemplate);
								}
							
								if(isObservable) {
									item.parent = parent;
									item.attach(itemTemplate);
									itemTemplate.attr('data-observable', item.observableId);
									
									//item.attach(itemTemplate);
								}
							}
							
							setTimeout(function() {
								var pt = element.parent();
							
								while(pt) {
									if(pt[0].scrollHeight > 0)
										break;
									else
										pt = pt.parent();
								}
						
								if(pt) {
									var scrollTop = pt.scrollTop();

									var elements = element.children();
									zimoko.applyVirtualCoords(elements, scrollTop, pt);
								}
							}, 350);
							/*
							for(var i = 0; i < items.length; i++) {
								var item = items[i].item;
								var index = items[i].index;
								var isObservable = (item instanceof zimoko.Observable);
							
								var itemTemplate = element.data('zimokoForeachTemplate').clone();
							
								if(index >= element.children().length) {
									zimoko.AsyncDispatch(element, element.append, [itemTemplate]);
								}
								else {
									var $ele = $(element.children().get(index));
								
									zimoko.AsyncDispatch($ele, $ele.before, [itemTemplate]);
									//$ele.before(itemTemplate);
								}
							
								if(isObservable) {
									item.parent = parent;
									zimoko.AsyncDispatch(item, item.attach, [itemTemplate]);
									
									//item.attach(itemTemplate);
								}
							}*/
						},
						onItemsRemoved: function(sender, items) {
							for(var i = 0; i < items.length; i++) {
								var index = items[i].index;
								var item = items[i].item;
					
								var $ele = element.find('[data-observable="' + item.observableId + '"]');
					
								if($ele) {
									if(item && item instanceof zimoko.Observable) 
										item.detach($ele);
					
									$ele.remove();
								}
							}
							
							setTimeout(function() {
								var pt = element.parent();
							
								while(pt) {
									if(pt[0].scrollHeight > 0)
										break;
									else
										pt = pt.parent();
								}
						
								if(pt) {
									var scrollTop = pt.scrollTop();

									var elements = element.children();
									zimoko.applyVirtualCoords(elements, scrollTop, pt);
								}
							}, 350);
						}
					};	
					
					/*setTimeout(function() {
						for(var i = 0; i < val.length; i++) {
							var item = val.elementAt(i);
							var isObservable = (item instanceof zimoko.Observable);
						
							var itemTemplate = element.data('zimokoForeachTemplate').clone();
						
							element.append(itemTemplate);
						
							if(isObservable) {
								item.parent = parent;
								item.attach(itemTemplate);
							}
						}
					}, 1 / 60); */
					
					element.data('zimokoForeachListener', foreachListener);
					
					val.subscribe(foreachListener);
				}
				else if(val instanceof Array || val instanceof zimoko.SortableCollection) {
					for(var i = 0; i < val.length; i++) {
						var item = val[i];
						var isObservable = (item instanceof zimoko.Observable);
						var itemTemplate = element.data('zimokoForeachTemplate').clone();
				
                        //itemTemplate.css({visibility: 'hidden'});
                                      
						element.append(itemTemplate);
				
						if(isObservable) {
							item.parent = parent;
							
							item.attach(itemTemplate);
							//item.attach(itemTemplate);
						}
					}
					
					setTimeout(function() {
						var pt = element.parent();
					
						while(pt) {
							if(pt[0].scrollHeight > 0)
								break;
							else
								pt = pt.parent();
						}
				
						if(pt) {
							var scrollTop = pt.scrollTop();

							var elements = element.children();
							zimoko.applyVirtualCoords(elements, scrollTop, pt);
						}
					}, 350);
					/*for(var i = 0; i < val.length; i++) {
						var item = val[i];
						var isObservable = (item instanceof zimoko.Observable);
						var itemTemplate = element.data('zimokoForeachTemplate').clone();
				
						zimoko.AsyncDispatch(element, element.append, [itemTemplate]);
						//element.append(itemTemplate);
				
						if(isObservable) {
							item.parent = parent;
							
							zimoko.AsyncDispatch(item, item.attach, [itemTemplate]);
							//item.attach(itemTemplate);
						}	
					}*/
				}
			},
			update: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				var isObservableCollection = (val instanceof zimoko.ObservableCollection);
				var previousValue = element.data('zimokoForeachValue').get();
				
				if(val === previousValue) return;
				
				if(val !== previousValue) {
					
					if(previousValue instanceof zimoko.ObservableCollection) {
						previousValue.unsubscribe(element.data('zimokoForeachListener'));
						previousValue.parent = undefined;
					
						for(var i = 0; i < previousValue.length; i++) {
							var item = previousValue.elementAt(i);
							var isObservable = (item instanceof zimoko.Observable);
                            var $ele = $(element.children().get(i));
 
 
							if(isObservable) {
								item.detach($ele);
								//item.detach($ele);
                            }
						}
					} 
					else if(previousValue instanceof Array || previousValue instanceof zimoko.SortableCollection) {
						for(var i = 0; i < previousValue.length; i++) {
							var item = previousValue[i];
							var isObservable = (item instanceof zimoko.Observable);
                            var $ele = $(element.children().get(i));
                            
							if(isObservable) {
								item.detach($ele);
								//item.detach($ele);
							}
						}
					}
					
					element.html('');
					
					element.data('zimokoForeachValue', value);
					
					if(isObservableCollection) {
						val.parent = parent;
						var foreachListener = {
							onItemsAdded: function(sender, items) {
								for(var i = 0; i < items.length; i++) {
									var item = items[i].item;
									var index = items[i].index;
									var isObservable = (item instanceof zimoko.Observable);
							
									var itemTemplate = element.data('zimokoForeachTemplate').clone();
							
                                    //itemTemplate.css({visibility: 'hidden'});
                                                  
									if(index >= element.children().length) {
										element.append(itemTemplate);
									}
									else {
										var $ele = $(element.children().get(index));
										$ele.before(itemTemplate);
									}
							
									if(isObservable) {
										item.parent = parent;
										item.attach(itemTemplate);
										itemTemplate.attr('data-observable', item.observableId);
										//item.attach(itemTemplate);
									}
								}
								
								setTimeout(function() {
									var pt = element.parent();
							
									while(pt) {
										if(pt[0].scrollHeight > 0)
											break;
										else
											pt = pt.parent();
									}
						
									if(pt) {
										var scrollTop = pt.scrollTop();

										var elements = element.children();
										zimoko.applyVirtualCoords(elements, scrollTop, pt);
									}
								}, 350);
								/*
								for(var i = 0; i < items.length; i++) {
									var item = items[i].item;
									var index = items[i].index;
									var isObservable = (item instanceof zimoko.Observable);
							
									var itemTemplate = element.data('zimokoForeachTemplate').clone();
							
									if(index >= element.children().length) {
										zimoko.AsyncDispatch(element, element.append, [itemTemplate]);
									}
									else {
										var $ele = $(element.children().get(index));
								
										zimoko.AsyncDispatch($ele, $ele.before, [itemTemplate]);
										//$ele.before(itemTemplate);
									}
							
									if(isObservable) {
										item.parent = parent;
										zimoko.AsyncDispatch(item, item.attach, [itemTemplate]);
									
										//item.attach(itemTemplate);
									}
								}*/
							},
							onItemsRemoved: function(sender, items) {
								for(var i = 0; i < items.length; i++) {
									var index = items[i].index;
									var item = items[i].item;
						
									var $ele = element.find('[data-observable="' + item.observableId + '"]');
						
									if($ele) {
										if(item && item instanceof zimoko.Observable) 
											item.detach($ele);
						
										$ele.remove();
									}
								}
								
								setTimeout(function() {
									var pt = element.parent();
							
									while(pt) {
										if(pt[0].scrollHeight > 0)
											break;
										else
											pt = pt.parent();
									}
						
									if(pt) {
										var scrollTop = pt.scrollTop();

										var elements = element.children();
										zimoko.applyVirtualCoords(elements, scrollTop, pt);
									}
								}, 350);
							}
						};	
						val.subscribe(foreachListener);
						element.data('zimokoForeachListener', foreachListener);
						var items = val.toArray();
						for(var i = 0; i < items.length; i++) {
							var item = items[i];
							var isObservable = (item instanceof zimoko.Observable);
						
							var itemTemplate = element.data('zimokoForeachTemplate').clone();
						
                            //itemTemplate.css({visibility: 'hidden'});
                                          
							element.append(itemTemplate);
						
							if(isObservable) {
								item.parent = parent;
								
								item.attach(itemTemplate);
								itemTemplate.attr('data-observable', item.observableId);
								//item.attach(itemTemplate);
                            }
						}
						
						setTimeout(function() {
							var pt = element.parent();
						
							while(pt) {
								if(pt[0].scrollHeight > 0)
									break;
								else
									pt = pt.parent();
							}
					
							if(pt) {
								var scrollTop = pt.scrollTop();

								var elements = element.children();
								zimoko.applyVirtualCoords(elements, scrollTop, pt);
							}
						}, 350);
					}
				}
				
				if(val instanceof Array || val instanceof zimoko.SortableCollection) {
					for(var i = 0; i < val.length; i++) {
						var item = val[i];
						var isObservable = (item instanceof zimoko.Observable);
						var itemTemplate = element.data('zimokoForeachTemplate').clone();
					
                        //itemTemplate.css({visibility: 'hidden'});
                                      
						element.append(itemTemplate);
					
						if(isObservable) {
							item.parent = parent;
							
							item.attach(itemTemplate);
						}	
					}
		
					setTimeout(function() {
						var pt = element.parent();
					
						while(pt) {
							if(pt[0].scrollHeight > 0)
								break;
							else
								pt = pt.parent();
						}
				
						if(pt) {
							var scrollTop = pt.scrollTop();

							var elements = element.children();
							zimoko.applyVirtualCoords(elements, scrollTop, pt);
						}
					}, 350);
					/*for(var i = 0; i < val.length; i++) {
						var item = val[i];
						var isObservable = (item instanceof zimoko.Observable);
						var itemTemplate = element.data('zimokoForeachTemplate').clone();
					
						zimoko.AsyncDispatch(element, element.append, [itemTemplate]);
						//element.append(itemTemplate);
					
						if(isObservable) {
							item.parent = parent;
							
							zimoko.AsyncDispatch(item, item.attach, [itemTemplate]);
							//item.attach(itemTemplate);
						}	
					}*/
				}
			},
			remove: function(element, value) {
				var previousValue = element.data('zimokoForeachValue').get();
					
				if(previousValue instanceof zimoko.ObservableCollection) {
					previousValue.unsubscribe(element.data('zimokoForeachListener'));
					previousValue.parent = undefined;
					
					for(var i = 0; i < previousValue.length; i++) {
						var item = previousValue.elementAt(i);
					
						var $ele = $(element.children().get(i));
							
						if(item && item instanceof zimoko.Observable)
							item.detach($ele);
					}
				}
				else if (previousValue instanceof Array || previousValue instanceof zimoko.SortableCollection) {
					for(var i = 0; i < previousValue.length; i++) {
						var item = previousValue[i];
					
						var $ele = $(element.children().get(i));
							
						if(item && item instanceof zimoko.Observable)
							item.detach($ele);

					}
				}
				
				element.html('');
				element.data('zimokoForeachValue', undefined);
				element.data('zimokoForeachListener', undefined);
			}
		},
 		'virtual': {
 			init: function(element, value) {
 				var val = value.get();
 				
 				var virtualListener = function(e) {
					var scrollTop = element.scrollTop();
					
					var elements = element.find(val);
 	
 					setTimeout(function() {
						elements.each(function(index, item) {
							var $ele = $(item);
							var offset = $ele.position();
			
							if(offset) {
								if(offset.top - scrollTop < 0 - $ele.height()) {
									$ele.css({visibility: 'hidden'});
									//console.log("Item Hidden");
								}
								else if(offset.top - scrollTop > element.height() + $ele.height()) {
									$ele.css({visibility: 'hidden'});
									//console.log("Item " + i + ": Hidden");
								}
								else {
									$ele.css({visibility: 'visible'});
									//console.log("Item " + i + ": Shown");
								}
							}
						});
					}, 1 / 60);
				};
 					
 				element.scroll(virtualListener);
 				
 				element.data('zimokoVirtualListener', virtualListener);
 			},
 			update: function(element, value) {
 			
 			},
 			remove: function(element, value) {
 				var virtualListener = element.data('zimokoVirtualListener');
 				
 				if(element.scrollHeight() > 0)
 					element.unbind('scroll', virtualListener);
 				else if(element.parent().scrollHeight() > 0)
 					element.parent().unbind('scroll', virtualListener);
 					
 				element.data('zimokoVirtualListener', undefined);
 			}
 		},
		'text': {
			init: function(element, value) {
				var val = value.get();
				
				element.text(val);
			},
			update: function(element, value) {
				var val = value.get();
				
				element.text(val);
			},
			remove: function(element, value) {
				element.text('');
			}
		},
		'html': {
			init: function(element, value) {
				var val = value.get();
				
				element.html(val);
			},
			update: function(element, value) {
				var val = value.get();
				
				element.html(val);
			},
			remove: function(element, value) {
				element.html('');
			}
		},
		'attr': {
			init: function(element, value) {
				var val = value.get();
				
				if(typeof(val) == 'object') {
					element.attr(val);
				}
			},
			update: function(element, value) {
				var val = value.get();
				
				if(typeof(val) == 'object') {
					element.attr(val);
				}
			},
			remove: function(element, value) {
				var val = value.get();
				
				if(typeof(val) == 'object') {
					for(var name in val) {
						element.removeAttr(name);
					}
				}
			}
		}, //601 - Modified to use CSS3 animations
		'fadeVisible': {
			init: function(element, value) {
				var val = value.get();
				
				if(val) {
					element.css({'opacity': 0, 'display': 'block'});
                    zimoko.ui.animate(element, 'fadeIn', function(e) {
                    	element.css({'opacity': 1});
                    });
				}
				else {
                    zimoko.ui.animate(element, 'fadeOut', function(e) {
                        element.hide();
                    });
				}
			},
			update: function(element, value) {
				var val = value.get();
				
				if(val) {
                    element.css({'opacity': 0, 'display': 'block'});
                    zimoko.ui.animate(element, 'fadeIn', function(e) {
                    	element.css({'opacity': 1});
                    });
				}
				else {
                    zimoko.ui.animate(element, 'fadeOut', function(e) {
                        element.hide();
                    });
				}
			},
			remove: function(element, value) {
				zimoko.ui.animate(element, 'fadeOut', function(e) {
                    element.hide();
                });
			}
		},
		'visible': {
			init: function(element, value) {
				var val = value.get();
				 
				if(val)
					element.show();
				else
					element.hide();
			},
			update: function(element, value) {
				var val = value.get();
				
				if(val)
					element.show();
				else
					element.hide();
			},
			remove: function(element, value) {
				element.hide();
			}
		},
		'css': {
			init: function(element, value) {
				var val = value.get();
				
				if(typeof(val) == 'object')
					element.css(val);
			},
			update: function(element, value) {
				var val = value.get();
				
				if(typeof(val) == 'object')
					element.css(val);
			},
			remove: function(element, value) {
				//Do nothing
			}
		},
		'with': {
			init: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				var isObservable = (val instanceof zimoko.Observable);
				
				if(isObservable) {
					val.root = parent;
					element.data('zimokoWithValue', value);
					val.attach(element.children().toArray());
				}
			},
			update: function(element, value) {
				var currentProperty = undefined
				
				if(element.data('zimokoWithValue'))
					currentProperty = element.data('zimokoWithValue').get();
					
				var val = value.get();
				var parent = this.observable;
				
				if(currentProperty !== val) {
					if(currentProperty instanceof zimoko.Observable) {
						currentProperty.detach(element.children().toArray());
						currentProperty.root = undefined;
					}
					
					element.data('zimokoWithValue', undefined);
					
					var isObservable = (val instanceof zimoko.Observable);
					
					if(isObservable) {
						val.root = parent;
						element.data('zimokoWithValue', value);
						val.attach(element.children().toArray());
					}
				}
			},
			remove: function(element, value) {
				var parent = this.observable;
				if(element.data('zimokoWithValue')) {
					var previousValue = element.data('zimokoWithValue').get();
					
					if(previousValue instanceof zimoko.Observable) {
						previousValue.detach(element.children().toArray());
						previousValue.root = undefined;
					}
				}				
				element.data('zimokoWithValue', undefined);
			}
		},
		'enable': {
			init: function(element, value) {
				var val = value.get();
				
				if(val)
					element.removeAttr('disabled');
				else
					element.attr('disabled','disabled');
			},
			update: function(element, value) {
				var val = value.get();
					 
				if(val)
					element.removeAttr('disabled');
				else
					element.attr('disabled','disabled');
			},
			remove: function(element, value) {
				element.removeAttr('disabled');
			}
		},
		'hasFocus': {
			init: function(element, value) {
				var val = value.get();
				
				var focusFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoFocusBlurValue');
					
					currentValue.set(true);
				};
				
				var blurFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoFocusBlurValue');
					
					currentValue.set(false);
				};
				
				element.bind('focus', focusFunction);
				element.bind('blur', blurFunction);
				element.data('zimokoFocusFunction', focusFunction);
				element.data('zimokoBlurFunction', blurFunction);
				element.data('zimokoFocusBlurValue', value); 
				
				if(val)
					element.focus();
				else
					element.blur();
			},
			update: function(element, value) {
				var val = value.get();
				
				element.data('zimokoFocusBlurValue', value);
				 
				if(val)
					element.focus();
				else
					element.blur();
			},
			remove: function(element, value) {
				element.unbind('focus', element.data('zimokoFocusFunction'));
				element.unbind('blur', element.data('zimokoBlurFunction'));
				element.data('zimokoFocusFunction', undefined);
				element.data('zimokoBlurFunction', undefined);
				element.data('zimokoFocusBlurValue', undefined);
			}
		},
		'submit': {
			init: function(element, value) {
				var parent = this.observable;
				var submitFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoSubmitValue');	
					currentValue.trigger(this, e, parent);
				};
			
				element.data('zimokoSubmitValue', value);
				element.data('zimokoSubmitFunction', submitFunction);
				element.bind('submit', submitFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				
				element.data('zimokoSubmitValue', value);
			},
			remove: function(element, value) {
				element.unbind('submit', element.data('zimokoSubmitFunction'));
				element.data('zimokoSubmitFunction', undefined);
				element.data('zimokoSubmitValue', undefined);
			}
		},
		'click': {
			init: function(element, value) {
				var parent = this.observable;
				var clickFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoClickValue');	
					currentValue.trigger(this, e, parent);
				};
			
				element.data('zimokoClickValue', value);
				element.data('zimokoClickFunction', clickFunction);
				element.bind('click', clickFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				
				element.data('zimokoClickValue', value);
			},
			remove: function(element, value) {
				element.unbind('click', element.data('zimokoClickFunction'));
				element.data('zimokoClickFunction', undefined);
				element.data('zimokoClickValue', undefined);
			}
		},
		'dblclick': {
			init: function(element, value) {
				var parent = this.observable;
				var dblclickFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoDblclickValue');	
					currentValue.trigger(this, e, parent);
				};
			
				element.data('zimokoDblclickValue', value);
				element.data('zimokoDblclickFunction', dblclickFunction);
				element.bind('dblclick', dblclickFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				
				element.data('zimokoDblclickValue', value);
			},
			remove: function(element, value) {
				element.unbind('dblclick', element.data('zimokoDblclickFunction'));
				element.data('zimokoDblclickFunction', undefined);
				element.data('zimokoDblclickValue', undefined);
			}
		},
		'keydown': {
			init: function(element, value) {
				var parent = this.observable;
				var keydownFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoKeydownValue');	
					currentValue.trigger(this, e, parent);
				};
			
				element.data('zimokoKeydownValue', value);
				element.data('zimokoKeydownFunction', keydownFunction);
				element.bind('keydown', keydownFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				
				element.data('zimokoKeydownValue', value);
			},
			remove: function(element, value) {
				element.unbind('keydown', element.data('zimokoKeydownFunction'));
				element.data('zimokoKeydownFunction', undefined);
				element.data('zimokoKeydownValue', undefined);
			}
		},
		'keyup': {
			init: function(element, value) {
				var parent = this.observable;
				var keyupFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoKeyupValue');	
					currentValue.trigger(this, e, parent);
				};
			
				element.data('zimokoKeyupValue', value);
				element.data('zimokoKeyupFunction', keyupFunction);
				element.bind('keyup', keyupFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				
				element.data('zimokoKeyupValue', value);
			},
			remove: function(element, value) {
				element.unbind('keyup', element.data('zimokoKeyupFunction'));
				element.data('zimokoKeyupFunction', undefined);
				element.data('zimokoKeyupValue', undefined);
			}
		},
		'keypress': {
			init: function(element, value) {
				var parent = this.observable;
				var keypressFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoKeypressValue');	
					currentValue.trigger(this, e, parent);
				};
			
				element.data('zimokoKeypressValue', value);
				element.data('zimokoKeypressFunction', keypressFunction);
				element.bind('keypress', keypressFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				
				element.data('zimokoKeypressValue', value);
			},
			remove: function(element, value) {
				element.unbind('keypress', element.data('zimokoKeypressFunction'));
				element.data('zimokoKeypressFunction', undefined);
				element.data('zimokoKeypressValue', undefined);
			}
		},
		'tap': {
			init: function(element, value) {
				var parent = this.observable;
				var tapFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoTapValue');	
					currentValue.trigger(this, e, parent);
				};
			
				element.data('zimokoTapValue', value);
				element.data('zimokoTapFunction', tapFunction);
				element.tap(tapFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				
				element.data('zimokoTapValue', value);
			},
			remove: function(element, value) {
				element.data('zimokoTapFunction', undefined);
				element.data('zimokoTapValue', undefined);
			}
		},
		'swipeLeft': {
			init: function(element, value) {
				var parent = this.observable;
				var swipeFunction = function(e, duration) {
					var ele = $(this);
					var currentValue = ele.data('zimokoSwipeLeftValue');	
					currentValue.trigger(this, e, parent);
				};
			
				element.data('zimokoSwipeLeftValue', value);
				element.data('zimokoSwipeLeftFunction', swipeFunction);
				element.swipe({
					swipeLeft: swipeFunction,
					threshold: 10,
					durationThreshold: 265
				});
			},
			update: function(element, value) {
				var parent = this.observable;
				
				element.data('zimokoSwipeLeftValue', value);
			},
			remove: function(element, value) {
				element.data('zimokoSwipeLeftFunction', undefined);
				element.data('zimokoSwipeLeftValue', undefined);
			}
		},
		'swipeRight': {
			init: function(element, value) {
				var parent = this.observable;
				var swipeFunction = function(e, duration) {
					var ele = $(this);
					var currentValue = ele.data('zimokoSwipeRightValue');	
					currentValue.trigger(this, e, parent);
				};
			
				element.data('zimokoSwipeRightValue', value);
				element.data('zimokoSwipeRightFunction', swipeFunction);
				element.swipe({
					swipeRight: swipeFunction,
					threshold: 10,
					durationThreshold: 265
				});
			},
			update: function(element, value) {
				var parent = this.observable;
				
				element.data('zimokoSwipeRightValue', value);
			},
			remove: function(element, value) {
				element.data('zimokoSwipeRightFunction', undefined);
				element.data('zimokoSwipeRightValue', undefined);
			}
		},
		'mousedown': {
			init: function(element, value) {
				var parent = this.observable;
				var mousedownFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoMousedownValue');	
					currentValue.trigger(this, e, parent);
				};
			
				element.data('zimokoMousedownValue', value);
				element.data('zimokoMousedownFunction', mousedownFunction);
				element.bind('mousedown', mousedownFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				
				element.data('zimokoMousedownValue', value);
			},
			remove: function(element, value) {
				element.unbind('mousedown', element.data('zimokoMousedownFunction'));
				element.data('zimokoMousedownFunction', undefined);
				element.data('zimokoMousedownValue', undefined);
			}
		},
		'mouseup': {
			init: function(element, value) {
				var parent = this.observable;
				var mouseupFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoMouseupValue');	
					currentValue.trigger(this, e, parent);
				};
			
				element.data('zimokoMouseupValue', value);
				element.data('zimokoMouseupFunction', mouseupFunction);
				element.bind('mouseup', mouseupFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				
				element.data('zimokoMouseupValue', value);
			},
			remove: function(element, value) {
				element.unbind('mouseup', element.data('zimokoMouseupFunction'));
				element.data('zimokoMouseupFunction', undefined);
				element.data('zimokoMouseupValue', undefined);
			}
		},
		'mouseover': {
			init: function(element, value) {
				var parent = this.observable;
				var mouseoverFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoMouseoverValue');	
					currentValue.trigger(this, e, parent);
				};
			
				element.data('zimokoMouseoverValue', value);
				element.data('zimokoMouseoverFunction', mouseoverFunction);
				element.bind('mouseover', mouseoverFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				
				element.data('zimokoMouseoverValue', value);
			},
			remove: function(element, value) {
				element.unbind('mouseover', element.data('zimokoMouseoverFunction'));
				element.data('zimokoMouseoverFunction', undefined);
				element.data('zimokoMouseoverValue', undefined);
			}
		},
		'mouseout': {
			init: function(element, value) {
				var parent = this.observable;
				var mouseoutFunction = function(e) {
					var ele = $(this);
					var currentValue = ele.data('zimokoMouseoutValue');	
					currentValue.trigger(this, e, parent);
				};
			
				element.data('zimokoMouseoutValue', value);
				element.data('zimokoMouseoutFunction', mouseoutFunction);
				element.bind('mouseout', mouseoutFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				
				element.data('zimokoMouseoutValue', value);
			},
			remove: function(element, value) {
				element.unbind('mouseout', element.data('zimokoMouseoutFunction'));
				element.data('zimokoMouseoutFunction', undefined);
				element.data('zimokoMouseoutValue', undefined);
			}
		},
		'checked': {
			init: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				if(val instanceof Array || val instanceof zimoko.SortableCollection) {
					for(var i = 0; i < val.length; i++) {
						if(element.val() == val[i]) {
							element[0].checked = true;
							break;
						}
						else {
							element[0].checked = false;
						}
					}
				}
				else if(val instanceof zimoko.ObservableCollection) {
					var checkedListener = {
						onItemsAdded: function(sender, items) {
							for(var i = 0; i < items.length; i++) {
								var item = items[i].item;
								
								if(element.val() == item) {
									element[0].checked = true;
									break;
								}
							}
						},
						onItemsRemoved: function(sender, items) {
							for(var i = 0; i < items.length; i++) {
								var item = items[i].item;
								
								if(element.val() == item) {
									element[0].checked = false;
									break;
								}
							}
						}
					};
				
					for(var i = 0; i < val.length; i++) {
						var item = val.elementAt(i);
						
						if(element.val() == item) {
							element[0].checked = true;
							break;
						}
					}
				
					val.subscribe(checkedListener);
					val.parent = parent;
					
					element.data('zimokoCheckedListener', checkedListener);
				}
				else {
					if(element.val() == val) {
						element[0].checked = true;
					}
					else {
						element[0].checked = false;
					}
				}
				
				element.data('zimokoCheckedValue', value);
				
				var checkedFunction = function(e) {
					var ele = $(this);
					var rawValue = ele.data('zimokoCheckedValue');
					var currentValue = ele.data('zimokoCheckedValue').get();
					
					if(currentValue instanceof Array || currentValue instanceof zimoko.SortableCollection || currentValue instanceof zimoko.ObservableCollection) {
						if(ele[0].checked) {
							if(currentValue.indexOf(ele.val()) == -1)
								currentValue.push(ele.val());
						}
						else {
							if(currentValue.indexOf(ele.val()) > -1)
								currentValue.removeAt(currentValue.indexOf(ele.val()));
						}
					}
					else {
						if(ele[0].checked) {
							rawValue.set(ele.val());
						}
						else {
							rawValue.set(undefined);
						}
					}
				};
			
				element.bind('change', checkedFunction);
				element.data('zimokoCheckedFunction', checkedFunction);
			},
			update: function(element, value) {
				var parent = this.observable;
				var val = value.get();
				
				if(val instanceof Array || val instanceof zimoko.SortableCollection) {
					for(var i = 0; i < val.length; i++) {
						if(element.val() == val[i]) {
							element[0].checked = true;
							break;
						}
						else {
							element[0].checked = false;
						}
					}
				}
				else if(val instanceof zimoko.ObservableCollection) {
					var previousValue = element.data('zimokoCheckedValue').get();
					
					if(previousValue != val) {
						if(previousValue instanceof zimoko.ObservableCollection) {
							previousValue.unsubscribe(element.data('zimokoCheckedListener'));
							previousValue.parent = undefined;
						}
					
						var checkedListener = {
							onItemsAdded: function(sender, items) {
								for(var i = 0; i < items.length; i++) {
									var item = items[i].item;
									
									if(element.val() == item) {
										element[0].checked = true;
										break;
									}
								}
							},
							onItemsRemoved: function(sender, items) {
								for(var i = 0; i < items.length; i++) {
									var item = items[i].item;
									
									if(element.val() == item) {
										element[0].checked = false;
										break;
									}
								}
							}
						};
						
						for(var i = 0; i < val.length; i++) {
							var item = val.elementAt(i);
							
							if(element.val() == item) {
								element[0].checked = true;
								break;
							}
						}
						
						val.subscribe(checkedListener);
						val.parent = parent;
						
						element.data('zimokoCheckedListener', checkedListener);
					}
				}
				else {
					if(element.val() == val) {
						element[0].checked = true;
					}
					else {
						element[0].checked = false;
					}
				}
			},
			remove: function(element, value) {
				element.unbind('change', element.data('zimokoCheckedFunction'));
				element.data('zimokoCheckedFunction', undefined);
				
				var previousValue = element.data('zimokoCheckedValue').get();
				
				if(previousValue instanceof zimoko.Observable) {
					previousValue.parent = undefined;
					previousValue.unsubscribe(element.data('zimokoCheckedListener'));
				}
				
				element[0].checked = false;
				
				element.data('zimokoCheckedListener', undefined);
			}
		}
	};
})();
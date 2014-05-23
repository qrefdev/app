(function() {
	zimoko.operators = {
		'gte': '>=',
		'lte': '<=',
		'lt': '<',
		'gt': '>',
		'eq': '==',
		'ne': '!=',
		'>': '>',
		'<': '<',
		'<=': '<=',
		'==': '==',
		'>=': '>=',
		'!=': '!=',
		'&&': '&&',
		'and': '&&',
		'||': '||',
		'or': '||',
		'startswith': function(object, value, caseSensitive) {
			var obj = object;
			var val = value;
			
			if(!obj)
				return false;
			
			if(typeof(object) == 'string') {
				
				if(!caseSensitive) { 
					obj = object.toLowerCase();
				
					if(typeof(value) == 'string') 
						val = value.toLowerCase();
				}
				
				return obj.indexOf(val) == 0;
			}
			
			return false;
		}, 
		'endswith': function(object, value, caseSensitive) {
			var obj = object;
			var val = value;
			
			if(!obj)
				return false;
			
			if(typeof(object) == 'string') {
				if(!caseSensitive) { 
					obj = object.toLowerCase();
				
					if(typeof(value) == 'string') 
						val = value.toLowerCase();
				}
				
				return obj.substring(obj.length - val.length) == val;
			}
			
			return false;
		},
		'contains': function(object, value, caseSensitive) {
			var obj = object;
			var val = value;
			
			if(!obj)
				return false;
			
			if(typeof(object) == 'string' && !caseSensitive) 
				obj = object.toLowerCase();
				
			if(typeof(value) == 'string' && !caseSensitive) 
				val = value.toLowerCase();
			
			return obj.indexOf(val) > -1;
		}
	};
	
	zimoko.Sort = zimoko.Class.extend(function() {
		this.init = function(fields, direction) {
			this.fields = fields;
			this.direction = direction;
		};
		
		this.apply = function(items) {
			var sortableCollection = undefined;
			
			if(items instanceof Array) {
				sortableCollection = new zimoko.SortableCollection(items);
			}
			else if(items instanceof zimoko.SortableCollection) {
				sortableCollection = items;
			}
			else if(items instanceof zimoko.ObservableCollection) {
				sortableCollection = new zimoko.SortableCollection(items.toArray());
			}
			
			if(this.fields.length >= 1) {
				if(this.direction == 'asc' || this.direction == 'desc' || this.direction == 0 || this.direction == 1)
					sortableCollection.sortBy(this.fields, this.direction)
				else
					sortableCollection.sortBy(this.fields, 'asc');
			}
			
			return sortableCollection;
		};
	});
	
	zimoko.FilterSet = zimoko.Class.extend(function() {
		this.init = function(logic, filters) {
			this.logic = logic;
			this.filters = filters;
		};
		
		this.result = function(object) {
			return this.expression(object);
		};
		
		this.expression = function(object) {
			var expression = '(';
			var parsedLogic = zimoko.operators[this.logic];
			
			if(!parsedLogic) parsedLogic = '&&';
		
			if(this.filters instanceof zimoko.FilterSet) {
				return this.filters.expression(object);
			}
			else if(this.filters instanceof Array || this.filters instanceof zimoko.SortableCollection) {			
				var trueHappened = false;
				
				for(var i = 0; i < this.filters.length; i++) {
					var filter = this.filters[i];
					
					if(filter instanceof zimoko.FilterSet) {
						if(!filter.expression(object) && parsedLogic == '&&')
							return false;
					}
					else if(filter instanceof zimoko.Filter) {
						if(!filter.result(object) && parsedLogic == '&&') {
							return false;
						}
						else if(filter.result(object) && parsedLogic == '||') {
							trueHappened = true;
						}
					}
				}
			}
			
			if(parsedLogic == '||')
				return trueHappened;
			else
				return true;
		};
	});
	
	zimoko.Filter = zimoko.Class.extend(function() {
		this.init = function(operator, field, value, caseSensitive) {
			this.operator = operator;
			this.field = field;
			this.value = value;
			this.caseSensitive = caseSensitive;
		};
		
		this.result = function(object) {
			var operator = zimoko.operators[this.operator];
			
			if(typeof(operator) == 'function') {
				var property = zimoko.parsePropertyString(object, this.field);
				
				return operator(property, this.value, this.caseSensitive);
			}
			else {
				if(typeof(this.value) == 'string' && !this.caseSensitive) {
					this.value = this.value.toLowerCase();
				}
				
				var property = zimoko.parsePropertyString(object, this.field);
				
				if(typeof(property) == 'string' && !this.caseSensitive) {
					property = property.toLowerCase();
				}
				
				if(operator == '>=') {
					return property >= this.value;
				}
				else if(operator == '<=') {
					return property <= this.value;
				}
				else if(operator == '!=') {
					return property != this.value;
				}
				else if(operator == '==') {
					return property == this.value;
				}
				else if(operator == '>') {
					return property > this.value;
				}
				else if(operator == '<') {
					return property < this.value;
				}
			}
		};
	});
	
	zimoko.ObservableCollection = zimoko.Class.extend(function() {
		this.init = function(arr) {
			if(arr) {
				this.length = arr.length;
				this._internalCollection = new zimoko.SortableCollection(arr);
			}
			else {
				this.length = 0;
				this._internalCollection = new zimoko.SortableCollection();
			}
			this.parent = undefined;
		
			this._filter = undefined;
			
			this._sorter = undefined;
			
			this._filteredItems = [];
			
			this.observableId = zimoko.createGuid();
			
			this.listeners = [];
		};
		
		this._shouldItemBeFiltered = function(item) {
			if(this._filter && (this._filter.filters.length > 0 || this._filter.filters instanceof zimoko.FilterSet)){
				var notFiltered = zimoko.isFiltered(this._filter.expression(item));
				
				if(!notFiltered) {
					this._filteredItems.push(item);
					return true;
				}
			}
			
			return false;
		};
		
		this.filter = function(filterSet) {
			var _this = this;
			this._filter = filterSet;
			var filtered = [];
			var doNotFilter = [];
		
			if(filterSet) {
				for(var i = 0; i < this._internalCollection.length; i++) {
					var item = this._internalCollection[i];
				
					if(this._filter && (this._filter.filters.length > 0 || this._filter.filters instanceof zimoko.FilterSet)){
						var notFiltered = zimoko.isFiltered(this._filter.expression(item));
				
						if(!notFiltered) {
							filtered.push(item);
						}
					}
				}
			
				for(var i = 0; i < this._filteredItems.length; i++) {
					var item = this._filteredItems[i];
				
					if(this._filter && (this._filter.filters.length > 0 || this._filter.filters instanceof zimoko.FilterSet)){
						var notFiltered = zimoko.isFiltered(this._filter.expression(item));
				
						if(notFiltered) {
							doNotFilter.push(item);
						}
					}
				}
				
				//setTimeout(function() {
					for(var i = 0; i < doNotFilter.length; i++) {
						_this._filteredItems.remove(doNotFilter[i]);
					}
				//}, 0);
				
				//setTimeout(function() {
					for(var i = 0; i < filtered.length; i++) {
						_this._filteredItems.push(filtered[i]);
					}
				//}, 0);
				
				if(filtered.length > 0)
					this.remove(filtered);
				
				if(doNotFilter.length > 0)
					this.push(doNotFilter);
					
				this.sort(this._sorter);
			}
			else {
				if(this._filteredItems.length > 0) {
					this.push(this._filteredItems);
					this._filteredItems = [];
				}
			}
		};
		
		this.sort = function(sorter) {
			var _this = this;
			this._sorter = sorter;
			if(sorter && sorter instanceof zimoko.Sort) {
				var previous = this._internalCollection.toArray();
				var results = sorter.apply(this._internalCollection);
				
				if(results) {
					var itemsAdded = [];
					var itemsRemoved = [];
					
					for(var i = 0; i < results.length; i++) {
						itemsAdded.push({item: results[i], index: i});
					}
					
					for(var i = 0; i < previous.length; i++) {
						itemsRemoved.push({item: previous[i], index: i});
					}
					
					_itemsRemoved.call(_this, itemsRemoved);
					_itemsAdded.call(_this, itemsAdded);
				}
			}
		};
		
		this.subscribe = function(listener) {
			if(this.listeners.indexOf(listener) == -1)
				this.listeners.push(listener);
		};
		
		this.unsubscribe = function(listener) {
			if(this.listeners.indexOf(listener) > -1)
				this.listeners.remove(listener);
		};
		
		this.elementAt = function(index) {
			if(index >= 0 && index < this._internalCollection.length)
				return this._internalCollection[index];
			
			return undefined;
		};
		
		this.toArray = function() {
			var items = [];
			
			for(var i = 0; i < this._internalCollection.length; i++) {
				var item = this._internalCollection[i];
				
				items.push(item);
			}
		
			return items;
		};
		
		this.push = function(items) {
			if(items instanceof Array || items instanceof zimoko.SortableCollection) {
				var added = [];
				
				for(var i = 0; i < items.length; i++)
				{
					if(!this._shouldItemBeFiltered(items[i])) {
						this._internalCollection.push(items[i]);
						this.length = this._internalCollection.length;
						added.push({item: items[i], index: this._internalCollection.length - 1});
					}
				}
				
				if(added.length > 0) {
					if(this._sorter)
						this.sort(this._sorter);
					else
						_itemsAdded.call(this, added);
				}
			}
			else if(items instanceof zimoko.ObservableCollection) {
				var added = [];
				
				for(var i = 0; i < items.length; i++)
				{
					if(!this._shouldItemBeFiltered(items.elementAt(i))) {
						this._internalCollection.push(items.elementAt(i));
						this.length = this._internalCollection.length;
						added.push({item: items.elementAt(i), index: this._internalCollection.length - 1});
					}
				}
				
				if(added.length > 0) {
					if(this._sorter)
						this.sort(this._sorter);
					else
						_itemsAdded.call(this, added);
				}
			}
			else
			{
				var added = [];
				
				if(!this._shouldItemBeFiltered(items)) {	
					this._internalCollection.push(items);
					this.length = this._internalCollection.length;
					added.push({item: items, index: this._internalCollection.length - 1});
				}
				
				if(added.length > 0) {
					if(this._sorter)
						this.sort(this._sorter);
					else
						_itemsAdded.call(this, added);
				}
			}
		};
		
		this.filtered = function() {
			return this._filteredItems;
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
			
			this.length = 0;
			this._internalCollection = new zimoko.SortableCollection();
			_itemsRemoved.call(this,removedItems);
		};
		
		this.insertAt = function(item, index) {
			var added = [];
			
			if(!this._shouldItemBeFiltered(item)) {
				added.push({item: item, index: index});
			}
			
			if(added.length > 0) {
				this._internalCollection.splice(index,0,item);
				this.length = this._internalCollection.length;
			
				_itemsAdded.call(this,added);
			}
		};
		
		this.pop = function() {
			var index = this._internalCollection.length - 1;
			var item = this._internalCollection.pop();
			
			this.length = this._internalCollection.length;
			_itemsRemoved.call(this,[{item: item, index: index}]);
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
						this.length = this._internalCollection.length;
					}
					else if(this._filteredItems.indexOf(items[i]) > -1) {
						this._filteredItems.remove(items[i]);
					}
				}
			
				if(removedItems.length > 0)
					_itemsRemoved.call(this,removedItems);
			}
			else if(items instanceof zimoko.ObservableCollection) {
				for(var i = 0; i < items.length; i++)
				{
					if(this._internalCollection.indexOf(items.elementAt(i)) > -1) {
						removedItems.push({item: items[i], index: this._internalCollection.indexOf(items.elementAt(i))});
						this._internalCollection.removeAt(this._internalCollection.indexOf(items.elementAt(i)));
						this.length = this._internalCollection.length;
					}
					else if(this._filteredItems.indexOf(items.elementAt(i)) > -1) {
						this._filteredItems.remove(items.elementAt(i));
					}
				}
				
				if(removedItems.length > 0)
					_itemsRemoved.call(this,removedItems);
			}
			else
			{
				if(this._internalCollection.indexOf(items) > -1) {
					removedItems.push({item: items, index: this._internalCollection.indexOf(items)});
					this._internalCollection.removeAt(this._internalCollection.indexOf(items));
					this.length = this._internalCollection.length;
					_itemsRemoved.call(this,removedItems);
				}
				else if(this._filteredItems.indexOf(items) > -1) {
					this._filteredItems.remove(items);
				}
			}
		};
		
		var _itemsAdded = function(items) {
			var observer = this;
	
				zimoko.each(observer.listeners, function(index, listener) {
					var it = items;
					if(listener.onItemsAdded != undefined && typeof(listener.onItemsAdded) == 'function') {
						listener.onItemsAdded.call(listener, observer, it);
					}
				});
		};
		
		var _itemsRemoved = function(items) {
			var observer = this;
		
				zimoko.each(observer.listeners, function(index, listener) {
					var it = items;
					if(listener.onItemsRemoved != undefined && typeof(listener.onItemsRemoved) == 'function') {
						listener.onItemsRemoved.call(listener, observer, it);
					}
				});
		};
	});
})();
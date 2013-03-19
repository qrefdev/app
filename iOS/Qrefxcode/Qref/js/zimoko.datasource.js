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
			
			if(typeof(object) == 'string') {
				if(!caseSensitive) { 
					obj = object.toLowerCase();
				
					if(typeof(value) == 'string') 
						val = value.toLowerCase();
				}
				
				return obj.indexOf(val) == obj.length - val.length;
			}
			
			return false;
		},
		'contains': function(object, value, caseSensitive) {
			var obj = object;
			var val = value;
			
			if(typeof(object) == 'string' && !caseSensitive) 
				obj = object.toLowerCase();
				
			if(typeof(value) == 'string' && !caseSensitive) 
				val = value.toLowerCase();
			
			return obj.indexOf(val) > -1;
		}
	};
	
	zimoko.Sort = function(fields, direction) {
		this.fields = fields;
		this.direction = direction;
		
		this.results = function(items) {
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
					return sortableCollection.sortBy(this.fields, this.direction)
				else
					return sortableCollection.sortBy(this.fields, 'asc');
			}
			
			return sortableCollection;
		}
	};
	
	zimoko.FilterSet = function(logic, filters) {
		this.logic = logic;
		this.filters = filters;
		
		this.expression = function(object) {
			var expression = '(';
			var parsedLogic = zimoko.operators[this.logic];
			
			if(!parsedLogic) parsedLogic = '&&';
			
			parsedLogic = ' ' + parsedLogic + ' ';
			var logicLength = parsedLogic.length;
			
			if(this.filters instanceof zimoko.FilterSet) {
				expression += this.filters.expression(object) + parsedLogic;
			}
			else if(this.filters instanceof Array || this.filters instanceof zimoko.SortableCollection) {			
				for(var i = 0; i < this.filters.length; i++) {
					var filter = this.filters[i];
					
					if(filter instanceof zimoko.FilterSet) {
						expression += filter.expression(object) + parsedLogic;
					}
					else if(filter instanceof zimoko.Filter) {
						expression += filter.result(object) + parsedLogic;
					}
				}
			}
			
			expression = expression.substring(0, expression.length - logicLength) + ')';
			
			return expression;
		};
	};
	
	zimoko.Filter = function(operator, field, value, caseSensitive) {
		this.operator = operator;
		this.field = field;
		this.value = value;
		
		this.caseSensitive = caseSensitive;
		
		this.result = function(object) {
			var operator = zimoko.operators[this.operator];
			
			if(typeof(operator) == 'function') {
				var property = zimoko.parsePropertyString(object, this.field);
				var propertyValue = zimoko.getPropertyValue(object,property);
				
				return operator(propertyValue, this.value, this.caseSensitive);
			}
			else {
				if(typeof(this.value) == 'string' && !this.caseSensitive) {
					this.value = this.value.toLowerCase();
				}
				
				var property = zimoko.parsePropertyString(object, this.field);
				var propertyValue = zimoko.getPropertyValue(object,property);
				
				if(typeof(propertyValue) == 'string' && !this.caseSensitive) {
					propertyValue = propertyValue.toLowerCase();
				}
				
				return new Function('field','value','return (field ' + zimoko.operators[this.operator] + ' value);').apply(object, [propertyValue, this.value]); 
			}
		};
	};
	
	zimoko.Transport = zimoko.Class.extend(function() {
		this.init = function(object) {
			this.schema = new zimoko.Schema();
		
			if(object && typeof(object) == 'object') {
				for(var name in object) {
					this[name] = object[name];
				}
			}
		};
	
		this.read = function(options) {
			options.success({data: []});
		};
		
		this.create = function(options) {
			options.success({data: []});
		};
		
		this.update = function(options) {
			options.success({data: []});
		};
		
		this.delete = function(options) {
			options.success({data: []});
		};
	});
	
	zimoko.Schema = function(object) {
		this.model = undefined;
		
		this.type = 'json';
		
		this.errors = function(response) {
			return response.errors;
		};
		
		this.data = function(response) {
			return response.data;
		};
		
		this.parse = function(response) {
			return response;
		};
		
		this.total = function(response) {
			return response.total;
		};
		
		if(object && typeof(object) == 'object') {
			for(var name in object) {
				this[name] = object[name];
			}
		}
	};
	
	zimoko.Schema.Model = zimoko.Class.extend(function() { 
		this.init = function(object) { 
			if(object && typeof(object) == 'object') {
				for(var name in object) {
					this[name] = object[name];
				}
			}
		};
	});
	
	
	zimoko.Transport.Restful = zimoko.Transport.extend(function() {
		
		this.init = function(object) {
			this.schema = new zimoko.Schema();
			this.updateUrl = '';
			this.readUrl = '';
			this.createUrl = '';
			this.deleteUrl = '';
			this.extraOptions = {};
			
			if(object && typeof(object) == 'object') {
				for(var name in object) {
					if(name == 'model') {
						this.schema[name] = object[name];
					}
					else if (name == 'type') {
						this.schema[name] = object[name];
					}
					else if (name == 'delete') {
						this.deleteUrl = object[name];
					}
					else if (name == 'update') {
						this.updateUrl = object[name];
					}
					else if (name == 'read') {
						this.readUrl = object[name];
					}
					else if (name == 'create') {
						this.createUrl = object[name];
					}
					else if (name = 'options') {
						this.extraOptions = object[name];
					}
				}
			}
		};
		
		this.read = function(options) {
			var self = this;
			
			for(var name in self.extraOptions) {
				options[name] = self.extraOptions[name];
			}
			
			if(self.readUrl) {
				$.ajax({
					url: self.readUrl,
					type: 'GET',
					data: options.data,
					dataType: self.schema.type,
					success: function(data) {
						options.success(data);
					},
					error: function(xhr, error) {
						options.success();
					}
				});
			}
		};
		
		this.create = function(options) {
			var self = this;
			
			for(var name in self.extraOptions) {
				options[name] = self.extraOptions[name];
			}
			
			if(self.createUrl) {
				$.ajax({
					url: self.createUrl,
					type: 'POST',
					data: 'data=' + JSON.stringify(options),
					dataType: self.schema.type,
					success: function(data) {
						options.success(data);
					},
					error: function(xhr, error) {
						options.success();
					}
				});
			}
		};
		
		this.delete = function(options) {
			var self = this;
			
			for(var name in self.extraOptions) {
				options[name] = self.extraOptions[name];
			}
			
			if(self.deleteUrl) {
				$.ajax({
					url: self.deleteUrl,
					type: 'DELETE',
					data: 'data=' + JSON.stringify(options),
					dataType: self.schema.type,
					success: function(data) {
						options.success(data);
					},
					error: function(xhr, error) {
						options.success();
					}
				});
			}
		};
		
		this.update = function(options) {
			var self = this;
			
			for(var name in self.extraOptions) {
				options[name] = self.extraOptions[name];
			}
			
			if(self.updateUrl) {
				$.ajax({
					url: self.updateUrl,
					type: 'PUT',
					data: 'data=' + JSON.stringify(options),
					dataType: self.schema.type,
					success: function(data) {
						options.success(data);
					},
					error: function(xhr, error) {
						options.success();
					}
				});
			}
		};
	});
	
	zimoko.DataSource = zimoko.Class.extend(function() {
		this.init = function(object) {
			this._data = new zimoko.ObservableCollection();
			this._filter = new zimoko.FilterSet('and', []);
			this._sorting = new zimoko.Sort([], 'asc');
			this._lastFilter = [];
			this._sources = [];
			this.listeners = [];
			this.serverFilter = false;
			this.serverPaging = false;
			this.serverSort = false;
			this.preventRead = false;
			
			this.reading = false;
			
			this.pageSize = 20;
			this.total = 0;
			this._page = 1;
			
			var datasource = this;
			
			this.listeners.push({
				onDataSourceRead: function(event) {
					if(!datasource.preventRead) {
						addObjects.call(datasource,event.data,event.append);
					}
					
					datasource.reading = false;
				},
				onDataSourceUpdate: function(event) {
					updateObject.call(datasource,event.original, event.data);
				},
				onDataSourceDelete: function(event) {
					removeObject.call(datasource,event.data);
				},
				onDataSourceCreate: function(event) {
					addObjects.call(datasource,event.data);
				},
				onDataSourceError: function(event) {
					var errors = '';
					datasource.reading = false;
					for(var i = 0; i < event.errors.length; i++) {
						if(typeof(event.errors[i]) == 'object') {
							errors += event.errors[i].toString() + ', ';
						}
						else {
							errors += event.errors[i] + ', ';
						}
					}
					
					errors = errors.substring(0,errors.length - 2);
					
					throw new Error(errors);
				}
			});
			
			if(object && typeof(object) == 'object') {
				for(var name in object) {
					this[name] = object[name];
				}
			}
		};
			
		var _dataSourceError = function(event) {
			var datasource = this;
			
			setTimeout(function() {
				for(var i = 0; i < datasource.listeners.length; i++) {
					var listener = datasource.listeners[i];
					
					if(listener && typeof(listener.onDataSourceUpdate) == 'function') {
						listener.onDataSourceError.call(listener, event);
					}
				}
			}, 10);
		};
		
		var _dataSourceUpdate = function(event) {
			var datasource = this;
			
			setTimeout(function() {
				for(var i = 0; i < datasource.listeners.length; i++) {
					var listener = datasource.listeners[i];
					
					if(listener && typeof(listener.onDataSourceUpdate) == 'function') {
						listener.onDataSourceUpdate.call(listener, event);
					}
				}
			}, 10);
		};
		
		var _dataSourceCreate = function(event) {
			var datasource = this;
			
			setTimeout(function() {
				for(var i = 0; i < datasource.listeners.length; i++) {
					var listener = datasource.listeners[i];
					
					if(listener && typeof(listener.onDataSourceCreate) == 'function') {
						listener.onDataSourceCreate.call(listener, event);
					}
				} 
			}, 10);
		};
		
		var _dataSourceDelete = function(event) {
			var datasource = this;
			
			setTimeout(function() {
				for(var i = 0; i < datasource.listeners.length; i++) {
					var listener = datasource.listeners[i];
					
					if(listener && typeof(listener.onDataSourceDelete) == 'function') {
						listener.onDataSourceDelete.call(listener, event);
					}
				} 
			}, 10);
		};
		
		var _dataSourceRead = function(event) {
			var datasource = this;
			
			setTimeout(function() {
				for(var i = 0; i < datasource.listeners.length; i++) {
					var listener = datasource.listeners[i];
					
					if(listener && typeof(listener.onDataSourceRead) == 'function') {
						listener.onDataSourceRead.call(listener, event);
					}
				} 
			}, 10);
		};
		
		var _dataSourceChange = function(event) {
			var datasource = this;
			
			setTimeout(function() {
				for(var i = 0; i < datasource.listeners.length; i++) {
					var listener = datasource.listeners[i];
					
					if(listener && typeof(listener.onDataSourceChange) == 'function') {
						listener.onDataSourceChange.call(listener, event);
					}
				}
			}, 10);
		};
		
		var _apply = function(append) {
			var filtered = _filter.call(this);
	
			var changes = [];
			var removal = [];
			
			if(!append) {
				for(var i = 0; i < this._data.length; i++) {
					var item = this._data.elementAt(i);
				
					if(filtered.indexOf(item) == -1)
						removal.push(item);
				}
			
				for(var i = 0; i < filtered.length; i++) {
					var item = filtered[i];
	
					var oldIndex = this._data.indexOf(item);
				
					if(oldIndex > -1 && oldIndex != i) {
						changes.push({item: item, newIndex: i});
					}
					else if(oldIndex == -1) {
						changes.push({item: item, newIndex: i});
					}
				}
			
				for(var i = 0; i < changes.length; i++) {
					var change = changes[i];
				
					var index = this._data.indexOf(change.item);
				
					if(index > -1) {
						this._data.removeAt(index);
						this._data.insertAt(change.item, change.newIndex);
					}
					else {
						this._data.insertAt(change.item, change.newIndex);
					}
				}
			
				for(var i = 0; i < removal.length; i++) {
					var item = removal[i];
				
					this._data.removeAt(this._data.indexOf(item));
				}
			}
			else {
				this._data.push(filtered);
			}
			
			this._lastFilter = filtered;
		};
		
		this.subscribe = function(object) {
			this.listeners.push(object);
		};
		
		this.unsubscribe = function(object) {
			this.listeners.removeAt(this.listeners.indexOf(object));
			var datasource = this;
			
			if(this.listeners.length == 0) {
				this.listeners.push({
					onDataSourceRead: function(event) {
						if(!datasource.preventRead) {
							addObjects.call(datasource,event.data,event.append);
						}
						
						datasource.reading = false;
					},
					onDataSourceUpdate: function(event) {
						updateObject.call(datasource,event.original, event.data);
					},
					onDataSourceDelete: function(event) {
						removeObject.call(datasource,event.data);
					},
					onDataSourceCreate: function(event) {
						addObjects.call(datasource,event.data);
					},
					onDataSourceError: function(event) {
						var errors = '';
						datasource.reading = false;
						for(var i = 0; i < event.errors.length; i++) {
							if(typeof(event.errors[i]) == 'object') {
								errors += event.errors[i].toString() + ', ';
							}
							else {
								errors += event.errors[i] + ', ';
							}
						}
						
						errors = errors.substring(0,errors.length - 2);
						
						throw new Error(errors);
					}
				});
			}
		};
		
		this.unsubscribeAll = function() {
			this.listeners = [];
			var datasource = this;
			
			this.listeners.push({
				onDataSourceRead: function(event) {
					if(!datasource.preventRead) {
						addObjects.call(datasource,event.data,event.append);
					}
					
					datasource.reading = false;
				},
				onDataSourceUpdate: function(event) {
					updateObject.call(datasource,event.original, event.data);
				},
				onDataSourceDelete: function(event) {
					removeObject.call(datasource,event.data);
				},
				onDataSourceCreate: function(event) {
					addObjects.call(datasource,event.data);
				},
				onDataSourceError: function(event) {
					var errors = '';
					datasource.reading = false;
					for(var i = 0; i < event.errors.length; i++) {
						if(typeof(event.errors[i]) == 'object') {
							errors += event.errors[i].toString() + ', ';
						}
						else {
							errors += event.errors[i] + ', ';
						}
					}
					
					errors = errors.substring(0,errors.length - 2);
					
					throw new Error(errors);
				}
			});
		};
		
		this.view = function() {
			return this._data;
		};
		
		this.data = function(objects) {
			if(objects) {
				this._sources = [];
				this._data.clear();
				this._page = 1;
				this.preventRead = true;
				addObjects.call(this,objects);
				_apply.call(this);
			}
			else {
				return this._sources;
			}
		};
		
		function addObjects(objects,append) {
			if(objects instanceof Array || objects instanceof zimoko.SortableCollection) {
				var observableObjects = [];
				
				for(var i = 0; i < objects.length; i++) {
					if(objects[i] instanceof zimoko.Observable) {
						observableObjects.push(objects[i])
					}
					else if(typeof(objects[i]) == 'number' || typeof(objects[i]) == 'string') {
						var item = new zimoko.Observable();
						
						item.set('text', objects[i]);
						item.set('value', objects[i]);
						item.set('_original', objects[i]);
						observableObjects.push(item);
					}
					else if(typeof(objects[i]) == 'object') {
						var item = new zimoko.Observable(objects[i]);
						observableObjects.push(item);
					}
				}
				
				this._sources = this._sources.concat(observableObjects);
					
				_sort.call(this);
				_apply.call(this,append);
				_dataSourceChange.call(this,{sender: self, items: observableObjects});
			}
			else if(objects instanceof zimoko.Observable) {
				this._sources.push(objects);
				
				_sort.call(this);
				_apply.call(this,append);
				_dataSourceChange.call(this,{sender: self, items: [item]});
			}
			else if(typeof(objects) == 'number' || typeof(objects) == 'string') {
				var item = zimoko.Observable();
				
				item.set('text', objects);
				item.set('value', objects);
				item.set('_original', objects);
				this._sources.push(item);
				
				_sort.call(this);
				_apply.call(this,append);
				_dataSourceChange.call(this,{sender: self, items: [item]});
			}
			else if(typeof(objects) == 'object') {
				var item = new zimoko.Observable(objects);
				this._sources.push(item);
				
				_sort.call(this);
				_apply.call(this,append);
				_dataSourceChange.call(this,{sender: self, items: [item]});
			}
			
			if(this.preventRead)
				this.total = this._sources.length;
		}
		
		function updateObject(original, object) {
			if(original && original instanceof zimoko.Observable) {
				for(var name in object) {
					item._original[name] = object[name];
					item.set(name, object[name]);
				}
			}
		}
		
		function removeObject(object) {
			
			if(this._data.indexOf(object) > -1)
				this._data.removeAt(this._data.indexOf(object));
			
			if(this._sources.indexOf(object) > -1)
				this._sources.removeAt(this._sources.indexOf(object));
				
			_dataSourceChange.call(this,{sender: self, items: [object]});
		}
		
		function compare(dataSet1, dataSet2) {
			var data1, data2;
			
			if(dataSet1 instanceof Array || dataSet1 instanceof zimoko.ObservableCollection) {
				data1 = dataSet1
				
				if(dataSet1 instanceof zimoko.ObservableCollection) 
					data1 = dataSet1.toArray();
			}
			else {
				data1 = [dataSet1];
			} 
			
			if(dataSet2 instanceof Array) {
				data2 = dataSet2;
			}
			else {
				data2 = [dataSet2];
			}
			
			if(data1.length != data2.length && data2.length > 0) {
				return false;
			}
			
			var foundCount = 0;
			for(var i = 0; i < data1.length; i++) {		
				for(var j = 0; j < data2.length; j++) {
					if (zimoko.objectEquals(data1[i]._original, data2[j])) {
						foundCount++;
						break;
					}
				}
			}
			
			if(foundCount == data1.length)
				return true;
			else
				return false;
		}
		
		function _sort() {
			if(this._sorting && this._sorting instanceof zimoko.Sort && !this.serverSort) {
				var sortedData = this._sorting.results(this._sources);
				
				this._sources = sortedData.toArray();
			}
		}
		
		function _filter() {
			var filteredData = [];
			
			if(!this.serverPaging) {
				var start = Math.floor((this._page - 1) * this.pageSize);
				var end = Math.ceil(this._page * this.pageSize);
				
				if(start > this._sources.length) start = 0;
				
				if(end > this._sources.length) end = this._sources.length;
				
				for(var i = start; i < end; i++) {
					var item = this._sources[i];
					
					if(this._filter && !this.serverFilter && (this._filter.filters.length > 0 || this._filter.filters instanceof zimoko.FilterSet)){
						var notFiltered = zimoko.isFiltered(this._filter.expression(item));
						
						if(notFiltered) {
							filteredData.push(item);
						}
					}
					else {
						filteredData.push(item);
					}
				}
			}
			else {
				filteredData = this._sources;
			}
			
			return filteredData;
		}
		
		this.totalPages = function() {
			return Math.ceil(this.total / this.pageSize);
		};
		
		this.sort = function(sort) {
			if(sort && sort instanceof zimoko.Sort) {
				this._sorting = sort;
				
				if(this.serverSort) {
					this.read();
				}
				else {
					_sort.call(this);
					_apply.call(this);
				}
			}
			else {
				return this._sorting;
			}
		};
		
		this.page = function(page) {
			if(page != undefined && zimoko.isNumber(page)) {
				this._page = page;
				
				if(this.serverPaging) {
					this.read();
				}
				else {
					_apply.call(this);
				}
			}
			else {
				return this._page;
			}
		};
		
		this.pageAndAppend = function(page) {
			if(page != undefined && zimoko.isNumber(page)) {
				this._page = parseInt(page);
				
				if(this.serverPaging) {
					this.read(true);
				}
				else {
					_apply.call(this,true);
				}
			}
		};
		
		this.transport = new zimoko.Transport();
		
		this.filter = function(filterSet) {
			if(filterSet && filterSet instanceof zimoko.FilterSet) {
				this._filter = filterSet;
				
				if(this.serverFilter) {
					this.read();
				}
				else {
					_apply.call(this);
				}
			}
			else if(!filterSet) {
				return this._filter;
			}
		};
		
		this.add = function(object) {
			addObjects.call(this,object);
		};
		
		this.insertAt = function(object, index) {
			var item = new zimoko.Observable(object);
			this._sources.splice(index, 0, item);
			_sort.call(this);
			_apply.call(this);
			_dataSourceChange.call(this,{sender: self, items: [item]});
		};
		
		this.remove = function(object) {
			removeObject.call(this,object);
		};
		
		
		this.refresh = function() {
			_apply.call(this);
		};
		
		this.removeAt = function(index) {
			var object = this._sources[i];
			
			if(object) {
				this._sources.splice(index,1);
			
				if(this._data.indexOf(object) > -1)
					this._data.removeAt(this._data.indexOf(object));
				
				_dataSourceChange.call(this,{sender: self, items: [object]});
			}
		};
		
		this.clear = function() {
			this._sources = [];
			this._data.clear();
		};
		
		this.get = function(index) {
			if(index < this._sources.length && index >= 0)
				return this._sources[index];
			
			return undefined;
		};
		
		this.read = function(append) {
			var datasource = this;
		
			var options = {
				filters: JSON.stringify(datasource._filter),
				pageSize: datasource.pageSize,
				page: datasource._page,
				sorting: JSON.stringify(datasource._sorting),
				success: function(response) {
					if(!datasource.preventRead)
						datasource.total = parseInt(datasource.transport.schema.total(response));
					
					var data = datasource.transport.schema.data(datasource.transport.schema.parse(response));
					
					var errors = datasource.transport.schema.errors(response);
					
					if(errors) {
						_dataSourceError.call(datasource,{sender: datasource, data: undefined, errors: errors});
					}
					else {
						if(!compare(datasource._sources, data) && !datasource.preventRead) {
							datasource._sources = [];
							_dataSourceRead.call(datasource,{sender: datasource, data: data, append: append});
						}
						else {
							_dataSourceRead.call(datasource,{sender: datasource, data: [], append: append});
						}
					}
				},
				error: function(errors) {
					_dataSourceError.call(datasource,{sender: datasource, data: undefined, errors: errors});
				}
			};	
			
			if(!this.reading) {
				this.reading = true;
				this.transport.read(options);
			}
		};
		
		
		this.create = function(object) {
			var realData = {};
			var originalObject = object;
			var datasource = this;
			
			if(this.transport.schema.model) {
				for(var name in this.transport.schema.model) {
					var modelSetting = this.transport.schema.model[name];
					
					if(name != 'init' && name != '_original') {
						if(modelSetting) {
							if(!modelSetting.nullable) {
								if(!originalObject[name]) {
									_dataSourceError.call(this,{sender: this, data: originalObject, errors: [name + ' is non nullable']}); 
									return;
								}
							}
							
							if(modelSetting.required) {
								if(!originalObject[name]) {
									_dataSourceError.call(this,{sender: this, data: originalObject, errors: [name + ' is required']});
									return;
								}
							}
							
							realData[name] = originalObject[name];
						}
						else {
							realData[name] = originalObject[name];
						}
					}
				}
			}
			else {
				realData = originalObject;
			}
			
			var options = {
				data: realData,
				filters: JSON.stringify(datasource._filter),
				pageSize: datasource.pageSize,
				page: datasource._page,
				sorting: JSON.stringify(datasource._sorting),
				success: function(response) {
					var data = datasource.transport.schema.data(datasource.transport.schema.parse(response));
					
					var errors = datasource.transport.schema.errors(response);
					
					if(errors) {
						_dataSourceError.call(datasource,{sender: datasource, data: object, errors: errors});
					}
					else {
						_dataSourceCreate.call(datasource,{sender: datasource, data: data, original: object});
					}
				},
				error: function(errors) {
					_dataSourceError.call(datasource,{sender: datasource, data: object, errors: errors});
				}
			}; 
			
			this.transport.create(options);
		};
		
		this.delete = function(object) {
			var originalObject = undefined;
			var datasource = this;
			
			if(object instanceof zimoko.Observable) {
				originalObject = object._original;
				
				for(var name in originalObject) {
					originalObject[name] = object[name];
				}
			}
			else {
				originalObject = object;
			}
		
			var options = {
				data: originalObject,
				filters: JSON.stringify(datasource._filter),
				pageSize: datasource.pageSize,
				page: datasource._page,
				sorting: JSON.stringify(datasource._sorting),
				success: function(response) {
					var errors = datasource.transport.schema.errors(response);
					
					if(errors) {
						_dataSourceError.call(datasource,{sender: datasource, data: object, errors: errors});
					}
					else {
						_dataSourceDelete.call(datasource,{sender: datasource, data: object, original: object});
					}
				},
				error: function(errors) {
					_dataSourceError.call(datasource,{sender: datasource, data: object, errors: errors});
				}
			}; 
			
			this.transport.delete(options);
		};
		
		this.update = function(object) {
			var realData = {};
			
			var originalObject = object;
			var datasource = this;
			
			if(this.transport.schema.model) {
				for(var name in this.transport.schema.model) {
					var modelSetting = this.transport.schema.model[name];
					
					if(name != 'init' && name != '_original') {
						if(modelSetting) {
							if(!modelSetting.nullable) {
								if(!originalObject[name]) {
									_dataSourceError.call(this,{sender: this, data: original, errors: [name + ' is non nullable']}); 
									return;
								}
							}
							
							if(modelSetting.required) {
								if(!originalObject[name]) {
									_dataSourceError.call(this,{sender: this, data: original, errors: [name + ' is required']});
									return;
								}
							}
							
							if(modelSetting.editable) {
								realData[name] = originalObject[name];
							}
						}
						else {
							realData[name] = originalObject[name];
						}
					}
				}
			}
			else {
				realData = originalObject;
			}
			
			var options = {
				data: realData,
				filters: JSON.stringify(datasource._filter),
				pageSize: datasource.pageSize,
				page: datasource._page,
				sorting: JSON.stringify(datasource._sorting),
				success: function(response) {
					var data = datasource.transport.schema.data(datasource.transport.schema.parse(response));
					
					var errors = datasource.transport.schema.errors(response);
					
					if(errors) {
						_dataSourceError.call(datasource,{sender: datasource, data: object, errors: errors});
					}
					else {
						_dataSourceUpdate.call(datasource,{sender: datasource, data: data, original: object});
					}
				},
				error: function(errors) {
					_dataSourceError.call(datasource,{sender: datasource, data: object, errors: errors});			
				}
			};
			
			this.transport.update(options);
		};
	});
})();
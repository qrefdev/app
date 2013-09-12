(function() {
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
		
		this.destroy = function(options) {
			options.success({data: []});
		};
	});
	
	zimoko.Schema = zimoko.Class.extend(function() {
		this.init = function(object) {
			this.model = undefined;
			this.type = 'json';
			
			if(object && typeof(object) == 'object') {
				for(var name in object) {
					this[name] = object[name];
				}
			}
		};
		
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
	});
	
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
			this.destroyUrl = '';
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
						this.destroyUrl = object[name];
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
		
		this.destroy = function(options) {
			var self = this;
			
			for(var name in self.extraOptions) {
				options[name] = self.extraOptions[name];
			}
			
			if(self.destroyUrl) {
				$.ajax({
					url: self.destroyUrl,
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
			this._view = new zimoko.ObservableCollection();
			this._filter = new zimoko.FilterSet('and', []);
			this._sorting = new zimoko.Sort([], 'asc');
			this._source = [];
			this.listeners = [];
			this.serverFilter = false;
			this.serverPaging = false;
			this.serverSorting = false;
			this.preventRead = false;
			this.id = zimoko.createGuid();
			
			this.reading = false;
			
			this.pageSize = 20;
			this.total = 0;
			this._page = 1;
			
			this.transport = new zimoko.Transport();
			
			if(object && typeof(object) == 'object') {
				for(var name in object) {
					this[name] = object[name];
				}
			}
		};
		
		this.subscribe = function(object) {
			this.listeners.push(object);
		};
		
		this.unsubscribe = function(object) {
			this.listeners.removeAt(this.listeners.indexOf(object));
		};
		
		this._filterSource = function() {
			var items = [];
			
			if(this._filter && !this._filter.cached) {
				for(var i = 0 ; i < this._source.length; i++) {
					if(!this._shouldItemBeFiltered(this._source[i])) {
						items.push(this._source[i]);
					}
				}
				
				this._filter.cached = items;
				
				return items;
			}
			else if(this._filter && this._filter.cached) {
				return this._filter.cached;
			}
			else {
				return this._source;
			}
		};
		
		this._paginate = function() {
			var items = this._filterSource();
			this.total = items.length;
		
			var skip = (this._page - 1) * this.pageSize;
			
			var limit = skip + this.pageSize;
			
			if(limit > items.length)
				limit = items.length;
			
			if(skip >= items.length)
				return [];
			
			var finalItems = items.slice(skip, limit);
			
			return finalItems;
		};
		
		
		this.view = function() {
			return this._view;
		};
		
		this.data = function(objects) {
			if(objects) {
			
				var items = [];
				
				if(objects instanceof Array) {
					items = objects.toObservableObjects();
				}
				else if(objects instanceof zimoko.ObservableCollection) {
					for(var i = 0; i < objects.length; i++) {
						items.push(objects.elementAt(i));
					}
				}
				
				if(this._filter)
					this._filter.cached = null;
				
				this._source = items;
				this._page = 1;
				this.sort();
			}
			else {
				return this._source;
			}
			
			return this;
		};
		
		this.pages = function() {
			return Math.ceil(this.total / this.pageSize);
		};
		
        this.sortView = function() {
        	this._view.sort(this._sorting);
        };
                                            
		this.sort = function(sort) {
			//this._getTotalWithFiltered();
			
			if(sort) {
				this._sorting = sort;
			
				if(!this.serverSorting && !this._filter) {
					this._source = sort.apply(this._source).toArray();
					//this._view.sort(sort);
					this._view.clear();
					this._view.push(this._paginate());
				}
				else if(!this.serverSorting && this._filter) {
					var items = this._paginate();
					
					items = sort.apply(items).toArray();
					
					this._view.clear();
					this._view.push(items);
				}
				else {
					this.read();
				}
			}
			else {
				if(!this.serverSorting && !this._filter) {
					if(this._sorting) {
						this._source = this._sorting.apply(this._source).toArray();
					}
					
					this._view.clear();
					this._view.push(this._paginate());
					//this._view.sort(sort);
				}
				else if(!this.serverSorting && this._filter) {
					var items = this._paginate();
					
					if(this._sorting) {
						items = this._sorting.apply(items).toArray();
					}
					
					this._view.clear();
					this._view.push(items);
				}
				else {
					this.read();
				}
			}
			
			return this;
		};
		
		this._shouldItemBeFiltered = function(item) {
			if(this._filter && (this._filter.filters.length > 0 || this._filter.filters instanceof zimoko.FilterSet)){
				if(!this._filter.result(item)) {
					return true;
				}
			}
			
			return false;
		};
		
		this.page = function(page) {
			if(page != undefined && zimoko.isNumber(page)) {
				this._page = parseInt(page);
				
				if(this.serverPaging) {
					this.read();
				}
				else {
					//reset view and add page splice
					this._view.clear();
					this.sort();
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
					this._view.push(this._paginate());
				}
			}
			
			return this;
		};
		
		this.filter = function(filterSet) {
			this._filter = filterSet;
			
			if(!this.serverFilter) {
				this.sort();
			}
			else {
				this.read();
			}
			
			return this;
		};
		
		this.add = function(object) {			
			obs = object;
			
			this._source.push(obs);
			this._view.push(obs);
			
			return this;
		};
		
		this.insertAt = function(object, index) {
			var item = object;
			
			this._source.splice(index, 0, item);
			this._view.insertAt(item, index);
			
			return this;
		};
		
		this.remove = function(object) {
			this._source.remove(object);
			this._view.remove(object);
			this.total = this._source.length;
			
			return this;
		};
		
		this.clear = function() {
			this._source = [];
			this._view.clear();
			
			return this;
		};
		
		this.get = function(index) {
			if(index < this._source.length && index >= 0)
				return this._source[index];
			
			return undefined;
		};
		
		var _dataSourceError = function(event) {
			var datasource = this;
			
			zimoko.each(datasource.listeners, function(index, listener) {
				if(listener && typeof(listener.onDataSourceUpdate) == 'function') {
					listener.onDataSourceError.call(listener, event);
				}
			});
		};
		
		var _dataSourceUpdate = function(event) {
			var datasource = this;
			
			zimoko.each(datasource.listeners, function(index, listener) {
				if(listener && typeof(listener.onDataSourceUpdate) == 'function') {
					listener.onDataSourceUpdate.call(listener, event);
				}
			});
		};
		
		var _dataSourceCreate = function(event) {
			var datasource = this;
			
			zimoko.each(datasource.listeners, function(index, listener) {	
				if(listener && typeof(listener.onDataSourceCreate) == 'function') {
					listener.onDataSourceCreate.call(listener, event);
				}
			}); 
		};
		
		var _dataSourceDelete = function(event) {
			var datasource = this;
			
			zimoko.each(datasource.listeners, function(index, listener) {
				if(listener && typeof(listener.onDataSourceDelete) == 'function') {
					listener.onDataSourceDelete.call(listener, event);
				}
			});
		};
		
		var _dataSourceRead = function(event) {
			var datasource = this;
			
			zimoko.each(datasource.listeners, function(index, listener) {	
				if(listener && typeof(listener.onDataSourceRead) == 'function') {
					listener.onDataSourceRead.call(listener, event);
				}
			}); 
		};
		
		var _dataSourceChange = function(event) {
			var datasource = this;
			
			zimoko.each(datasource.listeners, function(index, listener) {
				if(listener && typeof(listener.onDataSourceChange) == 'function') {
					listener.onDataSourceChange.call(listener,event);
				}
			});
		};
		
		this.read = function(append) {
			var _this = this;
		
			var options = {
				filters: _this._filter,
				pageSize: _this.pageSize,
				page: _this._page,
				sorting: _this._sorting,
				success: function(response) {
					if(!_this.preventRead)
						_this.total = parseInt(_this.transport.schema.total(response));
					
					var data = _this.transport.schema.data(_this.transport.schema.parse(response));
					
					var errors = _this.transport.schema.errors(response);
					
					if(errors) {
						_dataSourceError.call(_this, errors);
					}
					else {
						_this._source = data.toObservableObjects();
						
						if(_this._filter)
							_this._filter.cached = null;
						
						if(_this.serverPaging) {
							if(append) {
								_this._view.push(_this._source);
							}
							else {
								_this._view.clear();
								_this._view.push(_this.source);
							}
						}
						else {
							_this._view.clear();
							_this.sort();
						}
							
						_dataSourceRead.call(_this, _this);
					}
				},
				error: function(errors) {
					_dataSourceError.call(_this, errors);
				}
			};	
			
			if(!this.reading && !this.preventRead) {
				this.reading = true;
				
				this.transport.read(options);
			}
		};
		
		
		this.create = function(object) {
			var realData = {};
			var originalObject = object;
			var _this = this;
			
			zimoko.queue.add(function() {
				if(this.transport.schema.model) {
					for(var name in this.transport.schema.model) {
						var modelSetting = this.transport.schema.model[name];
					
						if(name != 'init' && name != '_original') {
							if(modelSetting) {
								if(!modelSetting.nullable) {
									if(!originalObject[name]) {
									
										return;
									}
								}
							
								if(modelSetting.required) {
									if(!originalObject[name]) {
								
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
					success: function(response) {
						var data = _this.transport.schema.data(_this.transport.schema.parse(response));
					
						var errors = datasource.transport.schema.errors(response);
					
						if(errors) {
							_dataSourceError.call(_this, errors);
						}
						else {
							var item = new zimoko.Observable(data);
							
							_this._source.push(item);
							_this._view.push(item);
							_this._view.sort(_this._sorting);
							_dataSourceCreate.call(_this, item);							
						}
					},
					error: function(errors) {
						_dataSourceError.call(_this, errors);
					}
				}; 

				this.transport.create(options);
			}, this);
		};
		
		this.destroy = function(object) {
			var originalObject = undefined;
			var _this = this;
			
			if(object instanceof zimoko.Observable) {
				originalObject = object.toObject();
			}
			else {
				originalObject = object;
			}
		
			var options = {
				data: originalObject,
				success: function(response) {
					var errors = _this.transport.schema.errors(response);
					
					if(errors) {
						_dataSourceError.call(_this, errors);
					}
					else {
						_this._source.remove(object);
						_this._view.remove(object);
						
						_dataSourceDelete.call(_this,object);
					}
				},
				error: function(errors) {
					_dataSourceError.call(_this, errors);
				}
			}; 
			
            _this.transport.destroy(options);
		};
		
		this.update = function(object) {
			var realData = {};
			
			var originalObject = object;
			var _this = this;
			
			if(originalObject instanceof zimoko.Observable)
				originalObject = originalObject.toObject();
			
			zimoko.queue.add(function() {
				if(this.transport.schema.model) {
					for(var name in this.transport.schema.model) {
						var modelSetting = this.transport.schema.model[name];
					
						if(name != 'init' && name != '_original') {
							if(modelSetting) {
								if(!modelSetting.nullable) {
									if(!originalObject[name]) { 
										return;
									}
								}
							
								if(modelSetting.required) {
									if(!originalObject[name]) {
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
					success: function(response) {				
						var errors = _this.transport.schema.errors(response);
					
						if(errors) {
							_dataSourceError.call(_this, errors);
						}
						else {
							_dataSourceUpate.call(_this,object);
						}
					},
					error: function(errors) {
						_dataSourceError.call(_this, errors);
					}
				};

				this.transport.update(options);
			}, this);
		};
	});
})();
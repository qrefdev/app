(function() {
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
		};
		
		this.indexOf = function(elt /*, from*/) {
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
						var value1 = item[keys[0]];
						var value2 = item2[keys[0]];
						
						if(value1 < value2)
							return -1;
						else if(value1 == value2)
							return 0;
						else
							return 1;
					});
				}
				else if(direction == 'desc' || direction == 1) {
					results = this.sort(function(item,item2) {
						var value1 = item[keys[0]];
						var value2 = item2[keys[0]];
						
						if(value1 < value2)
							return 1;
						else if(value1 == value2)
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
			
			if(results !== this) {
				for(var i = 0; i < this.length; i++) {
					this[i] = results[i];
				}
			}
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
		
		this.remove = function(obj) {
			var index = this.indexOf(obj);
			
			if(index > -1)
				this.removeAt(index);
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
})();
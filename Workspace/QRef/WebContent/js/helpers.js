function inputBlur(object, text) {
	var blurMe = $(object);
	
	if(blurMe.val() == "")
	{
		blurMe.val(text);
	}
}

function inputFocus(object, test) {
	var focusMe = $(object);
	
	if(focusMe.val() == test)
	{
		focusMe.val("");
	}
}

function passwordBlur(object, target) {
	var blurMe = $(object);
	var t = $("#" + target);
	
	if(blurMe.val() == "")
	{
		blurMe.toggle();
		t.toggle();
	}
}

function passwordFocus(object, target) {
	var focusMe = $(object);
	var t = $("#" + target);
	
	focusMe.toggle();
	t.toggle().focus();
}

function RefreshToken(callback) {
	if(token != "" && online)
	{
		var refresh = { "mode":"rpc", "token": token}
		
		$.ajax({
			type: "post",
			url: host + "services/rpc/auth/refreshToken",
			data: refresh,
			success: function(data) {
				var response = data;
				
				if(response.success == true)
				{
					token = response.returnValue;
					$.cookie.setCookie("QrefAuth", token, 30);
					
					if(callback) 
						callback(true);
				}
			
				if(callback)
					callback(false);
			},
			error: function(data) {
				if(callback)
					callback(false);
			}
		});
	}
	else if(online == false && token != "")
	{
		if(callback)
			callback(true);
	}
	else
	{
		if(callback)
			callback(false);
	}
}

function Dictionary() {
	this.elements = {};

	this.containsKey = function(key) {
		return Object.keys(this.elements).indexOf(key) != -1;
	};
	
	this.get = function(key) {
		if (this.containsKey(key))
			return this.elements[key];
		
		return null;
	};
	
	this.set = function(key, value) {
		this.elements[key] = value;
	};
	
	this.sortedKeys = function() {
		var keys = Object.keys(this.elements);
		return keys.sort(function (item1, item2) {
			if (item1 < item2)
				return -1;
			else if (item1 == item2)
				return 0;
			else if (item1 > item2)
				return 1;
		
			return 0;
		});
	};
};

function SortableArray(arr) {
	this.length = 0;
	var self = this;
	
	this.sortBy = function(keys) {
		var results = undefined;
		var groups = new Dictionary();
		
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
						
						if(object < object2)
							lastValue = -1;
						else if(object == object2)
							lastValue = 0;
						else
							lastValue = 1;
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
			results = this.sort(function(item,item2) {
				if(item[keys[0]] < item2[keys[0]])
					return -1;
				else if(item[keys[0]] == item2[keys[0]])
					return 0;
				else
					return 1;
			});
		}
		else
		{
			results = this;
		}
		
		return results;
	};
	
	this.shift = function() {
		var firstItem = this[0];
		
		for(var i = this.length - 1; i > 0; i--)
		{
			this[i - 1] = this[i];
		}
		
		this.length--;
		
		return firstItem;
	};
	
	this.sort = function(comparator) {
		var mArray = this.toArray();
		
		mArray = mArray.sort(comparator);
		
		return new SortableArray(mArray);
	};
	
	this.slice = function(offset, end) {
		
		if(!offset)
			offset = 0;
			
		if(!end)
			end = this.length;
			
		var arr = new SortableArray();
		
		if(end > this.length)
			end = this.length;
		if(offset < 0)
			offset = 0;
		
		for(var i = offset; i < end; i++)
		{
			arr.push(this[i]);
		}		
		
		return arr;
	}
	
	this.toArray = function() {
		var array = new Array();
		
		for(var i = 0; i < this.length; i++)
		{
			array.push(this[i]);
		}
		
		return array;
	};
	
	this.copy = function() {
		var arr = new SortableArray();
		
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
	
	if(arr)
	{
		for(var i = 0; i < arr.length; i++)
		{
			this.push(arr[i]);
		}
	}
}

Array.prototype.removeAt = function(index) {
  
  var nArray = new Array();
  for(var i = 0; i < this.length; i++)
  {
  	if(i != index)
  		nArray.push(this[i]);
  }
  
  return nArray;
};
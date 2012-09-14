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

Array.prototype.removeAt = function(index) {
  
  var nArray = new Array();
  for(var i = 0; i < this.length; i++)
  {
  	if(i != index)
  		nArray.push(this[i]);
  }
  
  return nArray;
};
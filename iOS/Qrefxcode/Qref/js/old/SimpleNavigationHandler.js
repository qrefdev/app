function SimpleNavigationHandler() {
	this.previousAreas = new Array();
	this.previousArea = "";
	this.currentArea = "";
	this.areas = new Dictionary();
	
	var self = this;
	
	this.updateArea = function() {
		if(this.areas.containsKey(this.currentArea))
		{
			var callback = this.areas.get(this.currentArea);
			
			if(callback) 
				callback();
		}
	};
	
	this.clearHistory = function() {
		this.previousAreas = new Array();
		this.previousArea = "";
	};
	
	this.autoGo = function(sender) {
		if(sender != undefined) {
			this.previousAreas.push(this.currentArea);
			this.currentArea = sender.attr("data-link");
			this.updateArea();
		}
	};
	
	this.back = function() {
		if(this.previousAreas.length > 0)
		{
			this.previousArea = this.currentArea;
			this.currentArea = this.previousAreas.pop();
			this.updateArea();
		}
	};
	
	this.go = function(place) {
		this.previousArea = "";
		this.previousAreas.push(this.currentArea);
		this.currentArea = place;
		this.updateArea();
	};
	
	this.add = function(area, callback) {
		if(!this.areas.containsKey(area)) {
			this.areas.set(area, callback);
		}
	};
}
function ThemeHandler() {
	var self = this;
	this.themes = [{id: "theme-dark"}, {id: "theme-light"}];
}

function Loader() {
	this.element = $(".loader");
	
	this.show = function() {
		this.element.fadeIn();
	}
	
	this.hide = function() {
		this.element.fadeOut();
	}
}

function Dialog(element, message, callback) {
	this.element = $(element);
	this.data = this.element.find(".data");
	this.okay = this.element.find(".okay");
	this.callback = callback;
	this.message = message;
	
	var self = this;
	
	this.data.html(message);
	
	this.okay.click(function() {
		self.close();
	});
	
	this.show = function() {
		this.element.fadeIn();
	};
	
	this.close = function() {
		this.element.fadeOut();
		
		if(this.callback)
		{
			this.callback();
		}
	};
}
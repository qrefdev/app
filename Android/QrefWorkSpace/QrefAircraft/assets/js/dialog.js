function Dialog(element, message, callback) {
	this.element = $(element);
	this.data = this.element.find(".data");
	this.okay = this.element.find(".okay");
	this.callback = callback;
	this.message = message;
	
	var self = this;
	
	this.data.html(message);
	
	this.okay.tap(function(e) {
		self.close();
	});
	
	this.show = function() {
		this.element.show();
	};
	
	this.close = function() {
		this.element.hide();
		
		if(this.callback)
		{
			this.callback();
		}
	};
}

function ConfirmationDialog(element, callback) {
	this.callback = callback;
	this.element = $(element);
	this.closeButton = this.element.find(".close");
	this.yesButton = this.element.find(".yes");
	this.noButton = this.element.find(".no");
	this.innerElement = this.element.find(".content");
	
	var self = this;
	
	this.closeButton.tap(function(e) {
		self.close(false);
	});
	
	this.yesButton.tap(function(e) {
		self.close(true);
	});
	
	this.noButton.tap(function(e) {
		self.close(false);
	});
	
	this.close = function(confirm) {
		this.element.fadeOut(function() {
			if(this.callback)
			{
				this.callback(confirm);
			}
		});
	};
	
	this.show = function() {
		this.element.fadeIn();
	};
	
	this.html = function(data) {
		this.innerElement.html(data);
	};
}
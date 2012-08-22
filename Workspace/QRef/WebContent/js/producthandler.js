function MyProductsHandler() {
	this.listing = undefined;
	
	this.init = function() {
		this.listing = $("#dashboard-planes");
		$(".dashboard-plane-selector").swipe({
			swipeUp: function() {
				return true;
			},
			swipeDown: function() {
				return true;
			}
		});
	};
	
	this.reset = function() {
		$(".dashboard-plane-selector").swipe("resetScroll");
	};
	
	this.populate = function(status) {
		var html = "";
		this.listing.html("");
		
		for(var i = 0; i < Checklist.products.length; i++)
		{
			html += '<li data-id="' + Checklist.products[i]._id + '"><div class="heading">' + Checklist.products[i].airplaneChecklist.manufacturer.name +
					'</div><div class="subheading">' + Checklist.products[i].airplaneChecklist.model.name + '</div>' +
					'<ul><li class="product-subarea" data-link="preflight">preflight</li><li class="product-subarea" data-link="takeoff">take-off</li>' +
					'<li class="product-subarea" data-link="landing">landing</li><li class="product-subarea" data-link="emergency">emergency</li></ul>' +
					'</li>';
		}
		
		this.listing.html(html);
		//this.addHandlers();
	};
	
	this.addHandlers = function() {
		this.listing.children().click(function() {
			//ToDo: Load Listing
		});
	};
}
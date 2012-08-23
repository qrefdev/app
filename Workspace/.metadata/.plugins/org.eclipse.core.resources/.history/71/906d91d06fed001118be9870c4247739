function MyProductsHandler() {
	this.listing = undefined;
	
	this.init = function() {
		this.listing = $("#dashboard-planes");
		$(".dashboard-planes-selector").swipe({
			threshold: 5,
			swipeUp: function() {
				return true;
			},
			swipeDown: function() {
				return true;
			}
		});
	};
	
	this.reset = function() {
		$(".dashboard-planes-selector").swipe("resetScroll");
	};
	
	this.populate = function(status) {
		var html = "";
		this.listing.html("");
		
		for(var i = 0; i < Checklist.products.length; i++)
		{
			var product = Checklist.products[i];
		
			if(product && product.aircraftChecklist)
			{
				html += '<li data-id="' + product._id + '"><div style="float: left; position: relative; width: 100%; height: 100%; background: transparent url(\'images/aircraft.png\') 100% 50% no-repeat; background-size: 35% 75%;"><div class="heading">' + product.aircraftChecklist.manufacturer.name +
						'</div><div class="subheading">' + product.aircraftChecklist.model.name + '</div>' +
						'<ul><li class="product-subarea" data-link="preflight">preflight</li><li class="product-subarea" data-link="takeoff">take-off</li>' +
						'<li class="product-subarea" data-link="landing">landing</li><li class="product-subarea" data-link="emergency">emergency</li></ul>' +
						'</div></li>';
			}
		}
		
		this.listing.html(html);
		this.addHandlers();
	};
	
	this.addHandlers = function() {
		this.reset();
		this.listing.children().click(function(e) {
			var id = $(this).attr("data-id");
			
			Navigation.loadProduct(id);
		});
		var subItems = this.listing.find(".product-subarea");
		
		subItems.click(function(e) {
			e.stopPropagation();
			var parent = $(this).parent().parent().parent();
			var dataid = parent.attr("data-id");
			var datalink = $(this).attr("data-link");
			
			Navigation.loadProduct(dataid, function() {
				Navigation.updateChecklist(datalink);
			});
		});
	};
}
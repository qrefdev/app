function MyProductsHandler() {
	this.listing = undefined;
	
	var self = this;
	
	this.init = function() {
		this.listing = $("#dashboard-planes");
		if(!$.android) {
			$(".dashboard-planes-selector").touchScroll({
				threshold: 200,
				direction: "vertical",
				onBeforeScroll: function(event) {
					if(Checklist.productEditMode && Checklist.isSorting)
					{
						$(".dashboard-planes-selector").touchScroll("enableReverseScroll");
						//$(this).touchScroll("disableScroll");
					}
					else
					{
						$(".dashboard-planes-selector").touchScroll("disableReverseScroll");
						//$(this).touchScroll("enableScroll");
					}
				}
			});
		}
	};
	
	this.populate = function(status) {
		var html = "";
		this.listing.html("");
		
		for(var i = 0; i < Checklist.products.length; i++)
		{
			var product = Checklist.products[i];
		
			if(product && product.aircraftChecklist)
			{
				html += '<li data-id="' + product._id + '"><div class="plane-icon"><img src="images/aircraft.png" /></div><div class="holder"><div class="heading">' + product.aircraftChecklist.manufacturer.name + 
						" " + product.aircraftChecklist.model.name + '</div>' +
						'<ul><li class="product-subarea" data-link="preflight">preflight</li><li class="product-subarea" data-link="takeoff">take-off</li>' +
						'<li class="product-subarea" data-link="landing">landing</li><li class="product-subarea" data-link="emergency">emergency</li></ul>' +
						'</div>' +
						'<div class="delete"><button class="item-delete-button">delete</button></div>' +
						'<div class="handle"><div class="item"></div><div class="item"></div><div class="item"></div>' +
						'</li>';
			}
		}
		
		this.listing.html(html);
		this.addHandlers();
	};
	
	this.addHandlers = function() {
		Theme.updateDashboardEditMode();
		this.listing.children().tap(function(e) {
			if(!Checklist.productEditMode) {
				var id = $(this).attr("data-id");
				
				Navigation.loadProduct(id);
			}
			else
			{
				Theme.clearDeleteStatus(self.listing.children());
			}
		});
		var subItems = this.listing.find(".product-subarea");
		
		subItems.tap(function(e) {
			if(!Checklist.productEditMode) {
				e.stopPropagation();
				var parent = $(this).parent().parent().parent();
				var dataid = parent.attr("data-id");
				var datalink = $(this).attr("data-link");
				
				Navigation.loadProduct(dataid, function() {
					Navigation.updateChecklist(datalink);
				});
			}
		});
		
		this.listing.children().swipe({
			swipeRight: function(event, duration) {
				if(Checklist.productEditMode)
				{
					var deleteButton = $(this).find(".delete");
					var holder = $(this).find(".holder");
					
					holder.animate({"margin-left": "75px"}, 500, function() {
						deleteButton.fadeIn();
					});
			
					event.stopPropagation();
				}
			},
			threshold: 20,
			durationThreshold: 500
		});
	};
}
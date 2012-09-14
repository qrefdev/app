function MyProductsHandler() {
	this.listing = undefined;
	this.products = new Array();
	this.allProducts = new Array();
	this.productListing = undefined;
	this.product = undefined;
	
	var self = this;
	
	this.init = function() {
		this.listing = $("#dashboard-planes");
		this.productListing = $("#downloads-items");
		$(".dashboard-planes-selector").touchScroll({
			threshold: 200,
			direction: "vertical",
			onBeforeScroll: function(event) {
				if(Checklist.productEditMode && Checklist.isSorting)
				{
					$(".dashboard-planes-selector").touchScroll("disableScroll");
					//$(this).touchScroll("disableScroll");
				}
				else
				{
					$(".dashboard-planes-selector").touchScroll("enableScroll");
					//$(this).touchScroll("enableScroll");
				}
			}
		});
		
		$(".dashboard-planes-selector").mouseScroll({
			scrollAmount: 2,
			direction: "vertical"
		});
		
		$(".downloads").touchScroll({
			threshold: 200,
			direction: "vertical"
		});
	};
	
	this.loadAllProducts = function(updateCallback) {
		$.ajax({
			type: "get",
			dataType: "json",
			url: host + "services/ajax/aircraft/products?token=" + token,
			success: function(data) {
				var response = data;
				
				if(response.success == true)
				{
					self.allProducts =  self.sort(response.records);
					if(updateCallback)
						updateCallback(true);
				}
				else
				{
					if(updateCallback)
						updateCallback(false);
				}
			},
			error: function()
			{
				if(updateCallback)
					updateCallback(false);
			}
		});
	};
	
	this.loadUserProducts = function(updateCallback) {
		$.ajax({
			type: "get",
			dataType: "json",
			url: host + "services/ajax/user/products?token=" + token,
			success: function(data) {
				var response = data;
				
				if(response.success == true)
				{
					self.products = self.sort(response.records);
					if(updateCallback)
						updateCallback(true);
				}
				else
				{
					if(updateCallback)
						updateCallback(false);
				}
			},
			error: function()
			{
				if(updateCallback)
					updateCallback(false);
			}
		});
	};
	
	this.populateDownloads = function() {
		var html = "";
		this.productListing.html("");
		
		for(var i = 0; i < this.allProducts.length; i++)
		{
			var product = this.allProducts[i];
			
			if(product)
			{
				userOwnsProduct = (this.getProduct(this.products, product._id)) ? "owns" : "buy";
				
				html += '<li data-id="' + product._id + '" class="' + userOwnsProduct + '"><div class="plane-icon"><img src="images/aircraft.png" /></div><div class="holder"><div class="heading">' + product.manufacturer.name +
				" " + product.model.name + '</div>' +
				'<div class="subheading">' + product.modelYear + '</div>' +
				'<div class="subheading">' + product.serialNumber + '</div>' +
				'</div></li>'
			}
		}
		
		this.productListing.html(html);
		this.addProductHandlers();
	};
	
	this.populate = function() {
		var html = "";
		this.listing.html("");
		
		for(var i = 0; i < Checklist.checklists.length; i++)
		{
			var product = Checklist.checklists[i];
		
			if(product)
			{
				html += '<li data-index="' + product.index + '" data-id="' + product._id + '"><div class="plane-icon"><img src="images/aircraft.png" /></div><div class="holder"><div class="heading">' + product.manufacturer.name + 
						" " + product.model.name + '</div>' +
						'<div class="subheading">' + product.modelYear + '</div>' +
						'<div class="subheading">' + product.tailNumber + '</div>' + 
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
	
	this.populateDownloadDetails = function() {
	
	};
	
	this.addProductHandlers = function() {
		this.productListing.children().tap(function(e) {
			self.product = self.getProduct(self.allProducts, $(this).attr("data-id"));
			
			if(self.product)
			{
				self.populateDownloadDetails();
				Navigation.go("download-details");
			}
		});
	};
	
	this.addHandlers = function() {
		Theme.updateDashboardEditMode();
		this.listing.children().tap(function(e) {
			if(!Checklist.productEditMode) {
				var id = $(this).attr("data-id");
				
				Navigation.loadChecklist(id);
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
				
				Navigation.loadChecklist(dataid, function() {
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
	
	this.getProduct = function(tProducts, id) {
		var item = _.find(tProducts, function(i) {
			if(i._id == id)
				return true;
		});
		
		return item;
	};
	
	this.sort = function(tProducts) {
		var dict = new Dictionary();
		
		for(var i = 0; i < tProducts.length; i++)
		{
			var product = tProducts[i];
			
			var manufacturer = product.manufacturer.name;
			
			if (!dict.containsKey(manufacturer)) {
				dict.set(manufacturer, [product])
			} else {
				var tmp = dict.get(manufacturer);
				tmp.push(product);
			}
		}
		
		var keySet = dict.sortedKeys();
		var sortedArray = [];
		
		for (kv in keySet) {
			var arrProd = dict.get(keySet[kv]);
			if(arrProd) {
				arrProd = arrProd.sort(function (item1, item2) {
					if (item1.model.name < item2.model.name)
						return -1;
					else if (item1.model.name == item2.model.name)
						return 0;
					else if (item1.model.name > item2.model.name)
						return 1;
					
					return 0;
				});
				
				sortedArray = sortedArray.concat(arrProd);
			}
			
		}
		
		return sortedArray;
		
	};
}
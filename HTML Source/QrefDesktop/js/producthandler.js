function MyProductsHandler() {
	this.listing = undefined;
	this.products = new Array();
	this.allProducts = new Array();
	this.productListing = undefined;
	this.product = undefined;
	this.productDetails = undefined;
	
	var self = this;
	
	this.init = function() {
		this.productDetails = new ProductDetails();
		this.listing = $("#dashboard-planes");
		this.productListing = $("#downloads-items");
	};
	
	
	//Loads all available published products from the server
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
	
	//Loads only the products that the user own from the server
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
				
				html = Theme.createDownloadItem(product, userOwnsProduct);
                this.productListing.append(html);
			}
		}
    
		Theme.addDownloadItemHandlers();
	};
	
	this.populate = function() {
		var html = "";
		this.listing.html("");
		
		for(var i = 0; i < Checklist.checklists.length; i++)
		{
			var product = Checklist.checklists[i];
		
			if(product)
			{
				if(!product.isDeleted)
                {
					html = Theme.createDashboardItem(product);
                    this.listing.append(html);
                }
			}
		}
		
		Theme.addDashboardItemHandlers();
	};
	
	this.selectProductDetails = function() {
		var owns = this.getProduct(this.products, this.product._id);
		
		this.productDetails.load(this.product, owns);
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

//Handles the loading of the product details
function ProductDetails() {
	this.details = $("#productDetailsListing");
	var self = this;
	
	//Do whatever necessary to start the purchase
	this.details.find(".buynow").tap(function(e) {
        loader.show();
	});
	
	this.load = function(product, ownsProduct) {
		this.details.find(".productImage").html('<img src="' + product.coverImage + '" />');
		this.details.find(".productModel").html(product.manufacturer.name + " " + product.model.name);
		this.details.find(".modelDescription").html(product.model.description);
		this.details.find(".manufacturerDescription").html(product.manufacturer.description);
		
		if(!ownsProduct)
			this.details.find(".buynow").html(product.suggestedRetailPrice);
		else
			this.details.find(".buynow").html("INSTALL");
			
		this.details.find(".productSerialNumbers").html(product.serialNumber);
		this.details.find(".productModelYear").html(product.model.modelYear);
		this.details.find(".description").html(product.description);
	};
}
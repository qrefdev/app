function CheckListHandler() {
	this.products = new Array();
	var self = this;
	
	this.commands = {
		CACHELOADED: 0,
		ONLINELOADEDAFTERCACHE: 1,
		ONLINEFAILEDAFTERCACHE: 2,
		ONLINEONLYLOADED: 3,
		ONLINEONLYFAILED: 4
	};
	
	this.load = function(updateCallback) {
		if(cached)
		{	
			this.products = JSON.parse(cachedUserProducts);
			this.products = this.sort();
			
			if(updateCallback)
				updateCallback(this.commands.CACHELOADED);
			
			if(online)
			{
				this.onlineLoad(function(success) {
					if(success) {
						self.products = self.sort();
						
						if(updateCallback)
							updateCallback(self.commands.ONLINELOADEDAFTERCACHE);
					}
					else
					{
						if(updateCallback)
							updateCallback(self.commands.ONLINEFAILEDAFTERCACHE);
					}
				});
			}
		}
		else
		{
			if(online)
			{
				this.onlineLoad(function(success) {
					if(success) {
						self.products = self.sort();
						
						if(updateCallback)
							updateCallback(self.commands.ONLINEONLYLOADED);
					}
					else
					{
						if(updateCallback)
							updateCallback(self.commands.ONLINEONLYFAILED);
					}
				});
			}
			else
			{
				if(updateCallback)
					updateCallback(self.commands.ONLINEONLYFAILED);
			}
		}
	};
	
	this.onlineLoad = function(updateCallback) {
		$.ajax({
			type: "get",
			url: host + "services/ajax/user/products?token=" + token,
			success: function(data) {
				var response = data;
				
				if(response.success == true)
				{
					self.products = response.records;
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
	
	this.getProduct = function(id) {
		var item = _.find(this.products, function(i) {
			if(i._id == id)
				return true;
		});
		
		return item;
	};
	
	this.sort = function() {
		var dict = new Dictionary();
		
		for(var i = 0; i < this.products.length; i++)
		{
			var product = this.products[i];
			
			var manufacturer = product.aircraftChecklist.manufacturer.name;
			
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
			
			arrProd = arrProd.sort(function (item1, item2) {
				if (item1.aircraftChecklist.model.name < item2.aircraftChecklist.model.name)
					return -1;
				else if (item1.aircraftChecklist.model.name == item2.aircraftChecklist.model.name)
					return 0;
				else if (item1.aircraftChecklist.model.name > item2.aircraftChecklist.model.name)
					return 1;
				
				return 0;
			});
			
			sortedArray = sortedArray.concat(arrProd);
			
		}
		
		return sortedArray;
		
	};
}

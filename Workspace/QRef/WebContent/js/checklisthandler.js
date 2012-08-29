function CheckListHandler() {
	this.products = new Array();
	var self = this;
	
	this.editMode = false;
	this.productEditMode = false;
	
	this.isSorting = false;
	
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
						cachedUserProducts = JSON.stringify(self.products);
						
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
						cached = true;
						cachedUserProducts = JSON.stringify(self.products);
						
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
			dataType: "json",
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
			if(arrProd) {
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
			
		}
		
		return sortedArray;
		
	};
	
	this.add = function(items, item, callback) {
		if(item.index >= items.length)
		{
			items.push(item);
		}
		else
		{
			for(var i = item.index; i < items.length; i++)
			{
				items[i].index += 1;
			}
			
			items.push(item);
			
			item = this.sortItems(items);
		}
		
		if(callback)
			callback(items);
	};
	
	this.remove = function(items, index, callback) {
		
		if(index == items.length - 1)
		{
			items = items.removeAt(index);
		}
		else
		{
			for(var i = index; i < items.length; i++)
			{
				items[i].index -= 1;
			}
			
			items = items.removeAt(index);
		}
		
		if(callback)
			callback(items);
			
	};
	
	this.sortItems = function(items) {
		var itemsSorted = items.sort(function(item1, item2) {
			if(item1.index < item2.index)
				return -1;
			else if(item1.index == item2.index)
				return 0;
			else if(item1.index > item2.index)
				return 1;
				
			return 0;
		});
		
		return itemsSorted;
	};
	
	this.reindex = function(items, indices) {
			for(var i = 0; i < indices.length; i++)
			{
				items[indices[i].original].index = indices[i].index;
			}
			
			items = this.sortItems(items);
			
		return items;
	};
}

function ChecklistItem() {
	this.icon = "";
	this.index = 0;
	this.check = "";
	this.response = "";
}

function ChecklistEditorHandler() {
	this.editingItem = undefined;
	this.editing = false;
	
	var self = this;
	
	this.add = function() {
		if(this.editingItem)
		{
			var index = parseInt(this.editingItem.attr("data-index"));
			
			var newItem = new ChecklistItem();
			newItem.index = index + 1;
			
			newItem.check = $("#check").val();
			newItem.response = $("#response").val();
			
			Checklist.add(Navigation.checklist[Navigation.currentChecklistSection].items, newItem, function(items) {
				self.editingItem = undefined;
				Navigation.checklist[Navigation.currentChecklistSection].items = items;
				Navigation.back();
			});
		}
	};
	
	this.edit = function() {
		if(this.editingItem) 
		{
			var index = parseInt(this.editingItem.attr("data-index"));
			
			var item = Navigation.checklist[Navigation.currentChecklistSection].items[index];
			
			item.check = $("#check").val();
			item.response = $("#response").val();
			this.editingItem = undefined;
			Navigation.back();
		}
	};
}

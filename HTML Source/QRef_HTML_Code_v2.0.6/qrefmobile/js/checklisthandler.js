function CheckListHandler() {
	this.checklists = new Array();

	var self = this;
	
	this.editMode = false;
	this.productEditMode = false;
	
	this.isSorting = false;
	
	this.load = function(updateCallback) {
		$.ajax({
			type: "get",
			dataType: "json",
			url: host + "services/ajax/aircraft/checklists?token=" + token,
			success: function(data) {
				var response = data;
				
				if(response.success == true)
				{
					self.checklists = MyProducts.sort(response.records);
					self.postSort();
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
	
	this.postSort = function() {
		var nextIndex = this.checklists.length;
		
		for(var i = 0; i < this.checklists.length; i++)
		{
			if(this.checklists[i].index == undefined || this.checklists[i].index == null)
				this.checklists[i].index = nextIndex++;
		}
		
		this.checklists = this.sortItems(this.checklists);
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

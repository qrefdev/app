function Guid() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid;
}

function CheckListHandler() {
	this.checklists = undefined;
    
	var self = this;
	
	this.editMode = false;
	this.productEditMode = false;
	
	this.isSorting = false;
	
	//Loads the users checklists from the server
	this.load = function(updateCallback) {
        var cached = cachePack;
        
		if((cached == "" || cached == undefined) && self.checklists == undefined)
		{
			$.ajax({
				type: "get",
				dataType: "json",
				url: host + "services/ajax/aircraft/checklists?token=" + token,
				success: function(data) {
					var response = data;
					
					if(response.success == true)
					{
						self.checklists = MyProducts.sort(response.records);
                        //$("#cache").val(JSON.stringify(self.checklists));
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
		}
		else if(cached && self.checklists == undefined)
		{
			self.checklists = JSON.parse(decodeURIComponent(unescape(cached)));
			
			if(updateCallback)
				updateCallback(true);
		}
		else
		{
			if(updateCallback)
				updateCallback(true);
		}
	};
    
    this.loadUncachedChecklists = function(tailNumber) {
        Sync.getChecklistsFromServer(function(items) {
            if(items) {
            	for(var i = 0; i < items.length; i++)
            	{
            		var currentItem = MyProducts.getProduct(Checklist.checklists,items[i]._id);
            		
            		if(!currentItem)
            		{
            			Checklist.checklists.push(items[i]);
            		}
            	}
        
                loader.hide();
                var dialog = new Dialog("#infobox", "A new check list has been created with the random tail number: " + tailNumber);
                dialog.show();
            	Navigation.go("dashboard");
            }
            else
            {
                loader.hide();
                var dialog = new Dialog("#infobox", "Could not connect to server to retrieve new check list.");
                dialog.show();
            }
        });
    };
	
	
	//Fills in undefined or null indexes with an index that is at the end of the
	//Already user sorted indexes
	this.postSort = function() {
		var nextIndex = this.checklists.length;
		
		for(var i = 0; i < this.checklists.length; i++)
		{
			if(this.checklists[i].index == undefined || this.checklists[i].index == null)
				this.checklists[i].index = nextIndex++;
		}
		
		this.checklists = this.sortItems(this.checklists);
	};
	
	
	//Helper get for items in arrays with items that have a object.index
	this.get = function(items, index) {
		var foundItem = _.find(items, function(item) {
			if(item.index == index)
				return true;
		});
		
		return foundItem;
	};
	
	//Helper add for items to arrays with items that have a object.index
	//Automatically updates the object.index when adding for you
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
			
			items = this.sortItems(items);
		}
		
		if(callback)
			callback(items);
	};
	
	//Helper for removing items from arrays with items that have object.index
	//Automatically updates the object.index when removing for you
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
	
	//Sorts any item array that has object.index
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
	
	//Tries to find the item with the associated index
	//Returns the real index of the item in the array
	this.getArrayIndex = function(items, index) {
		var item = _.find(items, function(ele) {
			if(ele.index == index)
				return true;
		});
		
		if(item)
		{
			return items.indexOf(item);
		}
		else
		{
			return -1;
		}
	};
	
	//Reindex the items in the array based on the new indices
	//Works on all arrays with items that are object.index
	this.reindex = function(items, indices) {
			for(var i = 0; i < indices.length; i++)
			{
				var item = _.find(items, function(it) {
					if(it._id == indices[i].id)
						return true;
				});
				
				if(item) {
					item.index = indices[i].index;
				}
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
	this._id = "";
}

function TailNumberEditorHandler() {
	this.editingItem = undefined;
	
	var self = this;
	
	this.edit = function() {
		if(this.editingItem)
		{
			var id = this.editingItem.attr("data-id");
			
			var item = MyProducts.getProduct(Checklist.checklists, id);
			
			if(item)
			{
				item.tailNumber = $("#tailnumber").val();
			}
			
			this.editingItem = undefined;
			Navigation.back();
			Sync.syncToPhone();
		}
	}
}

//Handles the editing of the checklist items
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
			newItem._id = Guid();
			
			Checklist.add(Navigation.checklist[Navigation.currentChecklistSection].items, newItem, function(items) {
				self.editingItem = undefined;
				Navigation.checklist[Navigation.currentChecklistSection].items = items;
				Navigation.back();
				Sync.syncToPhone();
			});
		}
	};
	
	this.edit = function() {
		if(this.editingItem) 
		{
			var id = this.editingItem.attr("data-id");
			
			var item = MyProducts.getProduct(Navigation.checklist[Navigation.currentChecklistSection].items, id);
			
			if(item)
			{
				item.check = $("#check").val();
				item.response = $("#response").val();
			}
			
			this.editingItem = undefined;
			Navigation.back();
			Sync.syncToPhone();
		}
	};
}

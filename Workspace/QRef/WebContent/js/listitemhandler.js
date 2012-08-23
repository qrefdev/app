function ListItemHandler(items) {
	this.items = items;
	
	this.sort = function() {
		var sorted = this.items.sort(function(item1, item2) {
			if(item1.index < item2.index)
				return -1;
			else if(item1.index == item2.index)
				return 0;
			else if(item1.index > item2.index)
				return 1;
				
			return 0;		
		});
		
		return sorted;
	};
	
	this.getByIndex = function(index) {
		return _.find(this.items, function(item) {
			if(item.index == index)
				return true;
		});
	};
}
function ImageProcessor(itemsToProcess, cacheType, icon) {
    this.count = 0;
    this.index = 0;
    this.items = itemsToProcess;
    this.type = cacheType;
    this.isIcon = icon;
    
    var self = this;
    
    this.init = function() {
        this.count = this.items.length;
        this.index = 0;
    };
    
    function PushImage(data) {
		var imageArray = data;
		
		if(imageArray[2].toLowerCase() == "productlisting")
		{
			var item = $("#downloads-items li[data-id='" + imageArray[1] + "']");
		
			if(item.length > 0)
				item.find(".plane-icon").html('<img src="' + imageArray[0] + '" />');
		}
		else if(imageArray[2].toLowerCase() == "checklistlisting")
		{
			var item = $("#dashboard-planes li[data-id='" + imageArray[1] + "']");
		
			if(item.length > 0)
				item.find(".plane-icon").html('<img src="' + imageArray[0] + '" />');
		}
		else if(imageArray[2].toLowerCase() == "productdetails")
		{
			var details = $("#productDetailsListing");
			details.find(".productImage").html('<img src="' + imageArray[0] + '" />');
		}
	}
    
    this.processImages = function() {
        if(this.count > 0)
        {
            var item = this.items[this.index];
        
            if(this.isIcon)
            {
                if(item.productIcon)
                {
                    var iconImageLocation = item.productIcon;
                	var realPath = QrefInterface.getImage(iconImageLocation); 
                	
                	PushImage([realPath,item._id,this.type]);   
               	}
            }
            else
            {
                if(item.coverImage)
                {
                    var coverImageLocation = item.coverImage;
                
                	var realPath = QrefInterface.getImage(coverImageLocation); 
                	
                	PushImage([realPath, item._id, this.type]);
                }
            }
        
            this.index++;
        
            if(this.index < this.count)
            {
                setTimeout(function() {
                    self.processImages();
                }, 100);
            }
        }
    };
}
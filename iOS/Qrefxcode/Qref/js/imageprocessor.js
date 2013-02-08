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
    
    this.processImages = function() {
        if(this.count > 0)
        {
            var item = this.items[this.index];
        
            if(this.isIcon)
            {
                if(item.productIcon)
                {
                    var iconImageLocation = item.productIcon;
                    
                    window.location = "qref://imageCache=" + iconImageLocation + ";" + item._id + ";" + this.type + "&timestamp=" + Date.now();
                }
            }
            else
            {
                if(item.coverImage)
                {
                    var coverImageLocation = item.coverImage;
                    
                    window.location = "qref://imageCache=" + coverImageLocation + ";" + item._id + ";" + this.type + "&timestamp=" +Date.now();
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
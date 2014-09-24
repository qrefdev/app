function ImageProcessor(itemsToProcess, cacheType, icon) {
    this.count = 0;
    this.index = 0;
    this.items = itemsToProcess;
    this.type = cacheType;
    this.isIcon = icon;

    this.init = function() {
        this.count = this.items.length;
        this.index = 0;
    };

    this.processImages = function() {
        var self = this;
        if(this.count > 0)
        {
            var item = this.items[this.index];

            if(this.isIcon)
            {
                if(item.productIcon)
                {
                    var iconImageLocation = item.productIcon;

                    CallObjectiveC("qref://imageCache=" + iconImageLocation + ";" + item._id + ";" + this.type + "&timestamp=" + Date.now());
                }
            }
            else
            {
                if(item.coverImage)
                {
                    var coverImageLocation = item.coverImage;

                    CallObjectiveC("qref://imageCache=" + coverImageLocation + ";" + item._id + ";" + this.type + "&timestamp=" +Date.now());
                }
            }

            this.index++;

            if(this.index < this.count)
            {
                setTimeout(function() {
                    self.processImages();
                }, 125);
            }
        }
    };
}

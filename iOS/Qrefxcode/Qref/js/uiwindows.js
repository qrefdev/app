function ThemeHandler() {
	this.previousTheme = "theme-dark";
	var self = this;
	
	this.apply = function(themeClass) {
		$("." + this.previousTheme).removeClass(this.previousTheme).addClass(themeClass);
		this.previousTheme = themeClass;
	};
	
	this.createDashboardItem = function(product) {
        
		var html = '<li data-index="' + product.index + '" data-id="' + product._id + '"><div class="plane-icon"></div><div class="holder"><div class="heading">' + product.manufacturer.name +
                        " " + product.model.name + '</div>';
                        
        if(product.model.description)
        	html += '<div class="subheading">' + product.model.description + '</div>';
        
        html += '<div class="subheading">';
        	
        if(product.tailNumber)
        	html += '<span class="tailNumber">' + product.tailNumber + '</span> ';
		else
			html += '<span class="tailNumber"></span> ';
		
		if(product.model.modelYear)
			html += '<span class="modelYear">' + product.model.modelYear + '</span>';
	
		html += '</div>';
		
		html += '<ul><li class="product-subarea" data-link="preflight">Preflight</li><li class="product-subarea" data-link="takeoff">Takeoff</li>' +
				'<li class="product-subarea" data-link="landing">Landing</li><li class="product-subarea" data-link="emergency">Emergencies</li>';
		
		if(ChecklistLast.containsKey(product._id))
			html += '<li class="product-subarea" data-link="last">Last</li>';		
				
			html +=	'</ul></div>' +
				'<div class="delete">delete</div>' +
				'<div class="handle"><div class="item"></div><div class="item"></div><div class="item"></div></div>' +
				'</li>';
						
		return html;
	};
	
	this.createDownloadItem = function(product, userOwnsProduct) {
		var html = '<li data-id="' + product._id + '" class="' + userOwnsProduct + '"><div class="plane-icon"></div><div class="holder"><div class="heading">' + product.manufacturer.name +
				" " + product.model.name + '</div>';
		if(product.model.description)
			html += '<div class="subheading">' + product.model.description + '</div>';
			html +=	'<div class="subheading">' + product.model.modelYear + '</div>' +
				'<div class="subheading">' + product.serialNumber + '</div>' +
				'</div></li>'
				
		return html;
	};
	
	this.createChecklistItem = function(item) {
		var html = '<li data-id="' + item._id + '" data-index="' + item.index + '">' +
					'<div class="icon"><i class="' + item.icon + '"></i></div>' +
					'<div class="holder">' +
						'<div class="check">' + item.check + '</div>' +
						'<div class="response">' + item.response + '</div>' +
					'</div>' +
					'<div class="delete">delete</div>' +
					'<div class="add"><i class="icon-plus"></i></div>' +
					'<div class="handle"><div class="item"></div><div class="item"></div><div class="item"></div>' +
					'</li>';
					
		return html;
	};
	
	this.createEmergencySectionItem = function(item) {
		var html = '<li data-link="checklist" data-index="' + item.index + '">' +
						'<div class="icon"><img src="images/' + item.name + '.png" /></div>' +
						'<div class="section-name">' + item.name + '</div>' +
					'</li>';
					
		return html;
	};
	
	this.updateChecklistEditMode = function() {
		if(Checklist.editMode)
		{
			$(".edit-list").addClass("active");
			$("#checklist-items").find(".add").animate({opacity: 1}, 200).css('display', 'block');
			$("#checklist-items").find(".handle").animate({opacity: 1}, 200).css('display', 'block');
			
		}	
		else
		{
			$(".edit-list").removeClass("active");
			$("#checklist-items").find(".add").animate({opacity: 0}, 200, function() {
				$(this).css('display', 'none');
			});
			$("#checklist-items").find(".handle").animate({opacity: 0}, 200, function() {
				$(this).css('display', 'none');
			});
		}
	};
	
	this.updateDashboardEditMode = function() {
		if(Checklist.productEditMode)
		{
			$(".edit-check").addClass("active");
			$("#dashboard-planes").find(".handle").animate({opacity: 1}, 200).css('display', 'block');
			
		}	
		else
		{
			$(".edit-check").removeClass("active");
			$("#dashboard-planes").find(".handle").animate({opacity: 0}, 200, function() {
				$(this).css('display', 'none');
			});
		}
	};
	
	this.clearDeleteStatus = function(items) {
		items.each(function(index, e) {
			var element = $(e);
			var deleteButton = element.find(".delete");
			var holder = element.find(".holder");
			
			deleteButton.animate({opacity: 0}, 200, function() {
				$(this).css('display', 'none');
				var parent = $(this).parent();
				holder.animate({"left": "5px"}, 200);
			});
		});
	};
	
	this.addSectionHandlers = function(listHandler) {
		$("#check-sections-items").children().tap(function(e) {
			e.stopPropagation();
			
			var item = $(this);
			
			$(".check-sections").fadeOut(function() {
				Navigation.currentChecklistSection = parseInt(item.attr("data-index"));
				Navigation.updateChecklist(Navigation.currentChecklistCategory);
				
				$(".checklist").scrollTop(0);
				
				var indexItem = listHandler.getByIndex(parseInt(item.attr("data-index")));
				$("#area").html(indexItem.name);
			});
		});
	};
	
	this.addEmergencySectionHandlers = function() {
		$("#emergency-items").find('li').each(function() {
			if($(this).attr('data-link')) {
				$(this).tap(function(event) {
					var index = parseInt($(this).attr("data-index"));
					Navigation.currentChecklistCategory = "emergency";
					Navigation.currentChecklistSection = index;
					Navigation.autoGo($(this));
				});
			}
		});
	};
	
	this.addDashboardItemHandlers = function() {
		Theme.updateDashboardEditMode();
		MyProducts.listing.children().tap(function(e) {
			e.stopPropagation();
			
			if($(this).find(".delete").css("display") != "none")
			{
				self.clearDeleteStatus($("#dashboard-planes").children());
			}
			else
			{
				if(!Checklist.productEditMode) {
					var id = $(this).attr("data-id");
					
					Navigation.loadChecklist(id);
					Navigation.go("checklist");
				}
				else
				{
					var itemToEdit = $(this);
					
					var item = MyProducts.getProduct(Checklist.checklists, itemToEdit.attr("data-id"));
					
					if(item)
					{
						TailNumberEditor.editingItem = itemToEdit;
						
						$("#tailnumber").val(item.tailNumber);
						$("#tailnumber").blur();
						
						Navigation.updateEditTailArea();
					}
				}
			}
		});
		
		var subItems = MyProducts.listing.find(".product-subarea");
		
		subItems.tap(function(e) {
			if(!Checklist.productEditMode) {
				e.stopPropagation();
                     e.preventDefault();
				var parent = $(this).parent().parent().parent();
				var dataid = parent.attr("data-id");
				var datalink = $(this).attr("data-link");
				
				if(datalink == 'last') {
					var lp = ChecklistLast.get(dataid);
				}
				
				Navigation.loadChecklist(dataid);
				
				if(datalink == 'last')
					ChecklistLast.set(dataid, lp);
				
				Navigation.updateChecklist(datalink);
				
				if(datalink == "emergency")
				{
					Navigation.go("emergency");
				}
				else
				{
					Navigation.go("checklist");
				}
			}
		});
		
		MyProducts.listing.find(".handle").punch();
		
		MyProducts.listing.find(".delete").tap(function(e) {
			e.stopPropagation();
			var parent = $(this).parent();
			var holder = parent.find(".holder");
			
			$(this).animate({opacity: 0}, 200, function() {
				$(this).css('display', 'none');
				holder.animate({"left":"5px"}, 200, function() {
					var removedId = parent.attr("data-id");
					var item = MyProducts.getProduct(Checklist.checklists, removedId);
					
					if(item)
					{
						item.isDeleted = true;
						parent.remove();
						
						Sync.syncToPhone();
					}
				});
			});
		});
		
		MyProducts.listing.children().swipe({
			swipeRight: function(event, duration) {
				if(Checklist.productEditMode)
				{
					var deleteButton = $(this).find(".delete");
					var holder = $(this).find(".holder");
					
					holder.animate({"left": "75px"}, 200, function(e) {
						deleteButton.animate({opacity: 1}, 200).css('display', 'block');
					});
			
					event.stopPropagation();
				}
			},
			threshold: 10,
			durationThreshold: 265
		});
	};
	
	this.addDownloadItemHandlers = function() {
		MyProducts.productListing.children().tap(function(e) {
			MyProducts.product = MyProducts.getProduct(MyProducts.allProducts, $(this).attr("data-id"));
			
			if(MyProducts.product)
			{
				MyProducts.selectProductDetails();
				Navigation.go("download-details");
			}
		});
	};
	
	this.addChecklistItemHandlers = function() {
		this.updateChecklistEditMode();
		$("#checklist-items").children().swipe({
			swipeRight: function(event, duration) {
				if(Checklist.editMode)
				{
					var deleteButton = $(this).find(".delete");
					var holder = $(this).find(".holder");
					
					holder.animate({"left": "75px"}, 200, function(e) {
						deleteButton.animate({opacity: 1}, 200).css('display', 'block');
					});
			
					event.stopPropagation();
				}
			},
			threshold: 40,
			durationThreshold: 265
		});
		
		
		$("#checklist-items").children().tap(function(e) {
			e.stopPropagation();
			
			if($(this).find(".delete").css("display") != "none")
			{
				self.clearDeleteStatus($("#checklist-items").children());
			}
			else if(Checklist.editMode)
			{
				ChecklistEditor.editing = true;
				ChecklistEditor.editingItem = $(this);
				
				$("#check").val($(this).find(".check").html());
				$("#response").val($(this).find(".response").html());
				
				Navigation.updateEditAddArea();
			}
		});
		
		$("#checklist-items").find(".add").tap(function(e) {
			e.stopPropagation();
			
			var parent = $(this).parent();
			ChecklistEditor.editing = false;
			ChecklistEditor.editingItem = parent;
			
			$("#check").val("");
			$("#response").val("");
			
			Navigation.updateEditAddArea();
		});
		
		$("#checklist-items").find(".handle").punch();
		
		$("#checklist-items").find(".delete").tap(function(e) {
			e.stopPropagation();
			var parent = $(this).parent();
			var holder = parent.find(".holder");
			
			$(this).animate({opacity: 0}, 200, function() {
				$(this).css('display', 'none');
				holder.animate({"left":"5px"}, 200, function() {
					var removedId = parent.attr("data-id");
					var item = MyProducts.getProduct(Navigation.checklist[Navigation.currentChecklistSection].items, removedId);
					var items = _.without(Navigation.checklist[Navigation.currentChecklistSection].items, item);
						parent.remove();
						Navigation.checklist[Navigation.currentChecklistSection].items = items;
				});
			});
		});
	};
}

function Loader(id) {
	this.element = $(id);
	
	this.show = function() {
		this.element.show();
	};
	
	this.hide = function() {
		this.element.hide();
	};
}

function Dialog(element, message, callback) {
	this.element = $(element);
	this.data = this.element.find(".data");
	this.okay = this.element.find(".okay");
	this.callback = callback;
	this.message = message;
	
	var self = this;
	
	this.data.html(message);
	
	this.okay.tap(function(e) {
		self.close();
	});
	
	this.show = function() {
		this.element.show();
	};
	
	this.close = function() {
		this.element.hide();
		
		if(this.callback)
		{
			this.callback();
		}
	};
}

function ConfirmationDialog(element, callback) {
	this.callback = callback;
	this.element = $(element);
	this.closeButton = this.element.find(".close");
	this.yesButton = this.element.find(".yes");
	this.noButton = this.element.find(".no");
	this.innerElement = this.element.find(".content");
	
	var self = this;
	
	this.closeButton.tap(function(e) {
		self.close(false);
	});
	
	this.yesButton.tap(function(e) {
		self.close(true);
	});
	
	this.noButton.tap(function(e) {
		self.close(false);
	});
	
	this.close = function(confirm) {
		this.element.fadeOut(function() {
			if(this.callback)
			{
				this.callback(confirm);
			}
		});
	};
	
	this.show = function() {
		this.element.fadeIn();
	};
	
	this.html = function(data) {
		this.innerElement.html(data);
	};
}

function ImageHandler(itemsToProcess, cacheType, icon) {
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

function ThemeHandler() {
	this.previousTheme = "theme-dark";
	var self = this;
	
	this.apply = function(themeClass) {
		$("." + this.previousTheme).removeClass(this.previousTheme).addClass(themeClass);
		this.previousTheme = themeClass;
	};
	
	
	this.createDashboardItem = function(product) {
		var modelName = (product.model.name != null) ? product.model.name : "";

		var manufacturerName = (product.manufacturer.name != null) ? product.manufacturer.name : "";

		var modelDesc = (product.model.description != null) ? product.model.description : "";
 
		var modelYear = (product.model.modelYear != null) ? product.model.modelYear : "";
 
		var tailNumber = (product.tailNumber != null) ? product.tailNumber : "";

		var html = '<li data-index="' + product.index + '" data-id="' + product._id + '"><div class="plane-icon"><img src="' + product.productIcon + '" /></div><div class="holder"><div class="heading">' + manufacturerName +
        " " + modelName + '</div>' +
            '<div class="subheading">' + modelDesc  + " | " + modelYear + '</div>' +
                '<div class="subheading">' + tailNumber + '</div>' +
						'<ul><li class="product-subarea" data-link="preflight">preflight</li><li class="product-subarea" data-link="takeoff">take-off</li>' +
						'<li class="product-subarea" data-link="landing">landing</li><li class="product-subarea" data-link="emergency">emergency</li></ul>' +
						'</div>' +
						'<div class="delete"><button class="item-delete-button">delete</button></div>' +
						'<div class="handle"><div class="item"></div><div class="item"></div><div class="item"></div></div>' +
						'</li>';
						
		return html;
	};
	
	this.createDownloadItem = function(product, userOwnsProduct) {
        
		var modelName = (product.model.name != null) ? product.model.name : "";

		var manufacturerName = (product.manufacturer.name != null) ? product.manufacturer.name : "";

		var modelDesc = (product.model.description != null) ? product.model.description : "";

		var modelYear = (product.model.modelYear != null) ? product.model.modelYear : "";

		var serialNumber = (product.serialNumber != null) ? product.serialNumber : "";
   
		     
		var html = '<li data-id="' + product._id + '" class="' + userOwnsProduct + '"><div class="plane-icon"><img src="' + product.productIcon + '" /></div><div class="holder"><div class="heading">' + manufacturerName +
        " " + modelName + '</div>' +
            '<div class="subheading">' + modelDesc + " | " +  modelYear + '</div>' +
				'<div class="subheading">' + serialNumber + '</div>' +
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
					'<div class="delete"><button class="item-delete-button">delete</button></div>' +
					'<div class="add"><button class="item-add-button">add</button></div>' +
					'<div class="handle"><div class="item"></div><div class="item"></div><div class="item"></div>' +
					'</li>';
					
		return html;
	};
	
	this.createEmergencySectionItem = function(item) {
		var html = '<li class="span50" data-link="checklist" data-index="' + item.index + '">' +
						'<div class="icon"><img src="' + item.sectionIcon + '" /></div>' +
						'<div class="section-name">' + item.name + '</div>' +
					'</li>';
					
		return html;
	};
	
	this.updateChecklistEditMode = function() {
		if(Checklist.editMode)
		{
			$(".edit-list").addClass("active");
			$("#checklist-items").find(".add").fadeIn();
			$("#checklist-items").find(".handle").fadeIn();
			
		}	
		else
		{
			$(".edit-list").removeClass("active");
			$("#checklist-items").find(".add").fadeOut();
			$("#checklist-items").find(".handle").fadeOut();
		}
	};
	
	this.updateDashboardEditMode = function() {
		if(Checklist.productEditMode)
		{
			$(".edit-check").addClass("active");
			$("#dashboard-planes").find(".handle").fadeIn();
			
		}	
		else
		{
			$(".edit-check").removeClass("active");
			$("#dashboard-planes").find(".handle").fadeOut();
		}
	};
	
	this.clearDeleteStatus = function(items) {
		items.each(function(index, e) {
			var element = $(e);
			var deleteButton = element.find(".delete");
			var holder = element.find(".holder");
			
			deleteButton.fadeOut(function() {
				var parent = $(this).parent();
				holder.animate({"margin-left": "5px"}, 500);
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
				
				var indexItem = listHandler.getByIndex(parseInt(item.attr("data-index")));
				$("#area").html(indexItem.name);
			});
		});
	};
	
	this.addEmergencySectionHandlers = function() {
		$("#emergency-items").children().tap(function(event) {
			var index = parseInt($(this).attr("data-index"));
			Navigation.currentChecklistCategory = "emergency";
			Navigation.currentChecklistSection = index;
			Navigation.autoGo($(this));
		});
	};
	
	this.addDashboardItemHandlers = function() {
		Theme.updateDashboardEditMode();
		MyProducts.listing.children().tap(function(e) {
			e.stopPropagation();
			
			if($(this).find(".delete").css("display") != "none")
			{
				self.clearDeleteStatus($("#checklist-items").children());
			}
			
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
					
					Navigation.go("edittail");
				}
			}
		});
		
		var subItems = MyProducts.listing.find(".product-subarea");
		
		subItems.tap(function(e) {
			if(!Checklist.productEditMode) {
				e.stopPropagation();
				var parent = $(this).parent().parent().parent();
				var dataid = parent.attr("data-id");
				var datalink = $(this).attr("data-link");
				
				Navigation.loadChecklist(dataid);
				Navigation.updateChecklist(datalink);
				
				if(datalink == "emergency")
				{
					Navigation.go("checklist");
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
			
			$(this).fadeOut(function() {
				holder.animate({"margin-left":"5px"}, 500, function() {
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
					
					holder.animate({"margin-left": "75px"}, 500, function() {
						deleteButton.fadeIn();
					});
			
					event.stopPropagation();
				}
			},
			threshold: 20,
			durationThreshold: 500
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
					
					holder.animate({"margin-left": "75px"}, 500, function() {
						deleteButton.fadeIn();
					});
			
					event.stopPropagation();
				}
			},
			threshold: 20,
			durationThreshold: 500
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
				$("#check").blur();
				$("#response").blur();
				
				Navigation.go("editadd");
			}
		});
		
		$("#checklist-items").find(".add").tap(function(e) {
			e.stopPropagation();
			
			var parent = $(this).parent();
			ChecklistEditor.editing = false;
			ChecklistEditor.editingItem = parent;
			
			$("#check").val("");
			$("#response").val("");
			
			Navigation.go("editadd");
		});
		
		$("#checklist-items").find(".handle").punch();
		
		$("#checklist-items").find(".delete").tap(function(e) {
			e.stopPropagation();
			var parent = $(this).parent();
			var holder = parent.find(".holder");
			
			$(this).fadeOut(function() {
				holder.animate({"margin-left":"5px"}, 500, function() {
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
		
		if(self.callback)
		{
			self.callback();
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
		this.element.fadeOut();
			if(self.callback)
			{
				self.callback(confirm);
			}
	};
	
	this.show = function() {
		this.element.fadeIn();
	};
	
	this.html = function(data) {
		this.innerElement.html(data);
	};
}

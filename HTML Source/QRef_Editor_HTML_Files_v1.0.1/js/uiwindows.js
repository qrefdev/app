function ThemeHandler() {
	var self = this;
	this.themes = [{id: "theme-dark"}, {id: "theme-light"}];
	
	this.createChecklistItem = function(item) {
		var html = '<li data-index="' + item.index + '">' +
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
						'<div class="icon"><i class="icon-plane"></i></div>' +
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
		
		$("#checklist-items").find(".delete").tap(function(e) {
			e.stopPropagation();
			var parent = $(this).parent();
			var holder = parent.find(".holder");
			
			$(this).fadeOut(function() {
				holder.animate({"margin-left":"5px"}, 500, function() {
					var removedIndice = parseInt(parent.attr("data-index"))
					Checklist.remove(Navigation.checklist[Navigation.currentChecklistSection].items, removedIndice, function(items) {
						parent.remove();
						Navigation.checklist[Navigation.currentChecklistSection].items = items;
						var indices = new Array();
						$("#checklist-items").children().each(function(index, item) {	
								$(this).attr("data-index", index);
						});
					});
				});
			});
		});
	};
}

function Loader() {
	this.element = $("#loader");
	
	this.show = function() {
		this.element.show();
	}
	
	this.hide = function() {
		this.element.hide();
	}
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
		this.element.fadeIn();
	};
	
	this.close = function() {
		this.element.fadeOut();
		
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
			if(callback)
			{
				callback(confirm);
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

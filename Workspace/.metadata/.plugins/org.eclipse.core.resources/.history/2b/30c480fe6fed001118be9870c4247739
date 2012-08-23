function NavigationHandler() {
	this.checklist = undefined;
	this.currentArea = "dashboard"
	this.product = undefined;
	this.currentChecklistCategory = "preflight";
	this.currentChecklistSection = 0;
	this.currentChecklistSections = new Array();
	this.currentChecklistItems = new Array();
	this.currentEmergency = 0;
	this.previousAreas = new Array();
	
	var self = this;
	
	this.back = function() {
		if(this.previousAreas.length > 0)
		{
			this.currentArea = this.previousAreas.pop();
			this.updateArea();
		}
	};
	
	this.go = function(place, callback) {
		this.previousAreas.push(this.currentArea);
		this.currentArea = place;
		this.updateArea(function() {
			if(callback)
				callback();
		});
	};
	
	this.autoGo = function(sender) {
		if(sender != null) {
			this.previousAreas.push(this.currentArea);
			this.currentArea = sender.attr("data-link");
			this.updateArea();
		};
	};
	
	this.updateChecklist = function(category) {
		if(this.currentChecklistCategory != category)
		{
			this.currentChecklistSection = 0;
		}
		
		this.currentChecklistCategory = category;
		
		this.selectNavButton(category);
		
		if(category == "preflight")
		{
			this.checklist = this.product.aircraftChecklist.preflight;
		}
		else if(category == "takeoff")
		{
			this.checklist = this.product.aircraftChecklist.takeoff;
		}
		else if(category == "landing")
		{
			this.checklist = this.product.aircraftChecklist.landing;
		}
		else if(category == "emergency")
		{
			this.checklist = this.product.aircraftChecklist.emergencies;
		}
		
		this.loadChecklistSections();
		
		this.loadChecklistItems();
	};
	
	this.loadProduct = function(id, callback) {
		this.product = Checklist.getProduct(id);
		
		if(this.product)
		{
			this.currentChecklistSection = 0;
			this.updateChecklist("preflight");
			this.go("checklist", function() {
				if(callback)
					callback();
			});
		}
	};
	
	this.loadChecklistSections = function() {
		var listHandler = new ListItemHandler(this.checklist);
		this.currentChecklistSections = listHandler.sort();
		
		var currentItem = listHandler.getByIndex(this.currentChecklistSection);
		$("#area").html(currentItem.name);
		
		$("#check-sections-items").html("");
		
		var html = "";
		
		for(var i = 0; i < this.currentChecklistSections.length; i++) {
			if(this.currentChecklistSections[i].index == this.currentChecklistSection)
			{
				html += '<li class="active" data-index="' + this.currentChecklistSections[i].index + '">' +
							'<p>' + this.currentChecklistSections[i].name + '</p>' +
						'</li>';
			}
			else
			{
				html += '<li data-index="' + this.currentChecklistSections[i].index + '">' +
							'<p>' + this.currentChecklistSections[i].name + '</p>' +
						'</li>';
			}
		}
		
		$("#check-sections-items").html(html);
		
		this.addSectionHandlers(listHandler);
	};
	
	this.addSectionHandlers = function(listHandler) {
		$(".check-sections").swipe("resetScroll");
		$("#check-sections-items").children().click(function(e) {
			e.stopPropagation();
			
			var item = $(this);
			
			$(".check-sections").fadeOut(function() {
				self.currentChecklistSection = parseInt(item.attr("data-index"));
				self.updateChecklist(self.currentChecklistCategory);
				
				var indexItem = listHandler.getByIndex(parseInt(item.attr("data-index")));
				$("#area").html(indexItem.name);
			});
		});
	};
	
	this.loadChecklistItems = function() {
		if(this.checklist)
		{
			this.currentChecklistItems = (new ListItemHandler(this.checklist[this.currentChecklistSection].items)).sort();
			
			$("#checklist-items").html("");
			
			var html = "";
			
			for(var i = 0; i < this.currentChecklistItems.length; i++)
			{
				var item = this.currentChecklistItems[i];
				html += '<li data-index="' + item.index + '">' +
					'<div class="icon"><i class="' + item.icon + '"></i></div>' +
					'<div class="holder">' +
						'<div class="check">' + item.check + '</div>' +
						'<div class="response">' + item.response + '</div>' +
					'</div>' +
					'<div class="delete"><button class="item-delete-button">delete</button></div>' +
					'</li>';
			}
			
			$("#checklist-items").html(html);
			this.addChecklistItemHandlers();
		}
	};
	
	this.selectNavButton = function(category) {
		var navlist = $(".nav ul");
		navlist.children().removeClass("active");
		navlist.children().each(function(index, item) {
			if($(item).attr("data-link") == category)
				$(item).addClass("active");
		});
	};
	
	this.clearDeleteStatus = function(items) {
		items.each(function(index, e) {
			var element = $(e);
			var deleteButton = element.find(".delete");
			var holder = element.find(".holder");
			
			deleteButton.fadeOut(function() {
				holder.animate({"margin-left": "5px"}, 500);
			});
		});
	};
	
	this.addChecklistItemHandlers = function() {
		$("#checklist-items").children().swipe({
			swipeRight: function(event) {
				var deleteButton = $(this).find(".delete");
				var holder = $(this).find(".holder");
				
				holder.animate({"margin-left": "75px"}, 500, function() {
					deleteButton.fadeIn();
				});
				
				event.cancelBubble = true;
				event.stopPropagation();
			},
			threshold: 20
		});
		
		$("#checklist-items").children().click(function(e) {
			e.stopPropagation();
			self.clearDeleteStatus($("#checklist-items").children());
		});
		
		$("#checklist-items").find(".delete").click(function(e) {
			e.stopPropagation();
			var parent = $(this).parent();
			var holder = parent.find(".holder");
			
			$(this).fadeOut(function() {
				holder.animate({"margin-left":"5px"}, 500);
			});
		});
	};
	
	this.updateArea = function(callback) {
		if(this.currentArea == "dashboard")
		{
			Checklist.load(function(status) {
				if(status == Checklist.commands.CACHELOADED || status == Checklist.commands.ONLINELOADEDAFTERCACHE || status == Checklist.commands.ONLINEONLYLOADED)
				{
					MyProducts.reset();
					MyProducts.populate();
				}
			});
		
			$("#signin").fadeOut();
			$("#register").fadeOut();
			$("#checklist").fadeOut();
			$("#checklist-nav").fadeOut();
			$("#dashboard").fadeIn(function() {
				if(callback)
					callback();
			});
		}
		else if(this.currentArea == "signin")
		{
			$("#dashboard").fadeOut();
			$("#register").fadeOut();
			$("#checklist").fadeOut();
			$("#checklist-nav").fadeOut();
			$("#signin").fadeIn(function() {
				if(callback)
					callback();
			});
		}
		else if(this.currentArea == "register")
		{
			$("#dashboard").fadeOut();
			$("#register").fadeOut();
			$("#signin").fadeOut();
			$("#checklist").fadeOut();
			$("#checklist-nav").fadeOut();
			$("#register").fadeIn(function() {
				if(callback)
					callback();
			});
		}
		else if(this.currentArea == "checklist")
		{
			$("#dashboard").fadeOut();
			$("#register").fadeOut();
			$("#signin").fadeOut();
			$("#register").fadeOut();
			$("#checklist").fadeIn(function() {
				if(callback)
					callback();
			});
			$("#checklist-nav").fadeIn();
		}
	};

	this.initNavBars = function() {
		$(".nav ul").children().click(function() {
			$(".nav ul").children().removeClass("active");
			$(this).addClass("active");
				Navigation.updateChecklist($(this).attr("data-link"));
		});
		
		$(".back").click(function() {
			Navigation.back();
		});
		
		$(".topmenu").click(function() {
			$("#menu").toggle();
		});
		
		$(".menu ul").children().click(function() {
			var item = $(this);
			Navigation.autoGo(item);
			$("#menu").fadeOut();
		});
		
		$(".sections").click(function(e) {
			$(".check-sections").toggle();
		});
		
		$(".check-sections").swipe({
			swipeUp: function() {
				return true;
			},
			swipeDown: function() {
				return true;
			},
			threshold: 5
		});
	};
	
	this.init = function() {
		this.initNavBars();
		
		/*$("#checklist-emergency-items").sortable({
			handle: ".handle",
			scroll: true,
			axis: "y"	
		});
		$("#checklist-emergency-items").disableSelection();
		$("#checklist-emergency-items").bind("sortstop", function(event, ui) {
			
			var currentCheckList = Navigation.getCheckList();
			Navigation.setCheckList(CheckLists.updateIndices(currentCheckList, CheckLists.getIndices()));
			
		});
		$( "#checklist-items" ).sortable({
			handle: ".handle",
			scroll: true,
			axis: "y"	
		});
		$( "#checklist-items" ).disableSelection();
		<!-- Refresh list to the end of sort to have a correct display -->
		$( "#checklist-items" ).bind( "sortstop", function(event, ui) {
			$('#checklist-items').listview('refresh');
		  
			var currentCheckList = Navigation.getCheckList();
			Navigation.setCheckList(CheckLists.updateIndices(currentCheckList, CheckLists.getIndices()));
		});*/
	};
}

function NavigationHandler() {
	this.checklist = undefined;
	this.product = undefined;
	this.currentArea = "dashboard"
	this.currentChecklistCategory = "preflight";
	this.previousChecklistCategory = "preflight"; 
	this.currentChecklistSection = 0;
	this.currentChecklistSections = new Array();
	this.currentChecklistItems = new Array();
	this.previousAreas = new Array();
	this.previousArea = "";
	
	var self = this;
	
	this.back = function() {
		if(this.previousAreas.length > 0)
		{
			this.previousArea = this.currentArea;
			this.currentArea = this.previousAreas.pop();
			this.updateArea();
		}
	};
	
	this.go = function(place, callback) {
		this.previousArea = "";
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
			this.checklist = this.product.preflight;
		}
		else if(category == "takeoff")
		{
			this.checklist = this.product.takeoff;
		}
		else if(category == "landing")
		{
			this.checklist = this.product.landing;
		}
		else if(category == "emergency")
		{
			this.checklist = this.product.emergencies;
		}
		
		this.loadChecklistSections();
		
		this.loadChecklistItems();
	};
	
	this.loadChecklist = function(id, callback) {
		this.product = MyProducts.getProduct(Checklist.checklists, id);
		
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
		
		if(currentItem)
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
		
		Theme.addSectionHandlers(listHandler);
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
				html += Theme.createChecklistItem(item);
			}
			
			$("#checklist-items").html(html);
			Theme.addChecklistItemHandlers();
		}
	};
	
	this.loadEmergencySections = function() {
		if(this.checklist)
		{
			this.selectNavButton("emergency");
			$("#emergency-items").html("");
			
			var html = "";
			
			for(var i = 0; i < this.checklist.length; i++)
			{
				var item = this.checklist[i];
				
				if(item.items.length > 0)
					html += Theme.createEmergencySectionItem(item);
			}
			
			$("#emergency-items").html(html);
			Theme.addEmergencySectionHandlers();
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
	
	this.updateArea = function(callback) {
		if(this.currentArea == "dashboard")
		{
			this.previousAreas = new Array();
		
			Checklist.load(function(status) {
				if(status)
				{
					MyProducts.populate();
				}
			});
		
			$("#signin").fadeOut();
			$("#register").fadeOut();
			$("#checklist").fadeOut();
			$("#editadd").fadeOut();
			$("#checklist-nav").fadeOut();
			$("#emergencies").fadeOut();
			$("#downloads").fadeOut();
			$("#download-details").fadeOut();
			$("#dashboard").fadeIn(function() {
				if(callback)
					callback();
			});
		}
		else if(this.currentArea == "download")
		{
			MyProducts.loadUserProducts(function(success) {
				if(success)
				{
					MyProducts.loadAllProducts(function(success) {
						if(success)
						{
							MyProducts.populateDownloads();
						
							$("#signin").fadeOut();
							$("#register").fadeOut();
							$("#checklist").fadeOut();
							$("#editadd").fadeOut();
							$("#checklist-nav").fadeOut();
							$("#dashboard").fadeOut();
							$("#download-details").fadeOut();
							$("#emergencies").fadeOut();
							$("#downloads").fadeIn(function() {
								if(callback)
									callback();
							});
						}
						else
						{
							var dialog = new Dialog("#infobox", "Cannot connect to server.");
							dialog.show();
						}
					});
				}
				else
				{
					var dialog = new Dialog("#infobox", "Cannot connect to server.");
					dialog.show();
				}
			});
		}
		else if(this.currentArea == "emergency")
		{
			Navigation.updateChecklist("emergency");
			Navigation.loadEmergencySections();
		
			$("#signin").fadeOut();
			$("#register").fadeOut();
			$("#checklist").fadeOut();
			$("#editadd").fadeOut();
			$("#checklist-nav").fadeIn();
			$("#dashboard").fadeOut();
			$("#downloads").fadeOut();
			$("#download-details").fadeOut();
			$("#emergencies").fadeIn(function() {
				if(callback)
					callback();
			});
		}
		else if(this.currentArea == "editadd")
		{
			$("#dashboard").fadeOut();
			$("#register").fadeOut();
			$("#checklist").fadeOut();
			$("#checklist-nav").fadeOut();
			$("#signin").fadeOut();
			$("#emergencies").fadeOut();
			$("#downloads").fadeOut();
			$("#download-details").fadeOut();
			$("#editadd").fadeIn(function() {
				if(callback)
					callback();
			});
		}
		else if(this.currentArea == "signin")
		{
			$("#dashboard").fadeOut();
			$("#register").fadeOut();
			$("#checklist").fadeOut();
			$("#editadd").fadeOut();
			$("#emergencies").fadeOut();
			$("#checklist-nav").fadeOut();
			$("#downloads").fadeOut();
			$("#download-details").fadeOut();
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
			$("#editadd").fadeOut();
			$("#emergencies").fadeOut();
			$("#checklist-nav").fadeOut();
			$("#downloads").fadeOut();
			$("#download-details").fadeOut();
			$("#register").fadeIn(function() {
				if(callback)
					callback();
			});
		}
		else if(this.currentArea == "checklist")
		{
			if(this.previousArea == "emergency")
				this.updateChecklist(this.previousChecklistCategory);
			else
				this.updateChecklist(this.currentChecklistCategory);
			
			$("#dashboard").fadeOut();
			$("#register").fadeOut();
			$("#signin").fadeOut();
			$("#editadd").fadeOut();
			$("#register").fadeOut();
			$("#emergencies").fadeOut();
			$("#downloads").fadeOut();
			$("#download-details").fadeOut();
			$("#checklist").fadeIn(function() {
				if(callback)
					callback();
			});
			$("#checklist-nav").fadeIn();
		}
	};

	this.initNavBars = function() {
		$(".checklistnav ul").children().tap(function(e) {
			$(".checklistnav ul").children().removeClass("active");
			$(this).addClass("active");
			if($(this).attr("data-link") == "emergency" && Navigation.currentChecklistCategory != "emergency")
			{
				Navigation.currentChecklistCategory == "emergency";
				Navigation.go("emergency");
			}
			else
			{
				if(Navigation.currentArea == "emergency")
				{
					Navigation.back();
				}
				
				Navigation.previousChecklistCategory = $(this).attr("data-link");
				Navigation.updateChecklist($(this).attr("data-link"));
			}
		});
		
		$(".back").tap(function(e) {
			Navigation.back();
		});
		
		$(".topmenu").tap(function(e) {
			$("#menu").toggle();
		});
		
		$(".dashnav ul").children().tap(function(e) {
			var item = $(this);
			Navigation.autoGo(item);
		});
		
		$(".menu ul").children().tap(function(e) {
			var item = $(this);
			Navigation.autoGo(item);
			$("#menu").fadeOut();
		});
		
		$(".sections").tap(function(e) {
			$(".check-sections").toggle();
		});
	};
	
	this.init = function() {
		this.initNavBars();
		
		$(".check-sections").touchScroll({ 
			threshold: 200,
			direction: "vertical"
		});
		
		$(".check-sections").mouseScroll({
			scrollAmount: 2,
			direction: "vertical"
		});
		
		$(".checklist").touchScroll({
			threshold: 200,
			direction: "vertical",
			onBeforeScroll: function(event) {
				if(Checklist.editMode && Checklist.isSorting)
				{
					$(".checklist").touchScroll("disableScroll");
					//$(this).touchScroll("disableScroll");
				}
				else
				{
					$(".checklist").touchScroll("enableScroll");
					//$(this).touchScroll("enableScroll");
				}
			}
		});
		
		$(".checklist").mouseScroll({
			scrollAmount: 2,
			direction: "vertical"
		});
		
		$(".edit-check").tap(function(e) {
			Checklist.productEditMode = !Checklist.productEditMode;
			Theme.updateDashboardEditMode();
		});
		
		$(".edit-list").tap(function(e) {
			Checklist.editMode = !Checklist.editMode
			Theme.updateChecklistEditMode();
		});
		
		$( "#checklist-items" ).sortable({
			handle: ".handle",
			scroll: true,
			axis: "y",
			stop: function(event, ui) {
				Checklist.isSorting = false;
				var indices = new Array();
				$("#checklist-items").children().each(function(index, item) {
					var original = parseInt($(this).attr("data-index"));
					 
					if( original != index)
					{
						indices.push({original: original, index: index});	
						$(this).attr("data-index", index);
					}
				});
			
				if(indices.length > 0)
					Navigation.checklist[Navigation.currentChecklistSection].items = Checklist.reindex(Navigation.checklist[Navigation.currentChecklistSection].items, indices);
			},
			start: function(event, ui) {
				Checklist.isSorting = true;
			}
		});
		$( "#checklist-items" ).disableSelection();
		
		$( "#dashboard-planes" ).sortable({
			handle: ".handle",
			scroll: true,
			axis: "y",
			stop: function(event, ui) {
				Checklist.isSorting = false;
			},
			start: function(event, ui) {
				Checklist.isSorting = true;
			}	
		});
		$( "#dashboard-planes" ).disableSelection();
	};
}

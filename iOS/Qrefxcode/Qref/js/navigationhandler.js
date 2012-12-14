function NavigationHandler() {
	this.simpleNavigation = new SimpleNavigationHandler();
	this.checklist = undefined;
	this.product = undefined;
	this.currentChecklistCategory = "preflight";
	this.previousChecklistCategory = "preflight"; 
	this.currentChecklistSection = 0;
	this.currentChecklistSections = new Array();
	this.currentChecklistItems = new Array();
	
	var self = this;
	
	this.back = function() {
		this.simpleNavigation.back();
	};
	
	this.go = function(place) {
		this.simpleNavigation.go(place);
	};
	
	this.autoGo = function(sender) {
		this.simpleNavigation.autoGo(sender);
	};
	
	this.hideOtherPages = function(id) {
		$(".page").each(function() {
			var item = $(this);
			
			var itemId = item.attr("id");
			
			if(itemId != id && itemId != undefined)
				item.fadeOut();
		});
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
	
	this.loadChecklist = function(id) {
		this.product = MyProducts.getProduct(Checklist.checklists, id);
		
		if(this.product)
		{
			this.currentChecklistSection = 0;
			this.updateChecklist("preflight");
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
				html = '<li class="active" data-index="' + this.currentChecklistSections[i].index + '">' +
							'<p>' + this.currentChecklistSections[i].name + '</p>' +
						'</li>';
			}
			else
			{
				html = '<li data-index="' + this.currentChecklistSections[i].index + '">' +
							'<p>' + this.currentChecklistSections[i].name + '</p>' +
						'</li>';
			}
            
            
            $("#check-sections-items").append(html);
		}
		
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
				html = Theme.createChecklistItem(item);
                
                $("#checklist-items").append(html);
			}

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
					html = Theme.createEmergencySectionItem(item);
                
                if(html != "")
                    $("#emergency-items").append(html);
			}
			
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
	
	this.updateE6BArea = function() {
		self.hideOtherPages("e6bconversions");
		$("#checklist-nav").fadeOut();
		$("#e6bconversions").fadeIn();
	};
	
	this.updateE6BConversionsArea = function() {
		self.hideOtherPages("e6bconversions");
		$("#checklist-nav").fadeOut();
		$("#e6bconversions").fadeIn();
	};
	
	this.updateDashboardArea = function() {
			self.simpleNavigation.clearHistory();
		
			Checklist.load(function(status) {
					MyProducts.populate();
			});
		
			self.hideOtherPages("dashboard");
			$("#checklist-nav").fadeOut();
			$("#dashboard").fadeIn();
	};
	
	this.updateDownloadArea = function() {
		MyProducts.loadUserProducts(function(succ) {
			if(succ == true)
			{
				MyProducts.loadAllProducts(function(succ) {
					if(succ == true)
					{
						MyProducts.populateDownloads();
					
						self.hideOtherPages("downloads");
						$("#checklist-nav").fadeOut();
						$("#downloads").fadeIn();
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
				var dialog = new Dialog("#infobox", "You must be signed in to access the store.");
				dialog.show();
			}
		});
	};
	
	this.updateEmergenciesArea = function() {

			Navigation.updateChecklist("emergency");
			Navigation.loadEmergencySections();
		
			self.hideOtherPages("emergencies");
			$("#checklist-nav").fadeIn(function() {
				self.selectNavButton("emergency");
			});
			$("#emergencies").fadeIn();
	};
	
	this.updateEditAddArea = function() {
			self.hideOtherPages("editadd");
			$("#checklist-nav").fadeOut();
			$("#editadd").fadeIn();
	};
	
	this.updateSignoutArea = function() {
			self.simpleNavigation.currentArea = self.simpleNavigation.previousAreas.pop();
			
			Authentication.signOut();
	};
	
	this.updateSyncArea = function() {
		self.simpleNavigation.currentArea = self.simpleNavigation.previousAreas.pop();
		
		syncLoader.show();
		
        setTimeout(function() {
            Sync.sync();
        }, 300);
	};
	
	this.updateSigninArea = function() {
			self.hideOtherPages("signin");
			$("#checklist-nav").fadeOut();
			$("#signin").fadeIn();
	};
		
	this.updateRegisterArea = function() {
			self.hideOtherPages("register");
			$("#checklist-nav").fadeOut();
			$("#register").fadeIn();
	};
	this.updateChecklistArea = function() {
			if(self.simpleNavigation.previousArea == "emergency")
				self.updateChecklist(self.previousChecklistCategory);
			else
				self.updateChecklist(self.currentChecklistCategory);
			
			self.hideOtherPages("checklist");
			$("#checklist").fadeIn();
			$("#checklist-nav").fadeIn();
	};
	this.updateEditTailArea = function() {
			self.hideOtherPages("edittail");
			$("#checklist-nav").fadeOut();
			$("#edittail").fadeIn();
	};
	this.updateDownloadDetailsArea = function() {
			self.hideOtherPages("productdetails");
			$("#checklist-nav").fadeOut();
			$("#productdetails").fadeIn();
	};

	this.updateSettingsArea = function() {
		self.hideOtherPages("settings");
		$("#checklist-nav").fadeOut();
		
		SettingsEditor.updateSettingsView();
		
		$("#settings").fadeIn();
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
				if(Navigation.simpleNavigation.currentArea == "emergency")
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
			if($(".menu").hasClass("slided"))
            {
                $(".page").animate({left:"0px"});
                $(".menu").animate({right:"-150px"}).removeClass("slided");
            }
            else
            {
                $(".page").animate({left:"-70px"});
                $(".menu").animate({right:"-5px"}).addClass("slided");
            }
		});
		
		$(".dashnav ul").children().tap(function(e) {
			var item = $(this);
			Navigation.autoGo(item);
		});
		
		$(".menu ul").children().tap(function(e) {
			var item = $(this);
			Navigation.autoGo(item);
            $(".page").animate({left:"0px"});
            $(".menu").animate({right:"-150px"}).removeClass("slided");
		});
		
		$(".sections").tap(function(e) {
			$(".check-sections").toggle();
		});
		
		$("#e6bList").children().tap(function(e) {
			self.autoGo($(this));
		});
	};
	
	this.initLocations = function() {
		this.simpleNavigation.add("dashboard", self.updateDashboardArea);
		this.simpleNavigation.add("download", self.updateDownloadArea);
		this.simpleNavigation.add("emergency", self.updateEmergenciesArea);
		this.simpleNavigation.add("editadd", self.updateEditAddArea);
		this.simpleNavigation.add("checklist", self.updateChecklistArea);
		this.simpleNavigation.add("edittail", self.updateEditTailArea);
		this.simpleNavigation.add("download-details", self.updateDownloadDetailsArea);
		this.simpleNavigation.add("signout", self.updateSignoutArea);
		this.simpleNavigation.add("register", self.updateRegisterArea);
		this.simpleNavigation.add("signin", self.updateSigninArea);
		this.simpleNavigation.add("e6b", self.updateE6BArea);
		this.simpleNavigation.add("conversions", self.updateE6BConversionsArea);
		this.simpleNavigation.add("settings", self.updateSettingsArea);
		this.simpleNavigation.add("sync", self.updateSyncArea);
	};
	
	this.init = function() {
		this.initNavBars();
		this.initLocations();
        
        $("button").each(function() {
            if($(this).attr("data-link"))
            {
                $(this).tap(function(e) {
                    Navigation.autoGo($(this));
                })
            }
        });
		
		/*$(".scrollable").touchScroll({
			direction: "vertical",
			threshold: 200,
			onBeforeScroll: function(e) {
				if(Checklist.isSorting)
				{
					$(this).touchScroll("disableScroll");
				}
				else
				{
					$(this).touchScroll("enableScroll");
				}
			}
		});
		
		$(".scrollable").mouseScroll({
			direction: "vertical",
			scrollAmount: 4
		});
		*/
		
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
					var id = $(this).attr("data-id");
					 
					indices.push({id: id, index: index});	
					$(this).attr("data-index", index);
				});
			
				if(indices.length > 0)
					Navigation.checklist[Navigation.currentChecklistSection].items = Checklist.reindex(Navigation.checklist[Navigation.currentChecklistSection].items, indices);
			
				Sync.syncToPhone();
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
				var indices = new Array();
				$("#dashboard-planes").children().each(function(index, item) {
					var id = $(this).attr("data-id");

						indices.push({id: id, index: index});	
						$(this).attr("data-index", index);
				
				});
			
				if(indices.length > 0)
					Checklist.checklists = Checklist.reindex(Checklist.checklists, indices);

				Sync.syncToPhone();
			},
			start: function(event, ui) {
				Checklist.isSorting = true;
			}	
		});
		$( "#dashboard-planes" ).disableSelection();
	};
}

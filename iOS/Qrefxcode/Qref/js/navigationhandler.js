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
		if($("#editadd").css('display') != 'none') {
			$("#editadd").animate({left: '-100%'}, 250, function(e) {
					$("#editadd").hide();
			});
		}
		else if($("#edittail").css('display') != 'none') {
			$("#edittail").animate({left: '-100%'}, 250, function(e) {
					$("#edittail").hide();
			});
		}
		else {
			this.simpleNavigation.back();
		}
	};
	
	this.go = function(place) {
		var self = this;
		
		if($("#editadd").css('display') != 'none') {
			$("#editadd").animate({left: '-100%'}, 250, function(e) {
					$("#editadd").hide();
					self.simpleNavigation.go(place);
			});
		}
		else if($("#edittail").css('display') != 'none') {
			$("#edittail").animate({left: '-100%'}, 250, function(e) {
					$("#edittail").hide();
					self.simpleNavigation.go(place);
			});
		}
		else {
			this.simpleNavigation.go(place);
		}
	};
	
	this.autoGo = function(sender) {
		var self = this;
		if($("#editadd").css('display') != 'none') {
			$("#editadd").animate({left: '-100%'}, 250, function(e) {
					$("#editadd").hide();
					self.simpleNavigation.autoGo(sender);
			});
		}
		else if($("#edittail").css('display') != 'none') {
			$("#edittail").animate({left: '-100%'}, 250, function(e) {
					$("#edittail").hide();
					self.simpleNavigation.autoGo(sender);
			});
		}
		else {
			this.simpleNavigation.autoGo(sender);
		}
	};
	
	this.hideOtherPages = function(id, hide) {
		$(".page").hide();
	};
	
	this.updateChecklist = function(cat) {
		var category = cat;
		if(this.currentChecklistCategory != category)
		{
			this.currentChecklistSection = 0;
		}
		
		if(category == 'last') {
			if(ChecklistLast.containsKey(this.product._id)) {
				var lp = ChecklistLast.get(this.product._id);
				
				category = lp.category;
				this.currentChecklistSection = lp.section;
			} else {
				category = "preflight";
			}
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
		
		var lastPosition = {category: category, section: -1};
		lastPosition.section = this.currentChecklistSection;
		ChecklistLast.set(this.product._id, lastPosition);
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
			
			var count = 0;
			for(var i = 0; i < this.checklist.length; i++)
			{
				if(count == 0) {
					html += '<li><ul>';
				}
				else if(count == 2) {
					html += '</ul></li>';
					count = 0;
					
					if(html != "")
                    	$("#emergency-items").append(html);
                    
                    html = '<li><ul>';
				}
				
				var item = this.checklist[i];
				
				if(item.items.length > 0)
					html += Theme.createEmergencySectionItem(item);
                
                if(count == 1 && i == this.checklist.length - 1) {
                	html += '</ul></li>';
                	
                	if(html != "")
                    	$("#emergency-items").append(html);
                    	
                    count = 0;
                }
                
                count++;
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
		$("#checklist-nav").fadeOut(200);
		$("#e6bconversions").fadeIn(200);
	};
	
	this.updateE6BConversionsArea = function() {
		self.hideOtherPages("e6bconversions");
		$("#checklist-nav").fadeOut(200);
		$("#e6bconversions").fadeIn(200);
	};
	
	this.updateDashboardArea = function() {
			loader.show();
			self.simpleNavigation.clearHistory();
		
			Checklist.load(function(status) {
					MyProducts.populate();
					Authentication.verify();
					loader.hide();
			});
		
			self.hideOtherPages("dashboard", true);
			$("#checklist-nav").fadeOut(200);
			$("#dashboard").show();
	};
	
	this.updateDownloadArea = function() {
		loader.show();
		MyProducts.loadUserProducts(function(succ) {
			if(succ == true)
			{
				MyProducts.loadAllProducts(function(succ) {
					if(succ == true)
					{
						MyProducts.populateDownloads();
					
						self.hideOtherPages("downloads", true);
						$("#checklist-nav").hide();
						$("#downloads").show();
						loader.hide();
					}
					else
					{
						var dialog = new Dialog("#infobox", "Cannot connect to server.");
						dialog.show();
						loader.hide();
					}
				});
			}
			else
			{
				var dialog = new Dialog("#infobox", "You must be signed in to access the store.");
				dialog.show();
				loader.hide();
			}
		});
	};
	
	this.updateEmergenciesArea = function() {
		Navigation.updateChecklist("emergency");
		Navigation.loadEmergencySections();
	
		self.hideOtherPages("emergencies");
		$("#checklist-nav").fadeIn(200);
		self.selectNavButton("emergency");
		$("#emergencies").show();
	};
	
	this.updateEditAddArea = function() {
		$("#editadd").css({left: '-100%'});
		$("#editadd").show();
		$("#editadd").animate({left: '0%'}, 250);
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
			$("#checklist-nav").fadeOut(200);
			$("#signin").fadeIn(200);
	};
		
	this.updateRegisterArea = function() {
			self.hideOtherPages("register");
			$("#checklist-nav").fadeOut(200);
			$("#register").fadeIn(200);
	};
	this.updateChecklistArea = function() {
			if(self.simpleNavigation.previousArea == "emergency")
				self.updateChecklist(self.previousChecklistCategory);
			else
				self.updateChecklist(self.currentChecklistCategory);
			
			self.hideOtherPages("checklist", true);
			$("#checklist").show();
			$("#checklist-nav").fadeIn(200);
	};
	this.updateEditTailArea = function() {
		$("#edittail").css({left: '-100%'});
		$("#edittail").show();
		$("#edittail").animate({left: '0%'}, 250);
	};
	this.updateDownloadDetailsArea = function() {
			self.hideOtherPages("productdetails");
			$("#checklist-nav").fadeOut(200);
			$("#productdetails").fadeIn(200);
	};

	this.updateSettingsArea = function() {
		self.hideOtherPages("settings");
		$("#checklist-nav").fadeOut(200);
		
		SettingsEditor.updateSettingsView();
		
		$("#settings").fadeIn(200);
	};
	
	this.updateChangePasswordArea = function() {
		self.hideOtherPages("changePassword");
		$("#checklist-nav").fadeOut(200);
		$("#changePassword").fadeIn(200);
	};
	
	this.updatePasswordRecoveryArea = function() {
		self.hideOtherPages("passwordRecovery");
		$("#checklist-nav").fadeOut(200);
		$("#passwordRecovery").fadeIn(200);
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
			else if($(this).attr("data-link") == "emergency" && Navigation.currentChecklistCategory == "emergency") {
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
		
		$(window).swipe({
			swipeRight: function(event, duration) {
				if($(".menu").hasClass("slided")) {
					$(".page").animate({left:"0px"});
					$(".checklistnav").animate({left:"0px"});
					$(".menu").animate({right:"-300px"}, function(e) {
						$(".menu").hide();
					}).removeClass("slided");
				}
			},
			swipeLeft: function(event, duration) {
				if(!$(".menu").hasClass("slided")) {
					$(".menu").show();
					$(".page").animate({left:"-245px"});
					$(".checklistnav").animate({left:"-245px"});
					$(".menu").animate({right:"-5px"}).addClass("slided");
				}
			},
			threshold: 100,
			durationThreshold: 265
		});
		
		$(".topmenu").tap(function(e) {
			if($(".menu").hasClass("slided"))
            {
                $(".page").animate({left:"0px"});
				$(".checklistnav").animate({left:"0px"});
				$(".menu").animate({right:"-300px"}, function(e) {
					$(".menu").hide();
				}).removeClass("slided");
            }
            else
            {
            	$(".menu").show();
				$(".page").animate({left:"-245px"});
				$(".checklistnav").animate({left:"-245px"});
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
			$(".checklistnav").animate({left:"0px"});
			$(".menu").animate({right:"-300px"}, function(e) {
				$(".menu").hide();
			}).removeClass("slided");
		});
		
		$(".check-sections").hide();
		
		$(".sections").tap(function(e) {
			if($(".check-sections").css("display") == 'none') {
				$(".check-sections").show();
				var anim = new Animation($(".check-sections"), 'fadeIn');
				anim.start();
			}
			else {
				var anim2 = new Animation($(".check-sections"), 'fadeOut', function(e) {
					$(".check-sections").hide();
				});
				anim2.start();
			}
		});
		
		$(".available-conversions").hide();
		
		$(".conversions").tap(function(e) {
			if($(".available-conversions").css("display") == 'none') {
				$(".available-conversions").show();
				var anim = new Animation($(".available-conversions"), 'fadeIn');
				anim.start();
			}
			else {
				var anim2 = new Animation($(".available-conversions"), 'fadeOut', function(e) {
					$(".available-conversions").hide();
				});
				anim2.start();
			}
		});
		
		$("#e6bList").children().tap(function(e) {
			self.autoGo($(this));
		});
		
		$(".submit").tap(function(e) {
			$(this).closest('form').submit();
		});
		
		$("#editadd").swipe({
			swipeLeft: function(event, duration) {
				$("#editadd").animate({left: '-100%'}, 250, function(e) {
					$("#editadd").hide();
				});
			},
			threshold: 50,
			durationThreshold: 265
		});
		
		$("#edittail").swipe({
			swipeLeft: function(event, duration) {
				$("#edittail").animate({left: '-100%'}, 250, function(e) {
					$("#edittail").hide();
				});
			},
			threshold: 50,
			durationThreshold: 265
		});
	};
	
	this.initLocations = function() {
		this.simpleNavigation.add("dashboard", self.updateDashboardArea);
		this.simpleNavigation.add("download", self.updateDownloadArea);
		this.simpleNavigation.add("emergency", self.updateEmergenciesArea);
		this.simpleNavigation.add("checklist", self.updateChecklistArea);
		this.simpleNavigation.add("download-details", self.updateDownloadDetailsArea);
		this.simpleNavigation.add("signout", self.updateSignoutArea);
		this.simpleNavigation.add("register", self.updateRegisterArea);
		this.simpleNavigation.add("signin", self.updateSigninArea);
		this.simpleNavigation.add("e6b", self.updateE6BArea);
		this.simpleNavigation.add("conversions", self.updateE6BConversionsArea);
		this.simpleNavigation.add("settings", self.updateSettingsArea);
		this.simpleNavigation.add("sync", self.updateSyncArea);
		this.simpleNavigation.add("changePassword", self.updateChangePasswordArea);
		this.simpleNavigation.add("passwordRecovery", self.updatePasswordRecoveryArea);
	};
	
	this.init = function() {
		this.initNavBars();
		this.initLocations();
        
        $("button,.button").each(function() {
            if($(this).attr("data-link"))
            {
                $(this).tap(function(e) {
                    Navigation.autoGo($(this));
                });
            }
        });
        
        $("a").each(function() {
        	if($(this).attr("data-link"))
        	{
        		$(this).tap(function(e) {
        			Navigation.autoGo($(this));
        		});
        	}
        });
		
		$(".edit-check").tap(function(e) {
			Checklist.productEditMode = !Checklist.productEditMode;
			Theme.updateDashboardEditMode();
		});
		
		$(".edit-list").tap(function(e) {
			Checklist.editMode = !Checklist.editMode
			Theme.updateChecklistEditMode();
		});
		
		$(".scrollable").touchScroll({
			direction: "vertical",
			threshold: 25,
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

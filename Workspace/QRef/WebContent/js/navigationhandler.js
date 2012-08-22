function NavigationHandler() {
	this.qref = undefined;
	this.currentArea = "dashboard"
	this.currentCheckListCategory = "preflight";
	this.previousCheckListCategory = "preflight";
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
	
	this.go = function(place) {
		this.previousAreas.push(this.currentArea);
		this.currentArea = place;
		this.updateArea();
	};
	
	this.autoGo = function(sender) {
		if(sender != null) {
			this.previousAreas.push(this.currentArea);
			this.currentArea = sender.attr("data-link");
			this.updateArea();
		};
	};
	
	this.updateArea = function() {
		if(this.currentArea == "dashboard")
		{
			Checklist.load(function(status) {
				if(status == Checklist.commands.CACHELOADED || status == Checklist.commands.ONLINELOADEDAFTERCACHE || status == Checklist.commands.ONLINEONLYLOADED)
				{
					MyProducts.reset();
					MyProducts.populate();
				}
			});
		
			$("#intro").fadeOut();
			$("#signin").fadeOut();
			$("#register").fadeOut();
			$("#dashboard").fadeIn();
		}
		else if(this.currentArea == "signin")
		{
			$("#intro").fadeOut();
			$("#dashboard").fadeOut();
			$("#register").fadeOut();
			$("#signin").fadeIn();
		}
		else if(this.currentArea == "register")
		{
			$("#intro").fadeOut();
			$("#dashboard").fadeOut();
			$("#register").fadeOut();
			$("#signin").fadeOut();
			$("#register").fadeIn();
		}
	};

	this.initNavBars = function() {
		$(".nav ul").children().click(function() {
				Navigation.autoGo($(this));
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

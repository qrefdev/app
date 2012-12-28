var shifted = false;
var alted = false;
var firstSelectedIndex = -1;

$(window).load(function() {

	//Start Shift-MultiSelect Functionality
	$(window).keydown(function(e) {
		if(e.which == 16)
		{
			shifted = true;
		}
	});
	
	$(window).keyup(function(e) {
		if(e.which == 16)
		{
			shifted = false;
		}
	});
	
	$(window).keydown(function(e) {
		if(e.altKey == true)
		{
			alted = true;
		}
	});
	
	$(window).keyup(function(e) {
		if(e.altKey == true)
		{
			alted = false;
		}
	});
});

function AddMultiSelect(item)
{
	var children = item.parent().children();
	item.toggleClass('ui-selected');
	
	if(alted) {
		item.removeClass("ui-selected");
		var currentIndex = index(item[0].parentNode, item[0]);
		
		if(currentIndex < firstSelectedIndex)
		{
			for(var i = firstSelectedIndex; i > currentIndex; i--)
			{
				
				$(children[i]).removeClass("ui-selected");
			}
		}
		else
		{
			for(var i = firstSelectedIndex; i < currentIndex; i++)
			{
				$(children[i]).removeClass("ui-selected");
			}
		}
		
		firstSelectedIndex = currentIndex;
		alted = false;
	}
	
	else {
		if(shifted)
		{
			if(!item.hasClass("ui-selected"))
				item.addClass("ui-selected");
			var currentIndex = index(item[0].parentNode, item[0]);
			
			
			if(currentIndex < firstSelectedIndex)
			{
				for(var i = firstSelectedIndex; i > currentIndex; i--)
				{
					
					$(children[i]).addClass("ui-selected");
				}
			}
			else
			{
				for(var i = firstSelectedIndex; i < currentIndex; i++)
				{
					$(children[i]).addClass("ui-selected");
				}
			}
			
			firstSelectedIndex = currentIndex;
		}
		else
		{					
			firstSelectedIndex = index(item[0].parentNode, item[0]);
		}
	}
	
	CalculateItemInputVisibility();
}

function index(parent, item)
{
	var children = parent.children;
	
	if(children)
	{
		for(var i = 0; i < children.length; i++)
		{
			if(item == children[i])
				return i;
		}
		/*
		var counter = 0;
		
		var foundItem = _.find(children, function(fItem) {
			if(fItem == item)
				return true;
			else
				counter++;
		});
		
		if(foundItem)
			return counter;
		else
			return 0;
		*/
	}
	
	return 0;
}

//Set Sortables, Stop Propagation
$(window).load(function() {
	
	$("ul").bind("sortreceive", function(sortevent, ui)
	{
		HaveMadeChanges = true;
		$('li.ui-selected').appendTo($(this));
		$('li.ui-selected').toggleClass("ui-selected");
		
		CalculateItemInputVisibility();
	});
	
	$("#s1").sortable(
	{
	start: function(event, ui) {
			event.stopPropagation();
			//$(".dashboard-planes-selector").touchScroll("disableScroll");
		},
	stop: function(event, ui) {
		event.stopPropagation();
		//$(".dashboard-planes-selector").touchScroll("enableScroll");
	},
		scroll: true,
		connectWith:"ul"
	});
	$("#s2").sortable(
	{
	start: function(event, ui) {
			event.stopPropagation();
			//$(".dashboard-planes-selector").touchScroll("disableScroll");
		},
	stop: function(event, ui) {
		event.stopPropagation();
		//$(".dashboard-planes-selector").touchScroll("enableScroll");
	},
		scroll: true,
		connectWith:"ul"
	});
	$("#s3").sortable(
	{
	start: function(event, ui) {
			event.stopPropagation();
			//$(".dashboard-planes-selector").touchScroll("disableScroll");
		},
	stop: function(event, ui) {
		event.stopPropagation();
		//$(".dashboard-planes-selector").touchScroll("enableScroll");
	},
		scroll: true,
		connectWith:"ul"
	});
	$("#s4").sortable(
	{
	start: function(event, ui) {
			event.stopPropagation();
			//$(".dashboard-planes-selector").touchScroll("disableScroll");
		},
	stop: function(event, ui) {
		event.stopPropagation();
		//$(".dashboard-planes-selector").touchScroll("enableScroll");
	},
		scroll: true,
		connectWith:"ul"
	});
});	
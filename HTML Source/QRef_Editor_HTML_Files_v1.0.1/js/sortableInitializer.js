var shifted = false;
var ctrled = false;
var firstSelectedIndex = -1;

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
	if(e.which == 17)
	{
		ctrled = false;
	}
});

$(window).keyup(function(e) {
	if(e.which == 17)
	{
		ctrled = true;
	}
});

function AddMultiSelect(item)
{
	item.toggleClass("ui-selected");
	
	var children = item.parent().children();
	/*
	if(ctrled)
	{
		firstSelectedIndex = index(item[0].parentNode, item[0]);
	}
	else
	{*/
		if(shifted)
		{
			var currentIndex = index(item[0].parentNode, item[0]);
			
			
			if(currentIndex < firstSelectedIndex)
			{
				for(var i = firstSelectedIndex - 1; i > currentIndex; i--)
				{
					$(children[i]).toggleClass("ui-selected");
				}
			}
			else
			{
				for(var i = firstSelectedIndex + 1; i < currentIndex; i++)
				{
					$(children[i]).toggleClass("ui-selected");
				}
			}
			
			firstSelectedIndex = currentIndex;
		}
		else
		{					
			firstSelectedIndex = index(item[0].parentNode, item[0]);
		}
		
	//}
	
	CalculateItemInputVisibility();
}

function index(parent, item)
{
	var children = parent.childNodes;
	
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
$(function() {
	
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
			$(".dashboard-planes-selector").touchScroll("disableScroll");
		},
	stop: function(event, ui) {
		event.stopPropagation();
		$(".dashboard-planes-selector").touchScroll("enableScroll");
	},
		scroll: true,
		connectWith:"ul"
	});
	$("#s2").sortable(
	{
	start: function(event, ui) {
			event.stopPropagation();
			$(".dashboard-planes-selector").touchScroll("disableScroll");
		},
	stop: function(event, ui) {
		event.stopPropagation();
		$(".dashboard-planes-selector").touchScroll("enableScroll");
	},
		scroll: true,
		connectWith:"ul"
	});
	$("#s3").sortable(
	{
	start: function(event, ui) {
			event.stopPropagation();
			$(".dashboard-planes-selector").touchScroll("disableScroll");
		},
	stop: function(event, ui) {
		event.stopPropagation();
		$(".dashboard-planes-selector").touchScroll("enableScroll");
	},
		scroll: true,
		connectWith:"ul"
	});
	$("#s4").sortable(
	{
	start: function(event, ui) {
			event.stopPropagation();
			$(".dashboard-planes-selector").touchScroll("disableScroll");
		},
	stop: function(event, ui) {
		event.stopPropagation();
		$(".dashboard-planes-selector").touchScroll("enableScroll");
	},
		scroll: true,
		connectWith:"ul"
	});
});	
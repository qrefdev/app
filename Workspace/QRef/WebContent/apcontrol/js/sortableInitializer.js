var shiftKey = false;
var altKey = false;
var firstSelectedIndex = -1;
var globalMouseMoveListener = undefined;

$(window).load(function() {

	//Start Shift-MultiSelect Functionality
	$(window).keydown(function(e) {
		if(e.which == 16) {
			shiftKey = true;
		}
		else if(e.which == 18) {
			altKey = true;
		}
	});
	
	$(window).keyup(function(e) {
		if(e.which == 16) {
			shiftKey = false;
		}
		else if(e.which == 18) {
			altKey = false;
		}
	});
});

function AddMultiSelect(item)
{
	var children = item.parent().children();

	if(altKey) {
		item.toggleClass('ui-selected');
		firstSelectedIndex = item.index();
	}
	else if(shiftKey) {
		var current = item.index();
		
		if(current < firstSelectedIndex) {
			for(var i = current; i < firstSelectedIndex; i++) {
				var selItem = $(children.get(i));
				
				selItem.toggleClass('ui-selected');
			}
		}
		else if(current > firstSelectedIndex) {
			for(var i = firstSelectedIndex + 1; i <= current; i++) {
				var selItem = $(children.get(i));
				
				selItem.toggleClass('ui-selected');
			}
		}

		firstSelectedIndex = current;
	}
	else {
		children.removeClass('ui-selected');
		item.addClass('ui-selected');
		firstSelectedIndex = item.index();
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

function ScrollDown(element, list) {
	var listParent = list.parent().parent().parent();
	var elementTop = element.offset().top;
	var listTop = listParent.offset().top;
	var elementHeight = element.height();
	var listHeight = listParent.height();
	
	if(elementTop + elementHeight >= listTop + listHeight - elementHeight) {
		listParent.scrollTop(listParent.scrollTop() + 15);
		
		setTimeout(function() {
			ScrollDown(element, list);
		}, 100);			
	}
}

function ScrollUp(element, list) {
	var listParent = list.parent().parent().parent();
	var elementTop = element.offset().top;
	var listTop = listParent.offset().top;
	var elementHeight = element.height();
	var listHeight = listParent.height();
	
	if(elementTop - elementHeight <= listTop + elementHeight) {
		listParent.scrollTop(listParent.scrollTop() - 15);
		
		setTimeout(function() {
			ScrollUp(element, list);
		}, 100);			
	}
}

function MouseListener(element, list) {
	var listParent = list.parent().parent().parent();
	var elementTop = element.offset().top;
	var listTop = listParent.offset().top;
	var elementHeight = element.height();
	var listHeight = listParent.height();
	
	if(elementTop + elementHeight >= listTop + listHeight - elementHeight) {
		ScrollDown(element, list);
	}
	else if(elementTop - elementHeight <= listTop + elementHeight) {
		ScrollUp(element, list);
	}
}

function initSortable(list) {
	list.sortable({
		start: function(event, info) {
				var $this = $(this);
				globalMouseMoveListener = function(e) {
					MouseListener(info.item, $this);
				};
				
				$(window).bind("mousemove", globalMouseMoveListener);
				//$(".dashboard-planes-selector").touchScroll("disableScroll");
				info.item.siblings(".ui-selected").not(".ui-sortable-placeholder").clone().css({opacity: 0.5}).appendTo(info.item);
	
			},
		stop: function(event, info) {
			//$(".dashboard-planes-selector").touchScroll("enableScroll");
			if(!info.sender) {
				var previous = info.item;
				$(this).find(".ui-selected").each(function(index, item) {
						if(item != info.item[0]) { 
							var current = $(item);
							previous.after(current);
							previous = current;
						}
				});
			}
			
			if(globalMouseMoveListener) {
				$(window).unbind("mousemove", globalMouseMoveListener);
				globalMouseMoveListener = undefined;
			}
		},
		beforeStop: function(e, info) {
			info.item.find(".ui-selected").remove();
		},
		receive: function(e, info) {
			info.item.after(info.sender.find('.ui-selected'));
			$(this).find('.ui-selected').removeClass('ui-selected');
			HaveMadeChanges = true;
			CalculateItemInputVisibility();
		},
		scroll: true,
		connectWith:"ul"
	});
}

//Set Sortables, Stop Propagation
$(window).load(function() {
	
	/*$("ul").bind("sortreceive", function(sortevent, ui)
	{
		HaveMadeChanges = true;
		$('li.ui-selected').appendTo($(this));
		$('li.ui-selected').toggleClass("ui-selected");
		
		CalculateItemInputVisibility();
	});*/
	
	$("#s1").sortable(
	{
		start: function(event, info) {
				//$(".dashboard-planes-selector").touchScroll("disableScroll");
				info.item.siblings(".ui-selected").not(".ui-sortable-placeholder").clone().css({opacity: 0.5}).appendTo(info.item);
	
			},
		stop: function(event, info) {
			//$(".dashboard-planes-selector").touchScroll("enableScroll");
			if(!info.sender) {
				$(this).find(".ui-selected").each(function(index, item) {
						if(item != info.item[0]) 
							info.item.after($(item));
				});
			}
			
			if(globalMouseMoveListener) {
				$(window).unbind("mousemove", globalMouseMoveListener);
				globalMouseMoveListener = undefined;
			}
		},
		beforeStop: function(e, info) {
			info.item.find(".ui-selected").remove();
		},
		receive: function(e, info) {
			info.item.after(info.sender.find('.ui-selected'));
			$(this).find('.ui-selected').removeClass('ui-selected');
			HaveMadeChanges = true;
				CalculateItemInputVisibility();
		},
		scroll: true,
		connectWith:"ul"
	});
	$("#s2").sortable(
	{
		start: function(event, info) {
				//$(".dashboard-planes-selector").touchScroll("disableScroll");
				info.item.siblings(".ui-selected").not(".ui-sortable-placeholder").clone().css({opacity: 0.5}).appendTo(info.item);
			},
		stop: function(event, info) {
			//$(".dashboard-planes-selector").touchScroll("enableScroll");
			if(!info.sender) {
				$(this).find(".ui-selected").each(function(index, item) {
						if(item != info.item[0]) 
							info.item.after($(item));
				});
			}
			
			if(globalMouseMoveListener) {
				$(window).unbind("mousemove", globalMouseMoveListener);
				globalMouseMoveListener = undefined;
			}
		},
		beforeStop: function(e, info) {
			info.item.find(".ui-selected").remove();
		},
		receive: function(e, info) {
			info.item.after(info.sender.find('.ui-selected'));
			$(this).find('.ui-selected').removeClass('ui-selected');
			HaveMadeChanges = true;
			CalculateItemInputVisibility();
		},
		scroll: true,
		connectWith:"ul"
	});
	$("#s3").sortable(
	{
		start: function(event, info) {
				//$(".dashboard-planes-selector").touchScroll("disableScroll");
				info.item.siblings(".ui-selected").not(".ui-sortable-placeholder").clone().css({opacity: 0.5}).appendTo(info.item);
			},
		stop: function(event, info) {
			//$(".dashboard-planes-selector").touchScroll("enableScroll");
			if(!info.sender) {
				$(this).find(".ui-selected").each(function(index, item) {
						if(item != info.item[0]) 
							info.item.after($(item));
				});
			}
			
			if(globalMouseMoveListener) {
				$(window).unbind("mousemove", globalMouseMoveListener);
				globalMouseMoveListener = undefined;
			}
		},
		beforeStop: function(e, info) {
			info.item.find(".ui-selected").remove();
		},
		receive: function(e, info) {
			info.item.after(info.sender.find('.ui-selected'));
			$(this).find('.ui-selected').removeClass('ui-selected');
			HaveMadeChanges = true;
			CalculateItemInputVisibility();
		},
		scroll: true,
		connectWith:"ul"
	});
});	
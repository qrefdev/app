var HaveMadeChanges = false;
var selectedPicture = "";
var stateOf = 0;
var postingChecklist = "";
var AddNewItem_SectionList = "";
var SectionList = new Array();

function show_prompt(question)
{
	var uInput = "";

	uInput=prompt(question);

	if(uInput == null || uInput == undefined)
	uInput = "";

	return uInput;
}

//Modal Overlay
function showModelOverlay(logintoken,mfg)
{
	if(stateOf == 0)
	{
		Request_Model(logintoken, mfg, "");
		
		$("#modaldisplay").css({"opacity":"0.85"});
		$("#modaldisplay").show();
		$("#modaldisplay").css({"display":"block;"});
		$("#modalListDiv").show();
		centerDialog();
		
		stateOf = 1;
	}
	else
	{
		exitOverlay();
		showModelOverlay(logintoken,mfg);
	}
}

function exitOverlay()
{
	if(stateOf == 1)
	{
		$("#modaldisplay").hide();
		$("#modalListDiv").hide();
		$("#modalText").hide();
		stateOf = 0;
	}
}

function Reset()
{
	exitOverlay();
	document.getElementById("OK").onclick = OK_MFG;
	document.getElementById("AddNew").onclick = AddNewMFG;
	document.getElementById("OverlayText").innerHTML = "Please Select a Manufacturer";
	mfgRequestResponse = "";
	modelRequestResponse = "";
	g_checklist = "";
	selectedmfg = "";
	selectedmodel = "";
}

function centerDialog()
{
	var b_width = document.documentElement.clientWidth;
	var b_height = document.documentElement.clientHeight;
	var listheight = $("#modalListDiv").height();
	var listwidth = $("#modalListDiv").width();
	
	$("#modalListDiv").css({"position": "absolute", "top": "50%", "left":"50%","margin-left": -(listwidth / 2) + "px", "margin-top": -(listheight / 2) + "px", "display":"block"});
}

//Mfg Overlay
function showMFGOverlay(logintoken)
{
	if(stateOf == 0)
	{
		Request_Mfg(logintoken, "", "");
		
		$("#modaldisplay").css({"opacity":"0.85"});
		$("#modaldisplay").show();
		$("#modaldisplay").css({"display":"block;"});
		$("#modalListDiv").show();
		$(".CheckListItem").show();
		$(".ARitem").hide();
		centerDialog();
		
		if(postingChecklist)
			$("#AddNew").show();
		else
			$("#AddNew").hide();
		stateOf = 1;
	}
}

function insertMFGtoList(mfglist)
{
	var selectlist = document.getElementById('modalSelectList');
	
	if(selectlist.options.length > 0)
	{
		var length = selectlist.options.length
		
		for(var i = 0; i < length; i++)
		{
			selectlist.remove(selectlist.options[i]);
		}
	}
	
	for(var i = 0; i < mfglist.length; i++)
	{
		var mfg = mfglist[i];
		var option = document.createElement("Option");
		option.text= mfg.name
		selectlist.add(option);
	}
}

function OK_MFG()
{
	document.getElementById("OverlayText").innerHTML = "Please Choose a Model.";
	
	selectedmfg = mfgRequestResponse.records[document.getElementById("modalSelectList").selectedIndex];
	
	$("#mfgOK").css({"display":"none"});
	$("#modelOK").css({"display":"block"});
	document.getElementById("modalText").innerHTML = "Selected Manufacturer: " + selectedmfg.name;
	$("#modalText").css({"display":"block"});
	$("#AddPicture").fadeOut("slow");
	
	document.getElementById("OK").onclick = OK_Model;
	document.getElementById("AddNew").onclick = AddNewModel;
	
	showModelOverlay(token,selectedmfg);
}

function AddNewMFG()
{
	var newmfg = show_prompt("Please Enter the Name of the new Manufacturer");
	
	if(newmfg == "")
	{
		return;
	}
	else
	{
		Post_Mfg(token, newmfg, "");
	}
}

//Model Overlay
function insertModelstoList(modellist)
{
	var selectlist = document.getElementById('modalSelectList');
	
	var length = selectlist.options.length;
	
	for(var i = 0; i < length; i++)
		{
			selectlist.remove(selectlist.options[i]);
		}
	
	if(length == 0)
	{
		var dialog = new Dialog("#infobox","No Models Found. Please Create a new Model");
		dialog.show();
	}
	else
	
	{
		for(var i = 0; i < modellist.length; i++)
		{
			var model = modellist[i];
			if(model.manufacturer != selectedmfg._id)
				continue;
			var option = document.createElement("Option");
			option.text= model.name
			selectlist.add(option);
		}
	}
}

function OK_Model()
{
	selectedmodel = modelRequestResponse.records[document.getElementById("modalSelectList").selectedIndex];
	document.getElementById("OK").onclick = OK_MFG;
	document.getElementById("OverlayText").innerHTML = "Please Select a Manufacturer";
	
	if(postingChecklist)
		PostCheckListData(token, selectedmfg, selectedmodel);
	else
		RequestChecklistData(token, selectedmfg, selectedmodel);
}

function AddNewModel()
{
	var newmodel = show_prompt("Please enter the Name of the new Model");
	
	if(newmodel == "")
	{
		return;
	}
	else
	{
		Post_Model(token, newmodel, selectedmfg);
	}
}
//Picture Overlay
function ShowPicUpload()
{
	ShowMainOverlay(false);
}

function ShowMainOverlay(visible)
{
	if(visible == false)
	{
		$("#modalSelectList").css({"display":"none"});
		$("#AddNew").hide();
		$("#modalText").hide();
		$("#OverlayText").fadeOut("slow", function()
		{
			document.getElementById("OverlayText").innerHTML = "Upload Picture";
			$("#OverlayText").show();
		});
		$("#AddPicture").hide();
		$(".pictureUpload").show();
		
		document.getElementById("OK").onclick = OK_PictureUpload;
		document.getElementById("Cancel").onclick = CancelPicture;
	}
	else
	{
	
		$("#OverlayText").show();
		$("#modalSelectList").show();
		$("#OK").show();
		$("#Cancel").show();
		if(postingChecklist)
		{
			$("#AddNew").show();
		}
		else
		{
			$("#AddNew").hide();
		}
		$("#OverlayText").fadeOut("slow", function()
		{
			document.getElementById("OverlayText").innerHTML = "Please Select a Manufacturer";
			$("#OverlayText").fadeIn("slow");
		});
		$(".pictureUpload").hide();
		$(".ARitem").hide();
		$("#AddPicture").show();
		document.getElementById("OK").onclick = OK_MFG;
		document.getElementById("Cancel").onclick = Reset;
	}
}

function ShowPreviewPicture(input)
{
	if (input.files && input.files[0]) 
	{
		var reader = new FileReader();

		reader.onload = function (e) {
			selectedPicture = e.target.result;
			$('#previewPic').attr('src', e.target.result);
		}

		reader.readAsDataURL(input.files[0]);
	}
}

function progressbarHandler(e)
{
	if(e.lengthComputable)
	{
		$('picProgress').attr({value:e.loaded,max:e.total});
	}
}

function OK_PictureUpload()
{
	if(selectedPicture == "")
	{
		alert("Please Select a picture");
	}
	else
	{
		
		$('picProgress').css({"display":"block"});
		
		var formData = new FormData($('picForm')[0]);
		
		$.ajax({
			url:"PICTUREUPLOADURL",
			type: 'post',
			xhr: function(){
				myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload)
				{
					myXhr.upload.addEventListener('progress',progressbarHandler);
				}
				return myXhr;
			},
			success: function(data){
			
				if(data.success)
				{
					var dialog = new Dialog("#infobox","Picture Uploaded Successfully");
					dialog.show();
				}
				else
				{
					var dialog = new Dialog("#infobox","Failed to Upload Picture");
					dialog.show();
				}				
			},
			error: function(){
				var dialog = new Dialog("#infobox","Error to Uploading Picture");
					dialog.show();
			},
			data: formData,
			cache: false,
			contentType: false,
			processData:false
			
		});
		
		ShowMainOverlay(true);
	}
}

function CancelPicture()
{
	ShowMainOverlay(true);
	slectedPicture ="";
	$('#previewPic').attr('src',"#");
	$('picProgress').css({"display":"none"});
}
//////////////////////////////////////////////////
function AddOptions(list, category, target) {
	
	switch(category)
	{
		
		case "preflight":
		for(var i = 0; i < list.preflight.length; i++)
		{
			var item = list.preflight[i];
			SetItemOptions(item, i, target);
		}
		break;
		case "takeoff":
		for(var i = 0; i < list.takeoff.length; i++)
		{
			var item = list.takeoff[i];
			SetItemOptions(item, i, target);
		}
		break;
		case "landing":
		for(var i = 0; i < list.landing.length; i++)
		{
			var item = list.landing[i];
			SetItemOptions(item, i, target);
		}
		break;
		case "emergencies":
		for(var i = 0; i < list.emergencies.length; i++)
		{
			var item = list.emergencies[i];
			SetItemOptions(item, i, target);
		}
		break;
	}
}

function SetItemOptions(item, index, target)
{
	for(var j = 0; j < item.items.length; j++)
	{
		var option = document.createElement("li");
		
		var $option = $(option);
		
		$option.data("Category","Preflight");
		$option.data("SectionIndex", index);
		$option.data("Section", item.name);
		$option.data("Index", item.items[j].index);
		$option.data("Check", item.items[j].check);
		$option.data("Response", item.items[j].response);
		$option.data("Value", j);
		$option.addClass("ui-widget-content");
		
		option.innerHTML = SetCheckListItemHTML(item.name,item.items[j].check,item.items[j].response);
		
		target.append($option);
		
		$option.tap(function(event) {
			AddMultiSelect($(this));
		});
	}
}

function SetCheckListItemHTML(Section, Check, Response)
{
	return '<div class="CheckListItem_Section">Section: <span class="CheckListItem_Values">' + Section + '</span></div><div class="CheckListItem_Check">Check: <span class="CheckListItem_Values">' + Check + '</span></div><div class="CheckListItem_Response">' + 'Response: <span class="CheckListItem_Values">' + Response + '</span></div>';
}

function LoadObjects(objects)
{
	var preflight = document.getElementById('s1');
	var takeOffCruise = document.getElementById('s2');
	var landing = document.getElementById('s3');
	var emergencyContents = document.getElementById('s4');
	var counter = 0;
	
	if(postingChecklist)
	{	
		AddOptions(objects[0], "preflight", $(preflight));
	}
	else
	{
		if(objects[0].preflight.length > 0)
			AddOptions(objects[0], "preflight",$(preflight));
		if(objects[0].takeoff.length > 0)
			AddOptions(objects[0], "takeoff",$(takeOffCruise));
		if(objects[0].landing.length > 0)
			AddOptions(objects[0], "landing",$(landing));
		if(objects[0].emergencies.length > 0)
			AddOptions(objects[0], "emergencies",$(emergencyContents));
	}
	
	for(var i = 0; i < checklistResponse.records[0].preflight.length; i++)
	{
		if(SectionList.indexOf(checklistResponse.records[0].preflight[i].name) == -1)
		{
			SectionList.push(checklistResponse.records[0].preflight[i].name);
		}
	}
	
	for(var i = 0; i < checklistResponse.records[0].takeoff.length; i++)
	{
		if(SectionList.indexOf(checklistResponse.records[0].takeoff[i].name) == -1)
		{
			SectionList.push(checklistResponse.records[0].takeoff[i].name);
		}
	}
	
	for(var i = 0; i < checklistResponse.records[0].landing.length; i++)
	{
		if(SectionList.indexOf(checklistResponse.records[0].landing[i].name) == -1)
		{
			SectionList.push(checklistResponse.records[0].landing[i].name);
		}
	}
	
	for(var i = 0; i < checklistResponse.records[0].emergencies.length; i++)
	{
		if(SectionList.indexOf(checklistResponse.records[0].emergencies[i].name) == -1)
		{
			SectionList.push(checklistResponse.records[0].emergencies[i].name);
		}
	}
}

function EditChecklist()
{
	if(HaveMadeChanges)
	{
		var confirmdialog = new ConfirmationDialog($("#confirmation"), function(result) {
			if(result)
			{
				CheckIn();
				ClearCheckLists();
				
				postingChecklist = false;
		
				DevLogin(function(token) 
				{
					GetandPost("", token)
				});
				
			}
			else
			{
				ClearCheckLists();
				postingChecklist = false;
		
				DevLogin(function(token) 
				{
					GetandPost("", token)
				});
			}
		});
		
		confirmdialog.show();
	}
	else
	{
		ClearCheckLists();
		
		postingChecklist = false;
		
		DevLogin(function(token) 
		{
			GetandPost("", token)
		});
	}
}

function CheckIn()
{
	if(checklistResponse != "")
	{		
		var preflight = document.getElementById('s1');
		var takeoff = document.getElementById('s2');
		var landing = document.getElementById('s3');
		var emergencies = document.getElementById('s4');
		
		var checklist = checklistResponse.records[0];
		
		CheckIn_Cycle(checklist.preflight, preflight);
		CheckIn_Cycle(checklist.takeoff , takeoff);
		CheckIn_Cycle(checklist.landing, landing);
		CheckIn_Cycle(checklist.emergencies, emergencies);
		
		PostEditedCheckListData(token, checklistResponse.records[0]);
		
		HaveMadeChanges = false;
	}
	else
	{
		var dialog = new Dialog("#infobox","No Checklist Items to Check In");
		dialog.show();
	}
	
}

function CheckIn_Cycle(list, ul)
{
	for(var i = 0; i < ul.children.length; i++)
	{
		var option = ul.children[i];
		
		var SectionIndex = $(option).data("SectionIndex");
		var Section = $(option).data("Section");
		var Check = $(option).data("Check");
		var Response = $(option).data("Response");
		var category = $(option).data("Category");
		var value = $(option).data("Value");
	
		var movedItem;
		
		if($(option).data("SectionIndex") == undefined)
		{
			var newSection = new ChecklistSection();
			newSection.name = $(option).data("Section");
			newSection.index = ul.children.length + 1;
			SectionIndex = newSection.index;
			
			list.push(newSection);
			movedItem = list[SectionIndex].items[value];
		}
		
		movedItem = list[SectionIndex].items[value];
		
		var newItem = new ChecklistItem();
		newItem.check = Check;
		newItem.response = Response;
		
		list[SectionIndex].items[value] = newItem;
		
		//Remove item from lists
		
		list[SectionIndex].items = _.without(list[SectionIndex].items, movedItem);
		
		ul.removeChild(option);
		
		i--;
	}
}

function ClearCheckLists()
{
	ClearList($('#s1'));
	ClearList($('#s2'));
	ClearList($('#s3'));
	ClearList($('#s4'));
	HaveMadeChanges = false;
}

function ClearList(list)
{
	list.html("");
}

function AddNewCheckListItem(e)
{	
	var target = e;
	
	var Parent = target.parentNode.parentNode.parentNode;
	
	if(Parent.id == "")
		Parent = Parent.parentNode;
	
	AddNewItem_SectionList = document.getElementById("s" + Parent.id);
	
	ShowAddNewItemForm();
}

function ShowAddNewItemForm()
{
	$("#modaldisplay").css({"opacity":"0.85"});
	$("#modaldisplay").show();
	
	$("#modalListDiv").show();
	$(".ARitem").show();
	$(".CheckListItem").css({"display":"none"});
	
	centerDialog();
	
	var ParentArray = GetParentList(new Array());
	
	for(var i = 0; i < ParentArray.length; i++)
	{
		var option = document.createElement("option");
		option.text = ParentArray[i];
		$("#Section_AddNew").append(option);
	}
}

function RemoveFromList(e)
{
	HaveMadeChanges = true;
	
	var target = e;
	
	var Parent = target.parentNode.parentNode.parentNode;
	
	if(Parent.id == "")
		Parent = Parent.parentNode;
	
	list = document.getElementById("s" + Parent.id);
	
	for(var i = 0; i < $(".ui-selected").length; i++)
	{
		var item = $(".ui-selected")[i];
		
		if(item.parentNode.id == list.id)
		{
			list.removeChild(item);
			i--;
		}
	}
	
	CalculateItemInputVisibility();
}

function AcceptNewCheckListItem()
{
	HaveMadeChanges = true;
	var check = document.getElementById("Check_AddNew").value;
	var response = document.getElementById("Response_AddNew").value
	
	var newitem = document.createElement("li")
	
	
	newitem.innerHTML = SetCheckListItemHTML(document.getElementById('Section_AddNew').children[document.getElementById('Section_AddNew').selectedIndex].text,check,response);
	
	var $newitem = $(newitem);
	
	
	switch(AddNewItem_SectionList.id)
	{
		case "s1":
		{
			$newitem.data("Category","Preflight");
			$newitem.data("Value",($("#s1").children.length + 1));
			break;
		}
		case"s2":
		{
			$newitem.data("Category","TakeOff");
			$newitem.data("Value",($("#s2").children.length + 1));
			break;
		}
		case "s3":
		{
			$newitem.data("Category","Landing");
			$newitem.data("Value",($("#s3").children.length + 1));
			break;
		}
		case "s4":
		{
			$newitem.data("Category","Emergency");
			$newitem.data("Value",($("#s4").children.length + 1));
			break;
		}
	}
	
	$newitem.data("SectionIndex",undefined);
	$newitem.data("SectionIndex",undefined);
	$newitem.data("Index", 0);
	$newitem.data("Check",check);
	$newitem.data("Response",response);
	var currentSection = document.getElementById('Section_AddNew').children[document.getElementById('Section_AddNew').selectedIndex].text
	$newitem.data("Section",currentSection);
	
		
	$newitem.addClass("ui-widget-content");
	AddNewItem_SectionList.appendChild($newitem.get(0));
	
	$newitem.tap(function(event) {
		AddMultiSelect($(this));
	});
	
	CloseAddNewItemForm();
	
	if(SectionList.indexOf(currentSection) == -1)
	{
		SectionList.push(currentSection);
	}
}

function ShowItemProperties()
{
	GetItemProperties();
	$("#CheckListInputsDiv").show();
}

function GetItemProperties()
{
	var count = $(".ui-selected").length;
	
	if(count == 1)
	{
		var Section = $(".ui-selected").data("Section");
		var Index = $(".ui-selected").data("Index")
		var Check = $(".ui-selected").data("Check")
		var Response = $(".ui-selected").data("Response")
		
		$("#Item_Index").val(Index);
		$("#Item_Check").val(Check);
		$("#Item_Response").val(Response);
		
	}
	else
	{
		EmptyItemInputs(false);
	}
	
	var ParentOptions= new Array();
	
	if(Section != undefined)
		ParentOptions.push(Section);
	
	ParentList = SectionList;
	
	$("#Item_Section").empty();
	
	var defaultoption = document.createElement("option");
	defaultoption.text = "--Select--";
	
	$("#Item_Section").append(defaultoption);
	
	for(var i = 0; i < ParentList.length; i++)
	{
		var option = document.createElement("option");
		option.text = ParentList[i];
		$("#Item_Section").append(option);
	}
	
	$("#Item_Index").keyup(function() {
		var item = $(".ui-selected");
		if(item.length == 1)
		{
			item.data("Index", $(this).val());
		}
	});
	
	$("#Item_Check").keyup(function() {
		var item = $(".ui-selected");
		if(item.length == 1)
		{
			item.data("Check", $(this).val());
			RedrawItem(item);
		}
	});
	
	$("#Item_Response").keyup(function() {
		var item = $(".ui-selected");
		if(item.length == 1)
		{
			item.data("Response", $(this).val());
			RedrawItem(item);
		}
	});
}

function HideItemProperties()
{
	EmptyItemInputs(true);
	$("#CheckListInputsDiv").hide();
}

function EmptyItemInputs(emptyParent)
{
	if(emptyParent)
		$("#Item_Section").empty();
	$("#Item_Index").val("");
	$("#Item_Check").val("");
	$("#Item_Response").val("");
}

function RedrawItem(item)
{
	HaveMadeChanges=true;
	item.html(SetCheckListItemHTML(item.data("Section"),item.data("Check"),item.data("Response")));
}

function GetParentList(array)
{
	
	/*for( var i = 0; i < $("li").not(".ui-selected").length; i++)
	{
		var newoption = $("li").not(".ui-selected")[i];
		
		if(($.inArray($(newoption).data("Section"), array)) == -1)
		{
			if($(newoption).data("Section") != undefined)
				array.push($(newoption).data("Section"));
		}
	}
	*/
	return SectionList;
}

function AddNewSection()
{
	var newitem = show_prompt("Please Enter a new Section");
	
	if(newitem == "")
	{
		return;
	}
	else
	{
		var list = document.getElementById('Section_AddNew');
		var option = document.createElement("option");
		option.text = newitem;
		option.value = list.children.length;
		list.appendChild(option);
		list.selectedIndex = option.value;
	}
}

function ApplyItemChanges()
{
	HaveMadeChanges = true;
	if($("#Item_Section").val() != "--Select--")
	{
		for(var i = 0; i < $(".ui-selected").length; i++)
		{
			var item = $(".ui-selected")[i];
			
			$(item).data("Section", $("#Item_Section").val());
			RedrawItem($(item));
		}
		$("#Item_Section").val("--Select--");	
	}
}

function CalculateItemInputVisibility()
{
	if($(".ui-selected").length > 0)
	{
		ShowItemProperties();
	}
	else
	{
		HideItemProperties();
	}
}

function CloseAddNewItemForm()
{
	$("#modaldisplay").hide();
	$("#modalListDiv").hide();
	
	$("#Section_AddNew").empty();
	
	$("#ARitem").hide();
	stateOf = 0;
}

function DevLogin(callback)
{
	Signin(callback);
}

var FileContents = "";

function readMultipleFiles(evt) 
{
	//Retrieve all the files from the FileList object
	var files = evt.files; 
			
	if (files) 
	{
		for (var i=0, f; f=files[i]; i++) 
		{
			  var r = new FileReader();
			r.onload = (function(f) 
			{
				return function(e) 
				{
					var contents = e.target.result;
					FileContents = contents;
					
					loader.show();
					
					var results = WriteToJSON(FileContents);
					
					loader.hide();
					
					DevLogin(function(token) {
						GetandPost(results, token)
					});
				};
			})(f);

			r.readAsText(f);
		}
	}
	else 
	{
		alert("Failed to load files"); 
	}
}
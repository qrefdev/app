var HaveMadeChanges = false;
var selectedPicture = "";
var stateOf = 0;
var postingChecklist = "";
var AddNewItem_SectionList = "";
var SectionList = new Array();
var FileContents = "";

function show_prompt(question)
{
	var uInput = "";

	uInput=prompt(question);

	if(uInput == null || uInput == undefined)
	uInput = "";

	return uInput;
}

function show_prompt(question,defaultanswer)
{
	var uInput = "";

	uInput=prompt(question,defaultanswer);

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
		centerDialog('#modalListDiv');
		
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

function centerDialog(dialog)
{
	var b_width = document.documentElement.clientWidth;
	var b_height = document.documentElement.clientHeight;
	var listheight = $(dialog).height();
	var listwidth = $(dialog).width();
	
	$(dialog).css({"position": "absolute", "top": "50%", "left":"50%","margin-left": -(listwidth / 2) + "px", "margin-top": -(listheight / 2) + "px", "display":"block"});
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
		centerDialog('#modalListDiv');
		
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
		option.value = mfg._id;
		selectlist.add(option);
	}
}

function findManufacturerById(id) {
	for (var i = 0; i < mfgRequestResponse.records.length; i++) {
		var item = mfgRequestResponse.records[i];
		
		if (item._id == id)
			return item;
	}
	
	return null;
}

function findModelById(id) {
	for (var i = 0; i < modelRequestResponse.records.length; i++) {
		var item = modelRequestResponse.records[i];
		
		if (item._id == id) 
			return item;
	}
	
	return null;
}

function OK_MFG()
{
	document.getElementById("OverlayText").innerHTML = "Please Choose a Model.";
	var modalSelectList = document.getElementById("modalSelectList");
	
	selectedmfg = findManufacturerById(modalSelectList.options[modalSelectList.selectedIndex].value);
	
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
	
	if(modellist.length == 0)
	{
		var dialog = new Dialog("#infobox2","No Models Found. Please Create a new Model");
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
			option.text= model.name + " (" + model.modelYear + ")";
			option.value = model._id;
			selectlist.add(option);
		}
	}
}

function OK_Model()
{
	var modalSelectList = document.getElementById("modalSelectList");
	selectedmodel = findModelById(modalSelectList.options[modalSelectList.selectedIndex].value);
	document.getElementById("OK").onclick = OK_MFG;
	document.getElementById("OverlayText").innerHTML = "Please Select a Manufacturer";
	
	if(postingChecklist)
		PostCheckListData(token, selectedmfg, selectedmodel,false);
	else
		RequestChecklistData(token, selectedmfg, selectedmodel, function(response)
		{
			if(response.records.length > 1)
			{
				ShowDuplicateList(response.records);
			}
			else
			{
				g_checklist = response.records[0];
				LoadObjects(response.records);
			}
		});
}

function AddNewModel()
{
	var newModel = show_prompt("Please enter the Name of the new Model");
	
	if(newModel == "")
		return;
	
	var newYear = show_prompt("Please enter the Year of the new Model");
	
	if(newYear == "")
		return;
	
	Post_Model(token, newModel, newYear, selectedmfg);
	
}

function ShowDuplicateList(records)
{
	$("#modaldisplay").css({"opacity":"0.85"});
	$("#modaldisplay").show();
	
	centerDialog('#duplicateListDiv');
	
	for(var i = 0; i < records.length; i++)
	{
		$('#dupChklist_Select').append('<option value=' + records[i].version + '>Version: ' + records[i].version +'</option>');
	}
	
	$('#duplicateListDiv').show();
}

function HideDuplicateList()
{
	$("#modaldisplay").hide();
	
	$('#dupChklist_Select').empty();
	
	$('#duplicateListDiv').hide();
}

function findChecklistByVersion(version) {
	for (var i = 0; i < checklistResponse.records.length; i++) {
		var item = checklistResponse.records[i];
		
		if (item.version == version) 
			return item;
	}
	
	return null;
}

function AcceptDupChecklist()
{
	g_checklist = findChecklistByVersion($('#dupChklist_Select').val());
	LoadObjects(g_checklist);
	
	HideDuplicateList();
}
//Picture Overlay
function ShowPicUpload()
{
	//ShowMainOverlay(false);
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
		$('.picProgressBar').attr({value:e.loaded,max:e.total});
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
					var dialog = new Dialog("#infobox2","Picture Uploaded Successfully");
					dialog.show();
				}
				else
				{
					var dialog = new Dialog("#infobox2","Failed to Upload Picture");
					dialog.show();
				}				
			},
			error: function(){
				var dialog = new Dialog("#infobox2","Error to Uploading Picture");
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

function LoadObjects(records)
{
	$('#SaveAs').show();
	$("#ChecklistName").html(selectedmfg.name + " " + selectedmodel.name + " (Version: " + g_checklist.version + ")");
	
	var preflight = document.getElementById('s1');
	var takeOffCruise = document.getElementById('s2');
	var landing = document.getElementById('s3');
	var emergencies = document.getElementById('s4');
	var counter = 0;
	var RecordToLoad = "";
	
	if(postingChecklist)
	{
		for(var i = 0; i < records.length; i++)
		{
			if(records[i].version == g_checklist.version)
				RecordToLoad = records[i];
		}
		
		if(RecordToLoad.preflight.length > 0)
			AddOptions(RecordToLoad, "preflight",$(preflight));
		if(RecordToLoad.takeoff.length > 0)
			AddOptions(RecordToLoad, "takeoff",$(takeOffCruise));
		if(RecordToLoad.landing.length > 0)
			AddOptions(RecordToLoad, "landing",$(landing));
		if(RecordToLoad.emergencies.length > 0)
			AddOptions(RecordToLoad, "emergencies",$(emergencies));
			
		PopulateCategoryList(RecordToLoad);
		
	}
	else
	{
		if(records.length == undefined)
		{
			RecordToLoad = records;
		}
		else if(records.length > 0)
		{
			RecordToLoad = records[0];
		}
		else
			return;
		
		if(RecordToLoad.preflight.length > 0)
			AddOptions(RecordToLoad, "preflight",$(preflight));
		if(RecordToLoad.takeoff.length > 0)
			AddOptions(RecordToLoad, "takeoff",$(takeOffCruise));
		if(RecordToLoad.landing.length > 0)
			AddOptions(RecordToLoad, "landing",$(landing));
		if(RecordToLoad.emergencies.length > 0)
			AddOptions(RecordToLoad, "emergencies",$(emergencies));
			
		PopulateCategoryList(RecordToLoad);
	}
	
	
}
function PopulateCategoryList(checklist)
{
	//Add Options To Category Select List
	for(var i = 0; i < checklist.preflight.length; i++)
	{
		if(SectionList.indexOf(checklist.preflight[i].name) == -1)
		{
			SectionList.push(checklist.preflight[i].name);
		}
	}
	
	for(var i = 0; i < checklist.takeoff.length; i++)
	{
		if(SectionList.indexOf(checklist.takeoff[i].name) == -1)
		{
			SectionList.push(checklist.takeoff[i].name);
		}
	}
	
	for(var i = 0; i < checklist.landing.length; i++)
	{
		if(SectionList.indexOf(checklist.landing[i].name) == -1)
		{
			SectionList.push(checklist.landing[i].name);
		}
	}
	
	for(var i = 0; i < checklist.emergencies.length; i++)
	{
		if(SectionList.indexOf(checklist.emergencies[i].name) == -1)
		{
			SectionList.push(checklist.emergencies[i].name);
		}
	}
	
}

function EditChecklist()
{
	$('#SaveAs').hide();
	
	if(HaveMadeChanges)
	{
		var confirmdialog = new ConfirmationDialog("#confirmation", function(result) {
			if(result)
			{
				if(token != null)
				{
					CheckIn();
					ClearCheckLists();
					g_checklist = "";
					$('#ChecklistName').html("");
					
					postingChecklist = false;
		
					GetToken(function(token) 
					{
						GetandPost("", token)
					});
					
					$('#globalAddNewSection').show();
				}
				else
				{
					var dialog = new Dialog("#infobox2","Please sign in");
					dialog.show();
				}
			}
			else
			{
				ClearCheckLists();
				g_checklist = "";
				$('#ChecklistName').html("");
				
				postingChecklist = false;
		
				GetToken(function(token) 
				{
					GetandPost("", token)
				});
				
				$('#globalAddNewSection').show();
			}
		});
		confirmdialog.show();
	}
	else
	{
		GetToken(function(token){});
		
		if(token != null)
		{
			ClearCheckLists();
			g_checklist = "";
			$('#ChecklistName').html("");
			
			postingChecklist = false;
			
			GetToken(function(token)
			{
				GetandPost("", token)
			});
			
			$('#globalAddNewSection').show();
		}
		else
		{
			var dialog = new Dialog("#infobox2","Please sign in");
			dialog.show();
		}
	}
}

function CheckIn()
{
	if(g_checklist != "")
	{
		var preflight = document.getElementById('s1');
		var takeoff = document.getElementById('s2');
		var landing = document.getElementById('s3');
		var emergencies = document.getElementById('s4');
		
		
		
		g_checklist.preflight = [];
		g_checklist.takeoff = [];
		g_checklist.landing = [];
		g_checklist.emergencies = [];
		
		CheckIn_Cycle(g_checklist.preflight, preflight);
		CheckIn_Cycle(g_checklist.takeoff , takeoff);
		CheckIn_Cycle(g_checklist.landing, landing);
		CheckIn_Cycle(g_checklist.emergencies, emergencies);
		
		PostEditedCheckListData(token, g_checklist, function()
		{
			g_checklist = "";
			//selectedVersion = 0;
			$("#ChecklistName").html("");
		});
		
		HaveMadeChanges = false;
		
		$('#globalAddNewSection').hide();
	}
	else
	{
		var dialog = new Dialog("#infobox2","No Checklist Items to Check In");
		dialog.show();
	}
	
}

function CheckIn_Cycle(datalist, ul)
{
	for(var i = 0; i < ul.children.length; i++)
	{
		var option = ul.children[i];
		
		var SectionIndex = $(option).data("SectionIndex");
		var Section = $(option).data("Section");
		var Index = $(option).data("Index");
		var Check = $(option).data("Check");
		var Response = $(option).data("Response");
		var category = $(option).data("Category");
		var value = $(option).data("Value");
		
		var newItem = new ChecklistItem();
		newItem.check = Check;
		newItem.response = Response;
		newItem.index = Index;
		
		var section = _.find(datalist,function(item){
			if(item.name == Section)
			{
				return true;
			}
		});
		
		if(section == undefined)
		{
			var newSection = new ChecklistSection();
			newSection.name = $(option).data("Section");
			newSection.index = datalist.length;
			SectionIndex = newSection.index;
			datalist.push(newSection);
			datalist[newSection.index].items.push(newItem);
		}
		else
		{
			datalist[section.index].items.push(newItem);
		}
		/*
		var newItem = new ChecklistItem();
		newItem.check = Check;
		newItem.response = Response;
		
		if(datalist[section].items.length < value)
			datalist[section].items.push(newItem);
		else
			datalist[section].items[value] = newItem;
		*/
	}
	ClearList($(ul));
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

function SaveAs(){
	if(g_checklist != "") {
		PostCheckListData(token,selectedmfg,selectedmodel,true);
	}
}

function deleteChecklist(){
	
	if(g_checklist != "")
	{
		var confirmdialog = new ConfirmationDialog("#confirmation-delete", function(result) {
			if(result)
			{
				loader.show();
				findChecklistProduct(token, function(list){
					
					if( list != "" && !list.isDeleted)
					{
						//Check to see if the list is published
						if(list.isPublished)
						{
							//Warn that it must be unassigned from the product before deletion
							loader.hide();
							var dialog = new Dialog("#infobox2","To delete a checklist, it must first be unassigned from a published product.");
							dialog.show();
						}
						else
						{
							//Can be deleted
							deleteChecklistById(token, list, function(){
								
								ClearCheckLists();
								g_checklist = "";
								$('#ChecklistName').html("");
								
							});
						}
					}
					else
					{
						//Can be deleted
						deleteChecklistById(token, g_checklist, function(){
							ClearCheckLists();
							g_checklist = "";
							$('#ChecklistName').html("");
						});
					}
				});
			}
			else
			{
				return;
			}
		});
		confirmdialog.show();
	}
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
	
	centerDialog('#modalListDiv');
	
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
	var currentSection = $('#Section_AddNew').val();
	$newitem.data("Section",currentSection);
	
		
	$newitem.addClass("ui-widget-content");
	AddNewItem_SectionList.appendChild($newitem.get(0));
	
	$newitem.tap(function(event) {
		AddMultiSelect($(this));
	});
	
	CloseAddNewItemForm();
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
		
	UpdateModalSectionList();
	
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

function UpdateModalSectionList()
{
	$("#Item_Section").empty();
	
	var defaultoption = document.createElement("option");
	defaultoption.text = "--Select--";
	
	$("#Item_Section").append(defaultoption);
	
	for(var i = 0; i < SectionList.length; i++)
	{
		var option = document.createElement("option");
		option.text = SectionList[i];
		$("#Item_Section").append(option);
	}
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
		list.appendChild(option);
		$(list).val(newitem);
		if(SectionList.indexOf(newitem) == -1)
		{
			SectionList.push(newitem);
			UpdateModalSectionList();
		}
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
	
	$(".ui-selected").toggleClass("ui-selected")
	CalculateItemInputVisibility();
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

function GetToken(callback)
{
	///*
	if (callback)
	{
		callback($.cookie.getCookie("QrefAuth") || null); 
	}
	
	token = $.cookie.getCookie("QrefAuth") || null;
	
	if(token == null)
	{
		token = $.cookie.getCookie("QrefAuth");
	}
	///*/
	/*
	var signin = { mode: "rpc", userName: "nathan.klick@b2datastream.com", password: "test" };
                
	$.ajax({
		type: "post",
		data: signin,
		dataType: "json",
		url: host + "services/rpc/auth/login",
		success: function(data) 
		{
			var response = data;
			if(response.success == true)
			{
				token = response.returnValue;
				$.cookie.setCookie("QrefAuth", token, 30);
				if (callback)
					callback(token);
			}
			else
			{
				if (callback)
					callback(null);
			}              
		},
		error: function(data, err, msg) 
		{
			if (callback)
				callback(null);
		}
	});
	//*/
}

function UploadFiles()
{
	$('#SaveAs').hide();
	var file = $("#fileinput")[0].files
	
	if(file.length == 1)
	{
		for (var i=0, f; f=file[i]; i++) 
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
					
					GetToken(function(token) {
						GetandPost(results, token)
					});
				};
			})(f);

			r.readAsText(f);
		}
	}
	else
	{
		return;
	}
}

function readMultipleFiles(evt) 
{
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
					
					GetToken(function(token) {
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
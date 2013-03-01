var mfgRequestResponse = "";
var modelRequestResponse = "";
var g_checklist = "";
var selectedmfg = "";
var selectedmodel = "";
var checklistResponse = "";
var selectedVersion = 0;

function GetandPost(checklistdata, logintoken)
{
	if(g_checklist) {
		g_checklist.preflight = checklistdata.preflight;
		g_checklist.takeoff = checklistdata.takeoff;
		g_checklist.landing = checklistdata.landing;
		g_checklist.emergencies = checklistdata.emergencies;
		postingChecklist = false;
		ClearChecklistsImportInto();
	} else {
		g_checklist = checklistdata;
		showMFGOverlay(logintoken);
	}
}

function PostEditedCheckListData(logintoken, editedchecklist, callback)
{
	var checklist = { "mode":"ajax", "token":logintoken, "preflight": editedchecklist.preflight,
	"takeoff":editedchecklist.takeoff, "landing":editedchecklist.landing, "emergencies":editedchecklist.emergencies,
	"manufacturer":editedchecklist.manufacturer, "model":editedchecklist.model, "modelYear":editedchecklist.model.modelYear}
	loader.show();
	
	$.ajax
	({
		type: "post",
		data: JSON.stringify(checklist),
		contentType:"application/json; charset=utf-8",
		dataType: "json",
		url: host + "services/ajax/aircraft/checklist/" + editedchecklist._id,
		success: function(data) 
		{
			var response = data;
								
			if(response.success == true)
			{
				loader.hide();
				var dialog = new Dialog("#infobox2", "Successfully Posted Edited Data");
				dialog.show();
				callback();
			}
			else
			{
				Reset();
				loader.hide();
				var dialog = new Dialog("#infobox2", "Post Checklist Data: " + response.message);
				dialog.show();
			}	
		},
		error: function() 
		{
			Reset();
			loader.hide();
			var dialog = new Dialog("#infobox2", "Post Checklist Data: " + response.message);
				dialog.show();
		}
	})

}

function getMaxVersion(records) {
	var maxVersion = 0;
	
	for (var i = 0; i < records.length; i++) {
		var item = records[i];
		
		maxVersion = Math.max(maxVersion, item.version);
	}
	
	return maxVersion;
}

function deleteChecklistById(loginToken, checklist, callback) {

	var request = { "mode":"ajax", "token":loginToken, "preflight": checklist.preflight,
	"takeoff":checklist.takeoff, "landing":checklist.landing, "emergencies":checklist.emergencies,
	"manufacturer":checklist.manufacturer, "model":checklist.model, "modelYear":checklist.model.modelYear, "isDeleted":true }
	
	$.ajax
	({
		type: "post",
		data: JSON.stringify(request),
		contentType:"application/json; charset=utf-8",
		dataType: "json",
		url: host + "services/ajax/aircraft/checklist/" + checklist._id,
		success: function(response) 
		{
			if(response.success == true)
			{
				loader.hide();
				var dialog = new Dialog("#infobox2", "Deleted Checklist Successfully");
				dialog.show();
				if(callback)
					callback();
			}
			else
			{
				Reset();
				loader.hide();
				var dialog = new Dialog("#infobox2", "Deleting Checklist: " + response.message);
				dialog.show();
			}	
		},
		error: function() 
		{
			Reset();
			loader.hide();
			var dialog = new Dialog("#infobox2", "Deleting Checklist: " + response.message);
				dialog.show();
		}
	})
}

function findChecklistProduct(loginToken, callback){
	
	var request = { "mode":"ajax", "token":loginToken }
	
	$.ajax
	({
		type: "get",
		data: JSON.stringify(request),
		contentType:"application/json; charset=utf-8",
		dataType: "json",
		url: host + "services/ajax/aircraft/products?token=" + loginToken,
		success: function(data) 
		{
			var response = data;
								
			if(response.success == true)
			{
				var returnList = "";
				
				for(var i = 0; i < response.records.length; i++)
				{
					var list = response.records[i];
					
					if(list.aircraftChecklist == g_checklist._id)
					{
						returnList = list;
						break;
					}
				}
				
				callback(returnList);
			}
			else
			{
				alert("Request Failed");
			}	
		},
		error: function(a,b,c) 
		{
			alert("Request Errored Out");
		}
	})
}

function PostCheckListData(logintoken, mfg, model, suppressDialog)
{
	
	g_checklist.manufacturer = mfg;
	g_checklist.model = model;
	
	var checklist = { "mode":"ajax", "token":logintoken, "model":model._id, "manufacturer":mfg._id, "preflight": g_checklist.preflight,
	"takeoff":g_checklist.takeoff, "landing":g_checklist.landing, "emergencies":g_checklist.emergencies,
	"modelYear":model.modelYear, "serialNumber":g_checklist.serialNumber, "version":g_checklist.version }

	loader.show();
	
	$.ajax
	({
		type: "post",
		data: JSON.stringify(checklist),
		contentType:"application/json; charset=utf-8",
		dataType: "json",
		url: host + "services/ajax/aircraft/checklists",
		success: function(data) 
		{
			var response = data;
								
			if(response.success == true)
			{
				loader.hide();
				var dialog = new Dialog("#infobox2","Successfully uploaded Version " + (selectedVersion));
				dialog.show();
				
				if (response.records.length > 0)
				{
					g_checklist = response.records[0];
				}
				else
					return;
				RequestChecklistData(logintoken, mfg, model, function(response)
				{
					LoadObjects(response.records);
				});
			}
			else
			{
				if( response.message != null && response.message.code == 11000) //Duplicate Entry!
				{
					if(suppressDialog)
					{
						RequestVersionNumber(logintoken, g_checklist.manufacturer,g_checklist.model, function(response) {
								
							selectedVersion = response.returnValue;
							
							g_checklist.version = response.returnValue;
							
							PostCheckListData(logintoken, g_checklist.manufacturer, g_checklist.model, true);
							
						});
					}
					else
					{
						var confirmdialog = new ConfirmationDialog("#confirmation-duplicate", function(result) {
							if(result)
							{
								RequestVersionNumber(logintoken, g_checklist.manufacturer,g_checklist.model, function(response) {
								
									selectedVersion = response.returnValue;
									
									g_checklist.version = response.returnValue;
									
									PostCheckListData(logintoken, g_checklist.manufacturer, g_checklist.model, false);
									
								});
							}
							else
							{
								Reset();
								loader.hide();
								return;
							}
						});
						confirmdialog.show();
					}
				}
				else
				{
					Reset();
					loader.hide();
					var dialog = new Dialog("#infobox2", "Post Checklist Data: " + response.message);
					dialog.show();
				}
			}	
		},
		error: function() 
		{
			loader.hide();
			Reset();
			var dialog = new Dialog("#infobox2", "Error Checklist Data: " + response.message);
				dialog.show();
		}
	})

}

function RequestVersionNumber(logintoken,mfg,model, callback) {
	var request = { "mode":"rpc","token":logintoken,"manufacturer":mfg._id,"model":model._id }
	loader.show();
	
	$.ajax({
		type:"post",
		data: JSON.stringify(request),
		dataType: "json",
		contentType:"application/json; charset=utf-8",
		url: host + "services/rpc/aircraft/checklist/version",
		success: function(data) {
			
			var response = data;
			
			if(response.success == true) {
				exitOverlay();
				loader.hide();
				if(callback)
					callback(response);
			}
			else {
				loader.hide();
				var dialog = new Dialog("#infobox2", "Error Requesting Checklist Version");
				dialog.show();
			}
			
		},
		error: function() {
			loader.hide();
			var dialog = new Dialog("#infobox2", "Requesting Checklist Version: " + response.message);
			dialog.show();
		}
	})
}

function RequestChecklistData(logintoken, mfg, model, callback)
{
	var checklist = { "mode":"ajax", "token":logintoken}
	loader.show();
	
	$.ajax
	({
		type: "get",
		data: checklist,
		dataType: "json",
		contentType:"application/json; charset=utf-8",
		url: host + "services/ajax/aircraft/checklist/manufacturer/" + mfg._id + "/model/" + model._id,
		success: function(data) 
		{
			var response = data;
								
			if(response.success == true)
			{
				exitOverlay();
				loader.hide();
				
				var records = [];
				
				for(var i = 0; i < response.records.length; i++)
				{
					if(!response.records[i].isDeleted)
						records.push(response.records[i]);
				}
				
				response.records = records;
				
				checklistResponse = response;
				if(callback)
					callback(response);
			}
			else
			{
				Reset();
				loader.hide();
				var dialog = new Dialog("#infobox2", "Requesting Checklist Data: " + response.message);
				dialog.show();
			}	
		},
		error: function() 
		{
			loader.hide();
			var dialog = new Dialog("#infobox2", "Error Requesting Checklist Data");
			dialog.show();
		}
	})
}

function Post_Mfg(token, mfg, model)
{
	var postdata = { "mode":"ajax", "token":token, "name":mfg, "description":"" }
	loader.show();
	
	$.ajax({
		type: "post",
		data: postdata,
		dataType: "json",
		url: host + "services/ajax/aircraft/manufacturers",
		success: function(data) {
			var response = data;
			
			if(response.success == true)
			{
				loader.hide();
				Request_Mfg(token, mfg, model);
			}
			else
			{
				loader.hide();
				var dialog = new Dialog("#infobox2", "Post Manufacturer: " + response.message);
				dialog.show();
			}	
		},
		error: function() {
			loader.hide();
			var dialog = new Dialog("#infobox2", "Post Manufacturer: " + response.message);
			dialog.show();
		}
	})
}

function Request_Mfg(token, mfg, model)
{
	var postdata = { "mode":"ajax", "token":token, "name":mfg, "description":"" }
	loader.show();
	
	$.ajax({
		type: "get",
		data: postdata,
		dataType: "json",
		url: host + "services/ajax/aircraft/manufacturers",
		success: function(data) {
			var response = data;
			
			if(response.success == true)
			{
				mfgRequestResponse = response;
				
				insertMFGtoList(mfgRequestResponse.records);
				loader.hide();
			}
			else
			{
				Reset();
				loader.hide();
				var dialog = new Dialog("#infobox2", "Requesting Manufacturer Data: " + response.message);
				dialog.show();
			}	
		},
		error: function() {
			Reset();
			loader.hide();
			var dialog = new Dialog("#infobox2", "Requesting Manufacturer Data: " + response.message);
				dialog.show();
		}
	})
}

function Request_Model(token, model, mfg)
{
	var getdata = { "mode":"ajax", "token":token, "name":model, "description":"","manufacturer":mfg._id }
	loader.show();
	
	$.ajax({
		type: "get",
		data: getdata,
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		url: host + "services/ajax/aircraft/models",
		success: function(data) {
			var response = data;
			
			if(response.success == true)
			{
				modelRequestResponse = response;
				
				insertModelstoList(modelRequestResponse.records);
				
				loader.hide();
			}
			else
			{
				Reset();
				loader.hide();
				var dialog = new Dialog("#infobox2", "Requesting Model Data: " + response.message);
				dialog.show();
			}	
		},
		error: function() {
			Reset();
			loader.hide();
			var dialog = new Dialog("#infobox2", "Requesting Model Data: " + response.message);
				dialog.show();
		}
	})
}

function Post_Model(token, model, year, mfg)
{
	var postdata = { "mode":"ajax", "token":token, "name":model, "description":"","manufacturer":mfg._id, "modelYear":year }

	$.ajax({
		type: "post",
		data: JSON.stringify(postdata),
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		url: host + "services/ajax/aircraft/models",
		success: function(data) {
			var response = data;
			
			if(response.success == true)
			{
				modelRequestResponse = response;
				Request_Model(token, mfg, model);
			}
			else
			{
				Reset();
				loader.hide();
				var dialog = new Dialog("#infobox2", "Posting Model: " + response.message);
				dialog.show();
			}	
		},
		error: function() {
			loader.hide();
			var dialog = new Dialog("#infobox2", "Posting Model: " + response.message);
				dialog.show();
		}
	})
}
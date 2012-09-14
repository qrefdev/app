var mfgRequestResponse = "";
var modelRequestResponse = "";
var g_checklist = "";
var selectedmfg = "";
var selectedmodel = "";
var checklistResponse = "";

function GetandPost(checklistdata, logintoken)
{
	g_checklist = checklistdata;
	showMFGOverlay(logintoken);
}

function PostEditedCheckListData(logintoken, editedchecklist)
{
	var checklist = { "mode":"ajax", "token":logintoken, "preflight": editedchecklist.preflight,
	"takeoff":editedchecklist.takeoff, "landing":editedchecklist.landing, "emergencies":editedchecklist.emergencies,
	"manufacturer":editedchecklist.manufacturer, "model":editedchecklist.model, "modelYear":"0000"}

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
				var dialog = new Dialog("#infobox", "Successfully Posted Edited Data");
				dialog.show();
			}
			else
			{
				Reset();
				var dialog = new Dialog("#infobox", "Failed posting Checklist Data");
				dialog.show();
			}	
		},
		error: function() 
		{
			Reset();
			var dialog = new Dialog("#infobox", "Error posting CheckList Data");
				dialog.show();
		}
	})

}



function PostCheckListData(logintoken, mfg, model)
{
	
	g_checklist.manufacturer = mfg;
	g_checklist.model = model;
	
	var checklist = { "mode":"ajax", "token":logintoken, "model":model._id, "manufacturer":mfg._id, "preflight": g_checklist.preflight,
	"takeoff":g_checklist.takeoff, "landing":g_checklist.landing, "emergencies":g_checklist.emergencies,
	"modelYear":g_checklist.modelYear, "serialNumber":g_checklist.serialNumber}

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
				RequestChecklistData(logintoken, mfg, model);
			}
			else
			{
				Reset();
				var dialog = new Dialog("#infobox", "Failed posting Checklist Data");
				dialog.show();
			}	
		},
		error: function() 
		{
			Reset();
			var dialog = new Dialog("#infobox", "Error posting CheckList Data");
				dialog.show();
		}
	})

}

function RequestChecklistData(logintoken, mfg, model)
{
	var checklist = { "mode":"ajax", "token":logintoken}

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
				checklistResponse = response;
				
				LoadObjects(response.records);
				
				exitOverlay();
			}
			else
			{
				Reset();
				var dialog = new Dialog("#infobox", "Error Requesting Checklist Data");
				dialog.show();
			}	
		},
		error: function() 
		{
			var dialog = new Dialog("#infobox", "Cannot connect to server");
			dialog.show();
		}
	})
}

function Post_Mfg(token, mfg, model)
{
	var postdata = { "mode":"ajax", "token":token, "name":mfg, "description":"" }

	$.ajax({
		type: "post",
		data: postdata,
		dataType: "json",
		url: host + "services/ajax/aircraft/manufacturers",
		success: function(data) {
			var response = data;
			
			if(response.success == true)
			{
				Request_Mfg(token, mfg, model);
			}
			else
			{
				var dialog = new Dialog("#infobox", "Failed posting Manufacturer");
				dialog.show();
			}	
		},
		error: function() {
			var dialog = new Dialog("#infobox", "Error posting Manufacturer");
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
				var dialog = new Dialog("#infobox", "Failed Requesting Manufacturer Data");
				dialog.show();
			}	
		},
		error: function() {
			Reset();
			var dialog = new Dialog("#infobox", "Error Requesting Manufacturer Data");
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
				var dialog = new Dialog("#infobox", "Failed Requesting Model Data");
				dialog.show();
			}	
		},
		error: function() {
			Reset();
			var dialog = new Dialog("#infobox", "Failed Requesting Manufacturer Data");
				dialog.show();
		}
	})
}

function Post_Model(token, model, mfg)
{
	var postdata = { "mode":"ajax", "token":token, "name":model, "description":"","manufacturer":mfg._id  }

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
				var dialog = new Dialog("#infobox", "Failed Posting Model");
				dialog.show();
			}	
		},
		error: function() {
			var dialog = new Dialog("#infobox", "Error Posting Model");
				dialog.show();
		}
	})
}
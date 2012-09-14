var mfgRequestResponse = "";
var modelRequestResponse = "";
var g_checklist = "";
var selectedmfg = "";
var selectedmodel = "";
var checklistResponse = "";
var selectedVersion = 0;

function GetandPost(checklistdata, logintoken)
{
	g_checklist = checklistdata;
	showMFGOverlay(logintoken);
}

function PostEditedCheckListData(logintoken, editedchecklist, callback)
{
	var checklist = { "mode":"ajax", "token":logintoken, "preflight": editedchecklist.preflight,
	"takeoff":editedchecklist.takeoff, "landing":editedchecklist.landing, "emergencies":editedchecklist.emergencies,
	"manufacturer":editedchecklist.manufacturer, "model":editedchecklist.model, "modelYear":"0000"}
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
				var dialog = new Dialog("#infobox", "Successfully Posted Edited Data");
				dialog.show();
				callback();
			}
			else
			{
				Reset();
				loader.hide();
				var dialog = new Dialog("#infobox", "Post Checklist Data: " + response.message);
				dialog.show();
			}	
		},
		error: function() 
		{
			Reset();
			loader.hide();
			var dialog = new Dialog("#infobox", "Post Checklist Data: " + response.message);
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
				var dialog = new Dialog("#infobox","Successfully uploaded Version " + selectedVersion);
				dialog.show();
				RequestChecklistData(logintoken, mfg, model, function(response)
				{
					LoadObjects(response.records);
				});
			}
			else
			{
				if( response.message.err != undefined && response.message.err.contains("E11000")) //Duplicate Entry!
				{
					var confirmdialog = new ConfirmationDialog($("#confirmation-duplicate"), function(result) {
						if(result)
						{
							RequestChecklistData(logintoken,mfg,model,function(response)
							{
								//Find Record in question
								var originalRecord = response.records[response.records.length - 1];
								
								selectedVersion = response.records.length + 1;
										
								originalRecord.version = selectedVersion;
							
								originalRecord.emergencies = g_checklist.emergencies;
								originalRecord.preflight = g_checklist.preflight;
								originalRecord.takeoff = g_checklist.takeoff;
								originalRecord.landing = g_checklist.landing;
							
								g_checklist = originalRecord;
								
								PostCheckListData(logintoken, mfg, model);
								
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
				else
				{
					Reset();
					loader.hide();
					var dialog = new Dialog("#infobox", "Post Checklist Data: " + response.message);
					dialog.show();
				}
			}	
		},
		error: function() 
		{
			loader.hide();
			Reset();
			var dialog = new Dialog("#infobox", "Error Checklist Data: " + response.message);
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
				checklistResponse = response;
				callback(response);
			}
			else
			{
				Reset();
				loader.hide();
				var dialog = new Dialog("#infobox", "Requesting Checklist Data: " + response.message);
				dialog.show();
			}	
		},
		error: function() 
		{
			loader.hide();
			var dialog = new Dialog("#infobox", "Requesting Checklist Data: " + response.message);
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
				var dialog = new Dialog("#infobox", "Post Manufacturer: " + response.message);
				dialog.show();
			}	
		},
		error: function() {
			loader.hide();
			var dialog = new Dialog("#infobox", "Post Manufacturer: " + response.message);
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
				var dialog = new Dialog("#infobox", "Requesting Manufacturer Data: " + response.message);
				dialog.show();
			}	
		},
		error: function() {
			Reset();
			loader.hide();
			var dialog = new Dialog("#infobox", "Requesting Manufacturer Data: " + response.message);
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
				var dialog = new Dialog("#infobox", "Requesting Model Data: " + response.message);
				dialog.show();
			}	
		},
		error: function() {
			Reset();
			loader.hide();
			var dialog = new Dialog("#infobox", "Requesting Model Data: " + response.message);
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
				var dialog = new Dialog("#infobox", "Posting Model: " + response.message);
				dialog.show();
			}	
		},
		error: function() {
			loader.hide();
			var dialog = new Dialog("#infobox", "Posting Model: " + response.message);
				dialog.show();
		}
	})
}
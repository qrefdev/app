var host = "http://my.qref.com/";

//Default Theme Settings 
var NightTimeModeTime = "00:00";
var NightTimeModeTimeOff = "00:00";
var AutoSwitch = false;
var NightMode = false;
var NightTheme = "theme-dark";
var DayTheme = "theme-light";

//Initialize
var checklists = undefined;
var Navigation = undefined;

//var SettingsEditor = new SettingsEditorHandler();
var Sync = new SyncProcessor();

$(window).load(function() {
	Navigation = new zimoko.Navigation(true, '.page');
	
	//Attach Observers!!!
	EditTailObserver.attach('#edittail');
	EditAddObserver.attach('#editadd');
	StoreObserver.attach('#downloads');
	ProductDetailsObserver.attach('#productdetails');
	E6BObserver.attach('#e6b');
	MenuObserver.attach('#menu');
	EmergenciesObserver.attach('#emergencies');
	ChecklistObserver.attach('#checklist');
	DashboardObserver.attach('#dashboard');
	AppObserver.attach('body');
	
	window.addEventListener("touchmove", function(e) {
			e.preventDefault();
	}, true);
	
	window.location.href = "qref://onload";
    //DataLoaded();
});

function keyboardShown(keyboardHeight, viewHeight) {
	$(".flyover").css({bottom: (keyboardHeight + 8) + "px"});
}

function keyboardHidden() {
	$(".flyover").css({bottom: "8px"});
}

//601 - Moved cache pack to AppObserver
function BeginChecklistPackets() {
    AppObserver.cachePack = "";
}

function AppendChecklist(data) {
    if(data) {
        if(AppObserver.cachePack == undefined)
            AppObserver.cachePack = [];
        
        try {
            var decoded = decodeURIComponent(unescape(atob(data)));
            var checklist = JSON.parse(decoded);
        
            AppObserver.cachePack.push(checklist);
        } catch (e) {
            
        }
    }
}

function LoadChecklistPacket(data) {
    AppObserver.cachePack = AppObserver.cachePack + data;
}

function PushImage(data) {
    var imageArray = data.split(";");
    
	if(imageArray[2].toLowerCase() == "productlisting")
	{
		var item = $("#downloads-items li[data-id='" + imageArray[1] + "']");
	
		if(item.length > 0)
			item.find(".plane-icon").html('<img src="' + imageArray[0] + '" />');
	}
	else if(imageArray[2].toLowerCase() == "checklistlisting")
	{
		var item = $("#dashboard-planes li[data-id='" + imageArray[1] + "']");
	
		if(item.length > 0)
			item.find(".plane-icon").html('<img src="' + imageArray[0] + '" />');
	}
	else if(imageArray[2].toLowerCase() == "productdetails")
	{
		var details = $("#productDetailsListing");
		details.find(".productImage").html('<img src="' + imageArray[0] + '" />');
	}
}

function RefreshToken() {
	if(AppObserver.token != "" && AppObserver.token != undefined)
	{
		var refresh = { "mode":"rpc", "token": AppObserver.token}
		
		$.ajax({
			type: "post",
			url: host + "services/rpc/auth/refreshToken",
			data: refresh,
			success: function(data) {
				var response = data;
				
				if(response.success == true)
				{
					AppObserver.set('token', response.returnValue);
					window.location.href = "qref://setToken=" + AppObserver.token;
				}
			
			},
			error: function(data) {
				
			}
		});
	}
}

function UpdateLoginDisplay(email) {
    AppObserver.set('email', email);
}

function DataLoaded() {
	window.location.href = "qref://clearCache";
	$("#editAddForm").validate({
		submitHandler: function() {
			EditAddObserver.edit();
		}
	});
	
	$("#registerForm").validate({
		submitHandler:function() {
			Register();
		}
	});
	
	$("#signinForm").validate({
		submitHandler: function() {
			Signin();
		}
	});
	
	$("#passwordRecoveryForm").validate({
		submitHandler: function() {
			passwordRecovery();
		}
	});
	
	$("#changePasswordForm").validate({
		submitHandler: function() {
			changePassword();
		}
	});
	//AppObserver.set('loading', false);
	AppObserver.load();
	Navigation.go("dashboard");
	Sync.init();
}
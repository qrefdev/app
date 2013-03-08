var host = "https://my.qref.com/";

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
var cachePack = "";

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

	AppObserver.set('token', QrefInterface.getToken());
	AppObserver.set('email', QrefInterface.getUser());
	
	loadCache();

    DataLoaded();
});

function loadCache() {
	var cacheChecklists = [];
	
	QrefInterface.findChecklistFiles();
	while(QrefInterface.hasNextChecklist()) {
		try {
			var checklist = QrefInterface.getNextChecklist();
		
			if(checklist != undefined) {
				cacheChecklists.push(JSON.parse(checklist));
			}		
		} catch (e) {

		}
	}
	
	if(cacheChecklists.length > 0) {
		AppObserver.cachePack = cacheChecklists;
	}
}

function keyboardShown(keyboardHeight, viewHeight) {
	$(".flyover").css({bottom: (keyboardHeight + 8) + "px"});
}

function keyboardHidden() {
	$(".flyover").css({bottom: "8px"});
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
					QrefInterface.updateToken(response.returnValue);
				}
			
			},
			error: function(data) {
				
			}
		});
	}
}

function DataLoaded() {
	var refreshTimer = new Timer(300000, function() {
		RefreshToken();
	});
	
	refreshTimer.start();
	
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
	
	setTimeout(function() {
		Navigation.go("dashboard");
		QrefInterface.hideSplash();
	}, 100);
	
	Sync.init();
}
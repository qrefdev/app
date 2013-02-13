var cachePack = "";

//Initialize
var Checklist = new CheckListHandler();
var ChecklistEditor = new ChecklistEditorHandler();
var TailNumberEditor = new TailNumberEditorHandler();
var MyProducts = new MyProductsHandler();
var SettingsEditor = new SettingsEditorHandler();
var Sync = new SyncHandler();
var syncLoader = undefined;
var Theme = new ThemeHandler();

$(window).load(function() {
	loader.show();
    syncLoader = new Loader("#syncLoader");
    DataLoaded();
});

function DataLoaded() {
	Navigation.init();
	MyProducts.init();
	SettingsEditor.init();
	Authentication.verify();
	
	$("#editAddForm").validate({
		submitHandler: function() {
			if(ChecklistEditor.editing)
			{
				ChecklistEditor.edit();
			}
			else if(!ChecklistEditor.editing)
			{
				ChecklistEditor.add();
			}
		}
	});
	
	$("#editTailForm").validate({
		submitHandler: function() {
			TailNumberEditor.edit();
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
	
	var UTC = new UTCTime();
	UTC.update();
	var converter = new Converter();
	converter.init();
	
	loader.hide();
	Navigation.go("dashboard");
	
	resetPassword();
}


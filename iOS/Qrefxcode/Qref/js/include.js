var host = "http://my.qref.com/";
var loader = undefined;
var Navigation = new NavigationHandler();
var Authentication = new AuthenticationHandler();
var token = "";

//Default Settings 
var NightTimeModeTime = "00:00";
var NightTimeModeTimeOff = "00:00";
var AutoSwitch = false;
var NightMode = false;
var NightTheme = "theme-dark";
var DayTheme = "theme-light";

$(window).load(function() {
	
	window.addEventListener("touchmove", function(e) {
				e.preventDefault();
		  }, true);
		  
    loader = new Loader("#loader");
});

function AuthenticationHandler() {
	
	this.signOut = function() {
		token = "";
		this.verify();
        $(".currentLogin .user").html("");
		window.location.href = "qref://clearToken&clearUser";
		cachePack = "";
		Checklist.checklists = undefined;
		$("#emergency-items").html('');
		$("#check-sections-items").html('');
		$("#checklist-items").html('');
		$("#dashboard-planes").html('');
		Navigation.go('dashboard');
	};
	
	this.verify = function() {
		if(token == undefined || token == "") 
		{
			token = "";
			
			$("#signin-menu").show();
			$("#signout-menu").hide();
			$("#register-menu").show();
			$("#sync-menu").hide();
			$("#changepassword-menu").hide();
			this.addFrontPageButtons();
		}
		else
		{
			$("#signin-menu").hide();
			$("#signout-menu").show();
			$("#register-menu").hide();
			$("#sync-menu").show();
			$("#changepassword-menu").show();
		}
	};
	
	this.addFrontPageButtons = function() {
		$("#dashboard-planes").html($("#frontPageButtons").html());
		$("#dashboard-planes li").each(function() {
        	if($(this).attr("data-link"))
        	{
        		$(this).tap(function(e) {
        			Navigation.autoGo($(this));
        		});
        	}
        });
	};
}
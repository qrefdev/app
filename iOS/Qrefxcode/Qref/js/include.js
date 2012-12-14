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
               loader = new Loader("#loader");
});

function AuthenticationHandler() {
	
	this.signOut = function() {
		token = "";
		this.verify();
		window.location.href = "qref://clearToken&clearUser";
	};
	
	this.verify = function() {
		if(token == undefined || token == "") 
		{
			token = "";
			
			$("#signin-menu").show();
			$("#signout-menu").hide();
			$("#register-menu").show();
			$("#sync-menu").hide();
		}
		else
		{
			$("#signin-menu").hide();
			$("#signout-menu").show();
			$("#register-menu").hide();
			$("#sync-menu").show();
		}
	};
}
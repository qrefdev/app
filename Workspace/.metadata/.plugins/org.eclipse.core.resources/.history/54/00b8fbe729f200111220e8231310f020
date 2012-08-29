
var token = "";

var Checklist = new CheckListHandler();
var Navigation = new NavigationHandler();
var MyProducts = new MyProductsHandler();
var Authentication = new AuthenticationHandler();
var Theme = new ThemeHandler();
var loader = undefined;
var cached = false;
var online = true;
var cachedUserProducts = "";
var previousProduct = "";
var previousArea = "";
var previousCategory = "";
var host = "http://66.128.48.242/";

$(function() {
	$.getScript("js/listitemhandler.js");
	$.android = /android/.test(navigator.userAgent.toLowerCase())

	loader = new Loader();
	Navigation.init();
	MyProducts.init();
	Authentication.init();
	
	$("#editAddForm").validate({
		submitHandler: function() {
			SaveEditAdd();
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
	
	Navigation.updateArea();
});

function AuthenticationHandler() {
	this.init = function() {
		token = $.cookie.getCookie("QrefAuth");

		this.verify();
	};
	
	this.verify = function() {
		if(token == undefined) 
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

function SaveEditAdd() {
	//do something
}



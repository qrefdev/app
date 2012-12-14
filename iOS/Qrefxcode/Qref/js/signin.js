function Signin() {
	var signin = { "mode":"rpc", "userName": $("#email").val(), "password": $("#password").val() }
	
	loader.show();
	
    window.location.href = "qref://clearCache";
    
	$.ajax({
		type: "post",
		data: signin,
		dataType: "json",
		url: host + "services/rpc/auth/login",
		success: function(data) {
			var response = data;
			
			loader.hide();
			
			if(response.success == true)
			{
				token = response.returnValue;
				Authentication.verify();
				window.location.href = "qref://setToken=" + token + "&setUser=" + $("#email").val();
                setTimeout(function() {
                      Navigation.go("dashboard");
                }, 200);
			}
			else
			{
				var dialog = new Dialog("#infobox", "Invalid email or password");
				dialog.show();
			}	
		},
		error: function() {
			loader.hide();
			var dialog = new Dialog("#infobox", "Cannot connect to server");
			dialog.show();
		}
	});
}
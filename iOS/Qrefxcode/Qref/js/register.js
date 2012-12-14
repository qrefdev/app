function Register() {
	var register = { "mode":"rpc", "userName": $("#emailRegister").val(), "password": $("#passwordRegister").val() }
	
	loader.show();
	
	if($("#passwordRegister").val() == "")
	{
		var dialogbox = new Dialog("#infobox", "Please fill out all fields");
		dialogbox.show();
		loader.hide();
		return;
	}
	else if($("#passwordRegister").val() != $("#confirmPassword").val())
	{
		var dialogbox = new Dialog("#infobox", "Password and Confirm Password do not match");
		dialogbox.show();
		loader.hide();
		return; 
	}
    
    window.location.href = "qref://clearCache";
	
	$.ajax({
		type: "post",
		data: register,
		url: host + "services/rpc/auth/registerAccount",
		success: function(data) {
			var response = data;
			
			loader.hide();
			
			if(response.success == true)
			{
				var dialog = new Dialog("#infobox", "Registration Successful!", function() {
				
					Navigation.go("signin");
				});
				
				dialog.show();
			}
			else
			{
				if(response.returnValue == 2)
				{
					var dialog = new Dialog("#infobox", "An account already exists with the provided email.");
					dialog.show();
				}
				else
				{
					var dialog = new Dialog("#infobox", "Server Error. Please try again.");
					dialog.show();
				}
			}	
		},
		error: function() {
			loader.hide();
			var dialog = new Dialog("#infobox", "Cannot connect to server");
			dialog.show();
		}
	});
}

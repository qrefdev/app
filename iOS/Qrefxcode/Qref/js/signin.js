function Signin() {
	var signin = { "mode":"rpc", "userName": $("#email").val(), "password": $("#password").val() };
	
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
                $(".currentLogin .user").html($("#email").val());
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

function changePassword() {
	var changingRequest = { "mode":"rpc", "oldPassword":$("#oldPassword").val(), "newPassword":$("#newPassword").val(), "token": token };
	
	if($("#newPassword").val() != $("#newPasswordConfirm").val()) 
	{
		var dialog = new Dialog("#infobox", "New Password and Confirm Password must match");
		dialog.show();
	}
	else
	{
		loader.show();
		
		window.location.href = "qref://clearCache";
		
		$.ajax({
			type: "post",
			data: changingRequest,
			dataType: "json",
			url: host + "services/rpc/auth/changePassword",
			success: function(data) {
				var response = data;
				
				loader.hide();
				
				if(response.success == true)
				{
					var dialog = new Dialog("#infobox", "Password changed successfully");
					dialog.show();
					$("#oldPassword").val("");
					$("#newPassword").val("");
					$("#newPasswordConfirm").val("");
					Navigation.go("dashboard");		
				}
				else
				{
					var dialog = new Dialog("#infobox", response.message);
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
}

function passwordRecovery() {
	var recovery = { "mode":"rpc", "userName": $("#recoveryEmail").val() };
	
	loader.show();
	
	window.location.href = "qref://clearCache";
	
	$.ajax({
		type: "post",
		data: recovery,
		dataType: "json",
		url: host + "services/rpc/auth/passwordRecoveryRequest",
		success: function(data) {
			var response = data;
			
			loader.hide();
			
			if(response.success == true)
			{
				var dialog = new Dialog("#infobox", "An email has been sent with instruction on how to finish the recovery process.");
				$("#recoveryEmail").val("");
				$("#recoveryEmail").focus().blur();
				dialog.show();		
			}
			else
			{
				var dialog = new Dialog("#infobox", "Invalid E-mail");
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

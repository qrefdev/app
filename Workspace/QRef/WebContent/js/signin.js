function Signin() {
	var signin = { "mode":"rpc", "userName": $("#email").val(), "password": $("#password").val() };
	
	AppObserver.set('loading', true);
	 
	$.ajax({
		type: "post",
		data: signin,
		dataType: "json",
		url: host + "services/rpc/auth/login",
		success: function(data) {
			var response = data;
			
			AppObserver.set('loading', false);
			
			if(response.success == true)
			{
				AppObserver.set('token', response.returnValue.token);
				AppObserver.set('email', $("#email").val());
				$.cookie.setCookie("QrefAuth", response.returnValue.token, 7);
							
                setTimeout(function() {
					AppObserver.set('loading', true);
					AppObserver.getChecklists(function(success, items) {
						if(success) {
							DashboardDataSource.data(items);
							DashboardObserver.set('dataSource', DashboardDataSource);
						}
						
						AppObserver.set('loading', false);
					});
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
			AppObserver.set('loading', hide);
			var dialog = new Dialog("#infobox", "Cannot connect to server");
			dialog.show();
		}
	});
}

function changePassword() {
	var changingRequest = { "mode":"rpc", "oldPassword":$("#oldPassword").val(), "newPassword":$("#newPassword").val(), "token": AppObserver.token };
	
	if($("#newPassword").val() != $("#newPasswordConfirm").val()) 
	{
		var dialog = new Dialog("#infobox", "New Password and Confirm Password must match");
		dialog.show();
	}
	else
	{
		AppObserver.set('loading', true);
		
		$.ajax({
			type: "post",
			data: changingRequest,
			dataType: "json",
			url: host + "services/rpc/auth/changePassword",
			success: function(data) {
				var response = data;
				
				AppObserver.set('loading', false);
				
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
				AppObserver.set('loading', false);
				var dialog = new Dialog("#infobox", "Cannot connect to server");
				dialog.show();
			}
		});
	}
}

function passwordRecovery() {
	var recovery = { "mode":"rpc", "userName": $("#recoveryEmail").val() };
	
	AppObserver.set('loading', true);
	
	$.ajax({
		type: "post",
		data: recovery,
		dataType: "json",
		url: host + "services/rpc/auth/passwordRecoveryRequest",
		success: function(data) {
			var response = data;
			
			AppObserver.set('loading', false);
			
			if(response.success == true)
			{
				var dialog = new Dialog("#infobox", "An email has been sent with instruction on how to finish the recovery process.");
				
				$("#recoveryEmail").val("");
				
				dialog.show();		
			}
			else
			{
				var dialog = new Dialog("#infobox", "Invalid E-mail");
				dialog.show();
			}
		},
		error: function() {
			AppObserver.set('loading', false);
			
			var dialog = new Dialog("#infobox", "Cannot connect to server");
			dialog.show();
		}
	});
}

function resetPassword() {
	var resetToken = $.querystring("passwordRecovery");
	
	if(resetToken)
	{
		if(resetToken.indexOf('#') > -1)
		resetToken = resetToken.split('#')[0];
		
		AppObserver.set('loading', true);
		
		var recovery = {"mode":"rpc", "token": resetToken };
		
		$.ajax({
			type: "post",
			data: recovery,
			dataType: "json",
			url: host + "services/rpc/auth/passwordRecovery",
			success: function(data) {
				AppObserver.set('loading', false);
			
				if(data.success)
				{
					var dialog = new Dialog("#infobox", "An email has been sent with your new password!");
					dialog.show();
				}
				else
				{
					var dialog = new Dialog("#infobox", data.message);
					dialog.show();
				}
			},
			error: function() {
				AppObserver.set('loading', false);
				var dialog = new Dialog("#infobox", "Cannot connect to server");
				dialog.show();
			}
		});
	}
}

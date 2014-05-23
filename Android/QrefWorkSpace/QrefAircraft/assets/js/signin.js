function Signin() {
	var signin = { "mode":"rpc", "userName": $("#email").val(), "password": $("#password").val() };
	
	AppObserver.set('loading', true);
    
    if(QrefInterface.isConnected()) {		
		AppObserver.ajax({
			data: JSON.stringify(signin),
			url: host + 'services/rpc/auth/login',
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			success: function(response) {
				if(response.success == true)
				{
					AppObserver.set('token', response.returnValue.token);
					AppObserver.set('email', signin.userName);
					QrefInterface.updateUser(response.returnValue.user, signin.userName);
					QrefInterface.updateToken(response.returnValue.token);
					QrefInterface.setLogin(response.returnValue.user, signin.userName, Whirlpool(signin.password));
                    
                    signinLoadChecklists();
				}
				else
				{
					InvalidSignin();
				}
			},
			error: function() {
				AppObserver.set('loading', false);
				var dialog = new Dialog("#infobox", "Cannot connect to server");
				dialog.show();
			}
		});
	}
	else {
		var token = QrefInterface.localLogin(signin.userName, Whirlpool(signin.password));
		if(token != undefined && token != '') {
			AppObserver.set('token', token);
			AppObserver.set('email', signin.userName);
			loadCache();
			setTimeout(function() {
				AppObserver.getChecklists(function(success, items) {
					if(success) {
						DashboardDataSource.data(items);
						DashboardObserver.set('dataSource', DashboardDataSource);
					}
				
					AppObserver.set('loading', false);
				});
			}, 200);
			Navigation.go("dashboard");
		}
		else {
			InvalidSignin();
		}
	}
}

function signinLoadChecklists() {
    $("#email").val("");
    $("#password").val("");
    
    AppObserver.set('loading', true);
    
    loadCache();
    
    if(AppObserver.cachePack != '' && AppObserver.cachePack != undefined && checklists == undefined) {
        AppObserver.getChecklists(function(success, items) {
            if(success) {
                DashboardDataSource.data(items);
                DashboardObserver.set('dataSource', DashboardDataSource);
            }

            AppObserver.set('loading', false);
                            
            Sync.sync();
        });
    }
    else {
        AppObserver.set('loading', false);
        Sync.sync();
    }
    Navigation.go("dashboard");
}

function InvalidSignin() {
	AppObserver.set('loading', false);
    var dialog = new Dialog("#infobox", "Invalid email or password");
    dialog.show();
}

function changePassword() {
	var changingRequest = { "mode":"rpc", "oldPassword":$("#oldPassword").val(), "newPassword":$("#newPassword").val(), "token": AppObserver.token };
	
    if(QrefInterface.isConnected()) {
        if($("#newPassword").val() != $("#newPasswordConfirm").val()) 
        {
            var dialog = new Dialog("#infobox", "New Password and Confirm Password must match");
            dialog.show();
        }
        else
        {
            AppObserver.set('loading', true);
            
            window.location.href = "qref://clearCache";
            
            AppObserver.ajax({
                type: "post",
                data: changingRequest,
                dataType: "json",
                contentType: 'application/json',
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
    else {
        AppObserver.set('loading', false);
        var dialog = new Dialog("#infobox", "No Connection Available");
        dialog.show();
    }
}

function passwordRecovery() {
	var recovery = { "mode":"rpc", "userName": $("#recoveryEmail").val() };
	
	AppObserver.set('loading', true);
	
	window.location.href = "qref://clearCache";
	
    if(QrefInterface.isConnected()) {
        AppObserver.ajax({
            type: "post",
            data: recovery,
            dataType: "json",
            contentType: 'application/json',
            url: host + "services/rpc/auth/passwordRecoveryRequest",
            success: function(data) {
                var response = data;
                
                AppObserver.set('loading', false);
                
                if(response.success == true)
                {
                    var dialog = new Dialog("#infobox", "An email has been sent with instruction on how to finish the recovery process.");
                    
                    $("#recoveryEmail").val("");
                    
                    dialog.show();	
                    
                    Navigation.go('#passwordAuthCode');
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
    else {
        AppObserver.set('loading', false);
        var dialog = new Dialog("#infobox", "No Connection Available");
        dialog.show();
    }
}

function passwordAuthCode() {
	var data = {"mode":"rpc", "code":$('#authCode').val()};
	
	if(QrefInterface.isConnected()) {
		if($('#authCode').val() != '' && $('#authPassword').val() != '' && $('#authPasswordConfirm').val() != '') {
			if($('#authPassword').val() == $('#authPasswordConfirm').val()) {
				AppObserver.set('loading', true);
				
				window.location.href = "qref://clearCache";
				
				data.password = $('#authPassword').val();
				
				 AppObserver.ajax({
					type: "post",
					data: data,
					dataType: "json",
					contentType: 'application/json',
					url: host + "services/rpc/auth/passwordRecovery",
					success: function(response) {
						if(response.success) {
							$('#authCode').val('');
							$('#authPassword').val('');
							$('#authPasswordConfirm').val('');
							
							var dialog = new Dialog("#infobox", "Password successfully updated!");
            				dialog.show();
            				
            				Navigation.go('#dashboard');
						}
						else {
							var dialog = new Dialog("#infobox", "Invalid Auth Code!");
            				dialog.show();
						}
						
						AppObserver.set('loading', false);
					},
					error: function() {
						var dialog = new Dialog("#infobox", "No internet connection!");
            			dialog.show();
            			
            			AppObserver.set('loading', false);
					}
				});
			}
			else {
				var dialog = new Dialog("#infobox", "New Password and Confirm Password must match");
            	dialog.show();
			}
		}
		else {
			var dialog = new Dialog("#infobox", "All fields are required!");
            dialog.show();
		}
	}
	else {
		var dialog = new Dialog("#infobox", "No internet connection!");
		dialog.show();
	}
}

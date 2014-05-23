function Register() {
	var register = { "mode":"rpc", "userName": $("#emailRegister").val(), "password": $("#passwordRegister").val() }
	
	AppObserver.set('loading', true);
	
	if($("#passwordRegister").val() == "")
	{
		AppObserver.set('loading', false);
		
		var dialogbox = new Dialog("#infobox", "Please fill out all fields");
		dialogbox.show();
		
		return;
	}
	else if($("#passwordRegister").val() != $("#confirmPassword").val())
	{
		AppObserver.set('loading', false);
		
		var dialogbox = new Dialog("#infobox", "Password and Confirm Password do not match");
		dialogbox.show();

		return; 
	}
	
    if(QrefInterface.isConnected()) {
        AppObserver.ajax({
            type: "post",
            data: JSON.stringify(register),
            dataType: 'json',
            contentType: 'application/json',
            url: host + "services/rpc/auth/registerAccount",
            success: function(data) {
                var response = data;
                
                AppObserver.set('loading', false);
                
                if(response.success == true)
                {
                    var dialog = new Dialog("#infobox", "Registration Successful!", function() {
                        AppObserver.ajax({
							type: "post",
							data: register,
							dataType: "json",
							url: host + "services/rpc/auth/login",
							success: function(data) {
								var response = data;
				
								if(response.success == true)
								{
									AppObserver.set('token', response.returnValue.token);
									AppObserver.set('email', register.userName);

			  						QrefInterface.updateUser(response.returnValue.user, register.userName);
									QrefInterface.updateToken(response.returnValue.token);
									QrefInterface.setLogin(response.returnValue.user, register.userName, Whirlpool(register.password));
									
									AppObserver.set('loading', true);
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
								else
								{
                                    AppObserver.set('loading', false);
									Navigation.go('signin');
								}	
							},
							error: function() {
                                AppObserver.set('loading', false);
								Navigation.go('signin');
							}
						});
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
                AppObserver.set('loading', false);
                
                var dialog = new Dialog("#infobox", "Cannot connect to server");
                dialog.show();
            }
        });
    }
    else {
        AppObserver.set('loading', false);
        var dialog = new Dialog("#infobox", "No Wifi Connection Available");
        dialog.show();
    }
}

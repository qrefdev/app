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
    
    window.location.href = "qref://clearCache";
	
    if(reachability) {
        $.ajax({
            type: "post",
            data: register,
            url: host + "services/rpc/auth/registerAccount",
            success: function(data) {
                var response = data;
                
                AppObserver.set('loading', false);
                
                if(response.success == true)
                {
                    var dialog = new Dialog("#infobox", "Registration Successful!", function() {
                        $.ajax({
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

							   		window.location.href = "qref://setUser=" + register.userName + "&setToken=" + response.returnValue.token + '&setUserId=' + response.returnValue.user;
			   
									AppObserver.set('loading', true);
									setTimeout(function() {
										  window.location.href = "qref://setLogin=" + register.userName + "(QREFUPS)" + response.returnValue.user + "(QREFUPS)" + Whirlpool(register.password);
											setTimeout(function() {
												window.location.href = "qref://hasChecklists";
											}, 1000);
									}, 1000);
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

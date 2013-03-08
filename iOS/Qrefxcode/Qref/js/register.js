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
                AppObserver.set('loading', false);
                
                var dialog = new Dialog("#infobox", "Cannot connect to server");
                dialog.show();
            }
        });
    }
    else {
        AppObserver.set('loading', false);
        var dialog = new Dialog("#infobox", "No Internet Connection Available");
        dialog.show();
    }
}

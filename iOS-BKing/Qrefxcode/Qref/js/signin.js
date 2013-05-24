function Signin() {
	var signin = { "mode":"rpc", "userToken":AppObserver.email};
	
	AppObserver.set('loading', true);
	
    window.location.href = "qref://clearCache";
    
    if(reachability) {
        $.ajax({
            type: "post",
            data: signin,
            dataType: "json",
            url: host + "services/rpc/auth/login/token",
            success: function(data) {
                var response = data;
                
                if(response.success == true)
                {
                    AppObserver.set('token', response.returnValue);

                    window.location.href = "qref://setUser=" + AppObserver.email + "&setToken=" + response.returnValue;
               
                    AppObserver.set('loading', true);
                    setTimeout(function() {
                        window.location.href = "qref://hasChecklists";
                               
                       setTimeout(function() {
                            window.location.href = "qref://setLogin=" + AppObserver.email + "(QREFUPS)" + Whirlpool(AppObserver.email);
                       }, 1000);
                    }, 1000);
                }
                else
                {
                    AppObserver.set('loading', false);
                    var dialog = new Dialog("#infobox", "Invalid user token provided");
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
        window.location.href = "qref://localLogin=" + AppObserver.email + "(QREFUPS)" + Whirlpool(AppObserver.email);
    }
}

function InvalidSignin() {
    AppObserver.set('loading', false);
    var dialog = new Dialog("#infobox", "Invalid user token provided");
    dialog.show();
}

function signinLoadChecklists() {
    $("#email").val("");
    $("#password").val("");
    
    AppObserver.getChecklists(function(success, items) {
        if(success) {
            DashboardDataSource.data(items);
            DashboardObserver.set('dataSource', DashboardDataSource);
        }

        AppObserver.set('loading', false);
    });
    Navigation.go("dashboard");
}

function changePassword() {
	var changingRequest = { "mode":"rpc", "oldPassword":$("#oldPassword").val(), "newPassword":$("#newPassword").val(), "token": AppObserver.token };
	
    if(reachability) {
        if($("#newPassword").val() != $("#newPasswordConfirm").val()) 
        {
            var dialog = new Dialog("#infobox", "New Password and Confirm Password must match");
            dialog.show();
        }
        else
        {
            AppObserver.set('loading', true);
            
            window.location.href = "qref://clearCache";
            
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
	
    if(reachability) {
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
    else {
        AppObserver.set('loading', false);
        var dialog = new Dialog("#infobox", "No Connection Available");
        dialog.show();
    }
}

var cachePack = "";

//Initialize
var checklists = undefined;
var Navigation = undefined;

//var ChecklistEditor = new ChecklistEditorHandler();
//var TailNumberEditor = new TailNumberEditorHandler();
//var MyProducts = new MyProductsHandler();
//var SettingsEditor = new SettingsEditorHandler();
var Sync = new SyncHandler();

$(window).load(function() {
    
});

function BeginChecklistPackets() {
    cachePack = "";
}

function LoadChecklistPacket(data) {
    cachePack = cachePack + data;
}

function PushImage(data) {
    var imageArray = data.split(";");
    
	if(imageArray[2].toLowerCase() == "productlisting")
	{
		var item = $("#downloads-items li[data-id='" + imageArray[1] + "']");
	
		if(item.length > 0)
			item.find(".plane-icon").html('<img src="' + imageArray[0] + '" />');
	}
	else if(imageArray[2].toLowerCase() == "checklistlisting")
	{
		var item = $("#dashboard-planes li[data-id='" + imageArray[1] + "']");
	
		if(item.length > 0)
			item.find(".plane-icon").html('<img src="' + imageArray[0] + '" />');
	}
	else if(imageArray[2].toLowerCase() == "productdetails")
	{
		var details = $("#productDetailsListing");
		details.find(".productImage").html('<img src="' + imageArray[0] + '" />');
	}
}

function PurchaseFailed() {
    AppObserver.set('loading', false);
    
    var dialog = new Dialog("#infobox", "We're sorry, but we could not complete your purchase at this time.");
    dialog.show();
}

function InvalidProduct() {
   	AppObserver.set('loading', false);
    
    var dialog = new Dialog("#infobox", "You cannot purchase a non-existant product silly!");
    dialog.show();
}

function CannotPurchase() {
    AppObserver.set('loading', false);
    
    var dialog = new Dialog("#infobox", "Your Apple account has disabled in-app purchases.");
    dialog.show();
}

function PurchaseCanceled() {
    AppObserver.set('loading', false);
}

function SendReceipt(receiptData)
{
    var tailNumberIdentifier = "N" + Math.round(Math.random() * 10000);
    
    $.ajax({
        type: "post",
        data: "mode=rpc&token=" + token + "&receipt=" + receiptData + "&product=" + MyProducts.product._id + "&tailNumber=" + tailNumberIdentifier,
        dataType: "json",
        url: host + "services/rpc/aircraft/product/authorize/apple",
        success: function(data) {
           if(data.success)
           {
           		checklists = AppObserver.GetChecklists();
        		DashboardDataSource.data(checklists);
           }
           else
           {
                if(data.message.code)
                {
                    if(data.message.code == 11000)
                    {
                        SendReceipt(receiptData);
                    }
                }
                else
                {
                    if(data.message == "Invalid Receipt")
                    {
                    	AppObserver.set('loading', false);
                    	
                        var dialog = new Dialog("#infobox", "The receipt provided by Apple appears to be invalid. Please contact Apple for support.");
                        dialog.show();
                    }
                    else
                    {
                    	AppObserver.set('loading', false);
                    	
                        var dialog = new Dialog("#infobox", "Your purchase was successful, but we could not verify the receipt from Apple. Please go through purchase process again - you will not be charged.");
                        dialog.show();
                    }
                }
           }
           
        },
        error: function() {
        	AppObserver.set('loading', false);
           
           	var dialog = new Dialog("#infobox", "Your purchase was successful, but we could not connect to our server to verify the purchase. Please go through the purchase process again, when connected to a internet connection - you will not be charged.");
           	dialog.show();
        }
    });
}

function UpdateLoginDisplay(email) {
    AppObserver.set('email', email);
}

function DataLoaded() {
	Navigation = new zimoko.Navigation(true, '.page');
	
	$("#editAddForm").validate({
		submitHandler: function() {
	
		}
	});
	
	$("#editTailForm").validate({
		submitHandler: function() {
			
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
	
	$("#passwordRecoveryForm").validate({
		submitHandler: function() {
			passwordRecovery();
		}
	});
	
	$("#changePasswordForm").validate({
		submitHandler: function() {
			changePassword();
		}
	});
	
	//var converter = new Converter();
	//converter.init();
	
	AppObserver.set('loading', false);
	Navigation.go("dashboard");
	//Sync.init();
}

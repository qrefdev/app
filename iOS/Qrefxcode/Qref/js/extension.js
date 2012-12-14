var cachePack = "";

//Initialize
var Checklist = new CheckListHandler();
var ChecklistEditor = new ChecklistEditorHandler();
var TailNumberEditor = new TailNumberEditorHandler();
var MyProducts = new MyProductsHandler();
var SettingsEditor = new SettingsEditorHandler();
var Sync = new SyncHandler();
var syncLoader = undefined;
var Theme = new ThemeHandler();

$(window).load(function() {
	loader.show();
    syncLoader = new Loader("#syncLoader");
    window.location.href = "qref://onload";
    DataLoaded();
});

function BeginChecklistPackets() {
    cachePack = "";
}

function LoadChecklistPacket(data) {
    cachePack = cachePack + data;
}

function PushImage(data) {
    var imageArray = data.split(";");
    
        if(imageArray[2] == "productListing")
        {
            var item = $("#downloads-items li[data-id='" + imageArray[1] + "']");
        
            if(item.length > 0)
                item.find(".plane-icon").html('<img src="' + imageArray[0] + '" />');
        }
        else if(imageArray[2] == "checklistListing")
        {
            var item = $("#dashboard-planes li[data-id='" + imageArray[1] + "']");
        
            if(item.length > 0)
                item.find(".plane-icon").html('<img src="' + imageArray[0] + '" />');
        }
        else if(imageArray[2] == "productDetails")
        {
            var detail = $("#productDetailsListing");
            details.find(".productImage").html('<img src="' + imageArray[0] + '" />');
        }
}

function PurchaseFailed() {
    loader.hide();
    
    var dialog = new Dialog("#infobox", "We're sorry, but we could not complete your purchase at this time.");
    dialog.show();
}

function InvalidProduct() {
    loader.hide();
    var dialog = new Dialog("#infobox", "You cannot purchase a non-existant product silly!");
    
    dialog.show();
}

function CannotPurchase() {
    loader.hide();
    var dialog = new Dialog("#infobox", "Your Apple account has disabled in-app purchases.");
    
    dialog.show();
}

function PurchaseCanceled() {
    loader.hide();
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
                Checklist.loadUncachedChecklists(tailNumberIdentifier);
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
                        var dialog = new Dialog("#infobox", "The receipt provided by Apple appears to be invalid. Please contact Apple for support.");
                        loader.hide();
                        dialog.show();
                    }
                    else
                    {
                        var dialog = new Dialog("#infobox", "Your purchase was successful, but we could not verify the receipt from Apple. Please go through purchase process again - you will not be charged.");
                        loader.hide();
                        dialog.show();
                    }
                }
           }
           
        },
        error: function() {
           var dialog = new Dialog("#infobox", "Your purchase was successful, but we could not connect to our server to verify the purchase. Please go through the purchase process again, when connected to a internet connection - you will not be charged.");
           
           loader.hide();
           dialog.show();
        }
    });
}

function DataLoaded() {
	Navigation.init();
	MyProducts.init();
	SettingsEditor.init();
	Authentication.verify();
	
	$("#editAddForm").validate({
		submitHandler: function() {
			if(ChecklistEditor.editing)
			{
				ChecklistEditor.edit();
			}
			else if(!ChecklistEditor.editing)
			{
				ChecklistEditor.add();
			}
		}
	});
	
	$("#editTailForm").validate({
		submitHandler: function() {
			TailNumberEditor.edit();
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
	
	var UTC = new UTCTime();
	UTC.update();
	var converter = new Converter();
	converter.init();
	
	loader.hide();
	Navigation.go("dashboard");
	Sync.init();
}


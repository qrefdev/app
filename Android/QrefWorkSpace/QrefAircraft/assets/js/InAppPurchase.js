function PurchaseFailed() {
    AppObserver.set('loading', false);
    
    var dialog = new Dialog('#infobox', 'We\'re sorry, but we could not complete your purchase at this time.');
    dialog.show();
}

function InvalidProduct() {
   	AppObserver.set('loading', false);
    
    var dialog = new Dialog('#infobox', 'In-app purchase setup error: You cannot purchase a non-existant product.');
    dialog.show();
}

function CannotPurchase() {
    AppObserver.set('loading', false);
    
    var dialog = new Dialog('#infobox', 'Your Apple account has disabled in-app purchases.');
    dialog.show();
}

function PurchaseCanceled() {
    AppObserver.set('loading', false);
}

function Install(productId) {
	var tailNumberIdentifier = 'N' + Math.round(Math.random() * 10000);
    var request = { "mode":"rpc", "token": AppObserver.token, "product": productId, "tailNumber":tailNumberIdentifier};
    AppObserver.ajax({
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(request),
        url: host + 'services/rpc/aircraft/product/authorize/install?token=' + AppObserver.token,
        success: function(data) {
           if(data.success)
           { 
				var dialog = new Dialog('#infobox', 'A new check list has been created with the random tail number: ' + tailNumberIdentifier, function() {
					Navigation.go('dashboard');
				});
           
                AppObserver.set('loading', false);
		
				dialog.show();
				
				Sync.sync();
           }
           else
           {
                if(data.message.code)
                {
                    if(data.message.code == 11000)
                    {
                        Install(productId);
                    }
                    else {
                    	AppObserver.set('loading', false);
           
           				var dialog = new Dialog('#infobox', 'Our server had an unexpected error! Please try again later!');
           				dialog.show();
                    }
                }
                else
                {
					AppObserver.set('loading', false);
					
					var dialog = new Dialog('#infobox', 'You need to sign out and sign back in, in order to re-authenticate and install a new checklist.');
					dialog.show();
                }
           }
           
        },
        error: function() {
        	AppObserver.set('loading', false);
           
           	var dialog = new Dialog('#infobox', 'Could not connect to server. Please try again when an internet connection is available.');
           	dialog.show();
        }
    });
}

function SendReceipt(receiptData)
{
    var tailNumberIdentifier = 'N' + Math.round(Math.random() * 10000);
    var request = {"mode": "rpc", "token": AppObserver.token , "receipt":receiptData , "product":ProductDetailsObserver.product._id, "tailNumber":tailNumberIdentifier};
    AppObserver.ajax({
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(request),
        url: host + 'services/rpc/aircraft/product/authorize/android?token=' + AppObserver.token,
        success: function(data) {
           if(data.success)
           {  
				var dialog = new Dialog('#infobox', 'A new check list has been created with the random tail number: ' + tailNumberIdentifier, function() {
					Navigation.go('dashboard');
				});
           
                AppObserver.set('loading', false);
		
				dialog.show();
				
				Sync.sync(); 
           }
           else
           {
                if(data.message.code)
                {
                    if(data.message.code == 11000)
                    {
                        SendReceipt(receiptData);
                    }
                    else {
                    	AppObserver.set('loading', false);
           
           				var dialog = new Dialog('#infobox', 'Our server had an unexpected error! Please try again later!');
           				dialog.show();
                    }
                }
                else
                {
                    if(data.message == 'Invalid Receipt')
                    {
                    	AppObserver.set('loading', false);
                    	
                        var dialog = new Dialog('#infobox', 'The receipt provided by Google appears to be invalid.');
                        dialog.show();
                    }
                    else
                    {
                    	AppObserver.set('loading', false);
                    	
                        var dialog = new Dialog('#infobox', 'Your purchase was successful, but you need to sign out and sign back in, in order to re-authenticate with our servers. After you sign back in, go back to the checklist and press the buy button again. You will not be charged a second time.');
                        dialog.show();
                    }
                }
           }
           
        },
        error: function() {
        	AppObserver.set('loading', false);
           
           	var dialog = new Dialog('#infobox', 'Your purchase was successful, but we could not connect to our servers to verify the purchase. Please go through the purchase process again, when connected to an internet connection - you will not be charged a second time.');
           	dialog.show();
        }
    });
}
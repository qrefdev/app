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
    
    $.ajax({
        type: 'post',
        data: 'mode=rpc&token=' + AppObserver.token + '&product=' + productId + '&tailNumber=' + tailNumberIdentifier,
        dataType: 'json',
        url: host + 'services/rpc/aircraft/product/authorize/install',
        success: function(data) {
           if(data.success == true)
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

function RestoreFailed() {
	AppObserver.set('loading', false);
	var dialog = new Dialog('#infobox', 'Restore All Products Failed. Do you have an internet connection?');
    dialog.show();
}

function RestoreAll() {
    AppObserver.getUserProducts(function(success, items) {
       if(success && items) {
            var itemCount = items.length;
            var currentCount = 0;        
                    
            AppObserver.set('loading', true);
            
            for(var i = 0; i < items.length; i++) {
            	RestoreProduct(items[i]._id, function() {
            		currentCount++;
            		
            		if(currentCount >= itemCount) {
            			Sync.sync();
            			AppObserver.set('loading', false);
            			
            			var dialog = new Dialog('#infobox', 'Restore All Completed');
           				dialog.show();
            		}
            	});
            }
       }
    });
}

function RestoreProduct(productId, callback) {
	var tailNumberIdentifier = 'N' + Math.round(Math.random() * 10000);
    
    $.ajax({
        type: 'post',
        data: 'mode=rpc&token=' + AppObserver.token + '&product=' + productId + '&tailNumber=' + tailNumberIdentifier,
        dataType: 'json',
        url: host + 'services/rpc/aircraft/product/authorize/install',
        success: function(data) {
           if(data.success == true)
           { 
				callback();
           }
           else
           {
                if(data.message.code)
                {
                    if(data.message.code == 11000)
                    {
                        RestoreProduct(productId, callback);
                    }
                    else {
                    	callback();
                    }
                }
                else
                {
					callback();
                }
           }
           
        },
        error: function() {
        	callback();
        }
    });
}

function SendReceipt(receiptData)
{
    var tailNumberIdentifier = 'N' + Math.round(Math.random() * 10000);
    
    $.ajax({
        type: 'post',
        data: 'mode=rpc&token=' + AppObserver.token + '&receipt=' + receiptData + '&product=' + ProductDetailsObserver.product._id + '&tailNumber=' + tailNumberIdentifier,
        dataType: 'json',
        url: host + 'services/rpc/aircraft/product/authorize/apple',
        success: function(data) {
           if(data.success == true)
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
                    	
                        var dialog = new Dialog('#infobox', 'The receipt provided by Apple appears to be invalid. Please contact Apple for support.');
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
           
           	var dialog = new Dialog('#infobox', 'Your purchase was successful, but we could not connect to our server to verify the purchase. Please go through the purchase process again, when connected to an internet connection - you will not be charged a second time.');
           	dialog.show();
        }
    });
}
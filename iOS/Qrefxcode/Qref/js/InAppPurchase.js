function PurchaseFailed() {
    AppObserver.set('loading', false);
    
    var dialog = new Dialog('#infobox', 'We\'re sorry, but we could not complete your purchase at this time.');
    dialog.show();
}

function InvalidProduct() {
   	AppObserver.set('loading', false);
    
    var dialog = new Dialog('#infobox', 'You cannot purchase a non-existant product silly!');
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

function SendReceipt(receiptData)
{
    var tailNumberIdentifier = 'N' + Math.round(Math.random() * 10000);
    
    $.ajax({
        type: 'post',
        data: 'mode=rpc&token=' + AppObserver.token + '&receipt=' + receiptData + '&product=' + ProductDetailsObserver.product._id + '&tailNumber=' + tailNumberIdentifier,
        dataType: 'json',
        url: host + 'services/rpc/aircraft/product/authorize/apple',
        success: function(data) {
           if(data.success)
           {  
				AppObserver.getUncachedChecklists(function(success) {
					AppObserver.set('loading', false);
					
					if(success) {
						var dialog = new Dialog('#infobox', 'A new check list has been created with the random tail number: ' + tailNumberIdentifier, function() {
							Navigation.go('dashboard');
						});
					
						dialog.show();
					}
					else {
						var dialog = new Dialog('#infobox', 'Failed to load the new checklist from server! Please use the Sync option to try again at a later time!', function() {
							Navigation.go('dashboard');
						});
						
						dialog.show();
					}
				});
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
                    if(data.message == 'Invalid Receipt')
                    {
                    	AppObserver.set('loading', false);
                    	
                        var dialog = new Dialog('#infobox', 'The receipt provided by Apple appears to be invalid. Please contact Apple for support.');
                        dialog.show();
                    }
                    else
                    {
                    	AppObserver.set('loading', false);
                    	
                        var dialog = new Dialog('#infobox', 'Your purchase was successful, but we could not verify the receipt from Apple. Please go through the purchase process again - you will not be charged a second time.');
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
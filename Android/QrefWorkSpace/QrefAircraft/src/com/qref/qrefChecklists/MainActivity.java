package com.qref.qrefChecklists;

import java.io.File;

import android.inputmethodservice.InputMethodService;
import android.os.*;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONObject;

import com.android.vending.billing.IInAppBillingService;
import com.qref.qrefChecklists.util.Base64;

import android.os.Bundle;
import android.preference.PreferenceManager;
import android.app.Activity;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.util.Log;
import android.view.Menu;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnTouchListener;
import android.view.inputmethod.InputMethod;
import android.view.inputmethod.InputMethodManager;
import android.view.inputmethod.InputMethodSubtype;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.ImageView;

public class MainActivity extends Activity {
	protected WebView webView;
	protected IInAppBillingService billingService;
	protected ServiceConnection serviceConnection;
	protected ArrayList<QrefProduct> purchases;
	protected ArrayList<String> pendingPurchases;
	protected ImageView splash;
	protected InputMethodService input;
	protected boolean isInputShown;
	
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        this.purchases = new ArrayList<QrefProduct>();
        this.webView = (WebView)findViewById(R.id.webView);
        
        this.splash = (ImageView)findViewById(R.id.splash);
        
        this.webView.getSettings().setJavaScriptEnabled(true);
        this.webView.getSettings().setSaveFormData(false);
        this.webView.getSettings().setSavePassword(false);
        
        Handler mhandler = new Handler();
        
        this.webView.setScrollBarStyle(WebView.SCROLLBARS_OUTSIDE_OVERLAY);
        this.webView.setWebChromeClient(new ChromeClient());
        this.webView.addJavascriptInterface(new QrefInterface(this, PreferenceManager.getDefaultSharedPreferences(this.getApplicationContext()), this.getApplicationContext(), this.webView, mhandler), "QrefInterface");
        
        try {
        	InputStream input = getAssets().open("phoneView.html");
        	int size = input.available();
        	byte[] buffer = new byte[size];
        	input.read(buffer);
        	input.close();
        	
        	String view = new String(buffer);
        	
        	this.webView.loadDataWithBaseURL("file:///android_asset/", view, "text/html", "UTF-8", null);
        } catch (Exception e)
        {
        	
        }
        
        try {
        	this.serviceConnection = new ServiceConnection() {
        		@Override
        		public void onServiceDisconnected(ComponentName name) {
        			MainActivity.this.billingService = null;
        		}
        		
        		public void onServiceConnected(ComponentName name, IBinder service) {
        			MainActivity.this.billingService = IInAppBillingService.Stub.asInterface(service);
        		}
        	};
        	
        	this.bindService(new Intent("com.android.vending.billing.InAppBillingService.BIND"), this.serviceConnection, Context.BIND_AUTO_CREATE);
        
        	this.getPreviousPurchases();
        } catch (Exception e) {
        	
        }
    }
    
    public void hideSplash() {
    	this.splash.setVisibility(View.GONE);
    }
    
    private void getPreviousPurchases() {
    	try {
    		Bundle items = this.billingService.getPurchases(3, this.getPackageName(), "inapp", null);
    	
    		int response = items.getInt("RESPONSE_CODE");
    		
    		if(response == 0) {
    			ArrayList<String> purchaseDatas = items.getStringArrayList("INAPP_PURCHASE_DATA_LIST");
    			ArrayList<String> signatures = items.getStringArrayList("INAPP_DATA_SIGNATURE");
    			String continuationToken = items.getString("INAPP_CONTINUATION_TOKEN");
    			
    			for(int i = 0; i < purchaseDatas.size(); i++) {
    				QrefProduct product = new QrefProduct();
    				
    				try {
	    				product.purchaseData = new JSONObject(purchaseDatas.get(i));
	    				product.signature = signatures.get(i);
	    				product.sku = product.purchaseData.getString("productId");
	    				
	    				if(!this.purchases.contains(product))
	    					this.purchases.add(product);
    				} catch (Exception ex) {
    					
    				}
    			}
    			
    			if(continuationToken != null)
    				this.getPreviousPurchases();
    			else
    				return;
    		}
    		
    	} catch (Exception e) {
    		return;
    	}
    }
    
    @Override
    public void onDestroy() {
    	super.onDestroy();
    	if(this.serviceConnection != null) {
    		this.unbindService(this.serviceConnection);
    	}
    }
    
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
    	if(requestCode == 3459) {
    		int responseCode = data.getIntExtra("RESPONSE_CODE", -1);
    		String purchaseData = data.getStringExtra("INAPP_PURCHASE_DATA");
    		String signature = data.getStringExtra("INAPP_DATA_SIGNATURE");
    		
    		if(resultCode == RESULT_OK) {
    			if(responseCode == 0) {
	    			try {
	    				JSONObject jo = new JSONObject(purchaseData);
	    				String sku = jo.getString("productId");
	    				QrefProduct product = new QrefProduct();
	    				product.sku = sku;
	    				product.signature = signature;
	    				product.purchaseData = jo;
	    				product.purchaseData.put("signature", signature);
	    				
	    				String pendingId = product.purchaseData.getString("developerPayload");
	    				
	    				if(this.pendingPurchases.contains(pendingId)) {
	    					this.purchases.add(product);
	    					
	    					String encodedReceiptData = Base64.encode(product.purchaseData.toString().getBytes());
	    					
	    					this.webView.loadData("SendReceipt('" + encodedReceiptData + "');", "text/javascript", "UTF8");
	    				
	    					this.pendingPurchases.remove(pendingId);
	    				}
	    				else {
	    					this.webView.loadData("PurchaseFailed();", "text/javascript", "UTF8");
	    				}
	    			}
	    			catch (Exception e) {
	    				this.webView.loadData("PurchaseFailed();", "text/javascript", "UTF8");
	    			}
    			}
    			else if(responseCode == 1) {
    				this.webView.loadData("PurchaseCanceled();", "text/javascript", "UTF8");
    			}
    			else if(responseCode == 3 || responseCode == 5 || responseCode == 6 || responseCode == 7) {
    				this.webView.loadData("PurchaseFailed();", "text/javascript", "UTF8");
    			}
    			else if(responseCode == 4) {
    				this.webView.loadData("InvalidProduct();", "text/javascript", "UTF8");
    			}
    		}
    		else if(resultCode == RESULT_CANCELED) {
    			this.webView.loadData("PurchaseCanceled();", "text/javascript", "UTF8");
    		}
    	}
    }
    
    public IInAppBillingService getInAppService() {
    	return this.billingService;
    }
    
    public ArrayList<QrefProduct> getPurchases() {
    	return this.purchases;
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        return true;
    }
    
    public boolean purchase(String productId) {
    	if(this.userOwnsProduct(productId)) {
    		QrefProduct product = this.getPurchaseByProductId(productId);
    		
    		if(product != null) {
    			try {
	    			JSONObject response = new JSONObject(product.purchaseData.toString());
	    			response.put("signature", product.signature);
	    			
	    			this.webView.loadData("SendReceipt('" + Base64.encode(response.toString().getBytes()) + "');", "text/javascript", "UTF8");
	    			
	    			return true;
    			} catch (Exception e) {
    				this.webView.loadData("PurchaseFailed();", "text/javascript", "UTF8");
    				
    				return false;
    			}
    		}
    		else {
    			this.webView.loadData("PurchaseFailed();", "text/javascript", "UTF8");
    			
    			return false;
    		}
    	}
    	try {
    		Bundle buyIntentBundle = this.billingService.getBuyIntent(3, this.getPackageName(), productId, "inapp", this.getNewPendingId());
    	
    		PendingIntent pendingBuy = buyIntentBundle.getParcelable("BUY_INTENT");
    		
    		this.startIntentSenderForResult(pendingBuy.getIntentSender(), 3459, new Intent(), Integer.valueOf(0), Integer.valueOf(0), Integer.valueOf(0));
    		
    	}  catch (Exception e) {
    		this.webView.loadData("PurchaseFailed();", "text/javascript", "UTF8");
    		return false;
    	}
    	
    	return true;
    }
    
    private String getNewPendingId() {
    	String id = (Double.valueOf(Math.random() * 100000)).toString();
    	
    	String encoded = Base64.encode(id.getBytes());
    	
    	if(!this.pendingPurchases.contains(encoded)) {
    		this.pendingPurchases.add(encoded);
    		return encoded;
    	}
    	else {
    		return this.getNewPendingId();
    	}
    }
    
    private QrefProduct getPurchaseByProductId(String productId) {
    	for(int i = 0; i < this.purchases.size(); i++) {
    		QrefProduct product = this.purchases.get(i);
    		try {
    			if(product.sku.equals(productId))
    				return product;
    		} catch (Exception e) {
    			
    		}
    	}
    	
    	return null;
    }
    
    private boolean userOwnsProduct(String productId) {
    	
    	for(int i = 0; i < this.purchases.size(); i++) {
    		QrefProduct product = this.purchases.get(i);
    		try {
    			if(product.sku.equals(productId))
    				return true;
    		} catch (Exception e) {
    			
    		}
    	}
    	
    	return false;
    }
}

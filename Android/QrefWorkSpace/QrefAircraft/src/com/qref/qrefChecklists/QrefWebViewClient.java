package com.qref.qrefChecklists;

import java.io.IOException;

import android.content.Context;
import android.net.http.SslError;
import android.util.Log;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class QrefWebViewClient extends WebViewClient {

	@Override
	public void onReceivedError(WebView view, int errorCode,
	        String description, String failingUrl) {
		Log.d("webview error", description);
	}
	
	@Override
	public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
		Log.e("SSL ERROR", new Integer(error.getPrimaryError()).toString());
		handler.proceed();
	}
	
	@Override 
	public boolean shouldOverrideUrlLoading(WebView view, String url) {
		return false;
	}
}

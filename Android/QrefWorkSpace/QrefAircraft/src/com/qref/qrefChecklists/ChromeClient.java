package com.qref.qrefChecklists;

import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;

public class ChromeClient extends WebChromeClient {
	@Override
	public boolean onConsoleMessage(ConsoleMessage m) {
		Log.d("QrefAircraft", m.message() + " -- From line " + m.lineNumber() + " of " + m.sourceId());
	
		return true;
	}
	
	
}

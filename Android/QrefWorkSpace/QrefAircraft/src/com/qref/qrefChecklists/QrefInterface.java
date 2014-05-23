package com.qref.qrefChecklists;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Queue;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.util.Base64;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

public class QrefInterface {
	protected SharedPreferences preferences;
	protected Context context;
	protected Handler handler;
	protected WebView view;
	protected MainActivity app;
	protected ArrayList<String> userChecklistIds;
	protected ArrayList<File> checklists;
	protected ArrayList<File> checklistVersions;
	protected int position;
	protected int versionPosition;
	protected ArrayBlockingQueue<String> dataQueue;
	
	public static String HOST = "https://my.qref.com/"; 
	
	public QrefInterface(MainActivity app, SharedPreferences prefs, Context context, WebView view, Handler threader) {
		this.preferences = prefs;
		this.context = context;
		this.app = app;
		this.view = view;
		this.position = 0;
		this.versionPosition = 0;
		this.handler = threader;
		this.dataQueue = new ArrayBlockingQueue<String>(10);
	}
	
	private String createUid() {
		return UUID.randomUUID().toString();
	}
	
	@JavascriptInterface
	public boolean deviceHasChecklists() {
		File dataDirectory = this.context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
		
		File[] files = dataDirectory.listFiles();
		
		for(int i = 0; i < files.length; i++) {
			File file = files[i];
			
			if(file.getName().contains(".qrf") || file.getName().contains(".qvi")) {
				return true;
			}
		}
		
		return false;
	}
	
	@JavascriptInterface
	public boolean isConnected() {
		AppStatus instance = AppStatus.getInstance(this.context);
		
		return instance.isOnline(this.context);
	}
	
	@JavascriptInterface 
	public void log(String data) {
		Log.d("QrefAircraft", data);
	}
	
	@JavascriptInterface
	public void saveChecklistVersionInfo(String data, String filename) {
		String user = this.preferences.getString("user-id", null);
		Editor edit = this.preferences.edit();
		String encrypted = data;
		
		String uid = this.preferences.getString("uid", null);
		
		if(uid == null) {
			uid = this.createUid();
			
			edit.putString("uid", uid);
			edit.commit();
		}
		
		if(!data.equals("") && user != null) {
			try {
				String skey = uid + user + uid + user;
				DESKeySpec keySpec = new DESKeySpec(skey.getBytes("UTF8"));
				SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
				SecretKey key = keyFactory.generateSecret(keySpec);
				
				byte[] text = data.getBytes("UTF8");
				
				Cipher cipher = Cipher.getInstance("DES");
				cipher.init(Cipher.ENCRYPT_MODE, key);
				encrypted = Base64.encodeToString(cipher.doFinal(text), 0);
				
			} catch (Exception e) {
				encrypted = data;
			}
			
			File dataDirectory = this.context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
			
			String path = dataDirectory.getAbsolutePath() + "/" + filename;
			
			try {
				FileWriter writer = new FileWriter(path);
				writer.write(encrypted);
				writer.close();
				
				String userIds = this.preferences.getString(user + "UserChecklistIds", "");
				
				if(!userIds.contains(filename)) {
					userIds += filename + ",";
					edit.putString(user + "UserChecklistIds", userIds);
				}
				
				edit.commit();
			} catch (IOException e) {
				
			}
		}
	}
	
	@JavascriptInterface
	public void saveChecklist(String data, String filename) {
		String user = this.preferences.getString("user-id", null);
		Editor edit = this.preferences.edit();
		String encrypted = data;
		
		String uid = this.preferences.getString("uid", null);
		
		if(uid == null) {
			uid = this.createUid();
			
			edit.putString("uid", uid);
			edit.commit();
		}
		
		if(!data.equals("") && user != null) {
			try {
				String skey = uid + user + uid + user;
				DESKeySpec keySpec = new DESKeySpec(skey.getBytes("UTF8"));
				SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
				SecretKey key = keyFactory.generateSecret(keySpec);
				
				byte[] text = data.getBytes("UTF8");
				
				Cipher cipher = Cipher.getInstance("DES");
				cipher.init(Cipher.ENCRYPT_MODE, key);
				encrypted = Base64.encodeToString(cipher.doFinal(text), 0);
				
			} catch (Exception e) {
				encrypted = data;
			}
			
			File dataDirectory = this.context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
			
			String path = dataDirectory.getAbsolutePath() + "/" + filename;
			
			try {
				FileWriter writer = new FileWriter(path);
				writer.write(encrypted);
				writer.close();
				
				String userIds = this.preferences.getString(user + "UserChecklistIds", "");
				
				if(!userIds.contains(filename)) {
					userIds += filename + ",";
					edit.putString(user + "UserChecklistIds", userIds);
				}
				
				edit.commit();
			} catch (IOException e) {
				
			}
		}
	}
	
	@JavascriptInterface
	public void updateUser(String id, String email) {
		Editor edit = this.preferences.edit();
		
		edit.putString("user", email);
		edit.putString("user-id", id);
		
		edit.commit();
	}
	
	@JavascriptInterface
	public void signout() {
		this.updateToken(null);
		this.updateUser(null, null);
	}
	
	@JavascriptInterface
	public void updateToken(String data) {
		Editor edit = this.preferences.edit();
		
		edit.putString("token", data);
		
		edit.commit();
		
		KeyChain keychain = new KeyChain(this.context);
		keychain.load("logins");
		
		keychain.set(this.preferences.getString("user", null) + "-Token", data);
	}
	
	@JavascriptInterface
	public String getToken() {
		return this.preferences.getString("token", null);
	}
	
	@JavascriptInterface
	public boolean getCanCheck() {
		return this.preferences.getBoolean("canCheck", false);
	}
	
	@JavascriptInterface
	public void setCanCheck(boolean canCheck) {
		Editor editor = this.preferences.edit();
		editor.putBoolean("canCheck", canCheck);
		editor.commit();
	}
	
	@JavascriptInterface
	private void getUserChecklistIds() {
		String user = this.preferences.getString("user-id", null);
		
		this.userChecklistIds = new ArrayList<String>();
		
		String lists = this.preferences.getString(user + "UserChecklistIds", null);
		if(user != null) {
			if(lists != null) {
				String[] listItems = lists.split(",");
				
				for(int i = 0; i < listItems.length; i++) {
					this.userChecklistIds.add(listItems[i]);
				}
			}
		}
	}
	
	@JavascriptInterface
	public String getUser() {
		String user = this.preferences.getString("user", null);
		
		return user;
	}
	
	@JavascriptInterface
	public void findChecklistFiles() {
		this.getUserChecklistIds();
		File dataDirectory = this.context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
		
		File[] files = dataDirectory.listFiles();
		this.checklists = new ArrayList<File>();
		this.checklistVersions = new ArrayList<File>();
		this.position = 0;
		this.versionPosition = 0;
		
		try {
			for(int i = 0; i < files.length; i++) {
				File file = files[i];
				
				if(file.getName().contains(".qrf")) {
					if(this.userChecklistIds.contains(file.getName()))
						this.checklists.add(file);
				}
				else if(file.getName().contains(".qvi")) {
					if(this.userChecklistIds.contains(file.getName()))
						this.checklistVersions.add(file);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@JavascriptInterface
	public String getDeviceName() {
		  String manufacturer = Build.MANUFACTURER;
		  String model = Build.MODEL;
		  if (model.startsWith(manufacturer)) {
		    return capitalize(model);
		  } else {
		    return capitalize(manufacturer) + " " + model;
		  }
	}

	private String capitalize(String s) {
		  if (s == null || s.length() == 0) {
		    return "";
		  }
		  char first = s.charAt(0);
		  if (Character.isUpperCase(first)) {
		    return s;
		  } else {
		    return Character.toUpperCase(first) + s.substring(1);
		  }
	} 
	
	@JavascriptInterface
	public void resetPositions() {
		this.position = 0;
		this.versionPosition = 0;
	}
	
	@JavascriptInterface
	public String getNextChecklistVersionInfo() {
		File checklist = this.checklistVersions.get(this.versionPosition);
		this.versionPosition++;
		
		String user = this.preferences.getString("user-id", null);
		String uid = this.preferences.getString("uid", null);
		BufferedReader stream;
		try {
			stream = new BufferedReader(new FileReader(checklist));
		} catch (FileNotFoundException e1) {
			return null;
		}
		
		try {
			StringBuilder encryptedBuffer = new StringBuilder();
			String line = stream.readLine();
			
			while(line != null) {
				encryptedBuffer.append(line);
				line = stream.readLine();
			}
			
			stream.close();
			
			if(uid != null && user != null && encryptedBuffer.length() > 0) {
				try {
					String skey = uid + user + uid + user;
					DESKeySpec keySpec = new DESKeySpec(skey.getBytes("UTF8"));
					SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
					SecretKey key = keyFactory.generateSecret(keySpec);
					
					byte[] text = Base64.decode(encryptedBuffer.toString(), 0);
					
					Cipher cipher = Cipher.getInstance("DES");
					cipher.init(Cipher.DECRYPT_MODE, key);
					String decrypted = new String(cipher.doFinal(text));
							
					return decrypted;
					
				} catch (Exception e) {
					return null;
				}
			}
			else {
				return null;
			}
			
			
		} catch (Exception e) {
			if(stream != null)
				try {
					stream.close();
				} catch (IOException e1) {
					
				}
			// TODO Auto-generated catch block
			return null;
		}
	}
	
	@JavascriptInterface
	public String getNextChecklist() {		
		/*String encrypted = this.preferences.getString("checklists", null);
		String uid = this.preferences.getString("uid", null);
		
		if(encrypted != null && !encrypted.equals("") && uid != null) {
			try {
				DESKeySpec keySpec = new DESKeySpec(uid.getBytes("UTF8"));
				SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
				SecretKey key = keyFactory.generateSecret(keySpec);
				
				byte[] text = Base64.decode(encrypted, 0);
				
				Cipher cipher = Cipher.getInstance("DES");
				cipher.init(Cipher.DECRYPT_MODE, key);
				String decrypted = new String(cipher.doFinal(text));
						
				return decrypted;
				
			} catch (Exception e) {
				return null;
			}
		}
		
		return null;*/
		
		File checklist = this.checklists.get(this.position);
		this.position++;
		
		String user = this.preferences.getString("user-id", null);
		String uid = this.preferences.getString("uid", null);
		BufferedReader stream;
		try {
			stream = new BufferedReader(new FileReader(checklist));
		} catch (FileNotFoundException e1) {
			return null;
		}
		
		try {
			StringBuilder encryptedBuffer = new StringBuilder();
			String line = stream.readLine();
			
			while(line != null) {
				encryptedBuffer.append(line);
				line = stream.readLine();
			}
			
			stream.close();
			
			if(uid != null && user != null && encryptedBuffer.length() > 0) {
				try {
					String skey = uid + user + uid + user;
					DESKeySpec keySpec = new DESKeySpec(skey.getBytes("UTF8"));
					SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
					SecretKey key = keyFactory.generateSecret(keySpec);
					
					byte[] text = Base64.decode(encryptedBuffer.toString(), 0);
					
					Cipher cipher = Cipher.getInstance("DES");
					cipher.init(Cipher.DECRYPT_MODE, key);
					String decrypted = new String(cipher.doFinal(text));
							
					return decrypted;
					
				} catch (Exception e) {
					return null;
				}
			}
			else {
				return null;
			}
			
			
		} catch (Exception e) {
			if(stream != null)
				try {
					stream.close();
				} catch (IOException e1) {
					
				}
			// TODO Auto-generated catch block
			return null;
		}
	}
	
	@JavascriptInterface
	public boolean hasNextChecklistVersionInfo() {
		if(this.versionPosition < this.checklistVersions.size())
			return true;
		
		return false;
	}
	
	@JavascriptInterface
	public boolean hasNextChecklist() {
		if(this.position < this.checklists.size())
			return true;
		
		return false;
	}
	
	@JavascriptInterface
	public void purchase(final String id) {
		
		Thread thread = new Thread(new Runnable() {
			@Override
			public void run() {
				QrefInterface.this.app.purchase(id);
			}
		});
		
		thread.start();
	}
	
	@JavascriptInterface
	public void getImage(String imageUrl, final String callback) {
		
		final String hostUrl = HOST + imageUrl;
		
		File cacheDir = this.context.getExternalFilesDir(Environment.DIRECTORY_PICTURES);
		
		String absolute = cacheDir.getAbsolutePath();
		
		String imagePath = absolute + imageUrl;
		
		final File possibleImage = new File(imagePath);
		
		File directoryPath = new File(possibleImage.getParent());
		
		if(!directoryPath.isDirectory()) {
			if(!directoryPath.mkdirs()) {
				Thread thr = new Thread(new Runnable() {
					@Override
					public void run() {
						byte[] imageBytes = QrefInterface.this.getImageBytes(hostUrl);
						
						if(imageBytes.length <= 0) {
							dataQueue.add("");
							QrefInterface.this.performCallback(callback, null);
							return;
						}
						
						dataQueue.add("data:image/png;base64," + Base64.encodeToString(imageBytes, 0));
						
						QrefInterface.this.performCallback(callback, null);
					}
				});
				
				thr.start();
			}
		}
		if(possibleImage.exists()) {
			Thread thr = new Thread(new Runnable() {
				@Override
				public void run() {
					byte[] imageBytes = QrefInterface.this.getCachedImageAsBytes(possibleImage);
					
					if(imageBytes.length <= 0) {
						dataQueue.add("");
						QrefInterface.this.performCallback(callback, null);
						return;
					}
					
					dataQueue.add("data:image/png;base64," + Base64.encodeToString(imageBytes, 0));
					
					QrefInterface.this.performCallback(callback, null);
				}
			});
			
			thr.start();
		}
		else {
			
			Thread thr = new Thread(new Runnable() {
				@Override
				public void run() {
					try {
						byte[] imageBytes = QrefInterface.this.getImageBytes(hostUrl);
						
						if(imageBytes.length <= 0) {
							dataQueue.add("");
							QrefInterface.this.performCallback(callback, null);
							return;
						}
						
						FileOutputStream out = null;
						
						out = new FileOutputStream(possibleImage);
						
						out.write(imageBytes);
						out.flush();
						out.close();
						
						dataQueue.add("data:image/png;base64," + Base64.encodeToString(imageBytes, 0));
						
						QrefInterface.this.performCallback(callback, null);
					} catch (Exception e) {
						dataQueue.add("");
						QrefInterface.this.performCallback(callback, null);
					}
				}
			});
			
			thr.start();
		}
	}
	
	@JavascriptInterface
	public void clearCache() {
		/*for(int i = 0; i < this.checklists.size(); i++) {
			File checklist = this.checklists.get(i);
			
			checklist.delete();
		}
		
		this.checklists.clear();*/
	}
	
	private byte[] getCachedImageAsBytes(File file) {
		try {
			FileInputStream input = new FileInputStream(file);
			byte[] buffer = new byte[2048];
			int bytesRead = 0;
			
			ByteArrayOutputStream output = new ByteArrayOutputStream();
			
			while((bytesRead = input.read(buffer)) > 0) {
				output.write(buffer, 0, bytesRead);
			}
			
			input.close();
			
			output.flush();
			
			return output.toByteArray();
			
		} catch (Exception e) {
			return new byte[0];
		}
	}
	
	private byte[] getImageBytes(String url) {
		try {
			Bitmap image = BitmapFactory.decodeStream(new AuthSSLDownloader(url, null, "GET").getInputStream());
			
			ByteArrayOutputStream out = null;
			
			out = new ByteArrayOutputStream();
			
			image.compress(Bitmap.CompressFormat.PNG, 100, out);
			
			return out.toByteArray();
		}
		catch (Exception e) {
			return new byte[0];
		}
	}
	
	@JavascriptInterface
	public void setLogin(String id, String user, String pass) {
		String token = this.preferences.getString("token", null);
		KeyChain keychain = new KeyChain(this.context);
		keychain.load("logins");
		
		if(token != null) {
			keychain.set(user, pass);
			keychain.set(user + "-Token", token);
			keychain.set(user + "-ID", id);
			keychain.synchronize();
		}
	}
	
	@JavascriptInterface
	public String localLogin(String user, String pass) {
		KeyChain keychain = new KeyChain(this.context);
		keychain.load("logins");
		
		if(keychain.hasKey(user)) {
			String kPass = keychain.getString(user);
		
			if(kPass.equals(pass)) {
				String token = keychain.getString(user + "-Token");
				String userId = keychain.getString(user + "-ID");
				this.updateToken(token);
				this.updateUser(userId, user);
				return token;
			}
		}
		
		return null;
	}
	
	@JavascriptInterface
	public String getDataFromQueue() {
		if(dataQueue.size() > 0)
			return dataQueue.remove();
		else
			return null;
	}
	
	@JavascriptInterface
	public void getAjaxResponse(final String url, final String data, final String method, final String callback) {		
		Thread thr = new Thread(new Runnable() {
			@Override
			public void run() {
				try {
					Log.d("Ajax", "Before Ajax Call: " + url);
					Log.d("Ajax", "Before Ajax Call Data: " + data);
					Log.d("Ajax", "Before Ajax Call Method: " + method); 
					ByteArrayOutputStream buffer = new AuthSSLDownloader(url, data, method).getByteStream();
					String output = buffer.toString();
					
					Log.d("Ajax", "After Ajax Call: " + output);
					
					dataQueue.add(output);
					
					QrefInterface.this.performCallback(callback, null);
				} catch (Exception e) {
					Log.d("Ajax Error", e.getMessage());
					QrefInterface.this.performCallback(callback, null);
				}
			}
		});
		
		thr.start();
	}
	
	protected final void performCallback(String callback, String data) {
        if(data == null) {
        	final String js =
    	            "javascript:(function() { "
    	                + "var callback = " + callback + ";"
    	                + "callback(null);"
    	            + "})()";
            
    	        this.handler.post(new Runnable() {
    	        	@Override
    	        	public void run() {
    	        		QrefInterface.this.app.webView.loadUrl(js);
    	        	}
    	        });
        }
        else {
        	final String js =
	            "javascript:(function() { "
	                + "var callback = " + callback + ";"
	                + "callback('" + data + "');"
	            + "})()";
        
	        this.handler.post(new Runnable() {
	        	@Override
	        	public void run() {
	        		QrefInterface.this.app.webView.loadUrl(js);
	        	}
	        });
        }
	}
	
	@JavascriptInterface
	public void hideSplash() {
		this.handler.post(new Runnable() {
			@Override
			public void run() {
				QrefInterface.this.app.getPreviousPurchases();
				QrefInterface.this.app.hideSplash();
			}
		});
	}
}

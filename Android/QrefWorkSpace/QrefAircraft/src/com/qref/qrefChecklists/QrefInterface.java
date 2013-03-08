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
import java.net.URL;
import java.util.ArrayList;
import java.util.UUID;

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
	protected ArrayList<File> checklists;
	protected int position;
	
	public static String HOST = "https://my.qref.com/"; 
	
	public QrefInterface(MainActivity app, SharedPreferences prefs, Context context, WebView view, Handler threader) {
		this.preferences = prefs;
		this.context = context;
		this.app = app;
		this.view = view;
		this.position = 0;
		this.handler = threader;
	}
	
	private String createUid() {
		return UUID.randomUUID().toString();
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
	public void saveChecklist(String data, String filename) {
		Editor edit = this.preferences.edit();
		String encrypted = data;
		
		String uid = this.preferences.getString("uid", null);
		
		if(uid == null) {
			uid = this.createUid();
			
			edit.putString("uid", uid);
			edit.commit();
		}
		
		if(!data.equals("")) {
			try {
				DESKeySpec keySpec = new DESKeySpec(uid.getBytes("UTF8"));
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
			} catch (IOException e) {
				
			}
		}
	}
	
	@JavascriptInterface
	public void updateUser(String data) {
		Editor edit = this.preferences.edit();
		
		edit.putString("user", data);
		
		edit.commit();
	}
	
	@JavascriptInterface
	public void updateToken(String data) {
		Editor edit = this.preferences.edit();
		
		edit.putString("token", data);
		
		edit.commit();
	}
	
	@JavascriptInterface
	public String getToken() {
		return this.preferences.getString("token", null);
	}
	
	@JavascriptInterface
	public String getUser() {
		return this.preferences.getString("user", null);
	}
	
	@JavascriptInterface
	public void findChecklistFiles() {
		File dataDirectory = this.context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
		
		File[] files = dataDirectory.listFiles();
		this.checklists = new ArrayList<File>();
		this.position = 0;
		
		for(int i = 0; i < files.length; i++) {
			File file = files[i];
			
			if(file.getName().contains(".qrf")) {
				this.checklists.add(file);
			}
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
			
			if(uid != null && encryptedBuffer.length() > 0) {
				try {
					DESKeySpec keySpec = new DESKeySpec(uid.getBytes("UTF8"));
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
	public String getImage(String imageUrl) {
		String hostUrl = HOST + imageUrl;
		
		File cacheDir = this.context.getExternalFilesDir(Environment.DIRECTORY_PICTURES);
		
		String absolute = cacheDir.getAbsolutePath();
		
		String imagePath = absolute + imageUrl;
		
		File possibleImage = new File(imagePath);
		
		File directoryPath = new File(possibleImage.getParent());
		
		if(!directoryPath.isDirectory()) {
			if(!directoryPath.mkdirs()) {
				byte[] imageBytes = this.getImageBytes(hostUrl);
				
				if(imageBytes.length <= 0)
					return "";
					
				return "data:image/png;base64," + Base64.encodeToString(imageBytes, 0);
			}
		}
		if(possibleImage.exists()) {
			byte[] imageBytes = this.getCachedImageAsBytes(possibleImage);
			
			if(imageBytes.length <= 0)
				return "";
			
			return "data:image/png;base64," + Base64.encodeToString(imageBytes, 0);
		}
		else {
			
			try {
				byte[] imageBytes = this.getImageBytes(hostUrl);
				
				if(imageBytes.length <= 0) 
					return "";
				
				FileOutputStream out = null;
				
				out = new FileOutputStream(possibleImage);
				
				out.write(imageBytes);
				out.flush();
				out.close();
				
				return "data:image/png;base64," + Base64.encodeToString(imageBytes, 0);
			} catch (Exception e) {
				return "";
			}
		}
	}
	
	@JavascriptInterface
	public void clearCache() {
		for(int i = 0; i < this.checklists.size(); i++) {
			File checklist = this.checklists.get(i);
			
			checklist.delete();
		}
		
		this.checklists.clear();
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
			Bitmap image = BitmapFactory.decodeStream(new URL(url).openConnection().getInputStream());
			
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
package com.qref.qrefChecklists;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;

import org.json.JSONException;
import org.json.JSONObject;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.util.Base64;

public class KeyChain {
	private Context context;
	private JSONObject keys;
	private String keychain;
	private SharedPreferences preferences;
	
	public KeyChain(Context context) {
		this.context = context;
	}
	
	public void load(String keychain) {
		this.keychain = keychain;
		this.preferences = this.context.getSharedPreferences(keychain, 0);
		
		String keyjson = this.preferences.getString("chain", null);
		keyjson = this.decryptJSON(keyjson);
		if(keyjson != null) {
			try {
				this.keys = new JSONObject(keyjson);
			} catch (JSONException e) {
				this.keys = new JSONObject();
			}
		}
		else {
			this.keys = new JSONObject();
		}
	}
	
	public void set(String key, Object value) {
		try {
			this.keys.put(key, value);
		} catch (JSONException e) {
		}
	}
	
	public void set(String key, String value) {
		try {
			this.keys.put(key, value);
		} catch (JSONException e) {
		}
	}
	
	public Object get(String key) {
		if(this.keys.has(key)) {
			try {
				return this.keys.get(key);
			} catch (JSONException e) {
				return null;
			}
		}
		
		return null;
	}
	
	public boolean hasKey(String key) {
		return this.keys.has(key);
	}
	
	public String getString(String key) {
		if(this.keys.has(key)) {
			try {
				return this.keys.getString(key);
			} catch (JSONException e) {
				return null;
			}
		}
		
		return null;
	}
	
	public void synchronize() {
		Editor editor = this.preferences.edit();
		
		editor.putString("chain",this.encryptJSON());
		
		editor.commit();
	}
	
	private String decryptJSON(String data) {
		try {
			String skey = this.keychain + this.keychain + this.keychain + this.keychain;
			DESKeySpec keySpec = new DESKeySpec(skey.getBytes("UTF8"));
			SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
			SecretKey key = keyFactory.generateSecret(keySpec);
			
			byte[] text = Base64.decode(data, 0);
			
			Cipher cipher = Cipher.getInstance("DES");
			cipher.init(Cipher.DECRYPT_MODE, key);
			String decrypted = new String(cipher.doFinal(text));
					
			return decrypted;
		}
		catch (Exception e) {
			return null;
		}
	}
	
	private String encryptJSON() {
		try {
			String skey = this.keychain + this.keychain + this.keychain + this.keychain;
			DESKeySpec keySpec = new DESKeySpec(skey.getBytes("UTF8"));
			SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
			SecretKey key = keyFactory.generateSecret(keySpec);
			
			byte[] text = this.keys.toString().getBytes("UTF8");
			
			Cipher cipher = Cipher.getInstance("DES");
			cipher.init(Cipher.ENCRYPT_MODE, key);
			String encrypted = Base64.encodeToString(cipher.doFinal(text), 0);
			
			return encrypted;
		}
		catch (Exception e) {
			return null;
		}
	}
}

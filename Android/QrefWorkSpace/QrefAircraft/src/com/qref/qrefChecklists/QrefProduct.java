package com.qref.qrefChecklists;

import org.json.JSONObject;

public class QrefProduct {
	public String sku;
	public JSONObject purchaseData;
	public String signature;
	public JSONObject receipt;
	
	@Override
	public boolean equals(Object obj) {
		if(obj == null) return false;
		
		if(obj == this) return true;
		
		if(obj.getClass().equals(this.getClass())) {
			QrefProduct product = (QrefProduct)obj;
			try {
				if(product.sku.equals(this.sku))
					return true;
			} catch (Exception e) {
				return false;
			}
		}
		
		return false;
	}
}

var productList = [];
var manufacturerList = [];
var modelList = [];
var mfgDictionaryList = [];
var checklistList = [];
var madeChanges = false;
var chosenImageType = "";
var newProductCoverImage = "";
var newProductIcon = "";
var isModalPopUpShowing = false;
var isNewProductShowing = false;
var hasUploadedNewPicture = false;

$(window).load(function() {
	if(token != "")
		prepareDocument();
});

function product() {
	this.id = "";
	this.name = "";
	this.description = "";
	this.isPublished = false;
	this.appleProductId = "";
	this.isAppleEnabled = false;
	this.androidProductId = "";
	this.isAndroidEnabled = false;
	this.suggestedRetailPrice = 0;
	this.isSampleProduct = false;
	this.manufacturer = "";
	this.model = "";
	this.productCategory = "";
	this.productType= "";
	this.serialNumber = "";
	this.checklist = "";
	this.coverImage = "";
	this.productIcon = "";
	this.hasChanged = false;
	this.isNew = false;
	this.isDeleted = false;
	this.hasNewIcon = false;
	this.checklistHasChanged = false;
		
	this.getHTML = function()
	{
		if(this.isNew)
			productList.unshift(this);
		else
			productList.push(this);
		
		var status = "";
		
		if(this.isNew)
			status = '<div class="productStatus border notCheckedIn">'
		else
			status = '<div class="productStatus border checkedIn">'
		
		
		return(
			'<div id="' + this.id +'" class="product productBackground">' +
				status +
				'</div>' +
				'<div class="productText pName">' +
					this.name +
				'</div>' +
				'<div class="productText pMfg">' +
					'Mfg: ' + this.manufacturer.name +
				'</div>' +
				'<div class="productText pModel">' +
					'Model: ' + this.model.name +
				'</div>' +
				'<span class="id" style="display:none;">' + this.id + '</span>' +
			'</div>'
		);
	}
}

function productImage() {
	this.src = "";
	this.getHTML = function() {
	
		var src = "";
		
		if(this.src === "")
			src = "#"
		else
			src = this.src;
		return(	
			'<div class="pbImageWrap border center rounded">' +
				'<div class="pbImage border center">' +
					'<img src="' + src + '"/>' +
				'</div>' +
				'<div class="pbImageDelete">' +
					'<div class="pbImageDeleteButton" onclick="deletePicture()">' +
						'<i class="icon icon-remove-sign"></i>' +
					'</div>' +
				'</div>' +
			'</div>'
		);
	}
}

function findProductHTML(product) {
	var p = $('#' + product.id);
	if(p.length == 0)
		return null;
	else
		return p;
}

function setProductStatus(status, product) {
	if(product) {
	
		var productHTML = $(product).find($('.productStatus'));
		
		if(status == "notCheckedIn")
		{
			if(productHTML.length > 0) {
				if(productHTML.hasClass('checkedIn')) {
					productHTML.removeClass('checkedIn')
				}
				productHTML.addClass('notCheckedIn');
			}
		}
		else
		{
			if(productHTML.length > 0) {
				if(productHTML.hasClass('notCheckedIn')) {
					productHTML.removeClass('notCheckedIn')
				}
				productHTML.addClass('checkedIn');
			}
		}
	}
	else if(status == "notCheckedIn")
			$('.selected').closest('.product').find($('.productStatus')).css({"background-color":"red"});
		else
			$(product).find($('.productStatus')).css({"background-color":"green"});
}

function prepareDocument() {
	
	
	$('#productName').keyup(function() {
		madeChanges = true;
		alterProductName();
	});
	$('#productDescription').keyup(function() {
		madeChanges = true;
		var product = findProductById($($('.selected').closest('.product')).find($('.id')).text());
		product.description = $(this).val();
		product.hasChanged = true;
		setProductStatus("notCheckedIn");
		
	});
	$('#productAppleId').keyup(function() {
		madeChanges = true;
		var product = findProductById($($('.selected').closest('.product')).find($('.id')).text());
		product.appleProductId = $(this).val();
		product.hasChanged = true;
		setProductStatus("notCheckedIn");
	});
	$('#productAndroidId').keyup(function() {
		madeChanges = true;
		var product = findProductById($($('.selected').closest('.product')).find($('.id')).text());
		product.androidProductId = $(this).val();
		product.hasChanged = true;
		setProductStatus("notCheckedIn");
	});
	$('#productRetailPrice').keyup(function() {
		madeChanges = true;
		var product = findProductById($($('.selected').closest('.product')).find($('.id')).text());
		product.suggestedRetailPrice = $(this).val();
		product.hasChanged = true;
		setProductStatus("notCheckedIn");
	});
	$('#productSerialNumber').keyup(function() {
		madeChanges = true;
		var product = findProductById($($('.selected').closest('.product')).find($('.id')).text());
		product.serialNumber = $(this).val();
		product.hasChanged = true;
		setProductStatus("notCheckedIn");
	});
	$('#productIsPublished').click(function() {
		madeChanges = true;
		var product = findProductById($($('.selected').closest('.product')).find($('.id')).text());
		product.isPublished = $(this)[0].checked;
		product.hasChanged = true;
		setProductStatus("notCheckedIn");
	});
	$('#productIsAppleEnabled').click(function() {
		madeChanges = true;
		var product = findProductById($($('.selected').closest('.product')).find($('.id')).text());
		product.isAppleEnabled = $(this)[0].checked;
		product.hasChanged = true;
		setProductStatus("notCheckedIn");
	});
	$('#productIsAndroidEnabled').click(function() {
		madeChanges = true;
		var product = findProductById($($('.selected').closest('.product')).find($('.id')).text());
		product.isAndroidEnabled = $(this)[0].checked;
		product.hasChanged = true;
		setProductStatus("notCheckedIn");
	});
	$('#productIsSample').click(function() {
		madeChanges = true;
		var product = findProductById($($('.selected').closest('.product')).find($('.id')).text());
		product.isSampleProduct = $(this)[0].checked;
		product.hasChanged = true;
		setProductStatus("notCheckedIn");
	});
	$('#productChecklist').change(function() {
		var product = findProductById($($('.selected').closest('.product')).find($('.id')).text());
		product.checklistHasChanged = true;
		madeChanges = true;
	});
	
	$('#addNewProductManufacturer').change(function() {
		populateModelList(true,true);
	});
	
	$('select').change(function() {
		madeChanges = true;
	});
	
	GetToken(function(token){
		loader.show();
		getProducts(token);
		getManufacturers(function() {
			getModels(function () {
				getChecklists(function() {
					loader.hide();
				});
			});
		});
	});
}

function reset() {
	//Clear Product Details
	$('#productName').val("");
	$('#productDescription').val("");
	$('#productIsPublished').attr('checked',false);
	$('#productAppleId').val("");
	$('#productIsAppleEnabled').attr('checked',false);
	$('#productAndroidId').val("");
	$('#productIsAndroidEnabled').attr('checked',false);
	$('#productRetailPrice').val("");
	$('#productCategory').val("");
	$('#productType').val("");
	$('#productChecklist').val("");
	$('#productIsSample').attr('checked',false);
	$('#productSerialNumber').val("");
	$('#productCoverImage').attr('src','images/notFound.jpg');
	$('#productManufacturer').val("");
	$('#productModel').val("");
	$('#productIcon').attr('src','images/notFound.jpg');
	
}

function resetNewProduct() {
	$('#addNewProductName').val("");
	$('#addNewProductDescription').val("");
	$('#addNewProductAppleId').val("");
	$('#addNewProductAndroidId').val("");
	$('#addNewProductRetailPrice').val("0");
	$('#addNewProductSerialNumber').val("");
	
	$('#addNewProductIsPublished').attr('checked',false);
	$('#addNewProductIsAppleEnabled').attr('checked',false);
	$('#addNewProductIsAndroidEnabled').attr('checked',false);
	$('#addNewProductIsSample').attr('checked',false);
	
	$('#addNewProductCoverImage').attr('src',"images/notFound.jpg");
	$('#addNewProductIcon').attr('src',"images/notFound.jpg");
	
	$('#addNewProductChecklist')
	$('#addNewProductManufacturer').val("0");
	$('#addNewProductModel').empty();
	
	$('#modalDisplay').click();
	
}

function selectProduct(event) {
	$('.selected').toggleClass('productBackground');
	$('.selected').toggleClass('selected');
	$(event.target).closest('.product').toggleClass('productBackground');
	$(event.target).closest('.product').toggleClass('selected');
	
	loadDetails($(event.target).closest('.product'));
}

function findProductById(id) {
	for(var i = 0; i < productList.length; i++) {
		if(productList[i].id == id)
			return productList[i];
	}
	return null;
}

function findProductManufacturerById(id) {
	for(var i = 0; i < manufacturerList.length; i++) {
		if(manufacturerList[i]._id == id)
			return manufacturerList[i];
	}
	return null;
}

function findProductModelById(id) {
	for(var i = 0; i < modelList.length; i++) {
		if(modelList[i]._id == id)
			return modelList[i];
	}
	return null;
}

function findMfgDictionaryById(id) {
	for(var i = 0; i < mfgDictionaryList.length; i++) {
		if(mfgDictionaryList[i].id == id) {
			return mfgDictionaryList[i];
		}
	}
	return null;
}

function findChecklistById(id) {
	for(var i = 0; i < checklistList.length; i++) {
		if(checklistList[i]._id == id)
			return;
	}
	return null;
}

function loadDetails(html) {
	
	var product = findProductById($(html).find($('.id')).text());
	
	$('#productName').val(product.name);
	$('#productDescription').val(product.description);
	
	if(product.isPublished)
		$('#productIsPublished').attr('checked',true);
	else
		$('#productIsPublished').attr('checked',false);
		
	$('#productAppleId').val(product.appleProductId);
	
	if(product.isAppleEnabled)
		$('#productIsAppleEnabled').attr('checked',true);
	else
		$('#productIsAppleEnabled').attr('checked',false);
		
	$('#productAndroidId').val(product.androidProductId);
	
	if(product.isAndroidEnabled)
		$('#productIsAndroidEnabled').attr('checked',true);
	else
		$('#productIsAndroidEnabled').attr('checked',false);
	
	$('#productRetailPrice').val(product.suggestedRetailPrice);
	$('#productCategory').val(product.productCategory);
	$('#productType').val(product.productType);
	$('#productChecklist').val(product.checklist);
	
	if(product.isSampleProduct)
		$('#productIsSample').attr('checked',true);
	else
		$('#productIsSample').attr('checked',false);
	
	$('#productSerialNumber').val(product.serialNumber);
	
	if(product.coverImage != "")
		$('#productCoverImage').attr('src',product.coverImage);
	else
		$('#productCoverImage').attr('src',"images/notFound.jpg");
		
		
	$('#productManufacturer').val(product.manufacturer._id);
	
	populateModelList();
	
	$('#productModel').val(product.model._id)
	
	if(product.coverImage != "")
		$('#productIcon').attr('src',product.productIcon);
	else
		$('#productIcon').attr('src',"images/notFound.jpg");
	
}

function getManufacturers(callback) {

	var request = { "mode":"ajax", "token":token }
	
	$.ajax
	({
		type: "get",
		data: JSON.stringify(request),
		contentType:"application/json; charset=utf-8",
		dataType: "json",
		url: host + "services/ajax/aircraft/manufacturers?token=" + token,
		success: function(data) 
		{
			var response = data;
								
			if(response.success == true)
			{
				addManufacturersToList(response.records, callback);
			}
			else
			{
				alert("Request Failed");
			}	
		},
		error: function(a,b,c) 
		{
			alert("Request Errored Out");
		}
	})
}

function getModels(callback) {

	$.ajax({
		type: "get",
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		url: host + "services/ajax/aircraft/models?token=" + token,
		success: function(data) {
			var response = data;
			
			if(response.success == true)
			{
				addModelsToList(response.records, callback);
			}
			else
			{
				alert(response.message);
			}	
		},
		error: function() {
			
		}
	})
}

function getProducts(loginToken, callback) {

	var request = { "mode":"ajax", "token":loginToken }
	
	$.ajax
	({
		type: "get",
		data: JSON.stringify(request),
		contentType:"application/json; charset=utf-8",
		dataType: "json",
		url: host + "services/ajax/aircraft/products?token=" + loginToken,
		success: function(data) 
		{
			var response = data;
								
			if(response.success == true)
			{
				addProductsToList(response.records, callback);
			}
			else
			{
				alert("Request Failed");
			}	
		},
		error: function(a,b,c) 
		{
			alert("Request Errored Out");
		}
	})
}

function getChecklists(callback) {
	var request = { "mode":"ajax", "token":token }
	
	$.ajax
	({
		type: "get",
		data: JSON.stringify(request),
		contentType:"application/json; charset=utf-8",
		dataType: "json",
		url: host + "services/ajax/aircraft/checklists?token=" + token,
		success: function(data) 
		{
			var response = data;
								
			if(response.success == true)
			{
				var records = response.records;
				checklistList = [];
				for(var i = 0; i < records.length; i++) {
					if( records[i].user == null) {
						checklistList.push(records[i]);
					}
				}
				
				addChecklistsToList(callback);
			}
			else
			{
				alert("Request Failed");
			}	
		},
		error: function(a,b,c) 
		{
			alert("Request Errored Out");
		}
	})
}

function addNewProduct(callback) {

	$('.selected').closest('.product').toggleClass('productBackground');
	$('.selected').closest('.product').toggleClass('selected');
	
	reset();
	
	showHTML('#addNewProduct');
	if(callback)
		callback();
}

function deleteProduct() {
	
	var productHTML = $('.selected').closest('.product');
	if($(productHTML).length == 0)
		return;
	
	var product = findProductById($(productHTML).find($('.id')).text());
	
	if(product.isNew) {
		productList.splice(productList.indexOf(product),1);
	}
	else {
		product.isDeleted = true;
	}
	productHTML.remove();
}

///*
function changePicture(event, isPopUp) {

	var currentImage = $(event.target).closest('img');
	
	if($(currentImage)[0].id.indexOf("CoverImage") != -1)
		chosenImageType = "coverImage";
	else
		chosenImageType = "productIcon";
	
	if(isPopUp)
	{
		alert("Please check in your new Product before adding an Image");
		return;
		//showPopUp($('#hiddenDivs').find('#changePictureWindow'));
	}
	else {
		if($('.selected').closest('.product').length == 0)
			return;
		else
		{
			var productHTML = $('.selected').closest('.product');
			var product = findProductById($(productHTML).find($('.id')).text());
			
			if( (product.checklist == null || product.checklist == "") || ($('#productChecklist').val() == "" || $('#productChecklist').val() == 0)) {
				alert("Please select an Aircraft Checklist");
				return;
			}
			
			showHTML($('#hiddenDivs').find('#changePictureWindow'));
		}
	}
		
}
///*/
/*
function changePicture(event, isPopUp) {
	
	var currentImage = $(event.target).closest('img');
	
	if($(currentImage)[0].id.indexOf("CoverImage") != -1)
		chosenImageType = "coverImage";
	else
		chosenImageType = "productIcon";
	
	if(isPopUp) {
		getProductImages(function() {
			showPopUp($('#hiddenDivs').find('#pictureBrowser'));
		});
	}
	else {
		if($('.selected').closest('.product').length == 0)
			return;
		else {
			getProductImages(function() {
				showHTML($('#hiddenDivs').find('#pictureBrowser'));
			});
		}
	}
		
}
*/
function getProductImages(callback) {
	
	var html = $('.pbImagesCont').html();
	
	if(!hasUploadedNewPicture && html != "")
		return;

	var request = { "mode":"ajax", "token":token }
	loader.show();
	$.ajax
	({
		type: "get",
		data: JSON.stringify(request),
		contentType:"application/json; charset=utf-8",
		dataType: "json",
		url: host + "services/ajax/aircraft/images?token=" + token,
		success: function(data) 
		{
			var response = data;
								
			if(response.success == true)
			{
				addProductImagesToList(response.records, function() {
					if(callback) {
						callback();
						loader.hide();
					}
					else {
						loader.hide();
					}
				});
			}
			else
			{
				alert("Request Failed");
				var test = new testResponse();
				addProductImagesToList(test.records, function() {
					if(callback) {
						callback();
						loader.hide();
					}
					else {
						loader.hide();
					}
				});
			}	
		},
		error: function(a,b,c) 
		{
			alert("Request Errored Out");
			var test = new testResponse();
				addProductImagesToList(test.records, function() {
					if(callback) {
						callback();
						loader.hide();
					}
					else {
						loader.hide();
					}
				});
		}
	})
}

function testResponse() {
	this.records = ['http://www.cessna.com/MungoBlobs/999/439/car_675_sp01.jpg',
	'http://www.cessna.com/MungoBlobs/921/1004/sin_haw_sp01.jpg',
	'http://www.cessna.com/MungoBlobs/984/19/172%20hangar_226x120.jpg',
	'http://www.cessna.com/MungoBlobs/972/576/172_overview_sp3_2010.jpg',
	'http://www.cessna.com/MungoBlobs/755/681/162_overview_sp1.jpg',
	'http://www.cessna.com/MungoBlobs/829/850/628_559_162_overview_sp2.jpg',
	'http://www.cessna.com/MungoBlobs/237/477/162_overview_sp3_2010.jpg',
	'http://www.cessna.com/MungoBlobs/999/439/car_675_sp01.jpg',
	'http://www.cessna.com/MungoBlobs/921/1004/sin_haw_sp01.jpg',
	'http://www.cessna.com/MungoBlobs/984/19/172%20hangar_226x120.jpg',
	'http://www.cessna.com/MungoBlobs/972/576/172_overview_sp3_2010.jpg',
	'http://www.cessna.com/MungoBlobs/755/681/162_overview_sp1.jpg',
	'http://www.cessna.com/MungoBlobs/829/850/628_559_162_overview_sp2.jpg',
	'http://www.cessna.com/MungoBlobs/999/439/car_675_sp01.jpg',
	'http://www.cessna.com/MungoBlobs/921/1004/sin_haw_sp01.jpg',
	'http://www.cessna.com/MungoBlobs/984/19/172%20hangar_226x120.jpg',
	'http://www.cessna.com/MungoBlobs/972/576/172_overview_sp3_2010.jpg',
	'http://www.cessna.com/MungoBlobs/755/681/162_overview_sp1.jpg',
	'http://www.cessna.com/MungoBlobs/829/850/628_559_162_overview_sp2.jpg',
	'http://www.cessna.com/MungoBlobs/999/439/car_675_sp01.jpg',
	'http://www.cessna.com/MungoBlobs/921/1004/sin_haw_sp01.jpg',
	'http://www.cessna.com/MungoBlobs/984/19/172%20hangar_226x120.jpg',
	'http://www.cessna.com/MungoBlobs/972/576/172_overview_sp3_2010.jpg',
	'http://www.cessna.com/MungoBlobs/755/681/162_overview_sp1.jpg',
	'http://www.cessna.com/MungoBlobs/829/850/628_559_162_overview_sp2.jpg'];
}

function showPicturePreview(input) {
	
	if (input.files && input.files[0]) 
	{
		loader.show();
		var reader = new FileReader();

		var previewBox = $(input).closest('.addPicCont');
		previewBox = $(previewBox).find('.addPicPreview');
		previewBox = $(previewBox).find('img');
		
		reader.onload = function (e) {
			selectedPicture = e.target.result;
			$(previewBox).attr('src', e.target.result);
		}

		reader.readAsDataURL(input.files[0]);
		loader.hide();
	}
}

function closePictureUploader(event) {
	
	$('#modalDisplay').click();
}

function acceptPicture(button) {
	
	if($('.addPicSelect').find('input')[0].files.length == 1)
	{
		madeChanges = true;
		
		var productHTML = $('.selected').closest('.product');
		var product = findProductById($(productHTML).find($('.id')).text());
		
		
		uploadPicture(chosenImageType, product, function(response) {
		
			if(chosenImageType == "coverImage") {
				if(product == null)
				{
					newProductCoverImage = host + response.returnValue;
					$('#addNewProductCoverImage').attr('src',newProductCoverImage);
				}
				else
				{
					product.coverImage = host + response.returnValue;
					product.hasChanged = true;
					$('#productCoverImage').attr('src',product.coverImage);
					setProductStatus("notCheckedIn");
				}
			}
			else {
				if(product == null)
				{
					newProductIcon = host + response.returnValue;
					$('#addNewProductIcon').attr('src',newProductIcon);
				}
				else
				{
					product.productIcon = host + response.returnValue;
					product.hasChanged = true;
					product.hasNewIcon = true;
					$('#productIcon').attr('src',product.productIcon);
					setProductStatus("notCheckedIn");
				}
			}
			
			$('.addPicPreview').find('img').attr('src',"");
			$('.addPicSelect').find('input')[0].files = [];
			
					
			
			if(isModalPopUpShowing)
				$('#modalPopUp').click();
			else
				$('#modalDisplay').click();
		});
	}
		else {
			alert("Please select a picture to upload");
		}
}

function uploadPicture(imageType, product, callback) {

	$('#picUploadToken').attr("value",token);
	$('#picUploadProduct').attr("value",product.id);
	
	var formData = new FormData($('#picForm')[0]);
	var file = $('.addPicSelect').find('input')[0].files[0];
	formData.append('image', file);
	formData.append('token',token);
	formData.append('product',product.id);
	formData.append('mode','rpc');
	loader.show();
	
	var route = "";
	
	
	if(imageType == "coverImage")
		route = "services/rpc/aircraft/product/cover";
	else
		route = "services/rpc/aircraft/product/icon";
		
	$.ajax({
		data: formData,
		cache: false,
		contentType: false,
		processData:false,
		url: host+ route + "?mode=rpc&token=" + token + "&product=" + product.id,
		type: 'POST',
		xhr: function(){
			myXhr = $.ajaxSettings.xhr();
			if(myXhr.upload)
			{
				myXhr.upload.addEventListener('progress',progressbarHandler);
			}			
			return myXhr;
		},
		success: function(data){
			
			var response = data;
			
			try{
				response = JSON.parse(data);
			}
			catch(err)
			{
				response = data;
			}
		
			if(data.success)
			{
				alert("Picture Uploaded SuccessFully");
				loader.hide();
				if(callback)
					callback(data);
			}
			else
			{
				alert("Picture Upload Failed");
				loader.hide();
			}				
		},
		error: function(){
			alert("Error in Picture Upload");
			loader.hide();
		}		
	});


}

function getChecklistById(id, image, callback) {

	$.ajax
	({
		type: "get",
		contentType:"application/json; charset=utf-8",
		dataType: "json",
		url: host + "services/ajax/aircraft/checklist/" + id + "?token=" + token +"&mode=ajax",
		success: function(response)
		{								
			if(response.success == true)
			{
				if(callback)
					callback(response, image);
			}
			else
			{
				alert("ChecklistRequest Failed");
				loader.hide();
			}	
		},
		error: function(a,b,c) 
		{
			alert("ChecklistRequest Error");
			loader.hide();
		}
	});
}

function updateChecklistImage(chklistResponse, image)
{
	var checklist = chklistResponse.records[0];
	
	var postData = { "mode":"ajax", "token":token, "preflight": checklist.preflight,
	"takeoff":checklist.takeoff, "landing":checklist.landing, "emergencies":checklist.emergencies,
	"manufacturer":checklist.manufacturer._id, "model":checklist.model._id, "modelYear":checklist.model.modelYear,
	"productIcon":image }
	
	$.ajax
	({
		type: "post",
		data: JSON.stringify(postData),
		contentType:"application/json; charset=utf-8",
		dataType: "json",
		url: host + "services/ajax/aircraft/checklist/" + checklist._id,
		success: function(response)
		{								
			if(response.success == true)
			{
				loader.hide();
			}
			else
			{
				alert("ChecklistRequest Failed");
				loader.hide();
			}	
		},
		error: function(a,b,c) 
		{
			alert("ChecklistRequest Error");
			loader.hide();
		}
	});
}

function acceptNewProduct(callback) {

	//Add Validation
	if($('#addNewProductManufacturer :selected').text() == "")
	{
		alert("Please select a manufacturer");
		return;
	}
	
	if($('#addNewProductModel :selected').text() == "")
	{
		alert("Please select a model");
		return;
	}
	
	if($('#addNewProductChecklist :selected').text() == "")
	{
		alert("Please select a checklist");
		return;
	}
	
	madeChanges = true;
	var newProduct = new product();
	
	newProduct.id = getGuid();
	newProduct.name = $('#addNewProductName').val();
	newProduct.description = $('#addNewProductDescription').val();
	newProduct.isPublished = $('#addNewProductIsPublished')[0].checked;
	newProduct.appleProductId = $('#addNewProductAppleId').val();
	newProduct.isAppleEnabled = $('#addNewProductIsAppleEnabled')[0].checked;
	newProduct.androidProductId = $('#addNewProductAndroidId').val();
	newProduct.isAndroidEnabled = $('#addNewProductIsAndroidEnabled')[0].checked;
	newProduct.suggestedRetailPrice = $('#addNewProductRetailPrice').val();
	newProduct.isSampleProduct = $('#addNewProductIsSample')[0].checked;
	newProduct.manufacturer = findProductManufacturerById($('#addNewProductManufacturer').val());
	newProduct.model = findProductModelById($('#addNewProductModel').val());
	newProduct.productCategory = $('#addNewProductCategory :selected').text();
	newProduct.productType= $('#addNewProductType :selected').text();
	newProduct.serialNumber = $('#addNewProductSerialNumber').val();
	newProduct.checklist = $('#addNewProductChecklist').val();
	newProduct.coverImage = newProductCoverImage;
	newProduct.productIcon = newProductIcon;
	
	newProduct.isNew = true;
	
	var newProductHTML = newProduct.getHTML()
	
	var newProductElement =  $(newProductHTML).click(function(event) {
		selectProduct(event);
	});
	
	$('#productsWrapper').prepend(newProductElement);
	
	setProductStatus("notCheckedIn", $(newProductHTML));
	
	
	returnHTML('#addNewProduct');
	
	if(callback)
		callback();
}

function getGuid() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid;
}

function centerDiv(div) {
	var height = $(div).height();
	var width = $(div).width();
	var screenHeight = $(window).height();
	var screenWidth = $(window).width();
	
	$(div).css({'top': ((screenHeight/2) - (height/2)) + 'px', 'left': ((screenWidth/2) - (width/2))})
	
	$(div).show();
}

function addProductsToList(records, callback) {

	var recordsSortable = new SortableArray(records);
	var sortedRecords = recordsSortable.sortBy(["name"]);
	
	$('#productsWrapper').empty();
	
	for(var i = 0; i < sortedRecords.length; i++) {
		var r = sortedRecords[i];
		var p = new product();
		
		p.id = r._id;
		p.name = r.name;
		p.description = r.description;
		p.isPublished = r.isPublished;
		p.appleProductId = r.appleProductIdentifier;
		p.isAppleEnabled = r.isAppleEnabled;
		p.androidProductId = r.androidProductIdentifier;
		p.isAndroidEnabled = r.isAndroidEnabled;
		p.suggestedRetailPrice = r.suggestedRetailPrice;
		p.isSampleProduct = r.isSampleProduct;
		p.manufacturer = r.manufacturer;
		p.model = r.model;
		p.productCategory = r.productCategory;
		p.productType= r.productType;
		p.serialNumber = r.serialNumber;
		p.checklist = r.aircraftChecklist;
		p.coverImage = r.coverImage;
		p.productIcon = r.productIcon;
		
		$('#productsWrapper').append(p.getHTML());
	}
	
	if(callback)
		callback();
	
	$('.product').click(function(event) {
		selectProduct(event);
	});
}

function addManufacturersToList(records, callback) {
	
	$('#productManufacturer').attr('onchange','');
		
	$('#productManufacturer').html("");
	var blankOption = document.createElement('Option');
	blankOption.text = "";
	blankOption.value = 0;
	$('#productManufacturer').append(blankOption);
	
	var productBlank = document.createElement('Option');
	productBlank.text = "";
	productBlank.value = 0;
	$('#addNewProductManufacturer').append(productBlank);
	
	manufacturerList = records;

	for(var i = 0; i < manufacturerList.length; i++) {
		var option = document.createElement('Option');
		option.text = manufacturerList[i].name;
		option.value = manufacturerList[i]._id;
		$('#productManufacturer').append(option);
		var productOption = document.createElement('Option');
		productOption.text = manufacturerList[i].name;
		productOption.value = manufacturerList[i]._id;
		$('#addNewProductManufacturer').append(productOption);
		
		var mfgD = new mfgDictionary();
		mfgD.id = manufacturerList[i]._id
		mfgD.name = manufacturerList[i].name;
		mfgDictionaryList.push(mfgD);
	}
	
	$('#productManufacturer').attr('onchange','alterProductMfg(false)');
	$('#addNewProductManufacturer').attr('onchange','populateModelList(false,true)');
	
	if(callback)
		callback();
}

function addModelsToList(records, callback) {
	
	modelList = records;
	
	for(var i = 0; i < modelList.length; i++) {
		var mfgD = findMfgDictionaryById(modelList[i].manufacturer);
		mfgD.models.push(modelList[i]);
	}
	
	if(callback)
		callback();
}

function addChecklistsToList(callback) {
	
	$('#productChecklist').html("");
	$('#addNewProductChecklist').html("");
	
	var blankOption = document.createElement('option');
	blankOption.text = "";
	blankOption.value = 0;
	$('#productChecklist').append($(blankOption));
	
	var productBlank = document.createElement('option');
	productBlank.text = "";
	productBlank.value = 0;
	$('#addNewProductChecklist').append($(productBlank));
	
	var checklist = new SortableArray(checklistList);
	var sortedChecklist = checklist.sortBy([ "manufacturer.name","model.name","version" ]);
	
	for(var i = 0; i < sortedChecklist.length; i++) {
		var checklist = sortedChecklist[i];
		
		var option = document.createElement('option');
		option.text = checklist.manufacturer.name + ' ' + checklist.model.name + ' Version: ' + checklist.version;
		option.value = checklist._id;
		$('#productChecklist').append($(option));
		var productOption = document.createElement('option');
		productOption.text = checklist.manufacturer.name + ' ' + checklist.model.name + ' Version: ' + checklist.version;
		productOption.value = checklist._id;
		$('#addNewProductChecklist').append($(productOption));
	}
	if(callback)
		callback();
}

function addChecklistToProduct(dropdown) {

	var checklistId = $(dropdown).val();
	
	var productHTML = $('.selected').closest('.product');
	
	if(productHTML.length != 0) {
		var product = findProductById($(productHTML).find($('.id')).text());
		product.checklist = checklistId;
		product.hasChanged = true;
		setProductStatus("notCheckedIn");
		madeChanges = true;
	}
}

function addProductImagesToList(records,callback) {
	for(var i = 0; i < records.length; i++) {
	
		var currentImage = records[i];
		var pImage = new productImage();
		
		pImage.src = currentImage;
		
		$('.pbImagesCont').append(pImage.getHTML());
		
	}
	
	$('.pbImage').click(function() {
		$(this).toggleClass('selected');
	});

	if(callback)
		callback();
}	

function alterProductMfg(isAddNewProduct) {
	
	if($('.selected').length == 0)
		return;
	
	var productHTML = $('.selected').closest('.product');
	var product = findProductById($(productHTML).find($('.id')).text());
	
	product.manufacturer = findProductManufacturerById($('#productManufacturer').val());
	product.hasChanged = true;
	$(productHTML).find('.pMfg').text(product.manufacturer.name);
	setProductStatus("notCheckedIn");
	
	populateModelList(true);
}

function populateModelList(shouldMakeChanges, isAddNewProduct) {
	
	$('#productModel').attr('onchange','');
	
	$('#productModel').html("");
	$('#addNewProductModel').html("");
	
	var mfg = "";
	
	if(isAddNewProduct)
		mfg = findMfgDictionaryById($('#addNewProductManufacturer').val());
	else
		mfg = findMfgDictionaryById($('#productManufacturer').val());

	for(var i = 0; i < mfg.models.length; i++) {
		
		var model = mfg.models[i];
		
		var option = document.createElement('option');
		option.text = model.name;
		option.value = model._id;
		$('#productModel').append(option);
		
		var newOption = document.createElement('option');
		newOption.text = model.name;
		newOption.value = model._id;
		$('#addNewProductModel').append(newOption);
	}
	
	if(shouldMakeChanges) {
		madeChanges = true;
		
		var productHTML = $('.selected').closest('.product');
		var product = findProductById($(productHTML).find($('.id')).text());
	
		product.model = findProductModelById($('#productModel').val());
		
		if(product.model != null) {
			$(productHTML).find('.pModel').text(product.model.name);
		}
	}
	
	$('#productModel').attr('onchange','alterProductModel()');
}

function alterProductModel(isAddNewProduct) {
	shouldMakeChanges = true;
	var productHTML = $('.selected').closest('.product');
	var product = findProductById($(productHTML).find($('.id')).text());
	
	product.model = findProductModelById($('#productModel').val());
	product.hasChanged = true;
	$(productHTML).find('.pModel').text(product.model.name);
	setProductStatus("notCheckedIn");
}

function alterProductName() {
	shouldMakeChanges = true;
	var productHTML = $('.selected').closest('.product');
	var product = findProductById($(productHTML).find($('.id')).text());
	
	product.name = $('#productName').val();
	product.hasChanged = true;
	$(productHTML).find('.pName').text($('#productName').val());
	setProductStatus("notCheckedIn");
}

function mfgDictionary() {
	this.name = "";
	this.id = "";
	this.models = [];
	
}

function showHTML(selector) {
	var rawHTML = $(selector).html();
	$(selector).empty();
	$('#results').html(rawHTML);
	$('#modalDisplay').show();
	$('#modalDisplay').unbind('click');
	$('#modalDisplay').click(function() {
		returnHTML(selector);
	});
	centerDiv('#modalWindow');
	isNewProductShowing = true;
}

function showPopUp(selector) {
	var rawHTML = $(selector).html();
	$(selector).empty();
	$('#popUp').html(rawHTML);
	$('#popUp').show();
	$('#results').hide();
	$('#modalPopUp').show();
	$('#modalPopUp').unbind('click');
	$('#modalPopUp').click(function() {
		closePopUp(selector);
	});
	centerDiv('#modalWindow');
	isModalPopUpShowing = true;
}

function closePopUp(selector) {
	var rawHTML = $('#popUp').html();
	$('#popUp').empty();
	$('#popUp').hide();
	$(selector).html(rawHTML);
	$('#modalPopUp').hide();
	$('#results').show();
	isModalPopUpShowing = false;
}

function returnHTML(selector) {
	var rawHTML = $('#results').html();
	$('#results').empty();
	$(selector).html(rawHTML);
	$('#modalDisplay').hide();
	$('#modalWindow').hide();
	isNewProductShowing = false;
}

function saveDictionary() {
	if(localStorage !== undefined) {
		localSTorage.setItem(JSON.stringify(mfgDictionaryList));
	}
}

function loadDictionary() {
	if(localStorage !== undefined) {
		localSTorage.getItem(JSON.parse(mfgDictionaryList));
	}
}

function GetToken(callback) {
	///*
	if (callback)
	{
		callback($.cookie.getCookie("QrefAuth") || null); 
	}
	
	token = $.cookie.getCookie("QrefAuth") || null;
	
	if(token == null)
	{
		token = $.cookie.getCookie("QrefAuth");
	}
	///*/
	/*
	var signin = { mode: "rpc", userName: "nathan.klick@b2datastream.com", password: "test" };
                
	$.ajax({
		type: "post",
		data: signin,
		dataType: "json",
		url: host + "services/rpc/auth/login",
		success: function(data) 
		{
			var response = data;
			if(response.success == true)
			{
				token = response.returnValue;
				$.cookie.setCookie("QrefAuth", token, 30);
				if (callback)
					callback(token);
			}
			else
			{
				if (callback)
					callback(null);
			}              
		},
		error: function(data, err, msg) 
		{
			if (callback)
				callback(null);
		}
	});
	//*/
}

function checkIn() {

	if(!madeChanges) {
		alert("No changes have been made");
		return;
	}
	
	var checkedInList = [];
	
	loader.show();
	
	for(var i = 0; i < productList.length; i++) {
		
		if(productList[i].isNew) {
			// Call Create Product
			var product = productList[i];
			
			var postData = {"mode":"ajax", "token":token,"name":product.name, "description":product.description,
				"isPublished":product.isPublished,"appleProductIdentifier":product.appleProductId ,"androidProductIdentifier":product.androidProductId ,
				"isAppleEnabled":product.isAppleEnabled ,"isAndroidEnabled":product.isAndroidEnabled ,"suggestedRetailPrice":parseInt(product.suggestedRetailPrice) ,
				"productCategory":product.productCategory ,"productType":product.productType ,
				"isSampleProduct":product.isSampleProduct ,"serialNumber":product.serialNumber ,"manufacturer":product.manufacturer._id ,"model":product.model._id };
			
			if(product.checklist != 0) {
				postData.aircraftChecklist = product.checklist;
			}
			
			if(product.coverImage != "")
				postData.coverImage = product.coverImage;
			
			if(product.productIcon != "")
			{
				postData.productIcon = product.productIcon;
				if(product.hasNewIcon || product.checklistHasChanged){
					getChecklistById(product.checklist, product.productIcon, function(checklist, image) {
						product.hasNewIcon = false;
						updateChecklistImage(checklist, image);
					});
				}
			}
			
			checkedInList.push(product._id);
			
			$.ajax
			({
				type: "post",
				data: JSON.stringify(postData),
				contentType:"application/json; charset=utf-8",
				dataType: "json",
				url: host + "services/ajax/aircraft/products",
				success: function(data)
				{
					var response = data;
										
					if(response.success == true)
					{
						if(checkedInList.length != 0) {
							checkedInList.splice(checkedInList.indexOf(response.records[0]._id),1);
							if(checkedInList.length == 0) {
								getProducts(token, function() {
									loader.hide();
									var dialog = new Dialog("#infobox","Uploaded Successfully");
									dialog.show();
								});
							}
						}							
					}
					else
					{
						alert("Post Failed");
						loader.hide();
					}	
				},
				error: function(a,b,c) 
				{
					alert("Post Error");
					loader.hide();
				}
			});
			
			continue;
		}
		
		if(!productList[i].hasChanged)
			continue;
			
		var product = productList[i];
		
		var request = { "mode":"ajax", "token":token, "name":product.name, "description":product.description,
		"isPublished":product.isPublished,"appleProductIdentifier":product.appleProductId ,"androidProductIdentifier":product.androidProductId ,
		"isAppleEnabled":product.isAppleEnabled ,"isAndroidEnabled":product.isAndroidEnabled ,"suggestedRetailPrice":parseInt(product.suggestedRetailPrice) ,
		"productCategory":product.productCategory ,"productType":product.productType ,"isSampleProduct":product.isSampleProduct ,
		"serialNumber":product.serialNumber ,"manufacturer":product.manufacturer ,"model":product.model };
		
		if(	product.checklist != "" && 
			product.checklist != "0" && 
			product.checklist != null && 
			product.checklist != undefined) {
			
			request.aircraftChecklist = product.checklist;
		}
		
		if(product.coverImage != "")
			request.coverImage = product.coverImage;
			
		if(product.productIcon != "")
		{
			request.productIcon = product.productIcon;
			if(product.hasNewIcon || product.checklistHasChanged){
				getChecklistById(product.checklist, product.productIcon, function(checklist, image) {
					product.hasNewIcon = false;
					updateChecklistImage(checklist, image);
				});
			}
		}
		
		checkedInList.push(product._id);
		
		$.ajax
		({
			type: "post",
			data: JSON.stringify(request),
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			url: host + "services/ajax/aircraft/product/" + product.id,
			success: function(data)
			{
				var response = data;
									
				if(response.success == true)
				{
					if(checkedInList.length != 0) {
						checkedInList.splice(checkedInList.indexOf(response.records[0]._id),1);
						if(checkedInList.length == 0) {
							getProducts(token, function() {
								loader.hide();
								var dialog = new Dialog("#infobox","Uploaded Successfully");
								dialog.show();
							});
						}
					}						
				}
				else
				{
					alert("Post Failed");
				}	
			},
			error: function(a,b,c) 
			{
				alert("Post Error");
			}
		});
	}
	madeChanges = false;
}

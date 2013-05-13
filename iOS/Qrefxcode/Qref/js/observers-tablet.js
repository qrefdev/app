//602 - Removed Sync from all editing, and instead just lets sync auto sync and let the user sync.

var EditAddObserver = new zimoko.Observable({
	item: new zimoko.Observable({check: '', response: '', icon: null, _id: zimoko.createGuid()}),
	adding: false,
	index: 0,
	menuTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		MenuObserver.toggler();
	},
	backTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		
		$('#editAddForm input').blur();
		
		EditAddObserver.item.unsubscribe(EditAddObserver);
		Navigation.back();
	},
	edit: function() {
		$('#editAddForm input').blur();
	
		if(EditAddObserver.adding) {
			EditAddObserver.set('adding', false);
			var index = EditAddObserver.index;
			var list = ChecklistObserver.list;
			var section = ChecklistObserver.section;
			var category = ChecklistObserver.category;
			
			var sectionItems = []
			
			//Emergency Category Changes
			if(list != 'emergencies')
				sectionItems = ChecklistObserver.checklist[list][section].items;
			else
				sectionItems = ChecklistObserver.checklist[list][category].items[section].items;
			
			EditAddObserver.item.set('index', index + 1);
			
			for(var i = index + 1; i < ChecklistObserver.items.length; i++) {
				var item = ChecklistObserver.items.elementAt(i);
				
				item.set('index', i + 1);
			}
			
			sectionItems.splice(index + 1, 0, EditAddObserver.item._original);
			
			ChecklistObserver.set('modified', true);
			ChecklistObserver.itemsDataSource.insertAt(EditAddObserver.item._original, index + 1);
			
			setTimeout(function() {
				Navigation.back();
			}, 100);
		}
	},
	onPropertyChanged: function(sender, property) {
		if(property == 'check' || property == 'response') {
			ChecklistObserver.set('modified', true);
		}
	}
});

var EditTailObserver = new zimoko.Observable({
	item: undefined,
	menuTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		MenuObserver.toggle();
	},
	backTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		
		$('#editTailForm input').blur();
		
		setTimeout(function() {
			Navigation.back();
		}, 100);
	}
});

var EmergenciesDataSource = new zimoko.DataSource({pageSize: 1000});

var EmergenciesObserver = new zimoko.Observable({
	dataSource: EmergenciesDataSource,
	emergencies: EmergenciesDataSource.view(),
	itemTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		
		zimoko.Async.each([function() {
			ChecklistObserver.set('category', data.index);
		},
		function() {
			ChecklistObserver.set('list', 'emergencies');
		},
		function() {
			ChecklistObserver.set('section', 1);
		},
		function() {
			ChecklistObserver.set('section', 0);
		},
		function() {
			ChecklistObserver.set('showSections', true);
		},
		function() {
			setTimeout(function() {
				Navigation.go('checklist');
			}, 100);
		}],
		function(index, item) {
			item();
		});
		
	},
	menuTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		MenuObserver.toggle();
	},
	backTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		Navigation.go("dashboard");
	},
	onDataSourceRead: function(event) {
        //601 - Removed grouping code for items
		/*var items = EmergenciesObserver.emergencies;
		
		var wrap = $('<li><ul></ul></li>');
		var element = undefined;
		var parentElement = undefined;
		var offset = 0;
		var iOffset = 0;
		var removed = 0;
		for(var i = 0; i < items.length; i++) {
			iOffset = i;
			
			if(offset == 0) {
				iOffset -= removed;					
				element = $($('#emergencies .emergencies ul').children().get(iOffset));
				
				element.wrapAll(wrap);
				parentElement = element.closest('ul');
				offset++;
			}
			else {
				iOffset -= removed;
				element = $($('#emergencies .emergencies ul').children().get(iOffset)).detach();
				removed++;
				parentElement.append(element);
				offset = 0;
			}
		}*/
	}
});

EmergenciesObserver.dataSource.subscribe(EmergenciesObserver);

var E6BObserver = new zimoko.Observable({
	topConversionValue: '0',
	bottomConversionValue: '0',
	topConversion: 'MPH',
	bottomConversion: 'KTS',
	conversionMultiplier: 0.868976242,
	conversionInverse: 1.150779448,
	conversionSelectedName: 'MPH <> KTS',
	conversionSelected: $('#conversion-items li[class="active"]'),
	showConversions: false,
	backTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		Navigation.back();
	},
	menuTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		MenuObserver.toggle();
	},
	conversionsTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		E6BObserver.set('showConversions', !E6BObserver.showConversions);
	},
	conversionTap: function(element, e, data) {
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();
		
		ele.parent().find('li').removeClass('active');
		ele.addClass('active');
		
		E6BObserver.set('conversionSelected', ele);
		E6BObserver.set('showConversions', false);
	},
	conversionTopKeyDown: function(element, e, data) {
		E6BObserver.topConversionValue = $(element).val();
		E6BObserver.convertTopToBottom();
	},
	conversionBottomKeyDown: function(element, e, data) {
		E6BObserver.bottomConversionValue = $(element).val();
		E6BObserver.convertBottomToTop();
	},
	onPropertyChanged: function(sender, property) {
		if(property == 'conversionSelected') {
			if(this.conversionSelected != undefined) {

				this.conversionMultiplier = parseFloat(this.conversionSelected.attr('data-multiplier'));
				this.conversionInverse = parseFloat(this.conversionSelected.attr('data-inverse'));
				this.set('topConversion', this.conversionSelected.attr('data-top'));
				this.set('bottomConversion', this.conversionSelected.attr('data-bottom'));
				this.set('conversionSelectedName', this.conversionSelected.text());
							
				this.convertTopToBottom();
			}
		}
	},
	convertTopToBottom: function() {
		if(parseInt(this.conversionSelected.attr('data-value')) != 6) {
			if(zimoko.isNumber(this.topConversionValue)) {
				var topValue = parseFloat(this.topConversionValue);
				
				var finalVal = topValue * this.conversionMultiplier;
				this.set('bottomConversionValue', finalVal);
			}
		}
		//It is time based
		else {
			//Check to make sure it is a valid 24 hour time format
			var timeMatches = /0[0-9]:[0-5][0-9]:[0-5][0-9]|1[0-9]:[0-5][0-9]:[0-5][0-9]|2[0-3]:[0-5][0-9]:[0-5][0-9]/.test(this.topConversionValue);
			if(timeMatches) {
				var splitText = this.topConversionValue.split(":");
			
				if(splitText.length == 3)
				{
					var hours = parseInt(splitText[0]);
					var minutes = parseInt(splitText[1]);
					var seconds = parseInt(splitText[2]);
					
					if(minutes < 60 && seconds < 60)
					{
						seconds += minutes * 60;
						
						var decimal = seconds / 60 / 60
						
						var deciString = ('' + decimal).split(".")[1];
						
						var decimalString = '';
						
						if(deciString)
							decimalString = ('' + parseInt(deciString));
						else
							decimalString = '00';
						
						this.set('bottomConversionValue', hours + "." + decimalString);	
					}
				}
			}
		}
	},
	convertBottomToTop: function() {
		if(parseInt(this.conversionSelected.attr('data-value')) != 6) {
			if(zimoko.isNumber(this.bottomConversionValue)) {
				var bottomValue = parseFloat(this.bottomConversionValue);
				
				var finalVal = bottomValue * this.conversionInverse;
				this.set('topConversionValue', finalVal);
			}
		}
		//It is time based
		else {
			if(zimoko.isNumber(this.bottomConversionValue)) {
				var splitNumber = parseFloat(this.bottomConversionValue);
				
				var splitText = this.bottomConversionValue.split('.');
				
				if(splitText.length == 2)
				{
					var hours = parseInt(splitText[0]);
					var decimal = parseFloat('0.' + splitText[1]);
					
					var minutes = decimal * 60;
					var seconds = minutes - parseInt(minutes);
					seconds = seconds * 60;
					
					this.set('topConversionValue', (hours + ':' + Math.round(minutes) + ':' + Math.round(seconds)));
				}
				else if(splitText.length == 1) {
					if(splitNumber >= 0 && splitNumber <= 23) {
						this.set('topConversionValue', splitNumber + ':00:00');
					}
				}
			}
		}
	},
});

E6BObserver.subscribe(E6BObserver);

var StoreDataSource = new zimoko.DataSource({pageSize: 20});

var StoreObserver = new zimoko.Observable({
	dataSource: StoreDataSource,
	items: StoreDataSource.view(),
	displayRequestModel: false,
	menuTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		MenuObserver.toggle();
	},
	backTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		Navigation.back();
	},
	requestModelTap: function(element, e, data) {
		window.location = 'mailto:admin@qref.com?subject=Model+Request';
	},
	itemTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		ProductDetailsObserver.set('product', data);
		Navigation.go('#productdetails');
		
		if(data.userOwnsProduct) {
			$(element).removeClass('active');
			$(element).addClass('active');
		} 
	},
	onDataSourceRead: function(event) {
		var imageProcessor = new ImageProcessor(StoreObserver.items.toArray(), "productListing", true);
        imageProcessor.init();
        imageProcessor.processImages();
	}
});

StoreObserver.dataSource.subscribe(StoreObserver);

var ProductDetailsObserver = new zimoko.Observable({
	product: undefined,
	menuTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		MenuObserver.toggle();
	},
	backTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		Navigation.back();
	},
	purchaseTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		AppObserver.set('loading', true);
		
		if(ProductDetailsObserver.product) {
			if(ProductDetailsObserver.product.userOwnsProduct) {
				Install(ProductDetailsObserver.product._id);
			}
			else {
				window.location.href = "qref://purchase=" + ProductDetailsObserver.product.appleProductIdentifier;
			}
		}
		else {
			AppObserver.set('loading', false);
		}
	},
	onPropertyChanged: function(sender, property) {
		if(property == 'product') {
			var imageProcessor = new ImageProcessor([this.product._original], "productDetails", false);
        	imageProcessor.init();
       		imageProcessor.processImages();
		}
	}
});

ProductDetailsObserver.subscribe(ProductDetailsObserver);

//601 - Sped up menu animation
//602 - Fixed close issue on some menu item taps
var MenuObserver = new zimoko.Observable({
	email: '',
	token: undefined,
	version: '0.1.2',
	menuNavTap: function(element, e, data) {
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();
		
		Navigation.go('#' + ele.attr('data-link'));
		
		MenuObserver.close();
	},
	orderPrintedTap: function(element, e, data) {
		window.location = 'http://www.qref.com';
	},
	/*downloadTap: function(element, e, data) {
		if(AppObserver.navHash != '#downloads') {
			AppObserver.set('loading', true);
			StoreObserver.set('displayRequestModel', false);
            if(reachability) {
				AppObserver.getAllProducts(function(success, items) {
					AppObserver.set('storeHasItems', success);
				
					if(success) {
						AppObserver.set('loading', false);
						Navigation.go('#downloads');
					}
					else {
						AppObserver.set('loading', false);
						if(AppObserver.token) {
							var dialog = new Dialog('#infobox', 'Cannot connect to the Qref Store, or there are no items currently available');
							dialog.show();
						}
						else {
							var dialog = new Dialog('#infobox', 'You must be signed in to access the store');
							dialog.show();
						}
					}
				});
			}
			else {
				var dialog = new Dialog('#infobox', 'An internet connection is required to access the store');
				dialog.show();
			}
		}
		
		MenuObserver.close();
	},*/
	checkingTap: function(element, e, data) {
		var checkbox = $(element).find('input').get(0);
		
		e.stopPropagation();
		e.preventDefault();
		
		if(ChecklistObserver.canCheck) {
			checkbox.checked = false;
			ChecklistObserver.set('canCheck', false);
			window.location.href = 'qref://setCanCheck=false';
		}
		else {
			checkbox.checked = true;
			ChecklistObserver.set('canCheck', true);
			window.location.href = 'qref://setCanCheck=true';
		}
	},
	signOutNavTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		
		var dialog = new ConfirmationDialog("#signoutbox", function(result) {
			if(result) {
				AppObserver.set('token', undefined);
				AppObserver.set('email', '');
				window.location.href = "qref://clearToken&clearUser";
				AppObserver.cachePack = undefined;
				checklists = undefined;
				ChecklistObserver.set('checklist', undefined);
				DashboardObserver.set('dataSource', undefined);
				
				if(AppObserver.navHash != '#dashboard') {
					Navigation.go('#dashboard');
				}
			}
		});
		
		dialog.show();
		
		MenuObserver.close();
	},
	syncNavTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		Sync.sync();
		MenuObserver.close();
	},
	open: function() {
		if(!$('.menu').hasClass('slided')) {
			$('.menu').show();
			$('.front .dashcontent').animate({left: '-245px'}, 100);
			$('.page,.page-hidden-tap').animate({left:'-245px'}, 100);
			$('.checklistnav').animate({left:'-245px'}, 100);
			$('.menu').animate({right:'-5px'}, 100).addClass('slided');
			AppObserver.set('menuOpen', true);
		}
	},
	close: function() {
		if($('.menu').hasClass('slided')) {
			$('.page,.page-hidden-tap').animate({left:'0px'}, 100);
			$('.front .dashcontent').animate({left: '0px'}, 100);
			$('.checklistnav').animate({left:'0px'}, 100);
			$('.menu').animate({right:'-300px'}, 100, function(e) {
				$('.menu').hide();
			}).removeClass('slided');
			AppObserver.set('menuOpen', false);
		}
	},
	toggle: function() {
		if(!$('.menu').hasClass('slided')) {
			this.open();
		}
		else {
			this.close();
		}
	}
});

var AppObserver = new zimoko.Observable({
	email: '',
	cachePack: undefined,
	token: undefined,
	loading: false,
	syncing: false,
    saving: false,
	navHash: '#dashboard',
	allProducts: [],
	userProducts: [],
	isSorting: false,
	menuOpen: false,
	pageTap: function(element, e, data) {
		MenuObserver.close();
	},
	checklistNavTap: function(element, e, data) {
		var ele = $(element);
		
		if(ChecklistObserver.editing && ChecklistObserver.modified) {
			Sync.syncOneLocal(ChecklistObserver.checklist._original);
		}
		
		$('.scrollable').stop();
		
		$('#checklist .checklist').scrollTop(0);
		
		zimoko.Async.each([
			(function() { ChecklistObserver.set('editing', false); }),
			(function() { ChecklistObserver.set('showSections', false) ;}),
			(function() { 
				setTimeout(function() {
					setTimeout(function() {
						if(ele.attr('data-link') == 'emergencies') {
							if($('#emergencies').css('display') == 'none') {
								Navigation.go('#emergencies');
							}
						}
						else {
							if($('#checklist').css('display') == 'none') {
								Navigation.go("#checklist");
							}
						}
					}, 200);
			
					if(ChecklistObserver.list == ele.attr('data-link'))
						ele.addClass('active');
					
					setTimeout(function() {
						ChecklistObserver.set('list', ele.attr('data-link'));
					}, 10);
				}, 200);
			})
		], function(index, item) {
			item();
		});
		
		e.stopPropagation();
		e.preventDefault();
	},
	keyUp: function(element, e, data) {
		if(e.which == 13) {
			$(element).closest('form').submit();
			$('input').blur();
		}
	},
	menuTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		MenuObserver.toggle();
	},
	backTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		Navigation.back();
	},
	navTap: function(element, e, data) {
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();
			
		Navigation.go('#' + ele.attr('data-link'));
	},
	onPropertyChanged: function(sender, property) {
		if(property == 'token') {
			MenuObserver.set('token', this.token);
			DashboardObserver.set('token', this.token);
		}
		else if(property == 'email') {
			MenuObserver.set('email', this.email);
		}
		else if(property == 'allProducts') {
			var _this = this;
			StoreObserver.dataSource.preventRead = true;
            StoreObserver.dataSource.clear();
			StoreObserver.dataSource.sort(new zimoko.Sort(['manufacturer.name', 'model.name'], 'asc'));
			StoreObserver.dataSource.filter(new zimoko.FilterSet('and', [
				new zimoko.Filter('==', 'isPublished', true),
				new zimoko.Filter('==', 'isDeleted', false)
			]));
                                        
            setTimeout(function() {
				StoreObserver.dataSource.data(_this.allProducts);
                StoreObserver.dataSource.read();
            }, 100);
		}
		else if(property == 'navHash') {
			if(this.navHash == '#checklist') {
				$('#checklist-nav li').removeClass('active');
				$('#checklist-nav li[data-link="' + ChecklistObserver.list +'"]').addClass('active');
			}
		}
	},
	getChecklists: function(callback) {
		var self = this;
		
		if(AppObserver.token) {
			if((self.cachePack == "" || self.cachePack == undefined) && checklists == undefined)
			{
				//$("#data-temp").append("Loading from web for some ungodly reason! CachePack: " + self.cachePack);
				$.ajax({
					type: "get",
					dataType: "json",
					url: host + "services/ajax/aircraft/checklists?token=" + AppObserver.token,
					success: function(data) {
						var response = data;
						
						if(response.success == true)
						{
							checklists = response.records;
							
							for(var i = 0; i < checklists.length; i++) {
								var item = checklists[i];
								
								item.lastPosition = undefined;
							}
							
							//var temp = JSON.stringify(checklists);
							//$("#data-temp2").html(temp);
							
							callback.call(self, true, checklists);
						}
						else
						{
							callback.call(self, false, []);
						}
					},
					error: function()
					{
						callback.call(self, false, []);
					}
				});
			}
			else if(self.cachePack != undefined && checklists == undefined)
			{
				try {
                    //601 - Fixed issue with callback not being properly issued
					//var temp = decodeURIComponent(unescape(self.cachePack));
					//checklists = JSON.parse(temp);
                    checklists = self.cachePack;
                                        
					for(var i = 0; i < checklists.length; i++) {
						var item = checklists[i];
						
						if(!item.lastPosition)
							item.lastPosition = undefined;
					}	
					
					callback.call(self, true, checklists);
				} catch (e) {
					checklists = undefined;
					self.cachePack = undefined;
					self.getChecklists(callback);	
				}
			}
			else
			{
				$.ajax({
					type: "get",
					dataType: "json",
					url: host + "services/ajax/aircraft/checklists?token=" + AppObserver.token,
					success: function(data) {
						var response = data;
						
						if(response.success == true)
						{
							checklists = response.records;
							
							for(var i = 0; i < checklists.length; i++) {
								var item = checklists[i];
								
								item.lastPosition = undefined;
							}
							
							callback.call(self, true, checklists);
						}
						else
						{
							callback.call(self, false, []);
						}
					},
					error: function()
					{
						callback.call(self, false, []);
					}
				});
			}
		}
		else {
			callback.call(self, false, []);
		}
	},
	getUserProducts: function(callback) {
		var self = this;
		$.ajax({
			type: "get",
			dataType: "json",
			url: host + "services/ajax/user/products?token=" + self.token,
			success: function(data) {
				var response = data;
				
				if(response.success)
				{
					self.set('userProducts', response.records);
					
					callback.call(self, true, self.userProducts);
				}
				else {
					callback.call(self, false, []);
				}
			},
			error: function() {
				callback.call(self, false, []);
			}
		});
	},
	getAllProducts: function(callback) {
		var self = this;
		$.ajax({
			type: "get",
			dataType: "json",
			url: host + "services/ajax/aircraft/products?token=" + self.token,
			success: function(data) {
				var response = data;
				
				if(response.success)
				{
					var allItems = response.records;
					
					self.getUserProducts(function(success, items) {
						for(var i = 0; i < allItems.length; i++) {
							var item = allItems[i];
								
							item.userOwnsProduct = false;
						}
						
						if(success) {
							for(var i = 0; i < items.length; i++) {
								var userItem = items[i];
								
								var foundProduct = _.find(allItems, function(item) {
									if(item._id == userItem._id)
										return true;
								});
								
								if(foundProduct != undefined)
									foundProduct.userOwnsProduct = true;
							}
						}
						
						self.set('allProducts', allItems);
						
						callback.call(self, true, self.allProducts);
					});
				}
				else {
					callback.call(self, false, []);
				}
			},
			error: function() {
				callback.call(self, false, []);
			}
		});
	},
	load: function() {
		var self = this;
		
		$(window).swipe({
			swipeRight: function(event, duration) {
				MenuObserver.close();
			},
			swipeLeft: function(event, duration) {
				MenuObserver.open();
			},
			threshold: 100,
			durationThreshold: 265
		});
		
		$(".submit").tap(function(e) {
			$(this).closest('form').submit();
			$('input').blur();
		});
		
		$(".scrollable").touchScroll({
			direction: "vertical",
			threshold: 25,
			onBeforeScroll: function(e) {
				if(AppObserver.isSorting)
				{
					$(this).touchScroll("disableScroll");
				}
				else
				{
					$(this).touchScroll("enableScroll");
				}
			}
		});
		
		$(".scrollable").scrollbar(function() {
				if(this.hasClass('dashboard-planes-selector')) {
					if(DashboardObserver.dataSource.page() < DashboardObserver.dataSource.totalPages()) {
						AppObserver.set('loading', true);
						DashboardObserver.dataSource.pageAndAppend(DashboardObserver.dataSource.page() + 1);
						setTimeout(function() {
							DashboardObserver.dataSource.read();
						}, 100);
					}
				}
				else if(this.hasClass('checklist')) {
					if(ChecklistObserver.itemsDataSource.page() < ChecklistObserver.itemsDataSource.totalPages()) {
						AppObserver.set('loading', true);
						ChecklistObserver.itemsDataSource.pageAndAppend(ChecklistObserver.itemsDataSource.page() + 1);
						setTimeout(function() {
							ChecklistObserver.itemsDataSource.read();
						}, 100);
					}
					else {
						if(ChecklistObserver.list != 'emergencies') {
							ChecklistObserver.set('displayNext', true);
						}
					}
				}
				else if(this.hasClass('downloads')) {
					if(StoreObserver.dataSource.page() < StoreObserver.dataSource.totalPages()) {
						AppObserver.set('loading', true);
						StoreObserver.dataSource.pageAndAppend(StoreObserver.dataSource.page() + 1);
						setTimeout(function() {
							StoreObserver.dataSource.read();
						}, 100);
						setTimeout(function() {
							AppObserver.set('loading', false);
						}, 30);
					}
					else {
						StoreObserver.set('displayRequestModel', true);
					}
				}
			});
		
		$( "#checklist-items" ).sortable({
			handle: ".handle",
			scroll: true,
			axis: "y",
			stop: function(event, ui) {
				AppObserver.isSorting = false;
				var indices = new Array();
				zimoko.Async.each($("#checklist-items").children(), function(index, item) {
					var id = $(this).attr("data-id");
					
					for(var i = 0; i < ChecklistObserver.items.length; i++) {
						var item = ChecklistObserver.items.elementAt(i);
						
						if(item._id == id) {
							ChecklistObserver.set('modified', true);
							item.set('index', index);
							break;
						}
					}
				});
				/*
				$("#checklist-items").children().each(function(index, item) {
					var id = $(this).attr("data-id");
					
					for(var i = 0; i < ChecklistObserver.items.length; i++) {
						var item = ChecklistObserver.items.elementAt(i);
						
						if(item._id == id) {
							ChecklistObserver.set('modified', true);
							item.set('index', index);
							break;
						}
					}
				});*/
			},
			start: function(event, ui) {
				AppObserver.isSorting = true;
			}
		});
		$( "#checklist-items" ).disableSelection();
		
		$( "#dashboard-planes" ).sortable({
			handle: ".handle",
			scroll: true,
			axis: "y",
			stop: function(event, ui) {
				AppObserver.isSorting = false;
				var indices = new Array();
				zimoko.Async.each($("#dashboard-planes").children(), function(index, item) {
					var id = $(this).attr("data-id");
					
					for(var i = 0; i < DashboardObserver.items.length; i++) {
						var item = DashboardObserver.items.elementAt(i);
						
						if(item._id == id) {
							item.set('index', index);
							break;
						}
					}
				});
				
				/*$("#dashboard-planes").children().each(function(index, item) {
					
				});*/
			},
			start: function(event, ui) {
				AppObserver.isSorting = true;
			}	
		});
		$( "#dashboard-planes" ).disableSelection();
		
		this.set('loading', true);
		
        /*if(reachability) {
            this.getAllProducts(function(success, items) {
                this.set('storeHasItems', success);
            });
        }*/
		
        if(reachability) {
            this.getChecklists(function(success, items) {
                if(success) {
                    DashboardDataSource.data(items);
                    DashboardObserver.set('dataSource', DashboardDataSource);
                    
                }
			
                self.set('loading', false);
                               
               if(AppObserver.cachePack != '' && AppObserver.cachePack != undefined) {
                    setTimeout(function() {
                          Sync.sync();
                    }, 100);
               }
               else if (success && (AppObserver.cachePack == '' || AppObserver.cachePack == undefined)) {
            		Sync.syncLocal();
               }
            });
        }
        else {
            window.location.href = "qref://hasChecklists";
        }
		
		var utcTimer = new Timer(1000, function() {
			var now = new Date();
		
			$(".utcCurrent").html(now.toUTCString());
		});
		
		utcTimer.start();
		
		$(document).bind('navigatedTo', function(e, data) {
			self.set('navHash', data.area);
			
            //601 - Remove editing mode on specific navigations
			if(data.area == '#checklist' && data.previous == '#editadd') {
				//Do nothing
			}
			else if(data.area == '#editadd' && data.previous == '#checklist') {
				//Do nothing
			}
			else if(data.area == '#dashboard' && data.previous == '#edittail') {
				//Do nothing
			}
			else if(data.area == '#edittail' && data.previous == '#dashboard') {
				//Do nothing
			}
			else {
				if(ChecklistObserver.editing && ChecklistObserver.modified) {
					Sync.syncOneLocal(ChecklistObserver.checklist._original);
				}
				
				ChecklistObserver.set('editing', false);
				DashboardObserver.set('editing', false);
			}
			
		});
		
		$('#checklist .checklist').scroll(function(e) {
			if(ChecklistObserver.checklist) {
				ChecklistObserver.checklist.lastPosition.scroll = $('#checklist .checklist').scrollTop();
			}
		});
	} 
});

AppObserver.subscribe(AppObserver);

var DashboardDataSource = new zimoko.DataSource({pageSize: 20});

var DashboardObserver = new zimoko.Observable({
	items: new zimoko.ObservableCollection(),
	itemTap: function(element, e, data) {
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();

		ele = ele.find('.delete');
		
		if(!DashboardObserver.editing) {
			AppObserver.set('loading', true);
			setTimeout(function() {
				ChecklistObserver.set('checklist', data)
			}, 10);
			
			setTimeout(function() {
				Navigation.go('#checklist');
				AppObserver.set('loading', false);
			}, 250);
		}
		else if(DashboardObserver.editing && ele.css('display') == 'none') {
			EditTailObserver.set('item', data);
			
			Navigation.go('#edittail');
		}
		else {
			ele.fadeOut(200, function() {
				ele.prev().animate({'left':'0px'}, 200);
			});
		}
	},
	navTap: function(element, e, data) {
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();
		
		if(ele.attr('data-link') == 'downloads') {
			AppObserver.set('loading', true);
			StoreObserver.set('displayRequestModel', false);
            if(reachability) {
				AppObserver.getAllProducts(function(success, items) {
					AppObserver.set('storeHasItems', success);
				
					if(success) {
						AppObserver.set('loading', false);
						Navigation.go('#' + ele.attr('data-link'));
					}
					else {
						AppObserver.set('loading', false);
						if(AppObserver.token) {
							var dialog = new Dialog('#infobox', 'Cannot connect to the Qref Store, or there are no items currently available');
							dialog.show();
						}
						else {
							var dialog = new Dialog('#infobox', 'You must be signed in to access the store');
							dialog.show();
						}
					}
				});
            }
            else {
            	AppObserver.set('loading', false);
            	var dialog = new Dialog('#infobox', 'No  Connection Available');
				dialog.show();
            }
		}
		else {
			Navigation.go('#' + ele.attr('data-link'));
		}
	},
	itemSwipeRight: function(element, e, data) {
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();
			
		var deleteB = ele.find('.delete');
		var handle = ele.find('.holder');
		
		if(DashboardObserver.editing) {
			handle.animate({'left': '75px'}, 200);
			deleteB.fadeIn(200); 
		}
	},
	subItemTap: function(element, e, data) {
		if(!DashboardObserver.editing) {
			e.stopPropagation();
			e.preventDefault();
			
			var dataid = data._id;
			var ele = $(element);
			
			var datalink = ele.attr('data-link');
				
			var lp = undefined
			
			if(datalink == 'last' && data.lastPosition) {
				lp = data.lastPosition;
			}
			
			AppObserver.set('loading', true);
			
			$('.scrollable').stop();
		
			$('#checklist .checklist').scrollTop(0);
			
			setTimeout(function() {
				ChecklistObserver.set('checklist', data);
			}, 10);
			
			setTimeout(function() {
				if(lp && datalink == 'last') {
					setTimeout(function() {
						ChecklistObserver.set('list', lp.list);
			
						setTimeout(function() {
							ChecklistObserver.set('category', lp.category);
						
							setTimeout(function() {
								ChecklistObserver.set('section', lp.section);
							}, 100);
						}, 100);
					}, 100);
				}
				else {
					ChecklistObserver.set('section', 0);
					ChecklistObserver.set('list', datalink);
				}
			
				setTimeout(function() {
					if(datalink == 'emergencies') {
						Navigation.go('#emergencies');
						AppObserver.set('loading', false);
					}
					else {
						Navigation.go('#checklist');
						AppObserver.set('loading', false);
					}
				}, 350);
			}, 100);
		}
	},
	deleteTap: function(element, e, data) {
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();
			
		ele.fadeOut(200, function() {
			ele.prev().animate({'left':'0px'}, 200, function() {
				data.set('isDeleted', true);
				
				DashboardObserver.dataSource.remove(data);
			});
		});
	},
	editTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		
		setTimeout(function() {
			DashboardObserver.set('editing', !DashboardObserver.editing);
		}, 200);
	},
	menuTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		MenuObserver.toggle();
	},
	dataSource: new zimoko.DataSource({pageSize: 20}),
	editing: false,
	token: undefined,
	onPropertyChanged: function(sender, property) {
		if(property == 'editing') {
			if(!this.editing) {
				$('#checklist .checklist li').each(function() {
					var del = $(this).find('.delete');
					
					if(del.css('display') != 'none') {
						del.fadeOut(200);
						del.prev().animate({'left': '0px'});
					}
				});
			}
		}
		else if(property == 'dataSource') {
			if(this.dataSource != undefined) {
				this.dataSource.preventRead = true;
				this.dataSource.sort(new zimoko.Sort(['manufacturer.name', 'model.name', 'index'], 'asc'));
				this.dataSource.filter(new zimoko.FilterSet('and', [
					new zimoko.Filter('==', 'isDeleted', false, false)
				]));
				
				this.dataSource.unsubscribe(this);
				this.dataSource.subscribe(this);
				
                                            
				this.set('items', this.dataSource.view());
				
				var _this = this;
				
				setTimeout(function() {
					_this.dataSource.read();
				}, 100);
			}
			else {
				this.dataSource = new zimoko.DataSource({pageSize: 20});
				this.dataSource.preventRead = true;
				this.dataSource.sort(new zimoko.Sort(['manufacturer.name', 'model.name', 'index'], 'asc'));
				this.dataSource.filter(new zimoko.FilterSet('and', [
					new zimoko.Filter('==', 'isDeleted', false, false)
				]));
				
				this.dataSource.data([]);
				
				this.set('items', this.dataSource.view());
				
				var _this = this;
				
				setTimeout(function() {
					_this.dataSource.read();
				}, 100);
			}
		}
	},
	getImages: function(items) {
		var imageProcessor = new ImageProcessor(items, "checklistListing", true);
		imageProcessor.init();
		imageProcessor.processImages();
	},
	punch: function() {
		var items = this.dataSource.view();
		
		setTimeout(function() {		
			for(var i = 0; i < items.length; i++) {
				var item = items.elementAt(i);
		
				if(item != undefined) {
					var element = $('#dashboard li[data-id="' + item._id +'"]');
				
					if(element.length > 0) {
						element.find('.handle').punch();
					}
				}
			}
		}, 200);
	},
	onDataSourceRead: function(event) {
		var _this = this;
		
        setTimeout(function() {                                    
	
			_this.punch();
	
			AppObserver.set('loading', false);
        }, 100);
                                              
        setTimeout(function() {
            var items = _this.dataSource.view();
        	var imageProcessor = new ImageProcessor(items.toArray(), "checklistlisting", true);
			imageProcessor.init();
			imageProcessor.processImages();
        }, 100);
	}
});

DashboardObserver.subscribe(DashboardObserver);

var ChecklistObserver = new zimoko.Observable({
	items: new zimoko.ObservableCollection(),
	sections: new zimoko.ObservableCollection(),
	checklist: undefined,
	section: 0,
	category: 0,
    modified: false,                                 
	sectionName: '',
	list: 'preflight',
	displayNext: true,
	editing: false,
	canCheck: false,
	nextSectionText: 'Next Section',
	previousSectionText: 'Previous Section',
	showSections: false,
	itemsDataSource: new zimoko.DataSource({pageSize: 20}),
	sectionsDataSource: new zimoko.DataSource({pageSize: 1000}),
	onPropertyChanged: function(sender, property) {
		if(property == 'checklist') {			
			if(this.checklist != undefined) {
				var _this = this;
				this.set('list', 'preflight');
				this.set('section', 0);
				this.set('category', 0);
				
				this.set('sectionName', this.checklist[this.list][this.section].name);
				this.itemsDataSource.preventRead = true;
				this.sectionsDataSource.preventRead = true;
				this.itemsDataSource.sort(new zimoko.Sort(['index'], 'asc'));
				this.sectionsDataSource.sort(new zimoko.Sort(['index'], 'asc'));
				
				this.itemsDataSource.clear();
				
				setTimeout(function() {
					_this.itemsDataSource.data(_this.checklist[_this.list][_this.section].items);
                    _this.itemsDataSource.read();
				}, 100);
				
				this.sectionsDataSource.clear();
				
				setTimeout(function() {
					_this.sectionsDataSource.data(_this.checklist[_this.list]);
				}, 100);
				
				this.itemsDataSource.unsubscribe(this);
				this.itemsDataSource.subscribe(this);
				
				this.set('items', this.itemsDataSource.view());
				this.set('sections', this.sectionsDataSource.view());
				
				EmergenciesObserver.dataSource.preventRead = true;
				EmergenciesObserver.dataSource.sort(new zimoko.Sort(['index'], 'asc'));
				EmergenciesObserver.dataSource.data(this.checklist.emergencies);
				EmergenciesObserver.dataSource.read();
				
				$('#checklist-nav li').removeClass('active');
				$('#checklist-nav li[data-link="' + this.list +'"]').addClass('active');
				
				//this.set('displayNext', false);
				
				this.checklist.set('lastPosition', {section: this.section, list: this.list, scroll: 0});
				
                $('.scrollable').stop();
				
				setTimeout(function() {
					$('#checklist .checklist').scrollTop(0);
				}, 250);
				
				/*setTimeout(function() {
					ChecklistObserver.previousSectionTextGenerate();
					ChecklistObserver.nextSectionTextGenerate();
				}, 10);*/
			}
			else {
				this.set('list', 'preflight');
				this.set('section', 0);
				this.set('category', 0);
				this.itemsDataSource.data([]);
				this.sectionsDataSource.data([]);
			}
		}
		else if(property == 'canCheck') {
			if(this.canCheck) {
				$('#checkingCheckbox')[0].checked = true;
			}
			else {
				$('#checkingCheckbox')[0].checked = false;
			}
		}
		else if(property == 'list' || property == 'section' || property == 'category') {
			var _this = this;
			
			if(property == 'list')  {
				this.section = 0;
				this.category = 0;
			}
			
			if(property == 'category') {
				this.section = 0;
			}
			
			if(this.list == 'emergencies') {
				//console.log("Category Index: " + this.category);
				this.itemsDataSource.clear();
				
				setTimeout(function() {
					_this.itemsDataSource.data(_this.checklist[_this.list][_this.category].items[_this.section].items);
                    _this.itemsDataSource.read();
				}, 100);
				
				this.sectionsDataSource.clear();
				
				setTimeout(function() {
					_this.sectionsDataSource.data(_this.checklist[_this.list][_this.category].items);
				}, 100);
				
				this.set('sectionName', this.checklist[this.list][this.category].items[this.section].name);
			}
			else {
				this.itemsDataSource.clear();
				
				setTimeout(function() {
					_this.itemsDataSource.data(_this.checklist[_this.list][_this.section].items);
                    _this.itemsDataSource.read();
				}, 100);
				
				this.sectionsDataSource.clear();
				
				setTimeout(function() {
					_this.sectionsDataSource.data(_this.checklist[_this.list]);
				}, 100);
				this.set('sectionName', this.checklist[this.list][this.section].name);
			}
			
			$('.scrollable').stop();
		
			$('#checklist .checklist').scrollTop(0);
			
			$('#checklist-nav li').removeClass('active');
			$('#checklist-nav li[data-link="' + this.list +'"]').addClass('active');
			
			this.checklist.set('lastPosition', {section: this.section, category: this.category, list: this.list, scroll: 0});
			
			/*setTimeout(function() {
					ChecklistObserver.previousSectionTextGenerate();
					ChecklistObserver.nextSectionTextGenerate();
			}, 10);*/
		}
		else if(property == 'editing') {
			if(!this.editing) {
				$('#checklist checklist li .delete').each(function() {
					var ele = $(this);
					
					if(ele.css('display') != 'none') {
						ele.fadeOut(200);
						ele.prev().animate({'left': '0px'}, 200);
					}
				});
			}
		}
	},
	checkTap: function(element, e, data) {
		if(data.isChecked) {
			data.set('isChecked', false);
		}
		else {
			data.set('isChecked', true);
		}
	},
	previousSectionTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		
		$('.scrollable').stop();
		
		$('#checklist .checklist').scrollTop(0);
		
		ChecklistObserver.set('showSections', false);
		
		if(ChecklistObserver.section - 1 >= 0) {
			ChecklistObserver.set('section', ChecklistObserver.section - 1);
		}
		else {
			if(ChecklistObserver.list == 'emergencies') {
				if(ChecklistObserver.category - 1 >= 0) {
					ChecklistObserver.set('category', ChecklistObserver.category - 1);
				}
				else {
					ChecklistObserver.list = 'landing';
				}
			}
			else if(ChecklistObserver.list == 'landing')
				ChecklistObserver.list = 'takeoff';
			else if(ChecklistObserver.list == 'takeoff')
				ChecklistObserver.list = 'preflight';
			
			if(ChecklistObserver.list == 'emergencies') {
				ChecklistObserver.set('section', ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.category].items.length - 1);
			}
			else {
				ChecklistObserver.set('section', ChecklistObserver.checklist[ChecklistObserver.list].length - 1);
			}
		}
	},
	nextSectionTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		
		$('.scrollable').stop();
		
		$('#checklist .checklist').scrollTop(0);
		
		ChecklistObserver.set('showSections', false);
	
		if(ChecklistObserver.list == 'emergencies' && ChecklistObserver.section + 1 < ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.category].items.length) {
			ChecklistObserver.set('section', ChecklistObserver.section + 1);
		}
		else if(ChecklistObserver.list != 'emergencies' && ChecklistObserver.section + 1 < ChecklistObserver.checklist[ChecklistObserver.list].length) {
			ChecklistObserver.set('section', ChecklistObserver.section + 1);
		}
		else {			
			if(ChecklistObserver.list == 'preflight')
				ChecklistObserver.set('list', 'takeoff');
			else if(ChecklistObserver.list == 'takeoff')
				ChecklistObserver.set('list', 'landing');
			else if(ChecklistObserver.list == 'landing')
				ChecklistObserver.set('list', 'emergencies');
			else if(ChecklistObserver.list == 'emergencies') {
				if(ChecklistObserver.category + 1 < ChecklistObserver.checklist[ChecklistObserver.list].length) 
					ChecklistObserver.set('category', ChecklistObserver.category + 1);
			}
				
			setTimeout(function() {
				ChecklistObserver.set('section', 0);
			}, 5);
		}          
        
        ChecklistObserver.set('showSections', false);
	},
	/*previousSectionTextGenerate: function() {
		if(ChecklistObserver.list == 'emergencies') {
			if(ChecklistObserver.section - 1 >= 0) {
				ChecklistObserver.set('previousSectionText', ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.category].items[ChecklistObserver.section - 1].name);
			}
			else if(ChecklistObserver.category - 1 >= 0) {
				var lastSection = ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.category - 1].items.length - 1;
				ChecklistObserver.set('previousSectionText', ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.category - 1].items[lastSection].name);
			}
			else {
				var lastSection = ChecklistObserver.checklist['landing'].length - 1;
				ChecklistObserver.set('previousSectionText', ChecklistObserver.checklist['landing'][lastSection].name);
			}
		}
		else {
			if(ChecklistObserver.section - 1 >= 0) {
				ChecklistObserver.set('previousSectionText', ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.section - 1].name);
			}
			else {
				if(ChecklistObserver.list == 'landing') {
					var lastSection = ChecklistObserver.checklist['takeoff'].length - 1;
					ChecklistObserver.set('previousSectionText', ChecklistObserver.checklist['takeoff'][lastSection].name);
				}
				else if(ChecklistObserver.list == 'takeoff') {
					var lastSection = ChecklistObserver.checklist['preflight'].length - 1;
					ChecklistObserver.set('previousSectionText', ChecklistObserver.checklist['preflight'][lastSection].name);
				}
				else {
					ChecklistObserver.set('previousSectionText', 'Previous Section');
				}
			}
		}
	},
	nextSectionTextGenerate: function() {
		if(ChecklistObserver.list == 'emergencies') {
			if(ChecklistObserver.section + 1 < ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.category].items.length) {
				ChecklistObserver.set('nextSectionText', ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.category].items[ChecklistObserver.section + 1].name);
			}
			else if (ChecklistObserver.category + 1 < ChecklistObserver.checklist[ChecklistObserver.list].length) {
				ChecklistObserver.set('nextSectionText', ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.category + 1].items[0].name);
			}
			else {
				ChecklistObserver.set('nextSectionText', 'Next Section');
			}
		}
		else {
			if(ChecklistObserver.section + 1 < ChecklistObserver.checklist[ChecklistObserver.list].length) {
				ChecklistObserver.set('nextSectionText', ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.section + 1].name);
			}
			else {
				if(ChecklistObserver.list == 'preflight') {
					ChecklistObserver.set('nextSectionText', ChecklistObserver.checklist['takeoff'][0].name);
				}
				else if(ChecklistObserver.list == 'takeoff') {
					ChecklistObserver.set('nextSectionText', ChecklistObserver.checklist['landing'][0].name);
				}
				else if(ChecklistObserver.list == 'landing') {
					ChecklistObserver.set('nextSectionText', ChecklistObserver.checklist['emergencies'][0].items[0].name);
				}
			}
		}
	},*/
	onDataSourceChange: function(event) {
		var self = this;
		
		setTimeout(function() {
			for(var i = 0; i < self.items.length; i++) {
				var item = self.items.elementAt(i);
			
				if(item != undefined) {
					var element = $('#checklist li[data-id="' + item._id +'"]');
				
					if(element.length > 0) {
						element.find('.handle').punch();
					}
				}
			}
		});
	},
	onDataSourceRead: function(event) {
		var self = this;
		setTimeout(function() {
			setTimeout(function() {
				if(ChecklistObserver.itemsDataSource.page() < ChecklistObserver.itemsDataSource.totalPages()) {
					self.set('displayNext', true);
				}
				else {
					self.set('displayNext', true);
				}
			}, 100);
			
			for(var i = 0; i < self.items.length; i++) {
				var item = self.items.elementAt(i);
			
				if(item != undefined) {
					var element = $('#checklist li[data-id="' + item._id +'"]');
				
					if(element.length > 0) {
						element.find('.handle').punch();
					}
				}
			}
		
			setTimeout(function() {
				AppObserver.set('loading', false);
			}, 10);
		}, 250);
	},
	editTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		
		if(ChecklistObserver.editing && ChecklistObserver.modified) {
			Sync.syncOneLocal(ChecklistObserver.checklist._original);
		}
		
		setTimeout(function() {
			ChecklistObserver.set('editing', !ChecklistObserver.editing);
		}, 60);
                                              
        ChecklistObserver.set('showSections', false);
	},
	menuTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		MenuObserver.toggle();
	},
	addTap: function(element, e, data) {
		var index = data.index;
		
		e.stopPropagation();
		e.preventDefault();
		
		EditAddObserver.set('item', new zimoko.Observable({check: '', response: '', icon: null, _id: zimoko.createGuid()}));
		
		EditAddObserver.set('adding', true);
		
		EditAddObserver.set('index', index);
		
        ChecklistObserver.set('showSections', false);
            
        setTimeout(function() {                                  
			Navigation.go('#editadd');
		}, 50);
	},
	itemSwipeRight: function(element, e, data) {
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();
		
		var deleteB = ele.find('.delete');
		var holder = ele.find('.holder'); 
		
		if(ChecklistObserver.editing) {
			holder.animate({'left': '75px'}, 200);
			deleteB.fadeIn(200); 
		}
	},
	deleteTap: function(element, e, data) {
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();
		
		if(ChecklistObserver.editing) {
			ele.fadeOut(200, function() {
				ele.prev().animate({'left':'0px'}, 200, function(e) {
					var index = ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.section].items.indexOf(data._original);
				
					ChecklistObserver.itemsDataSource.remove(data);
					
					if(index > -1) {
						ChecklistObserver.set('modified', true);
						ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.section].items.removeAt(index);
					}
				});
			});
		}
	},
	itemTap: function(element, e, data) {
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();
		
		ele = ele.find('.delete');
		
		if(ChecklistObserver.editing && ele.css('display') == 'none') {
			EditAddObserver.set('adding', false);
			EditAddObserver.set('item', data);
			EditAddObserver.set('index', data.index);
			EditAddObserver.item.subscribe(EditAddObserver);
			
			Navigation.go('#editadd');
		}
		else {
			ele.fadeOut(200, function() {
				ele.prev().animate({'left':'0px'}, 200);
			});
		}
	},
	sectionTap: function(element, e, data) {
		$('#checklist check-sections li').removeClass('active');
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();
		
		ele.addClass('active');
		
		ChecklistObserver.set('section', data.index);
		ChecklistObserver.set('showSections', false);
	},
	sectionsTap: function(element, e, data) {
		ChecklistObserver.set('showSections', !ChecklistObserver.showSections);
	},
	backTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
        ChecklistObserver.set('showSections', false);                                      
		
    	setTimeout(function() {
			if(ChecklistObserver.list != "emergencies") {
				Navigation.go("dashboard");
			}
			else {
				Navigation.go("emergencies");
			}
		}, 50);
	}
});

ChecklistObserver.subscribe(ChecklistObserver);
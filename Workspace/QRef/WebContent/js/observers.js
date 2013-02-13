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
		Navigation.back();
		
		setTimeout(function() {
			Sync.webSync(ChecklistObserver.checklist, true);
		}, 1000);
	},
	edit: function() {
		if(EditAddObserver.adding) {
			EditAddObserver.set('adding', false);
			var index = EditAddObserver.index;
			var list = ChecklistObserver.list;
			var section = ChecklistObserver.section;
			
			var sectionItems = ChecklistObserver.checklist[list][section].items;
			
			EditAddObserver.item.set('index', index + 1);
			
			for(var i = index + 1; i < ChecklistObserver.items.length; i++) {
				var item = ChecklistObserver.items.elementAt(i);
				
				item.set('index', i + 1);
			}
			
			sectionItems.splice(index + 1, 0, EditAddObserver.item._original);
			
			ChecklistObserver.itemsDataSource.insertAt(EditAddObserver.item._original, index + 1);
			ChecklistObserver.itemsDataSource.read();
			
			setTimeout(function() {
				Navigation.back();
			}, 100);
			
			setTimeout(function() {
				Sync.webSync(ChecklistObserver.checklist, true);
			}, 1000);
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
		Navigation.back();

		setTimeout(function() {
			Sync.webSync(item, true);
		}, 1000);
	}
});

var EmergenciesDataSource = new zimoko.DataSource({pageSize: 1000});

var EmergenciesObserver = new zimoko.Observable({
	dataSource: EmergenciesDataSource,
	emergencies: EmergenciesDataSource.view(),
	itemTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		ChecklistObserver.set('section', data.index);
		ChecklistObserver.set('list', 'emergencies');
		Navigation.go('checklist');
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
	onDataSourceRead: function(event) {
		var items = EmergenciesObserver.emergencies;
		
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
		}
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

var StoreDataSource = new zimoko.DataSource({pageSize: 1000});

var StoreObserver = new zimoko.Observable({
	dataSource: StoreDataSource,
	items: StoreDataSource.view(),
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
	itemTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		ProductDetailsObserver.set('product', data);
		Navigation.go('#productdetails'); 
	},
	onDataSourceRead: function(event) {
		/*var imageProcessor = new ImageProcessor(StoreObserver.items.toArray(), "productListing", true);
        imageProcessor.init();
        imageProcessor.processImages();*/
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
	onPropertyChanged: function(sender, property) {
		if(property == 'product') {
			/*var imageProcessor = new ImageProcessor([this.product._original], "productDetails", false);
        	imageProcessor.init();
       		imageProcessor.processImages();*/
		}
	}
});

ProductDetailsObserver.subscribe(ProductDetailsObserver);

var MenuObserver = new zimoko.Observable({
	email: '',
	token: undefined,
	menuNavTap: function(element, e, data) {
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();
		
		Navigation.go('#' + ele.attr('data-link'));
		
		MenuObserver.close();
	},
	signOutNavTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		AppObserver.set('token', undefined);
		AppObserver.set('email', '');
		cachePack = "";
		checklists = undefined;
		ChecklistObserver.set('checklist', undefined);
		DashboardObserver.set('dataSource', undefined);
		Navigation.go('#dashboard');
	},
	syncNavTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		Sync.sync();
	},
	open: function() {
		if(!$('.menu').hasClass('slided')) {
			$('.menu').show();
			$('.front .dashcontent').animate({left: '-245px'});
			$('.page').animate({left:'-245px'});
			$('.checklistnav').animate({left:'-245px'});
			$('.menu').animate({right:'-5px'}).addClass('slided');
		}
	},
	close: function() {
		if($('.menu').hasClass('slided')) {
			$('.page').animate({left:'0px'});
			$('.front .dashcontent').animate({left: '0px'});
			$('.checklistnav').animate({left:'0px'});
			$('.menu').animate({right:'-300px'}, function(e) {
				$('.menu').hide();
			}).removeClass('slided');
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
	token: undefined,
	loading: false,
	syncing: false,
	navHash: '#dashboard',
	allProducts: [],
	userProducts: [],
	isSorting: false,
	checklistNavTap: function(element, e, data) {
		var ele = $(element);
		
		setTimeout(function() {
			if(ele.attr('data-link') == 'emergencies') {
				Navigation.go('#emergencies');
			}
			
			if(ChecklistObserver.list == ele.attr('data-link'))
				ele.addClass('active');
			
			ChecklistObserver.set('list', ele.attr('data-link'));
		}, 10);
		
		e.stopPropagation();
		e.preventDefault();
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
			StoreObserver.dataSource.preventRead = true;
			StoreObserver.dataSource.data(this.allProducts);
			StoreObserver.dataSource.sort(new zimoko.Sort(['manufacturer.name', 'index'], 'asc'));
			StoreObserver.dataSource.filter(new zimoko.FilterSet('and', [
				new zimoko.Filter('==', 'isPublished', true),
				new zimoko.Filter('==', 'isDeleted', false)
			]));
			StoreObserver.dataSource.read();
		}
		else if(property == 'navHash') {
			if(this.navHash == '#checklist') {
				$('#checklist-nav li').removeClass('active');
				$('#checklist-nav li[data-link="' + ChecklistObserver.list +'"]').addClass('active');
			}
		}
	},
	getUncachedChecklists: function() {
		if(checklists) {
			$.ajax({
				type: "get",
				dataType: "json",
				url: host + "services/ajax/aircraft/checklists?token=" + AppObserver.token,
				success: function(data) {
					var response = data;
					
					if(response.success == true)
					{
						items = response.records;
						
						for(var i = 0; i < items.length; i++) {
							var item = items[i];
							
							item.lastPosition = undefined;
							
							var found = _.find(checklists, function(ite) {
								if(ite._id == item._id)
									return true;
							});	
							
							if(!found) {
								checklists.push(item);
								DashboardObserver.dataSource.add(item);
							}
						}
						
						DashboardObserver.dataSource.refresh();
						DashboardObserver.dataSource.read();
					}
				}
			});
		}
	},
	getChecklists: function(callback) {
		var self = this;
		
		if(AppObserver.token) {
			if((cachePack == "" || cachePack == undefined) && checklists == undefined)
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
			else if(cachePack && checklists == undefined)
			{
				checklists = JSON.parse(decodeURIComponent(unescape(cachePack)));
				
				for(var i = 0; i < checklists.length; i++) {
					var item = checklists[i];
					
					if(!item.lastPosition)
						item.lastPosition = undefined;
				}
				
				$('#tempCount').html(checklists.length);				
				callback.call(self, true, checklists);
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
		
		var token = $.cookie.getCookie('QrefAuth');
		
		resetPassword();
		
		if(token)
			this.set('token', token);
		
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
		});
		
		/*$(".scrollable").touchScroll({
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
		});*/
		
		$( "#checklist-items" ).sortable({
			handle: ".handle",
			scroll: true,
			axis: "y",
			stop: function(event, ui) {
				AppObserver.isSorting = false;
				var indices = new Array();
				$("#checklist-items").children().each(function(index, item) {
					var id = $(this).attr("data-id");
					
					for(var i = 0; i < ChecklistObserver.items.length; i++) {
						var item = ChecklistObserver.items.elementAt(i);
						
						if(item._id == id) {
							item.set('index', index);
							break;
						}
					}
				});
		
				setTimeout(function() {
					Sync.webSync(ChecklistObserver.checklist);
				}, 1000);
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
				$("#dashboard-planes").children().each(function(index, item) {
					var id = $(this).attr("data-id");
					
					for(var i = 0; i < DashboardObserver.items.length; i++) {
						var item = DashboardObserver.items.elementAt(i);
						
						if(item._id == id) {
							item.set('index', index);
							
							setTimeout(function() {
								Sync.webSync(item);
							}, 1000);
							
							break;
						}
					}
				});
			},
			start: function(event, ui) {
				AppObserver.isSorting = true;
			}	
		});
		$( "#dashboard-planes" ).disableSelection();
		
		this.set('loading', true);
		
		this.getAllProducts(function(success, items) {
			this.set('storeHasItems', success);
		});
		
		this.getChecklists(function(success, items) {
			if(success) {
				DashboardDataSource.data(items);
				DashboardObserver.set('dataSource', DashboardDataSource);
			}
			
			self.set('loading', false);
		});
		
		var utcTimer = new Timer(1000, function() {
			var now = new Date();
		
			$(".utcCurrent").html(now.toUTCString());
		});
		
		utcTimer.start();
		
		$(document).bind('navigatedTo', function(e, data) {
			self.set('navHash', data.area);
		});
		
		/*$('#checklist .checklist').scroll(function(e) {
			if(ChecklistObserver.checklist) {
				ChecklistObserver.checklist.lastPosition.scroll = $('#checklist .checklist').scrollTop();
				$('#tempScroll').html(ChecklistObserver.checklist.lastPosition.scroll);
				setTimeout(function() {
					Sync.syncToPhone();
				}, 10000);
			}
		});*/
	} 
});

AppObserver.subscribe(AppObserver);

var DashboardDataSource = new zimoko.DataSource({pageSize: 1000});

var DashboardObserver = new zimoko.Observable({
	items: new zimoko.ObservableCollection(),
	itemTap: function(element, e, data) {
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();

		ele = ele.find('.delete');
		
		if(!DashboardObserver.editing) {
			setTimeout(function() {
				ChecklistObserver.set('checklist', data)
				Navigation.go('#checklist');
			}, 10);
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
			
			ChecklistObserver.set('checklist', data);
			
			setTimeout(function() {
				if(lp && datalink == 'last') {
					ChecklistObserver.set('list', lp.list);
				
					setTimeout(function() {
						ChecklistObserver.set('section', lp.section);
					
						setTimeout(function() {
							$('#checklist .checklist').scrollTop(lp.scroll);
						}, 10);
					}, 10);
				}
				else {
					ChecklistObserver.set('section', 0);
					ChecklistObserver.set('list', datalink);
				}
				
				if(datalink == 'emergencies') {
					Navigation.go('#emergencies');
				}
				else {
					Navigation.go('#checklist');
				}
			}, 10);
		}
	},
	deleteTap: function(element, e, data) {
		var ele = $(element);
		
		e.stopPropagation();
		e.preventDefault();
		
		if(DashboardObserver.editing) {
			var confirm = new ConfirmationDialog('#deleteConfirm', function(success) {
				if(success) {
					ele.fadeOut(200, function() {
						ele.prev().animate({'left':'0px'}, 200, function() {
							data.set('isDeleted', true);
							
							DashboardObserver.dataSource.refresh();
							
							setTimeout(function() {
								DashboardObserver.dataSource.read();
							}, 10);
							
							setTimeout(function() {
								Sync.webSync(data);
							}, 1000);
						});
					});
				}
			});
			
			confirm.show();
		}
	},
	editTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		DashboardObserver.set('editing', !DashboardObserver.editing);
	},
	menuTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		MenuObserver.toggle();
	},
	dataSource: new zimoko.DataSource({pageSize: 1000}),
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
				this.dataSource.sort(new zimoko.Sort(['manufacturer.name', 'index'], 'asc'));
				this.dataSource.filter(new zimoko.FilterSet('and', [
					new zimoko.Filter('==', 'isDeleted', false, false)
				]));
				
				this.dataSource.unsubscribe(this);
				this.dataSource.subscribe(this);
				
				this.set('items', this.dataSource.view());
				
				this.dataSource.read();
			}
			else {
				this.dataSource = new zimoko.DataSource({pageSize: 1000});
				this.dataSource.preventRead = true;
				this.dataSource.sort(new zimoko.Sort(['manufacturer.name', 'index'], 'asc'));
				this.dataSource.filter(new zimoko.FilterSet('and', [
					new zimoko.Filter('==', 'isDeleted', false, false)
				]));
				
				this.dataSource.data([]);
				
				this.set('items', this.dataSource.view());
				
				this.dataSource.read();
			}
		}
	},
	onDataSourceRead: function(event) {
		var items = this.dataSource.view();
				
		for(var i = 0; i < items.length; i++) {
			var item = items.elementAt(i);
		
			if(item != undefined) {
				var element = $('#dashboard li[data-id="' + item._id +'"]');
				
				if(element.length > 0) {
					element.find('.handle').punch();
				}
			}
		}
		
		ChecklistObserver.set('checklist', undefined);
		
		/*var imageProcessor = new ImageProcessor(this.items.toArray(), "checklistListing", true);
		imageProcessor.init();
		imageProcessor.processImages();*/
	}
});

DashboardObserver.subscribe(DashboardObserver);

var ChecklistObserver = new zimoko.Observable({
	items: new zimoko.ObservableCollection(),
	sections: new zimoko.ObservableCollection(),
	checklist: undefined,
	section: 0,
	sectionName: '',
	list: 'preflight',
	editing: false,
	showSections: false,
	itemsDataSource: new zimoko.DataSource({pageSize: 1000}),
	sectionsDataSource: new zimoko.DataSource({pageSize: 1000}),
	onPropertyChanged: function(sender, property) {
		if(property == 'checklist') {			
			if(this.checklist != undefined) {	
				this.set('list', 'preflight');
				this.set('section', 0);
				
				this.set('sectionName', this.checklist[this.list][this.section].name);
				this.itemsDataSource.preventRead = true;
				this.sectionsDataSource.preventRead = true;
				this.itemsDataSource.sort(new zimoko.Sort(['index'], 'asc'));
				this.sectionsDataSource.sort(new zimoko.Sort(['index'], 'asc'));
				
				this.itemsDataSource.data(this.checklist[this.list][this.section].items);
				this.sectionsDataSource.data(this.checklist[this.list]);
				
				this.itemsDataSource.unsubscribe(this);
				this.itemsDataSource.subscribe(this);
				
				this.set('items', this.itemsDataSource.view());
				this.set('sections', this.sectionsDataSource.view());
				this.itemsDataSource.read();
				
				EmergenciesObserver.dataSource.preventRead = true;
				EmergenciesObserver.dataSource.sort(new zimoko.Sort(['index'], 'asc'));
				EmergenciesObserver.dataSource.data(this.checklist.emergencies);
				EmergenciesObserver.dataSource.read();
				
				$('#checklist-nav li').removeClass('active');
				$('#checklist-nav li[data-link="' + this.list +'"]').addClass('active');
				
				$('#checklist .checklist').scrollTop(0);
				this.checklist.set('lastPosition', {section: this.section, list: this.list, scroll: 0});
			}
			else {
				this.set('list', 'preflight');
				this.set('section', 0);
				this.itemsDataSource.data([]);
				this.sectionsDataSource.data([]);
			}
		}
		else if(property == 'list' || property == 'section') {
			
			if(property == 'list') this.section = 0;
			
			this.itemsDataSource.data(this.checklist[this.list][this.section].items);
			this.sectionsDataSource.data(this.checklist[this.list]);
			this.checklist.set('lastPosition', {section: this.section, list: this.list, scroll: 0});
			
			$('#checklist .checklist').scrollTop(0);
			
			this.set('sectionName', this.checklist[this.list][this.section].name);
			
			$('#checklist-nav li').removeClass('active');
			$('#checklist-nav li[data-link="' + this.list +'"]').addClass('active');
			
			this.itemsDataSource.read();
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
	previousSectionTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		
		if(ChecklistObserver.section - 1 >= 0) {
			ChecklistObserver.set('section', ChecklistObserver.section - 1);
		}
		else {
			if(ChecklistObserver.list == 'emergencies')
				ChecklistObserver.list = 'landing';
			else if(ChecklistObserver.list == 'landing')
				ChecklistObserver.list = 'takeoff';
			else if(ChecklistObserver.list == 'takeoff')
				ChecklistObserver.list = 'preflight';
			
			ChecklistObserver.set('section', ChecklistObserver.checklist[ChecklistObserver.list].length - 1);
		}
	},
	nextSectionTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
	
		if(ChecklistObserver.section + 1 < ChecklistObserver.checklist[ChecklistObserver.list].length) {
			ChecklistObserver.set('section', ChecklistObserver.section + 1);
		}
		else {			
			if(ChecklistObserver.list == 'preflight')
				ChecklistObserver.set('list', 'takeoff');
			else if(ChecklistObserver.list == 'takeoff')
				ChecklistObserver.set('list', 'landing');
			else if(ChecklistObserver.list == 'landing')
				ChecklistObserver.set('list', 'emergencies');
				
			setTimeout(function() {
				ChecklistObserver.set('section', 0);
			}, 5);
		}
	},
	onDataSourceRead: function(event) {
		for(var i = 0; i < this.items.length; i++) {
			var item = this.items.elementAt(i);
			
			if(item != undefined) {
				var element = $('#checklist li[data-id="' + item._id +'"]');
				
				if(element.length > 0) {
					element.find('.handle').punch();
				}
			}
		}
	},
	editTap: function(element, e, data) {
		e.stopPropagation();
		e.preventDefault();
		ChecklistObserver.set('editing', !ChecklistObserver.editing);
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
		
		Navigation.go('#editadd');
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
			var confirm = new ConfirmationDialog('#deleteConfirm', function(success) {
				if(success) {
					ele.fadeOut(200, function() {
						ele.prev().animate({'left':'0px'}, 200, function(e) {
							var index = ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.section].items.indexOf(data._original);
						
							ChecklistObserver.itemsDataSource.remove(data);
							
							if(index > -1) {
								ChecklistObserver.checklist[ChecklistObserver.list][ChecklistObserver.section].items.removeAt(index);
							}
							
							ChecklistObserver.itemsDataSource.refresh();
							ChecklistObserver.itemsDataSource.read();
							
							setTimeout(function() {
								Sync.webSync(ChecklistObserver.checklist, true);
							}, 1000);
						});
					});
				}
			});
			
			confirm.show();
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
		Navigation.back();
	}
});

ChecklistObserver.subscribe(ChecklistObserver);

/*function ThemeHandler() {
	this.previousTheme = "theme-dark";
	var self = this;
	
	this.apply = function(themeClass) {
		$("." + this.previousTheme).removeClass(this.previousTheme).addClass(themeClass);
		this.previousTheme = themeClass;
	};
	
	this.createDashboardItem = function(product) {
        
		var html = '<li data-index="' + product.index + '" data-id="' + product._id + '"><div class="plane-icon"></div><div class="holder"><div class="heading">' + product.manufacturer.name +
                        " " + product.model.name + '</div>';
                        
        if(product.model.description)
        	html += '<div class="subheading">' + product.model.description + '</div>';
        
        html += '<div class="subheading">';
        	
        if(product.tailNumber)
        	html += '<span class="tailNumber">' + product.tailNumber + '</span> ';
		else
			html += '<span class="tailNumber"></span> ';
		
		if(product.model.modelYear)
			html += '<span class="modelYear">' + product.model.modelYear + '</span>';
	
		html += '</div>';
		
		html += '<ul><li class="product-subarea" data-link="preflight">Preflight</li><li class="product-subarea" data-link="takeoff">Takeoff</li>' +
				'<li class="product-subarea" data-link="landing">Landing</li><li class="product-subarea" data-link="emergency">Emergencies</li>';
		
		if(ChecklistLast.containsKey(product._id))
			html += '<li class="product-subarea" data-link="last">Last</li>';		
				
			html +=	'</ul></div>' +
				'<div class="delete">delete</div>' +
				'<div class="handle"><div class="item"></div><div class="item"></div><div class="item"></div></div>' +
				'</li>';
						
		return html;
	};*/
	
	/*this.createDownloadItem = function(product, userOwnsProduct) {
		var html = '<li data-id="' + product._id + '" class="' + userOwnsProduct + '"><div class="plane-icon"></div><div class="holder"><div class="heading">' + product.manufacturer.name +
				" " + product.model.name + '</div>';
		if(product.model.description)
			html += '<div class="subheading">' + product.model.description + '</div>';
			html +=	'<div class="subheading">' + product.model.modelYear + '</div>' +
				'<div class="subheading">' + product.serialNumber + '</div>' +
				'</div></li>'
				
		return html;
	};
	
	this.createChecklistItem = function(item) {
		var html = '<li data-id="' + item._id + '" data-index="' + item.index + '">' +
					'<div class="icon"><i class="' + item.icon + '"></i></div>' +
					'<div class="holder">' +
						'<div class="check">' + item.check + '</div>' +
						'<div class="response">' + item.response + '</div>' +
					'</div>' +
					'<div class="delete">delete</div>' +
					'<div class="add"><i class="icon-plus"></i></div>' +
					'<div class="handle"><div class="item"></div><div class="item"></div><div class="item"></div>' +
					'</li>';
					
		return html;
	};
	
	this.createEmergencySectionItem = function(item) {
		var html = '<li data-link="checklist" data-index="' + item.index + '">' +
						'<div class="icon"><img src="images/' + item.name + '.png" /></div>' +
						'<div class="section-name">' + item.name + '</div>' +
					'</li>';
					
		return html;
	};
	
	this.updateChecklistEditMode = function() {
		if(Checklist.editMode)
		{
			$(".edit-list").addClass("active");
			$("#checklist-items").find(".add").animate({opacity: 1}, 200).css('display', 'block');
			$("#checklist-items").find(".handle").animate({opacity: 1}, 200).css('display', 'block');
			
		}	
		else
		{
			$(".edit-list").removeClass("active");
			$("#checklist-items").find(".add").animate({opacity: 0}, 200, function() {
				$(this).css('display', 'none');
			});
			$("#checklist-items").find(".handle").animate({opacity: 0}, 200, function() {
				$(this).css('display', 'none');
			});
		}
	};
	
	this.updateDashboardEditMode = function() {
		if(Checklist.productEditMode)
		{
			$(".edit-check").addClass("active");
			$("#dashboard-planes").find(".handle").animate({opacity: 1}, 200).css('display', 'block');
			
		}	
		else
		{
			$(".edit-check").removeClass("active");
			$("#dashboard-planes").find(".handle").animate({opacity: 0}, 200, function() {
				$(this).css('display', 'none');
			});
		}
	};
	
	this.clearDeleteStatus = function(items) {
		items.each(function(index, e) {
			var element = $(e);
			var deleteButton = element.find(".delete");
			var holder = element.find(".holder");
			
			deleteButton.animate({opacity: 0}, 200, function() {
				$(this).css('display', 'none');
				var parent = $(this).parent();
				holder.animate({"left": "5px"}, 200);
			});
		});
	};
	
	this.addSectionHandlers = function(listHandler) {
		$("#check-sections-items").children().tap(function(e) {
			e.stopPropagation();
			
			var item = $(this);
			
			$(".check-sections").fadeOut(function() {
				Navigation.currentChecklistSection = parseInt(item.attr("data-index"));
				Navigation.updateChecklist(Navigation.currentChecklistCategory);
				
				$(".checklist").scrollTop(0);
				
				var indexItem = listHandler.getByIndex(parseInt(item.attr("data-index")));
				$("#area").html(indexItem.name);
			});
		});
	};
	
	this.addEmergencySectionHandlers = function() {
		$("#emergency-items").find('li').each(function() {
			if($(this).attr('data-link')) {
				$(this).tap(function(event) {
					var index = parseInt($(this).attr("data-index"));
					Navigation.currentChecklistCategory = "emergency";
					Navigation.currentChecklistSection = index;
					Navigation.autoGo($(this));
				});
			}
		});
	};
	
	this.addDashboardItemHandlers = function() {
		Theme.updateDashboardEditMode();
		MyProducts.listing.children().tap(function(e) {
			e.stopPropagation();
			
			if($(this).find(".delete").css("display") != "none")
			{
				self.clearDeleteStatus($("#dashboard-planes").children());
			}
			else
			{
				if(!Checklist.productEditMode) {
					var id = $(this).attr("data-id");
					
					Navigation.loadChecklist(id);
					Navigation.go("checklist");
				}
				else
				{
					var itemToEdit = $(this);
					
					var item = MyProducts.getProduct(Checklist.checklists, itemToEdit.attr("data-id"));
					
					if(item)
					{
						TailNumberEditor.editingItem = itemToEdit;
						
						$("#tailnumber").val(item.tailNumber);
						$("#tailnumber").blur();
						
						Navigation.updateEditTailArea();
					}
				}
			}
		});
		
		var subItems = MyProducts.listing.find(".product-subarea");
		
		subItems.tap(function(e) {
			if(!Checklist.productEditMode) {
				e.stopPropagation();
                     e.preventDefault();
				var parent = $(this).parent().parent().parent();
				var dataid = parent.attr("data-id");
				var datalink = $(this).attr("data-link");
				
				if(datalink == 'last') {
					var lp = ChecklistLast.get(dataid);
				}
				
				Navigation.loadChecklist(dataid);
				
				if(datalink == 'last')
					ChecklistLast.set(dataid, lp);
				
				Navigation.updateChecklist(datalink);
				
				if(datalink == "emergency")
				{
					Navigation.go("emergency");
				}
				else
				{
					Navigation.go("checklist");
				}
			}
		});
		
		MyProducts.listing.find(".handle").punch();
		
		MyProducts.listing.find(".delete").tap(function(e) {
			e.stopPropagation();
			var parent = $(this).parent();
			var holder = parent.find(".holder");
			
			$(this).animate({opacity: 0}, 200, function() {
				$(this).css('display', 'none');
				holder.animate({"left":"5px"}, 200, function() {
					var removedId = parent.attr("data-id");
					var item = MyProducts.getProduct(Checklist.checklists, removedId);
					
					if(item)
					{
						item.isDeleted = true;
						parent.remove();
						
						Sync.syncToPhone();
					}
				});
			});
		});
		
		MyProducts.listing.children().swipe({
			swipeRight: function(event, duration) {
				if(Checklist.productEditMode)
				{
					var deleteButton = $(this).find(".delete");
					var holder = $(this).find(".holder");
					
					holder.animate({"left": "75px"}, 200, function(e) {
						deleteButton.animate({opacity: 1}, 200).css('display', 'block');
					});
			
					event.stopPropagation();
				}
			},
			threshold: 10,
			durationThreshold: 265
		});
	};
	
	this.addDownloadItemHandlers = function() {
		MyProducts.productListing.children().tap(function(e) {
			MyProducts.product = MyProducts.getProduct(MyProducts.allProducts, $(this).attr("data-id"));
			
			if(MyProducts.product)
			{
				MyProducts.selectProductDetails();
				Navigation.go("download-details");
			}
		});
	};
	
	this.addChecklistItemHandlers = function() {
		this.updateChecklistEditMode();
		$("#checklist-items").children().swipe({
			swipeRight: function(event, duration) {
				if(Checklist.editMode)
				{
					var deleteButton = $(this).find(".delete");
					var holder = $(this).find(".holder");
					
					holder.animate({"left": "75px"}, 200, function(e) {
						deleteButton.animate({opacity: 1}, 200).css('display', 'block');
					});
			
					event.stopPropagation();
				}
			},
			threshold: 40,
			durationThreshold: 265
		});
		
		
		$("#checklist-items").children().tap(function(e) {
			e.stopPropagation();
			
			if($(this).find(".delete").css("display") != "none")
			{
				self.clearDeleteStatus($("#checklist-items").children());
			}
			else if(Checklist.editMode)
			{
				ChecklistEditor.editing = true;
				ChecklistEditor.editingItem = $(this);
				
				$("#check").val($(this).find(".check").html());
				$("#response").val($(this).find(".response").html());
				
				Navigation.updateEditAddArea();
			}
		});
		
		$("#checklist-items").find(".add").tap(function(e) {
			e.stopPropagation();
			
			var parent = $(this).parent();
			ChecklistEditor.editing = false;
			ChecklistEditor.editingItem = parent;
			
			$("#check").val("");
			$("#response").val("");
			
			Navigation.updateEditAddArea();
		});
		
		$("#checklist-items").find(".handle").punch();
		
		$("#checklist-items").find(".delete").tap(function(e) {
			e.stopPropagation();
			var parent = $(this).parent();
			var holder = parent.find(".holder");
			
			$(this).animate({opacity: 0}, 200, function() {
				$(this).css('display', 'none');
				holder.animate({"left":"5px"}, 200, function() {
					var removedId = parent.attr("data-id");
					var item = MyProducts.getProduct(Navigation.checklist[Navigation.currentChecklistSection].items, removedId);
					var items = _.without(Navigation.checklist[Navigation.currentChecklistSection].items, item);
						parent.remove();
						Navigation.checklist[Navigation.currentChecklistSection].items = items;
				});
			});
		});
	};
}*/

/*function Loader(id) {
	this.element = $(id);
	
	this.show = function() {
		this.element.show();
	};
	
	this.hide = function() {
		this.element.hide();
	};
}*/
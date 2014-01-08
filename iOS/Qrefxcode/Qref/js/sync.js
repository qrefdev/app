//601 - Fixed refresh issue when auto syncing or syncing when in a checklist
function SyncProcessor() {
    this.timer = undefined;
    this.syncing = false;
	
    this.syncLocal = function() {
        if(checklists && AppObserver.token != '' && AppObserver.token != undefined) {
            this.syncToPhone(checklists);
        }
    };
    
    this.syncOneLocalSilent = function(checklist) {
    	if(checklist != undefined && AppObserver.token != '' && AppObserver.token != undefined)
		{
        	this.syncToPhone([checklist]);
        }
    };
    
    this.syncOneLocal = function(checklist) {
    	if(checklist != undefined && AppObserver.token != '' && AppObserver.token != undefined)
		{
        	AppObserver.set('saving', true);
        	this.syncToPhone([checklist]);
        }
    };
    
    this.syncOneServer = function(checklist) {
    	var self = this;
        if(checklist != undefined && AppObserver.token != '' && AppObserver.token != undefined)
		{	
            if(reachability) {
         		AppObserver.set('syncing', true);
         		self.getChecklistFromServer(checklist._id, function(item) {
					if(item) {
						if(!item.isDeleted) {
							if(item.version <= checklist.version) {
								self.sendChecklistToServer(checklist, function(success) {
									AppObserver.set('syncing', false);
										   
									if(!success) {
									   var dialog = new Dialog('#infobox', 'You will need to sign out and sign back in, in order to sync to the web.');
									   dialog.show();
									}
								});
							}
							else {
								AppObserver.set('syncing', false);
							}
						}
						else {
							self.sendChecklistToServer(checklist, function(success) {
								AppObserver.set('syncing', false);
								   
								if(!success) {
								   var dialog = new Dialog('#infobox', 'You will need to sign out and sign back in, in order to sync to the web.');
								   dialog.show();
								}
							});
						}
					}
					else {
						AppObserver.set('syncing', false);
					}
                });
            }
		}
    };
    
	this.sync = function() {
		var self = this;
		
        if(checklists == undefined) checklists = [];
        
		if(checklists != undefined && AppObserver.token != '' && AppObserver.token != undefined)
		{
			AppObserver.set('syncing', true);
			
            if(reachability) {
                self.getChecklistsFromServer(function(items) {
                    if(items)
                    {
                        setTimeout(function() {
                            var view = DashboardObserver.dataSource.view().toArray();
                            var newItems = [];
                                   
                            //Well looks like some were deleted!
                            //Time to find out which!
                            if(items.length < checklists.length) {
                                for(var i = 0; i < checklists.length; i++) {
                                   var found = _.find(items, function(item) {
                                   		if(item._id == checklists[i]._id)
                                   			return true;
                                   		else
                                   			return false;
                                   });
                                   
                                   if(found == undefined) {
                                   		checklists[i].isDeleted = true;
                                   }
                                }
                            }
                            
                            for(var i = 0; i < items.length; i++)
                            {
                                var currentItem = _.find(checklists, function(item) {
                                    if(item._id == items[i]._id)
                                        return true;
                                    else
                                        return false;
                                });
                            
                                if(currentItem != undefined)
                                {
                                    if(items[i].version >= currentItem.version)
                                    {
                                        currentItem.manufacturer = items[i].manufacturer;
                                        currentItem.model = items[i].model;
                                        currentItem.tailNumber = items[i].tailNumber;
                                        currentItem.version = items[i].version;
                                        currentItem.preflight = items[i].preflight;
                                        currentItem.takeoff = items[i].takeoff;
                                        currentItem.landing = items[i].landing;
                                        currentItem.emergencies = items[i].emergencies;
                                        currentItem.isDeleted = items[i].isDeleted;
                                        currentItem.index = items[i].index;
                                    }
                                    else
                                    {
                                        self.sendChecklistToServer(currentItem);
                                    }
                                }
                                else
                                {
                                    items[i].lastPosition = undefined;
									
                                    checklists.push(items[i]);
									DashboardDataSource.add(new zimoko.Observable(items[i]));
                                }
                                
    							currentItem = undefined;
                            }
                            
                            DashboardDataSource.clear();
                            DashboardDataSource.data(checklists);
                            
                            if(ChecklistObserver.checklist) {
                                   for(var i = 0; i < DashboardDataSource.view().length; i++) {
                                        if(DashboardDataSource.view().elementAt(i)._id == ChecklistObserver.checklist._id) {
                                            ChecklistObserver.set('checklist', DashboardDataSource.view().elementAt(i));
                                        }
                                   }
                            }
                                   
                            if(DashboardObserver.dataSource != DashboardDataSource)
        						DashboardObserver.set('dataSource', DashboardDataSource);
        					else
                            	DashboardObserver.onDataSourceRead();
                             
                            if(DashboardObserver.dataSource.view().length > 0)
								DashboardObserver.set('showHelp', false);
                             
                            self.syncToPhone(checklists);
                        }, 20);
                    }
                    else {
                        self.syncToPhone(checklists);
                                             
                        var dialog = new Dialog('#infobox', 'You will need to sign out and sign back in, in order to sync to the web. Checklists have been saved to the device.');
                        dialog.show();
                    }
                });
            }
            else {
                setTimeout(function() {
                    self.syncToPhone(checklists);
                }, 20);
            }
		}
	};
	
	this.syncToPhone = function(lists) {
		var self = this;
		window.location.href = 'qref://nlog=ListCount:' + lists.length;
		if(lists != undefined)
		{
            if(lists.length > 0) {
                setTimeout(function() {
                    process(0, lists[0]);
                }, 20);
            }
            else {
                AppObserver.set('syncing', false);
                AppObserver.set('saving', false);
            }
            
            function process(index, item) {
				//var stringifiedJson = JSON.stringify(item);
				//var filename = item._id + '.qrf';
				//var encoded = btoa(escape(encodeURIComponent(stringifiedJson)));
				//var data = filename + '-FN-' + encoded;
        
        		
        		//window.location.href = 'qref://nlog=' + data;
				
                item.version += 0.01;
                
				window.location.href = 'qref://sc=' + item._id;
				
				if(index >= lists.length - 1) {
		
					if(AppObserver.syncing)
						AppObserver.set('syncing', false);
		
					if(AppObserver.saving) {
						AppObserver.set('saving', false);
						var saveDialog = new ConfirmationDialog('#savebox', function(doSync) {
							if(doSync && lists.length > 0) {
								Sync.syncOneServer(lists[0]);
							}
						});
			
						saveDialog.show();
					}
				}
				else {
					setTimeout(function() {
						process(index+1,lists[index+1]);
					}, 100);
				}
			}
		}
	};
    
    /// Old Code - No Longer Used
    /*
    this.syncToPhoneStart = function(data) {
    	var self = this;
        window.location.href = 'qref://checklistsBegin';
        
        setTimeout(function() {
            self.syncToPhoneSend(data, 0);
        }, 10);
    };
    
    this.syncToPhoneSend = function(data, i) {
    	var self = this;
        var buffer = '';
        var bufferChunks = Math.ceil(data.length / 6024);
        
            if(data.length - 1 >= 6024)
            {
                if((i + 1) * 6024 < data.length - 1)
                {
                    buffer = data.substring(i * 6024, ((i + 1) * 6024))
                }
                else if(i * 6024 < data.length - 1)
                {
                    buffer = data.substring(i * 6024, data.length);
                }
            }
            else
            {
                buffer = data;
            }

            if(i + 1 > bufferChunks)
            {
                setTimeout(function() {
                    self.syncToPhoneSendChunk(buffer, data, i, true);
                }, 10);
            }
            else
            {
                setTimeout(function() {
                    self.syncToPhoneSendChunk(buffer, data, i, false);
                }, 10);
            }
    };
    
    this.syncToPhoneSendChunk = function(buffer, data, i, lastChunk) {
    	var self = this;
        if(lastChunk)
        {
            if(buffer != undefined && buffer != '')
                window.location.href = 'qref://checklistsPacket=' + buffer;
            
            setTimeout(function() {
            	self.syncToPhoneEnd();
            }, 10);
        }
        else
        {
            if(buffer != undefined && buffer != '')
                window.location.href = 'qref://checklistsPacket=' + buffer;
            
            self.syncToPhoneSend(data, i+1);
        }
    };
    
    this.syncToPhoneEnd = function() {
    	var self = this;
        window.location.href = 'qref://checklistsEnd';
        self.syncing = false;
        AppObserver.set('syncing', false);
    };*/
    
	this.sendChecklistToServer = function(item, callback) {
		var request = {
			manufacturer: item.manufacturer._id,
			model: item.model._id,
			index: item.index,
			tailNumber: item.tailNumber,
			version: item.version,
			isDeleted: item.isDeleted,
			preflight: item.preflight,
			takeoff: item.takeoff,
			landing: item.landing,
			emergencies: item.emergencies,
			user: item.user,
			productIcon: item.productIcon,
			token: AppObserver.token,
			mode: 'ajax'
		};
		
        var urltoPost = host + 'services/ajax/aircraft/checklist/' + item._id + '?token=' + AppObserver.token;
        
		$.ajax({
			type: 'POST',
			contentType:'application/json; charset=utf-8',
			dataType: 'json',
			data: JSON.stringify(request),
			url: urltoPost,
            cache: false,
			success: function(data) {
               if(data.success == true) {
                   if(callback) {
                        callback(true);
                   }
               }
               else {
                   if(callback) {
                        callback(false);
                   }
               }
			},
            error: function(error) {
               //console.log(error);
               if(callback) {
                    callback(false);
               }
            }
		});
	};
	
	this.getChecklistFromServer = function(id, updateCallback) {
		$.ajax({
			type: 'get',
			dataType: 'json',
			url: host + 'services/ajax/aircraft/checklist/' + id + '?token=' + AppObserver.token + '&timestamp=' + Date.now(),
			success: function(data) {
				var response = data;
				
				if(response.success == true)
				{
					if(updateCallback)
						updateCallback(response.records[0]);
				}
				else
				{
					if(updateCallback)
						updateCallback(null);
				}
			},
			error: function() {
				if(updateCallback)
					updateCallback(null);
			}
		});
	};
	
	this.getChecklistsFromServer = function(updateCallback) {
		$.ajax({
			type: 'get',
			dataType: 'json',
			url: host + 'services/ajax/aircraft/checklists?token=' + AppObserver.token + '&timestamp=' + Date.now(),
			success: function(data) {
				var response = data;
				
				if(response.success == true)
				{
					if(updateCallback)
						updateCallback(response.records);
				}
				else
				{
					if(updateCallback)
						updateCallback(undefined);
				}
			},
			error: function()
			{
				if(updateCallback)
					updateCallback(undefined);
			}
		});
	};
}
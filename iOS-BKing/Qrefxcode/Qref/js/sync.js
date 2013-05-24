//601 - Fixed refresh issue when auto syncing or syncing when in a checklist
function SyncProcessor() {
    this.timer = undefined;
    this.syncing = false;
    this.index = 0;
    this.lists = [];
	
    this.syncLocal = function() {
        if(checklists && AppObserver.token != '' && AppObserver.token != undefined) {
            this.syncToPhone(checklists);
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
        if(checklist != undefined && AppObserver.token != '' && AppObserver.token != undefined)
		{	
            if(reachability) {
         		AppObserver.set('syncing', true);
         		
         		this.sendChecklistToServer(checklist, function() {
         			AppObserver.set('syncing', false);
         		});   
            }
		}
    };
    
	this.sync = function() {
		var self = this;
		
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
                                    if(items[i].version > currentItem.version)
                                    {
                                        //606 - Fix for screen refreshing on dashboard during sync
                                        /*currentItem.manufacturer = items[i].manufacturer;
                                        currentItem.model = items[i].model;
                                        currentItem.tailNumber = items[i].tailNumber;
                                        currentItem.version = items[i].version;
                                        currentItem.preflight = items[i].preflight;
                                        currentItem.takeoff = items[i].takeoff;
                                        currentItem.landing = items[i].landing;
                                        currentItem.emergencies = items[i].emergencies;
                                        currentItem.isDeleted = items[i].isDeleted;
                                        currentItem.index = items[i].index;*/
                                        
                                        var observable = _.find(view, function(item) {
                                            if(item._id == currentItem._id)
                                                return true;
                                            else
                                                return false;
                                        });
                                        
                                        if(observable != undefined)
                                        	observable.batchSet(items[i]);
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
									DashboardObserver.dataSource.add(items[i]);
                                }
                                
    							currentItem = undefined;
                            }
                             
                            DashboardObserver.dataSource.read();
                             
                            self.syncToPhone(checklists);
                        }, 20);
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
		if(lists != undefined && !self.syncing)
		{
            self.syncing = true;
            self.lists = lists;
            //var temp = JSON.stringify(checklists);
            //var stringifiedJson = window.btoa(escape(encodeURIComponent(temp)));
            //var stringifiedJson = window.btoa(checklists);
            
            //self.syncToPhoneStart(stringifiedJson);
            
            setTimeout(function() {
                self.index = 0;
                self.nextChecklist();
            }, 20);
		}
	};
    
    // 606 - New method of syncing for lower memory usage!
    this.nextChecklist = function() {
        var self = this;
        if(this.index <  self.lists.length) {
            var stringifiedJson = JSON.stringify(self.lists[self.index]);
            var filename = self.lists[self.index]._id + '.qrf';
            var encoded = btoa(escape(encodeURIComponent(stringifiedJson)));
            var data = filename + '-FN-' + encoded;
            
            window.location.href = 'qref://sc=' + data;
            
            self.index++;
            
            setTimeout(function() {
                self.nextChecklist();
            }, 20);
        }
        else {
            self.syncing = false;
            
            if(AppObserver.syncing)
                AppObserver.set('syncing', false);
            
            if(AppObserver.saving) {
                AppObserver.set('saving', false);
                var saveDialog = new ConfirmationDialog('#savebox', function(doSync) {
                    if(doSync && self.lists.length > 0) {
                        Sync.syncOneServer(self.lists[0]);
                    }
                });
                
                saveDialog.show();
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
               if(callback) {
                	callback();
               }
			},
            error: function(error) {
               console.log(error);
            }
		});
	};
	
	this.getChecklistsFromServer = function(updateCallback) {
		$.ajax({
			type: 'get',
			dataType: 'json',
			url: host + 'services/ajax/aircraft/checklists?token=' + AppObserver.token,
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
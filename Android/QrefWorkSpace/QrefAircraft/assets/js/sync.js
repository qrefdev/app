function SyncProcessor() {
    this.timer = undefined;
    this.syncing = false;
    
	this.init = function() {
		var self = this;
		this.timer = new Timer(200000, function() {
			self.timerSync();
		});
		
		this.timer.start();
	};
	
	this.timerSync = function() {
		var self = this;
		
		if(checklists != undefined && AppObserver.token != '' && AppObserver.token != undefined)
		{
			if(QrefInterface.isConnected()) {
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
								});
						
								if(currentItem)
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
									newItems.push(items[i]);
								}
							}
						
							setTimeout(function() {
								if(newItems.length > 0) {
									DashboardObserver.punch();
									DashboardObserver.getImages(newItems);
								}
							}, 20);
						
							self.syncToPhone();
						}, 20);
					}
				});
			}
			else {
                setTimeout(function() {
                    self.syncToPhone();
                }, 20);
            }
		}
	};
	
	this.sync = function() {
		var self = this;
		
		AppObserver.set('syncing', true);
		
		if(checklists != undefined && AppObserver.token != '' && AppObserver.token != undefined)
		{
			if(QrefInterface.isConnected()) {
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
								});
						
								if(currentItem)
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
									newItems.push(items[i]);
								}
							}
						
							setTimeout(function() {
								if(newItems.length > 0) {
									DashboardObserver.punch();
									DashboardObserver.getImages(newItems);
								}
							}, 20);
						
							self.syncToPhone();
						}, 20);
					}
				});
			}
			else {
                setTimeout(function() {
                    self.syncToPhone();
                }, 20);
            }
		}
	};
	
	this.syncToPhone = function() {
		var self = this;
		if(checklists != undefined && !self.syncing)
		{
            self.syncing = true;
            
            self.syncToPhoneStart(checklists);
		}
	};
	
    this.syncToPhoneStart = function(data) {
    	var self = this;
    	
        setTimeout(function() {
            self.syncToPhoneSend(data);
        }, 10);
    };
    
    this.syncToPhoneSend = function(data) {
    	/*var self = this;
        var buffer = '';
        var bufferChunks = Math.ceil(data.length / 8024);
        
            if(data.length - 1 >= 8024)
            {
                if((i + 1) * 8024 < data.length - 1)
                {
                    buffer = data.substring(i * 8024, ((i + 1) * 8024))
                }
                else if(i * 8024 < data.length - 1)
                {
                    buffer = data.substring(i * 8024, data.length);
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
            }*/
        
        for(var i = 0; i < data.length; i++) {
        	var checklist = data[i];
        	var fileName = checklist._id + '.qrf';
        	
        	QrefInterface.saveChecklist(JSON.stringify(data[i]), fileName);
        }
        this.syncToPhoneEnd();
    };
    
    /*this.syncToPhoneSendChunk = function(buffer, data, i, lastChunk) {
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
    };*/
    
    this.syncToPhoneEnd = function() {
    	var self = this;
        self.syncing = false;
        AppObserver.set('syncing', false);
    };
    
	this.sendChecklistToServer = function(item) {
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
               return data;
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
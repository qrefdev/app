function SyncProcessor() {
    this.timer = undefined;
    this.syncing = false;
    
	this.init = function() {
		var self = this;
		this.timer = new Timer(300000, function() {
			self.timerSync();
		});
		
		this.timer.start();
	};
	
	this.timerSync = function() {
		var self = this;
		
		if(checklists != undefined && AppObserver.token != '' && AppObserver.token != undefined)
		{
			self.getChecklistsFromServer(function(items) {
				if(items)
				{
                    window.location.href = 'qref://clearCache';
                    setTimeout(function() {
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
									//self.sendChecklistToServer(currentItem);
								}
							}
							else
							{
								items[i].lastPosition = undefined;
								checklists.push(items[i]);
								DashboardObserver.dataSource.add(items[i]);
							}
						}
						
						DashboardObserver.dataSource.refresh();
						DashboardObserver.dataSource.read();
                    }, 100);
				}
			});
        
			self.syncToPhone();
		}
	};
	
	this.sync = function() {
		var self = this;
		
		AppObserver.set('syncing', true);
		
		if(checklists != undefined && AppObserver.token != '' && AppObserver.token != undefined)
		{
			self.getChecklistsFromServer(function(items) {
				if(items)
				{
                    window.location.href = 'qref://clearCache';
                    setTimeout(function() {
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
								DashboardObserver.dataSource.add(items[i]);
							}
						}
						
						DashboardObserver.dataSource.refresh();
						DashboardObserver.dataSource.read();
                    }, 100);
				}
			});
			self.syncToPhone();
		}
	};
	
	this.syncToPhone = function() {
		var self = this;
		if(checklists != undefined && !self.syncing)
		{
            self.syncing = true;
            var stringifiedJson = window.btoa(escape(encodeURIComponent(JSON.stringify(checklists))));
            
            self.syncToPhoneStart(stringifiedJson);
		}
	};
	
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
//601 - Fixed refresh issue when auto syncing or syncing when in a checklist
function SyncProcessor() {
    this.timer = undefined;
    this.syncing = false;
    this.versionInfoEpoch = 1395680903723;
	
    this.syncLocal = function() {
        if(checklists && AppObserver.token != '' && AppObserver.token != undefined) {
            this.syncVersionInfoToPhone(AppObserver.checklistVersions);
            this.syncToPhone(checklists);
        }
    };
    
    this.syncOneLocalSilent = function(checklist) {
    	if(checklist != undefined && AppObserver.token != '' && AppObserver.token != undefined)
		{
			this.syncVersionInfoToPhone(AppObserver.checklistVersions);
        	this.syncToPhone([checklist]);
        }
    };
    
    this.syncOneLocal = function(checklist) {
    	if(checklist != undefined && AppObserver.token != '' && AppObserver.token != undefined)
		{
        	AppObserver.set('saving', true);
        	this.syncVersionInfoToPhone(AppObserver.checklistVersions);
        	this.syncToPhone([checklist]);
        }
    };
    
    this.syncOneServer = function(checklist) {
    	var self = this;
        if(checklist != undefined && AppObserver.token != '' && AppObserver.token != undefined)
		{	
			setTimeout(function () { 
				window.location.href = "qref://getDeviceName"; 
			}, 20);
			
            if(reachability) {
         		AppObserver.set('syncing', true);
         		self.getChecklistFromServer(checklist._id, function(item) {
					if(item) {
						self._sync([checklist], [item], false, true);
					}
					else {
						AppObserver.set('syncing', false);
					}
                });
            }
		}
    };
    
    this._sync = function (localItems, serverItems, updateDataSource, refreshChecklist) {
    	var self = this;
    	setTimeout(function () {
			var syncTime = (new Date()).getTime();
			var conflicts = [];
		
			async.each(serverItems, function (serverItem, feCb) {
				var localItem = _.find(localItems, function (v) { return v._id == serverItem._id; });
				var existingVersionInfo = AppObserver.getChecklistVersionObject(serverItem._id);
			
				if (!localItem && !existingVersionInfo) {
					// No cached or existing local checklist copy
					// Also we have never seen any version of the checklist
				
					existingVersionInfo = self.formatVersionInfo(serverItem);
					AppObserver.addChecklistVersionObject(existingVersionInfo);
					localItem = _.omit(serverItem, ['knownSerialNumbers', 'currentSerialNumber', 'lastCheckpointSerialNumber']);
					localItem.lastPosition = undefined;
					localItems.push(localItem);
					feCb();
					return;
				
				} else if (!localItem && existingVersionInfo) {
					// No cached or existing local checklist copy
					// BUT, we have seen this checklist before
					self.forceUpdateVersionInfo(serverItem, existingVersionInfo);
					localItem = _.omit(serverItem, ['knownSerialNumbers', 'currentSerialNumber', 'lastCheckpointSerialNumber']);
					localItem.lastPosition = undefined;
					localItems.push(localItem);
					feCb();
					return;
				
				} else {
					// We have a cached local checklist copy
					// We may or may not have version info
				
					if (!existingVersionInfo) {
						// We are missing version info
						var serverVersionInfo = self.formatVersionInfo(serverItem);
					
						if (serverVersionInfo.currentSerialNumber == self.versionInfoEpoch) {
							// This is the first time we have seen this checklist
							// since the app upgrade to support version info
						
							if (localItem.version > serverItem.version) {
								self.sendChecklistToServer(localItem, syncTime, function (serverAccepted) {
									if (serverAccepted) {
										self.updateVersionInfo(syncTime, AppObserver.getDeviceName(), serverVersionInfo);
										AppObserver.addChecklistVersionObject(serverVersionInfo);
									}
								
									feCb();
								});
								return;
							} else if (serverItem.version > localItem.version) {
								self.copyChecklist(serverItem, localItem);
								self.forceUpdateVersionInfo(serverItem, serverVersionInfo);
								existingVersionInfo = serverVersionInfo;
								AppObserver.addChecklistVersionObject(existingVersionInfo);
							} else {
								self.copyChecklist(serverItem, localItem);
								self.forceUpdateVersionInfo(serverItem, serverVersionInfo);
								existingVersionInfo = serverVersionInfo;
								AppObserver.addChecklistVersionObject(existingVersionInfo);
							}
						
						} else {
							self.copyChecklist(serverItem, localItem);
							self.forceUpdateVersionInfo(serverItem, serverVersionInfo);
							existingVersionInfo = serverVersionInfo;
							AppObserver.addChecklistVersionObject(existingVersionInfo);
						}
					
			
					
					} else {
						// We have existing version info
						self.evaluateChecklistVersions(localItem, existingVersionInfo, serverItem, syncTime, function (status, gapInfo) {
							if (status != 0) {
								var conflictObj = { localItem: localItem, localVersionInfo: existingVersionInfo, 
											serverItem: serverItem, serverVersionInfo: self.formatVersionInfoEx(serverItem), syncTime: syncTime,
											gapInfo: gapInfo, status: status };
								conflicts.push(conflictObj);
							
							}
						
							feCb();
						});
						return;
					}
				
					feCb();	
				}
			}, function (err) {
			
				if (conflicts == null) { conflicts = []; }
				
				
				for (var i = 0; i < localItems.length; i++) {
					if (localItems[i].isDeleted == false) {
						var found = _.find(serverItems, function (z) { return z._id == localItems[i]._id; });
					
						if (found == null) {
							localItems[i].isDeleted = true;
						} else if (found && localItems[i].isDeleted) {
							localItems[i].isDeleted = false;
						}
					}
				}
				
				
				var counter = 0;
				async.eachSeries(conflicts, function (conflict, feCb) {
					counter++;
					
					self.showConflictResolution(conflict, counter, conflicts.length, function (keepLocalVersion) {
						if (keepLocalVersion) {
							self.sendChecklistToServer(conflict.localItem, conflict.syncTime, function (serverAccepted) {
								if (serverAccepted) {
									self.updateVersionInfo(conflict.syncTime, AppObserver.getDeviceName(), conflict.localVersionInfo);
								}
							
								feCb();
							});
						} else {
							self.copyChecklist(conflict.serverItem, conflict.localItem);
							self.forceUpdateVersionInfo(conflict.serverItem, conflict.localVersionInfo);
							feCb();
						}
					});
				}, function (err) {
				
					
					self.syncVersionInfoToPhone(AppObserver.checklistVersions, function () {
						self.syncToPhone(localItems, function () {
							AppObserver.set('syncing', false);
			
							if (updateDataSource === true) {
								DashboardDataSource.clear();
								DashboardDataSource.data(localItems);
			
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
							}
							
							if (!updateDataSource && refreshChecklist) {
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
							}
						});
					});
					
					
					
				
					
				});
				
				
			});
		}, 20);
    };
    
    this.sync = function() {
		var self = this;
		
        if(checklists == undefined) checklists = [];
        
		if(checklists != undefined && AppObserver.token != '' && AppObserver.token != undefined)
		{
			AppObserver.set('syncing', true);
			setTimeout(function () { 
				window.location.href = "qref://getDeviceName"; 
			}, 20);
			
            if(reachability) {
                self.getChecklistsFromServer(function (serverItems) {
                	if (!serverItems) { serverItems = []; }
                	                	
                	self._sync(checklists, serverItems, true, false);
                });
            }
            else {
                setTimeout(function() {
                    self.syncToPhone(checklists);
                }, 20);
            }
		}
	};
	
	this.showConflictResolution = function (conflict, index, length, callback) {
		var self = this;
		var localDate = self.formatDate(conflict.localVersionInfo.currentSerialNumber);
        var localDateElements = localDate.split(" ",2);
        var serverDate = self.formatDate(conflict.serverVersionInfo.currentSerialNumber);
        var serverDateElements = serverDate.split(" ",2);
		var serverDeviceName = self.getDeviceNameFromVersionInfo(conflict.serverVersionInfo, conflict.serverVersionInfo.currentSerialNumber);
		var make = conflict.localItem.manufacturer.name;
		var model = conflict.localItem.model.name;
		var tailNumber = conflict.localItem.tailNumber;

		
		
		var html = '<span class="header">Sync Conflict <span class="conflictNumber">' + index + ' of ' + length + '</span></span><br /><br />';
        html += '<div class="emphasis">' + make + ' ' + model + '  (' + tailNumber + ')</div>';
        html += '<div class="description">A sync conflict exists with this checklist. Please choose which version to keep.<br /></div>';
		html += '<div class="choiceBox"><span class="cdev"><span class="choiceTitle">Local Version</span>';
        html += '<div class="tableRow"><span class="tableCell col1">Last Sync: </span><span class="tableCell col2">' + localDateElements[0] + '<br />' + localDateElements[1] + '</span></div></span><br />';
		html += '<span class="cdev"><div class="tableRow"><span class="tableCell col1">Device: </span><span class="tableCell col2">' + AppObserver.getDeviceName() + '</span></div></span></div>';
		html += '<div class="choiceBox"><span class="cdev"><span class="choiceTitle">Server Version</span>';
        html += '<div class="tableRow"><span class="tableCell col1">Last Sync: </span><span class="tableCell col2">' + serverDateElements[0] + '<br />' + serverDateElements[1] + '</span></div></span><br />';
		html += '<span class="cdev"><div class="tableRow"><span class="tableCell col1">Device: </span><span class="tableCell col2">' + serverDeviceName + '</span></div></span></div>';
		
		var dialog = new ConfirmationDialog('#conflictbox', function (keepLocalVersion) {
			if (callback) {
				AppObserver.set('syncing', true);
				setTimeout(function () {
					callback(keepLocalVersion);
				}, 20);
			}
		});
		
		dialog.html(html);
		AppObserver.set('syncing', false);
		dialog.show();
	};
	
	this.getDeviceNameFromVersionInfo = function(versionInfo, serialNumber) {
		var ksn = _.find(versionInfo.knownSerialNumbers, function (v) { return v.serialNumber == serialNumber; });
		
		if (ksn) {
			return ksn.deviceName;
		} else {
			return 'UNKNOWN';
		}
	};
	
	this.formatDate = function (usec) {
		var dt = new Date();
		dt.setTime(usec);
		return this.padNumber(dt.getMonth()+1) + '-' + this.padNumber(dt.getDate()) + '-' 
				+ dt.getFullYear() + ' ' + this.padNumber(dt.getHours())
				+ ':' + this.padNumber(dt.getMinutes()) + ':' + this.padNumber(dt.getSeconds());
	};
	
	this.padNumber = function (n) {
		n = parseInt(n, 10);
		
		if (n < 10) 
			return '0' + n;
		
		return '' + n;
	};
	
	
	this.evaluateChecklistVersions = function (localItem, localVersionInfo, serverItem, syncTime, callback) {
		var self = this;
		var serverVersionInfo = self.formatVersionInfoEx(serverItem);
		
		if (localVersionInfo.currentSerialNumber == serverVersionInfo.currentSerialNumber) {
			
			if (localVersionInfo.lastCheckpointSerialNumber <= localVersionInfo.currentSerialNumber) {
				if (callback) {
					callback(0);
				}
				return;
			}
			
			self.sendChecklistToServer(localItem, syncTime, function (serverAccepted) {
				if (serverAccepted) {
					self.updateVersionInfo(syncTime, AppObserver.getDeviceName(), localVersionInfo);
				}
				
				if (callback) {
					callback(0);
				}
			});
		} else {
			var localKsns = _.sortBy(localVersionInfo.knownSerialNumbers, function (v) { return v.serialNumber; });
			var serverKsns = _.sortBy(serverVersionInfo.knownSerialNumbers, function (v) { return v.serialNumber; });
			
			/* localKsns.push({ serialNumber: syncTime, deviceName: AppObserver.getDeviceName() }); */
			
			var revisedServerKsns = [];
			var revisedLocalKsns = [];
			
			for (var i = 0; i < serverKsns.length; i++) {
				var seKsn = serverKsns[i];
				
				if (seKsn.serialNumber < localVersionInfo.currentSerialNumber) 
					continue;
				
				revisedServerKsns.push(seKsn);
			}
		
			for (var i = 0; i < localKsns.length; i++) {
				var loKsn = localKsns[i];
				
				if (loKsn.serialNumber < localVersionInfo.currentSerialNumber) 
					continue;
				
				revisedLocalKsns.push(loKsn);
			}
			
			serverKsns = revisedServerKsns;
			localKsns = revisedLocalKsns;
			
			var ksnCount = 0;
			
			if (localKsns.length > serverKsns.length) {
				ksnCount = serverKsns.length;
			} else {
				ksnCount = localKsns.length;
			}
			
			
			
			var gapInfo = null;
			
			
			for (var z = 0; z < ksnCount; z++) {
				var loKsn = localKsns[z];
				var seKsn = serverKsns[z];
				
				if (loKsn.serialNumber == seKsn.serialNumber) {
					continue;
				} else {
					var mDelta = ((loKsn.serialNumber < seKsn.serialNumber) ? seKsn.serialNumber : loKsn.serialNumber);
					
					gapInfo = { loIndex: z, seIndex: z, loSn: loKsn.serialNumber, seSn: seKsn.serialNumber, mKsn: mDelta, loKsn: loKsn, seKsn: seKsn };
					break;
				} 
			}
				
			if (gapInfo == null) { 
				// No Gaps Found
				if (localVersionInfo.currentSerialNumber < serverVersionInfo.currentSerialNumber) {
					if (localVersionInfo.lastCheckpointSerialNumber <= localVersionInfo.currentSerialNumber) {
						self.copyChecklist(serverItem, localItem);
						self.forceUpdateVersionInfo(serverItem, localVersionInfo);
						
						if (callback) {
							callback(0);
						}
						
						return;
					} else {
						if (callback) {
							callback(1);
						}
						return;
					}
				} else {
					self.sendChecklistToServer(localItem, syncTime, function (serverAccepted) {
						if (serverAccepted) {
							self.updateVersionInfo(syncTime, AppObserver.getDeviceName(), localVersionInfo);
						}
				
						if (callback) {
							callback(0);
						}
					});
				}
			} else {
				if (callback) {
					callback(2, gapInfo);
				}
			}
			
		}
	};
	
	this.forceUpdateVersionInfo = function (chklst, versionInfo) {
		if (chklst.currentSerialNumber) {
			if (versionInfo.currentSerialNumber == chklst.currentSerialNumber) return;
			
			//versionInfo.lastCheckpointSerialNumber = versionInfo.currentSerialNumber;
			versionInfo.currentSerialNumber = chklst.currentSerialNumber;
			
			if (chklst.knownSerialNumbers) {
				var ksn = _.find(chklst.knownSerialNumbers, function (v) { return v.serialNumber == chklst.currentSerialNumber; });
				
				if (ksn) {
					versionInfo.knownSerialNumbers.push(ksn);
				} else {
					versionInfo.knownSerialNumbers.push({ serialNumber: chklst.currentSerialNumber, deviceName: 'SYSTEM' });
				}
			} else {
				versionInfo.knownSerialNumbers.push({ serialNumber: chklst.currentSerialNumber, deviceName: 'SYSTEM' });
			}
		}
	};
	
	this.updateVersionInfo = function (newVersion, deviceName, versionInfo) {
		if (versionInfo.currentSerialNumber == newVersion) return;

		versionInfo.currentSerialNumber = newVersion;
	
	
		var ksn = _.find(versionInfo.knownSerialNumbers, function (v) { return v.serialNumber == newVersion; });
	
		if (ksn) {
			ksn.deviceName = deviceName;
		} else {
			versionInfo.knownSerialNumbers.push({ serialNumber: newVersion, deviceName: deviceName });
		}
	};
	
	this.formatVersionInfo = function (chklst) {
		var versionInfo = { _id: chklst._id, lastCheckpointSerialNumber: null, knownSerialNumbers: [], currentSerialNumber: null };
		
		if (chklst.currentSerialNumber && chklst.knownSerialNumbers) {
			var ksn = _.find(chklst.knownSerialNumbers, function (item) { return item.serialNumber == chklst.currentSerialNumber; });
			versionInfo.lastCheckpointSerialNumber = chklst.currentSerialNumber;
			versionInfo.currentSerialNumber = chklst.currentSerialNumber;
			
			if (ksn) {
				versionInfo.knownSerialNumbers.push(ksn);
			} else {
				versionInfo.knownSerialNumbers.push({ serialNumber: chklst.currentSerialNumber, deviceName: "SYSTEM" });
			}
		}
		
		return versionInfo;
	};
	
	this.formatVersionInfoEx = function (chklst) {
		var versionInfo = { _id: chklst._id, lastCheckpointSerialNumber: null, knownSerialNumbers: [], currentSerialNumber: null };
		
		if (chklst.currentSerialNumber && chklst.knownSerialNumbers) {
			versionInfo.lastCheckpointSerialNumber = chklst.currentSerialNumber;
			versionInfo.currentSerialNumber = chklst.currentSerialNumber;
			
			for (var i = 0; i < chklst.knownSerialNumbers.length; i++) {
				var r = chklst.knownSerialNumbers[i];
				
				versionInfo.knownSerialNumbers.push(_.clone(r));
			}
			
			//versionInfo.knownSerialNumbers = _.sortBy(versionInfo.knownSerialNumbers, function (v) { return v.serialNumber; });
		}
		
		return versionInfo;
	};
	
	this.copyChecklist = function (source, dest) {
		dest.manufacturer = source.manufacturer;
		dest.model = source.model;
		dest.tailNumber = source.tailNumber;
		dest.version = source.version;
		dest.preflight = source.preflight;
		dest.takeoff = source.takeoff;
		dest.landing = source.landing;
		dest.emergencies = source.emergencies;
		dest.isDeleted = source.isDeleted;
		dest.index = source.index;
	};
	
	/*
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
	*/
	
	this.syncVersionInfoToPhone = function(versions, callback) {
		var self = this;
		
		if (versions != undefined) {
			if (versions.length > 0) {
				setTimeout(function() {
					process(0, versions[0]);
				}, 20);
			} else {
				if (callback) {
					callback();
				}
			}
		} else {
			if (callback) {
				callback();
			}
		}
		
		function process(index, item) {
			window.location.href = 'qref://svi=' + item._id;
			
			if (index >= versions.length - 1) {
				if (callback) {
					callback();
				}
				return;
			} else {
				setTimeout(function() {
					process(index+1,versions[index+1]);
				}, 100);
			}
		}
	};
	
	this.syncToPhone = function(lists, callback) {
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
                
                if (callback) {
					callback();
				}
            }
            
            function process(index, item) {
				//var stringifiedJson = JSON.stringify(item);
				//var filename = item._id + '.qrf';
				//var encoded = btoa(escape(encodeURIComponent(stringifiedJson)));
				//var data = filename + '-FN-' + encoded;
        
        		
        		//window.location.href = 'qref://nlog=' + data;
				
                //item.version += 0.01;
                
				window.location.href = 'qref://sc=' + item._id;
				
				if(index >= lists.length - 1) {
		
					if(AppObserver.syncing)
						AppObserver.set('syncing', false);
		
					if(AppObserver.saving) {
						AppObserver.set('saving', false);
						var saveDialog = new ConfirmationDialog('#savebox', function(doSync) {
							if(doSync && lists.length > 0) {
								Sync.syncOneServer(lists[0]);
								
								if (callback) {
									callback();
								}
							}
						});
			
						saveDialog.show();
						return;
					}
					
					if (callback) {
						callback();
					}
				}
				else {
					setTimeout(function() {
						process(index+1,lists[index+1]);
					}, 100);
				}
			}
		} else {
			if (callback) {
				callback();
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
    
	this.sendChecklistToServer = function(item, syncTime, callback) {
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
			mode: 'ajax',
			clientTime: syncTime,
			deviceName: AppObserver.getDeviceName()
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
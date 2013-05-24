(function() {	
	zimoko.Navigation = zimoko.Class.extend(function() {	
		this.init = function(animation, pageClass) {
			var self = this;
			
			this.previous = undefined;
			this.previousHashes = [];
			
			this.pageClass = pageClass;
			
			if(this.pageClass.indexOf('.') == -1) this.pageClass = '.' + this.pageClass;
			
			$(this.pageClass).hide();
			var id = $($(this.pageClass).get(0)).attr("id");
			
			this.animation = animation;
			this.currentArea = undefined;
			
			this.go(id);
		};
		
		this.go = function(area) {
			if(area && area.indexOf('#') == -1)
				area = '#' + area;
		
			if(area != this.currentArea) {
				this.previous = this.currentArea;
				this.previousHashes.push(this.currentArea);
				this.currentArea = area;
			}
			
			this.hashChanged({newURL: this.currentArea, oldURL: this.previous});
		};
		
		this.hashChanged = function(e) {
			if(e.newURL == '#back') {
				this.back();
			}
			else {
				var oldHash = undefined;
				if(e.oldURL) {
					oldHash = e.oldURL.split('#')[1];
				}
				
				var newHash = undefined;
				if(e.newURL) {
					newHash = e.newURL.split('#')[1];
				}
				
				if(oldHash != undefined && newHash != undefined && oldHash != 'back') {
					this._go(oldHash, newHash);
				}
				else if(oldHash == undefined && newHash != undefined) {
					this._go(undefined, newHash);
				}
				else if(oldHash == 'back' && newHash != undefined) {
					this._go(undefined, newHash);
				}
			}
		};
		
		this.update = function(oldHash, newHash) {
			$(document).trigger('navigatedTo', [{
				previous: oldHash,
				area: newHash,
				sender: this
			}]);
		};
		
		this.back = function(e) {
			if(this.previousHashes.length > 0) {
				this.previousArea = this.currentArea;
				this.currentArea = this.previousHashes.pop();
				this._go(this.previousArea, this.currentArea);
			}				
		};
		
		this._go = function(oldHash, newHash) {
			var self = this;
			if(oldHash) {
				if(oldHash.indexOf('#') == -1)
					oldHash = '#' + oldHash;
			}
			
			if(newHash) {
				if(newHash.indexOf('#') == -1)
					newHash = '#' + newHash;
			}
			
			$(document).trigger('beforeNavigate', [{
					previous: oldHash,
					area: newHash,
					sender: this
			}]);
			
			this._applyAnimation(oldHash, newHash);
		};
		
		this._applyAnimation = function(oldHash, newHash) {
			var currentObject = $(newHash);
			var previousObject = $(oldHash);
			
			if(this.animation) {
				currentObject.show();
				if(currentObject.attr('data-page-show'))
					zimoko.ui.animate(currentObject, currentObject.attr('data-page-show'));
				
				if(previousObject.length > 0 && previousObject.attr('data-page-hide')) {
					zimoko.ui.animate(previousObject, previousObject.attr('data-page-hide'), function(e) {
						previousObject.hide();
					});
				}
				else if (previousObject.length > 0) {
					previousObject.hide();
				}
				
				this.update(oldHash, newHash);
			}
			else {
				if(previousObject.length > 0)
					previousObject.hide();
				
				currentObject.show();
				
				this.update(oldHash, newHash);
			}
		};
	});
})();
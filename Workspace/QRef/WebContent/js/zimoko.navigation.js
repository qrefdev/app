(function() {	
	zimoko.Navigation = zimoko.Class.extend(function() {	
		this.init = function(animation, pageClass) {
			this.pageClass = pageClass;
			
			if(this.pageClass.indexOf('.') == -1) this.pageClass = '.' + this.pageClass;
			
			$(this.pageClass).hide();
			var id = $($(this.pageClass).get(0)).attr("id");
			
			this.animation = animation;
			window.addEventListener('hashchange', this.hashChanged.bind(this), true);
			
			if(window.location.hash != '')
				this._go(undefined, window.location.hash);
			else
				this.go(id);
		};
		
		this.go = function(area) {
			if(area && area.indexOf('#') == -1)
				area = '#' + area;
				 
			window.location.hash = area;
		};
		
		this.hashChanged = function(e) {
			if(window.location.hash == '#back') {
				this.back();
			}
			else {
				var oldHash = e.oldURL.split('#')[1];
				var newHash = e.newURL.split('#')[1];
				
				if(oldHash != undefined && newHash != undefined && oldHash != 'back') {
					this._go(oldHash, newHash);
				}
				else if(oldHash == undefined && newHash != undefined) {
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
			if(window.location.hash == '#back') {
				history.back();
				history.back();
			}
			else {
				history.back();
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
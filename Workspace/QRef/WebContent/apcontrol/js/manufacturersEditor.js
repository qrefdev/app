var manufacturersEditor = new ManufacturersEditor();

function ManufacturersEditor() {
	this.manufacturers = [];
	
	this.get = function(callback) {
		var self = this;
		loader.show();
		$.ajax
		({
			type: "get",
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			url: host + "services/ajax/aircraft/manufacturers?token=" + token,
			success: function(data) 
			{
				var response = data;
									
				if(response.success == true)
				{
					loader.hide();
					var items = new SortableArray(response.records);
					items = items.sortBy(['name']);
					self.manufacturers = items.toArray();
					callback();
				}
				else
				{
					loader.hide();
					callback();
				}	
			},
			error: function() 
			{
				loader.hide();
				callback();
			}
		})
	};
	
	this.load = function() {
		$('#manufacturers').html('');
		var html = '';
		for(var i = 0; i < this.manufacturers.length; i++) {
			var manufacturer = this.manufacturers[i];
			
			html += this.generateManufacturerHtml(manufacturer);
		}
		
		$('#manufacturers').html(html);
	};
	
	this.generateManufacturerHtml = function(manufacturer) {
		var html =  '<li data-id="' + manufacturer._id + '"><div class="holder" style="width: 95%;">' +
						'Name: <input type="text" class="name" style="width: 50%;" value="' + manufacturer.name + '" /><br>' +
						'Description:<br><textarea class="description" style="width: 100%;">' + manufacturer.description + '</textarea>' +
					'</div></li>';
					
		return html;
	};
	
	this.save = function() {
		loader.show();
		for(var i = 0; i < this.manufacturers.length; i++) {
			var manufacturer = this.manufacturers[i];
			
			var element = $('#manufacturers li[data-id="' + manufacturer._id + '"]');
			
			if(element.length > 0) {
				manufacturer.name = element.find('.name').val();
				manufacturer.description = element.find('.description').val();
			}
			var data = {id: manufacturer._id, name: manufacturer.name, description: manufacturer.description, token: token, mode: 'ajax'};
			
			$.ajax({
				type: 'post',
				contentType:"application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify(data),
				url: host + 'services/ajax/aircraft/manufacturer?token=' + token,
				success: function(data) {
					
				},
				error: function(data) {
				
				}
			})
		}
		loader.hide();
	}
}
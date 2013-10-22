var modelsEditor = new ModelsEditor();

function ModelsEditor() {
	this.models = [];
	
	this.get = function(callback) {
		var self = this;
		loader.show();
		$.ajax
		({
			type: "get",
			contentType:"application/json; charset=utf-8",
			dataType: "json",
			url: host + "services/ajax/aircraft/models?token=" + token,
			success: function(data) 
			{
				var response = data;
									
				if(response.success == true)
				{
					loader.hide();
					var items = new SortableArray(response.records);
					items = items.sortBy(['name']);
					self.models = items.toArray();
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
		$('#models').html('');
		var html = '';
		for(var i = 0; i < this.models.length; i++) {
			var model = this.models[i];
			
			html += this.generateModelHtml(model);
		}
		
		$('#models').html(html);
	};
	
	this.generateModelHtml = function(model) {
		var html =  '<li data-id="' + model._id + '"><div class="holder" style="width: 95%;">' +
						'<table width="100%" border="0">' +
						'<tr><td width="100">Name: </td><td><input type="text" class="name" style="width: 200px;" maxlength="17" value="' + model.name + '" /></td></tr>' +
						'<tr><td>Description:</td><td><input type="text" class="description" style="width: 200px;" maxlength="25" value="' + model.description + '" /></td></tr>' +
						'<tr><td>Years: </td><td><input type="text" class="year" style="width: 200px;" maxlength="19" value="' + model.modelYear + '"/></td></tr>' +
					'</table></div></li>';
					
		return html;
	};
	
	this.save = function() {
		loader.show();
		for(var i = 0; i < this.models.length; i++) {
			var model = this.models[i];
			
			var element = $('#models li[data-id="' + model._id + '"]');
			
			if(element.length > 0) {
				model.name = element.find('.name').val();
				model.description = element.find('.description').val();
				model.modelYear = element.find('.year').val();
			}
			var data = {id: model._id, name: model.name, description: model.description, year: model.modelYear, token: token, mode: 'ajax'};
			
			$.ajax({
				type: 'post',
				contentType:"application/json; charset=utf-8",
				data: JSON.stringify(data),
				dataType: "json",
				url: host + 'services/ajax/aircraft/model?token=' + token,
				success: function(data) {
					return data;
				},
				error: function(data) {
					return data;
				}
			})
		}
		loader.hide();
	}
}
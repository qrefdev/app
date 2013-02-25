var modelsEditor = new ModelsEditor();

function ModelsEditor() {
	this.models = [];
	
	this.get = function() {
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
				}
				else
				{
					loader.hide();
				}	
			},
			error: function() 
			{
				loader.hide();
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
		var html =  '<li data-id="' + model._id + '"><div class="holder">' +
						'Name: <input type="text" class="name" style="width: 50%" value="' + model.name + '" /><br>' +
						'Years: <input type="text" class="year" style="width: 50%" value="' + model.modelYear + '"/><br>' +
						'Description:<br><textarea class="description" style="width: 95%">' + model.description'</textarea>' +
					'</div></li>';
					
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
				dataType: "json",
				url: host + 'services/ajax/aircraft/model',
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
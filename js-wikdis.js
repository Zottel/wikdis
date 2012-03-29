wikdis_hookable = {
	addHook: function(name, callback) {
		if(this._hooks === undefined) {
			this._hooks = {};
		}
		
		if(this._hooks[name] === undefined) {
			this._hooks[name] = [];
		}
		
		this._hooks[name].push(callback);
	},
	delHook: function(name, callback) {
		if(this._hooks === undefined) {
			return;
		}
		
		if(this._hooks[name] === undefined) {
			return;
		}
		
		var idx = this._hooks[name].indexOf(name);
		
		if(idx!=-1) {
			this._hooks[name].splice(idx, 1);
		}
	},
	callHook: function(name, data) {
		if(this._hooks === undefined) {
			return;
		}
		
		if(this._hooks[name] === undefined) {
			return;
		}
		
		for(var i=0; i < this._hooks[name].length; i++) {
			this._hooks[name][i](data);
		}
	}
}

wikdis_models = {
	main: function() {
		this.getPage = function(name) {
			return new wikdis_models.page(name);
		}
	},
	page: function(name) {
		var content = undefined;
		var fetching = false;
		this.fetch = function() {
			if(fetching) {
				return;
			}
			
			fetching = true;
			
			$.ajax({
				type: 'GET',
				dataType: 'json',
				url: '/GET/' + encodeURI('page:' + name + ':content') + '.json',
				success: $.proxy(function(data) {
					var newContent = data.GET
					fetching = false;
					content = newContent;
					this.callHook('newContent', newContent);
				}, this)
			});
		},
		this.getName = function() {
			return name;
		}
		this.getContent = function() {
			if(content === undefined) {
				this.fetch();
			}
			
			return content;
		}
		this.setContent = function(newContent) {
			$.ajax({
				type: 'PUT',
				data: newContent,
				url: '/SET/' + encodeURI('page:' + name + ':content'),
				success: $.proxy(function(data) {
					this.fetch();
				}, this)
			})
		}
	}
}
wikdis_models.main.prototype = wikdis_hookable;
wikdis_models.page.prototype = wikdis_hookable;

wikdis_views = {
	main: function() {
		
	},
	toolbar: function() {
		
	},
	page: function() {
		
	}
}
wikdis_views.main.prototype = wikdis_hookable;
wikdis_views.toolbar.prototype = wikdis_hookable;
wikdis_views.page.prototype = wikdis_hookable;

function wikdis() {
	this.show = function(container){
		
	}
}
wikdis.prototype = wikdis_hookable;


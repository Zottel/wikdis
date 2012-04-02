function trim(str) {
	return str.replace (/^\s+/, '').replace (/\s+$/, '');
}
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

wikdis_backend = function(options) {
	var defaultURL = '';
	var baseURL = options ? options.baseURL ? options.baseURL : defaultURL : defaultURL;
	this.get = function(key, callback) {
		$.ajax({
			type: 'GET',
			dataType: 'json',
			url: baseURL + '/GET/' + encodeURI(key) + '.json',
			success: $.proxy(function(data) {
				callback(data.GET);
			}, this)
		});
	};
	
	this.put = function(key, content, callback) {
		$.ajax({
			type: 'PUT',
			data: content,
			url: baseURL + '/SET/' + encodeURI(key),
			success: function(data) {
				callback();
			}
		});
	};
	
	this.getPage = function(name) {
		return new wikdis_page(this, name);
	};
};
wikdis_backend.prototype = wikdis_hookable;

wikdis_page = function(backend, name) {
	var content = undefined;
	var fetching = false;
	
	var receiveContent = function(newContent) {
		content = newContent;
		fetching = false;
		this.callHook('newContent', newContent);
	};
	
	this.fetch = function() {
		if(fetching) {
			return;
		}
		
		fetching = true;
		
		backend.get('page:' + name + ':content', $.proxy(receiveContent, this));
	};
	
	this.getContent = function() {
		if(content === undefined) {
			this.fetch();
		}
		
		return content;
	};
	
	this.setContent = function(newContent) {
		/*if(trim(newContent) == '') {
			
		} else {
			
		}*/
		var handler = function() {
			content = newContent;
			this.callHook('newContent', newContent);
		};
		backend.put('page:' + name + ':content',
		            newContent,
		            $.proxy(handler, this));
	};
	
	this.getName = function() {
		return name;
	}
};
wikdis_page.prototype = wikdis_hookable;

wikdis_page_view = function(main_view, page) {
	var container = undefined;
	
	this.destroy = function() {
		$(container).empty();
		
		container = undefined;
	}
	
	this.renderContent = function(newContent) {
		if(container === undefined) {
			return;
		}
		$(container).children('.content').text(newContent);
	};
	
	this.save = function() {
		page.setContent($(container).children('.content').val());
	}
	
	this.show = function(newContainer) {
		container = newContainer;
		$(container).empty();
		$('#pageTemplate').tmpl().appendTo(container);
		$(container).children('h2').text(page.getName());
		page.addHook('newContent', $.proxy(this.renderContent, this));
		var newContent = page.getContent();
		if(newContent !== undefined) {
			$(container).children('.content').val(newContent);
		}
		$(container).children('.save').click($.proxy(this.save, this));
	}
};
wikdis_page_view.prototype = wikdis_hookable;

wikdis_view = function(backend, options) {
	var default_page = options ? options.default ? options.default : 'wikdis' : 'wikdis';
	var container = undefined;
	var current_page = undefined;
	
	this.showPage = function(name) {
		if(container === undefined) {
			return;
		}
		if(current_page !== undefined) {
			current_page.destroy();
		}
		
		var new_page_backend = backend.getPage(name);
		current_page = new wikdis_page_view(this, new_page_backend);
		current_page.show(container.children('#page'));
	};
	
	this.show = function(newContainer) {
		container = newContainer;
		$(container).empty();
		$('#mainTemplate').tmpl().appendTo(container);
		if(current_page === undefined) {
			this.showPage(default_page)
		} else {
			this.showPage(current_page.getName());
		}
	};
};
wikdis_view.prototype = wikdis_hookable;


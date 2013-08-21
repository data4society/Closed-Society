// ROOT VIEW
ncos.Views.MainLayout = Backbone.Layout.extend({
  el: 'body',

  events: {
    'click #add': 'addToStack',
    'click #goback': 'removeFromStack',
    'click .close-stack': 'removeFromStack',
    'keydown' : 'keydown',
    'click li.menu:not(".comingsoon, .active")': 'changeLayout',
  },
  
  changeLayout: function(v) {
  	this.stackView.pop();
  	ncos.rooter.setPage(v.currentTarget.id);
  	ncos.rooter.navigate('/' + v.currentTarget.id, {trigger: true});
  },

	keydown: function(e){
		if (e.keyCode == 27) {
			this.removeFromStack();
		}
	},	
	
  addToStack: function(v) {
    this.stackView.push(v);
  },

  removeFromStack: function(ev) {
    this.stackView.pop();
    ncos.rooter.setPage('data');
  },

  initialize: function() {
    // Create a new StackView and the root view.
    this.stackView = new ncos.Views.StackView();
    this.stackView.setRootView(this.options.rootView);
    this.setView('#stackView', this.stackView);
  }
});

// STACK MANAGER
ncos.Views.StackView = Backbone.Layout.extend({
  hasRootView: false,

  // Define options for transitioning views in and out.
  options: {
    inTransitionClass: 'animated fadeInRightBig',
    outTransitionClass: 'animated fadeOutRightBig',
    transitionDelay: 1000,
    class: 'stacks'
  },

  afterRender: function() {
    this.$el.addClass(this.options.class);
  },

  // Pop the top-most view off of the stack.
  pop: function() {
    var views = this.getViews().value();

    if (views.length > (this.hasRootView ? 1 : 0)) {
      var view = views.pop();
      this.transitionViewOut(view);
    }
  },

  // Push a new view onto the stack.
  // The itemClass will be auto-added to the parent element.
  push: function(view) {
    this.insertView(view);
    this.transitionViewIn(view);
  },

  // Trastition the new view in.  This is broken out as a method for convenient
  // overriding of the default transition behavior.  If you only want to change
  // the animation use the trasition class options instead.
  transitionViewIn: function(view) {
    this.trigger('before:transitionIn', this, view);
    view.$el.addClass(this.options.inTransitionClass);
		
    view.initialize();

    setTimeout(function() {
      this.trigger('transitionIn', this, view);
    }.bind(this), this.options.transitionDelay);
  },
  
  // Trastition a view out.  This is broken out as a method for convenient
  // overriding of the default transition behavior.  If you only want to change
  // the animation use the trasition class options instead.
  transitionViewOut: function(view) {
    this.trigger('before:transitionOut', this, view);
    view.$el.addClass(this.options.outTransitionClass);
		ncos.rooter.previous();
    setTimeout(function() {
      view.remove();
      this.trigger('transitionOut', this, view);
    }.bind(this), this.options.transitionDelay);
  },

  setRootView: function(view) {
    this.hasRootView = true;
  	this.setView(view);
  }
});

// NCOs-CHECKS MAIN GRID
/*ncos.Views.ChecksGrid = Backbone.Layout.extend({
	events: {
		'click .data-menu button:not(.active)': 'filterSanction',
		'click .counter' : 'downloadCsv',
	},
  options: {
    class: 'stack-item root-layout'
  },
  downloadCsv: function() {
  	var col = [];
  	this.collection.fullCollection.models.forEach(function(m) {
  		var n = _.clone(m.attributes);
  		delete n._id;
  		delete n.cid;
  		delete n.nco_id;
  		delete n.edited;
  		delete n.created;
  		delete n.chronology;
  		delete n.authorities;
  		delete n.name
  		if (!_.isNull(n.date)) {
  			n.date = moment(n.date,"X").format("DD.MM.YYYY");
  		}
  		if (!_.isNull(n.currentStateDate)) {
  			n.currentStateDate = moment(n.currentStateDate,"X").format("DD.MM.YYYY");
  		}
  		changePropName(n,'ncoName','название НКО');
  		changePropName(n,'sector','направления деятельности');
  		changePropName(n,'region','регион');
  		changePropName(n,'date','дата проверки');
  		changePropName(n,'authoritiesName','проверяющие органы');
  		changePropName(n,'currentStateDate','дата текущего статуса');
  		changePropName(n,'currentState','текущий статус');
  		changePropName(n,'currentStateSource','источник информации о текущем статусе');
  		changePropName(n,'source','источник информации о проверке');
  		changePropName(n,'description','примечание');
  		col.push(n);
  	});
		var csv = toCsv(col,'"',';');
		var blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
		saveAs(blob, "data.csv");
  },
  setAllChecks: function() {
  	this.grid.removeColumn(this.grid.columns.models);
  	this.grid.insertColumn({
      name: 'ncoName',
      label: 'Название',
			editable: false,
      cell: 'string'
    }).insertColumn({
      name: 'region',
      label: 'Регион',
			editable: false,
      cell: 'string'
    }).insertColumn({
      name: 'sector',
      label: 'Сектор',
			editable: false,
      cell: 'string'
    }).insertColumn({
      name: 'currentState',
      label: 'Санкция',
			editable: false,
      cell: 'string'
    }).insertColumn({
      name: 'ncoFullName',
      label: 'Полное название',
			editable: false,
			renderable: false,
      cell: 'string'
    });
  },
  setFilteredChecks: function() {
  	this.grid.removeColumn(this.grid.columns.models);
  	this.grid.insertColumn({
      name: 'ncoName',
      label: 'НКО',
			editable: false,
      cell: 'string'
    }).insertColumn({
      name: 'currentStateDate',
      label: 'Дата санкции',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
    }).insertColumn({
      name: 'currentState',
      label: 'Санкция',
			editable: false,
      cell: 'string'
    }).insertColumn({
      name: 'currentStateSource',
      label: 'Источник',
			editable: false,
      cell: 'uri'
    }).insertColumn({
      name: 'ncoFullName',
      label: 'Полное название',
			editable: false,
			renderable: false,
      cell: 'string'
    });
  },
  filterSanction: function(ev) {
  	ncos.rooter.navigate('/data/' + ev.currentTarget.dataset.section, {trigger: true});
  	var current = this.$el.find('button.active').data('section');
  	if (ev.currentTarget.dataset.section != 'checks' && current == 'checks') {
			this.setFilteredChecks();
  	}
  	else if (ev.currentTarget.dataset.section == 'checks' && current != 'checks') {
  		this.setAllChecks();
  	} 
  },
  initialize: function() {
  	this.columns = [{
      name: 'ncoName',
      label: 'Название',
			editable: false,
      cell: 'string'
      },
      {
      name: 'ncoFullName',
      label: 'Полное название',
			editable: false,
			renderable: false,
      cell: 'string'
      },
      {
      name: 'region',
      label: 'Регион',
			editable: false,
      cell: 'string'
      },
      {
      name: 'sector',
      label: 'Сектор',
			editable: false,
      cell: 'string'
      },
      {
      name: 'currentState',
      label: 'Санкция',
			editable: false,
      cell: 'string'
      }];
    this.grid = new Backgrid.Grid({
    	row: ClickableRow,
      columns: this.columns,
      collection: this.options.collection,
    });
    $(this.$el).append(this.grid.render().$el);
    this.paginator = new Backgrid.Extension.Paginator({
  		columns: this.columns,
  		collection: this.options.collection
		});
		$(this.$el).append(this.paginator.render().$el);
		this.filterSection = new Backgrid.Extension.ClientSideSelectFilter({
  		collection: this.options.collection.fullCollection,
  		placeholder: "Направление деятельности",
 	 		fields: 'sector',
  		wait: 150,
		});
		$(this.$el).prepend(this.filterSection.render().el);
		this.filterRegion = new Backgrid.Extension.ClientSideSelectFilter({
  		collection: this.options.collection.fullCollection,
  		placeholder: "Регион",
 	 		fields: 'region',
  		wait: 150,
		});
		$(this.$el).prepend(this.filterRegion.render().el);
    this.filterSearch = new ncoFilter({
  		collection: this.options.collection.fullCollection,
  		placeholder: "Например: Мемориал",
 	 		fields: ['name','sector','ncoFullName'],
  		wait: 150,
		});
		$(this.$el).prepend(this.filterSearch.render().el);
		$(this.$el).prepend('<span title="скачать данные" class="badge counter" data-toggle="tooltip">результат: ' + this.options.collection.fullCollection.length + '</span>');
		$(this.$el).prepend('<div class="btn-group data-menu" data-toggle="buttons-radio"><button type="button" title="В эту категорию попадают все НКО, подвергшиеся проверкам различных государственных органов." class="btn active" data-toggle="tooltip" data-section="checks">Все проверки <span title="" class="label label-inverse tip-left">' + ncos.Data.checks.fullCollection.length + '</span></button><button type="button" title="В эту категорию попадают НКО, деятельность которых приостановлена министерством юстиции." class="btn" data-toggle="tooltip" data-section="suspended">Приостановление  <span title="" class="label label-inverse tip-left">' + ncos.Data.Stats.suspended.fullCollection.length + '</span></button><button type="button" title="В эту категорию попадают НКО, против которых прокуратура или министерство юстиции возбужают административные дела о нерегистрации НКО в реестре «иностранных агентов»." class="btn" data-toggle="tooltip" data-section="cases">Административные дела  <span title="" class="label label-inverse tip-left">' + ncos.Data.Stats.cases.fullCollection.length + '</span></button><button type="button" title="В эту категорию попадают НКО, которым прокуратура направила представление с требованием зарегистрироваться в реестре «иностранных агентов»." class="btn" data-toggle="tooltip" data-section="submissions">Представления  <span title="" class="label label-inverse tip-left">' + ncos.Data.Stats.submissions.fullCollection.length + '</span></button><button type="button" title="В эту категорию попадают НКО, которым прокуратура направила предостережение о недопустимости нарушения законодательстве в сфере регистрации в реестре «иностранных агентов»." class="btn" data-toggle="tooltip" data-section="warnings">Предостережения <span title="" class="label label-inverse tip-left">' + ncos.Data.Stats.warnings.fullCollection.length + '</span></button><button type="button" title="В эту категорию попадают НКО, против которых прокуратура или иные государственные органы применяет различные иные методы давления, не касающиеся реестра «иностранных агентов»." class="btn" data-toggle="tooltip" data-section="other">Иные санкции <span title="" class="label label-inverse tip-left">' + ncos.Data.Stats.other.fullCollection.length + '</span></button></div>');
  },
  afterRender: function() {
    this.$el.addClass(this.options.class);
    $('span[data-toggle=tooltip],button[data-toggle=tooltip]:not(button[data-section=checks])').tooltip({placement:'bottom'});
    $('button[data-section=checks]').tooltip({placement:'right'});
  }
});
*/
ncos.Views.ChecksGrid = Backbone.MainGrid.extend({
  options: {
    class: 'stack-item root-layout'
  },
  events: {
		'click .data-menu button:not(.active)': 'filterSanction',
		'click .counter' : 'downloadCsv'
	},
  filters: function() {
    this.listenTo(this.options.collection,'reset',this.updateCounter);
  	this.filterSector = new Backgrid.Extension.ServerSelectFilter({
  		collection: this.options.collection,
  		placeholder: "Направление деятельности",
 	 		name: 'sector'
		});
		$(this.$el).prepend(this.filterSector.render().el);
  	this.filterRegion = new Backgrid.Extension.ServerSelectFilter({
  		collection: this.options.collection,
  		placeholder: "Регион",
 	 		name: 'region'
		});
		$(this.$el).prepend(this.filterRegion.render().el);
  	this.filterSearch = new Backgrid.Extension.ServerSideSearch({
  		collection: this.options.collection,
  		placeholder: "Например: Мемориал",
 	 		name: ['ncoName','ncoFullName']
		});
		$(this.$el).prepend(this.filterSearch.render().el);
  	$(this.$el).prepend('<span title="скачать данные" class="badge counter" data-toggle="tooltip">результат: ' + this.options.collection.state.totalRecords + '</span>');
  	$(this.$el).prepend('<div class="btn-group data-menu" data-toggle="buttons-radio"><button type="button" title="В эту категорию попадают все НКО, подвергшиеся проверкам различных государственных органов." class="btn active" data-toggle="tooltip" data-section="checks" data-filter="all">Все проверки <span title="" class="label label-inverse tip-left">' + ncos.State.Stats.all + '</span></button><button type="button" title="В эту категорию попадают НКО, деятельность которых приостановлена министерством юстиции." class="btn" data-toggle="tooltip" data-section="suspended" data-filter="приостановление деятельности">Приостановление  <span title="" class="label label-inverse tip-left">' + ncos.State.Stats.suspended + '</span></button><button type="button" title="В эту категорию попадают НКО, против которых прокуратура или министерство юстиции возбужают административные дела о нерегистрации НКО в реестре «иностранных агентов»." class="btn" data-toggle="tooltip" data-section="cases" data-filter="административное дело">Административные дела  <span title="" class="label label-inverse tip-left">' + ncos.State.Stats.cases + '</span></button><button type="button" title="В эту категорию попадают НКО, которым прокуратура направила представление с требованием зарегистрироваться в реестре «иностранных агентов»." class="btn" data-toggle="tooltip" data-section="submissions" data-filter="представление">Представления  <span title="" class="label label-inverse tip-left">' + ncos.State.Stats.submissions + '</span></button><button type="button" title="В эту категорию попадают НКО, которым прокуратура направила предостережение о недопустимости нарушения законодательстве в сфере регистрации в реестре «иностранных агентов»." class="btn" data-toggle="tooltip" data-section="warnings" data-filter="предостережение">Предостережения <span title="" class="label label-inverse tip-left">' + ncos.State.Stats.warnings + '</span></button><button type="button" title="В эту категорию попадают НКО, против которых прокуратура или иные государственные органы применяет различные иные методы давления, не касающиеся реестра «иностранных агентов»." class="btn" data-toggle="tooltip" data-section="other" data-filter="иная санкция">Иные санкции <span title="" class="label label-inverse tip-left">' + ncos.State.Stats.other + '</span></button></div>');
  },
  setFiltered: function() {
  	var self = this;
  	this.grid.removeColumn(this.grid.columns.models);
  	_.each(ncos.Grids.FilteredChecks, function(column) {
  		self.grid.insertColumn(column);
  	});
  },
  setAllChecks: function() {
  	var self = this;
  	this.grid.removeColumn(this.grid.columns.models);
  	_.each(ncos.Grids.Checks, function(column) {
  		self.grid.insertColumn(column);
  	});
  },
  filterSanction: function(e) {
    var self = this,
    		query = this.collection.queryParams.query,
    		currentSection = this.$el.find('button.active').data('section'),
    		currentFilter = e.currentTarget.dataset.filter;
    if (_.isUndefined(query)) query = {};
    if (currentFilter == 'all') {
  		delete query['chronology.state'];
  	} else {
  		query['chronology.state'] = currentFilter;
  	}
  	ncos.rooter.navigate('/data/' + e.currentTarget.dataset.section, {trigger: false});
  	ncos.rooter.trigger('pseudo');
  	this.collection.fetch().done(function() {
  		if (e.currentTarget.dataset.section != 'checks' && currentSection == 'checks') {
				self.setFiltered();
  		}
  		else if (e.currentTarget.dataset.section == 'checks' && currentSection != 'checks') {
  			self.setAllChecks();
  		}
  	});
  },
  updateCounter: function() {
  	this.$el.find('span.counter').text('результат: ' + this.options.collection.state.totalRecords);
  },
  downloadCsv: function() {
  	var col = [],
  	    source = this.collection.clone();
  	source.queryParams = this.collection.queryParams;
  	source.state = this.collection.state;
  	delete source.state.pageSize;
  	source.fetch().done(function(){
  		source.models.forEach(function(m) {
  			var n = _.clone(m.attributes);
  			delete n._id;
  			delete n.cid;
  			delete n.nco_id;
  			delete n.edited;
  			delete n.created;
  			delete n.chronology;
  			delete n.authorities;
  			delete n.name
  			delete n.events
  			delete n.ncoFullName
  			delete n.attitude
  			delete n.reason
  			delete n.verified
  			if (!_.isNull(n.date)) {
  				n.date = moment(n.date,"X").format("DD.MM.YYYY");
  			}
  			if (!_.isNull(n.currentStateDate)) {
  				n.currentStateDate = moment(n.currentStateDate,"X").format("DD.MM.YYYY");
  			}
  			changePropName(n,'ncoName','название НКО');
  			changePropName(n,'sector','направления деятельности');
  			changePropName(n,'region','регион');
  			changePropName(n,'date','дата проверки');
  			changePropName(n,'authoritiesName','проверяющие органы');
  			changePropName(n,'currentStateDate','дата текущего статуса');
  			changePropName(n,'currentState','текущий статус');
  			changePropName(n,'currentStateSource','источник информации о текущем статусе');
  			changePropName(n,'source','источник информации о проверке');
  			changePropName(n,'description','примечание');
  			col.push(n);
  		});
			var csv = toCsv(col,'"',';');
			var blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
			saveAs(blob, "data.csv");
		});
  },
  afterRender: function() {
    this.$el.addClass(this.options.class);
    this.filters();
    $('span[data-toggle=tooltip],button[data-toggle=tooltip]:not(button[data-section=checks])').tooltip({placement:'bottom'});
    $('button[data-section=checks]').tooltip({placement:'right'});
  }
});
/*
// CHECKS-SUBMISSIONS MAIN GRID
ncos.Views.ChecksSubmissionsGrid = Backbone.Layout.extend({
  options: {
    class: 'stack-item root-layout'
  },
  initialize: function() {
  	this.columns = [{
  		name: 'date',
      label: 'Дата проверки',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
      },
      {
      name: 'ncoName',
      label: 'НКО',
			editable: false,
      cell: 'string'
      },
      {
      name: 'authorityName',
      label: 'Орган',
			editable: false,
      cell: 'string'
      },
      {
      name: 'attitude',
      label: 'Позиция',
			editable: false,
      cell: 'string'
      }];
    this.grid = new Backgrid.Grid({
    	row: ClickableRow,
      columns: this.columns,
      collection: this.options.collection,
    });
    $(this.$el).append(this.grid.render().$el);
    this.paginator = new Backgrid.Extension.Paginator({
  		columns: this.columns,
  		collection: this.options.collection
		});
    $(this.$el).append(this.paginator.render().$el);
    this.filterSection = new Backgrid.Extension.ClientSideSelectFilter({
  		collection: this.options.collection.fullCollection,
  		placeholder: "Направление деятельности",
 	 		fields: 'sector',
  		wait: 150,
		});
		$(this.$el).prepend(this.filterSection.render().el);
		this.filterRegion = new Backgrid.Extension.ClientSideSelectFilter({
  		collection: this.options.collection.fullCollection,
  		placeholder: "Регион",
 	 		fields: 'administrative_area_level_1',
  		wait: 150,
		});
		$(this.$el).prepend(this.filterRegion.render().el);
    this.filterSearch = new ncoFilter({
  		collection: this.options.collection.fullCollection,
  		placeholder: "Например: Мемориал",
 	 		fields: ['name','sector'],
  		wait: 150,
		});
		$(this.$el).prepend(this.filterSearch.render().el);
		$(this.$el).prepend('<span title="" class="badge counter">' + this.options.collection.fullCollection.length + '</span>');
  },
  afterRender: function() {
    this.$el.addClass(this.options.class);
  }
});

// CHECKS-WARNINGS MAIN GRID
ncos.Views.ChecksWarningsGrid = Backbone.Layout.extend({
  options: {
    class: 'stack-item root-layout'
  },
  initialize: function() {
  	this.columns = [{
  		name: 'date',
      label: 'Дата проверки',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
      },
      {
      name: 'ncoName',
      label: 'НКО',
			editable: false,
      cell: 'string'
      },
      {
      name: 'authorityName',
      label: 'Орган',
			editable: false,
      cell: 'string'
      },
      {
      name: 'attitude',
      label: 'Позиция',
			editable: false,
      cell: 'string'
      }];
    this.grid = new Backgrid.Grid({
    	row: ClickableRow,
      columns: this.columns,
      collection: this.options.collection,
    });
    $(this.$el).append(this.grid.render().$el);
    this.paginator = new Backgrid.Extension.Paginator({
  		columns: this.columns,
  		collection: this.options.collection
		});
    $(this.$el).append(this.paginator.render().$el);
    this.filterSection = new Backgrid.Extension.ClientSideSelectFilter({
  		collection: this.options.collection.fullCollection,
  		placeholder: "Направление деятельности",
 	 		fields: 'sector',
  		wait: 150,
		});
		$(this.$el).prepend(this.filterSection.render().el);
		this.filterRegion = new Backgrid.Extension.ClientSideSelectFilter({
  		collection: this.options.collection.fullCollection,
  		placeholder: "Регион",
 	 		fields: 'administrative_area_level_1',
  		wait: 150,
		});
		$(this.$el).prepend(this.filterRegion.render().el);
    this.filterSearch = new ncoFilter({
  		collection: this.options.collection.fullCollection,
  		placeholder: "Например: Мемориал",
 	 		fields: ['name','sector'],
  		wait: 150,
		});
		$(this.$el).prepend(this.filterSearch.render().el);
		$(this.$el).prepend('<span title="" class="badge counter">' + this.options.collection.fullCollection.length + '</span>');
  },
  afterRender: function() {
    this.$el.addClass(this.options.class);
  }
});
*/
// NCO PAGE VIEW
ncos.Views.NCOPage = Backbone.Layout.extend({
  options: {
    class: 'stack-item'
  },
	template: '#nco-page',
  initialize: function() {
  	var self = this;
  	self.model.checks();
  	self.model.cases();
  	self.model.sanctions();
  	var checks = self.model._checks;
  	var cases = self.model._cases;
  	var sanctions = self.model._sanctions;
  	setTimeout(function() {
    self.insertView(new ncos.Views.NCOsChecksGrid({collection:checks})); 
  	self.insertView(new ncos.Views.NCOsCasesGrid({collection:cases}));
  	self.insertView(new ncos.Views.NCOsSanctionsGrid({collection:sanctions}));
  	self.insertView(new ncos.Views.NCOsMediaGrid({collection:ncos.Data.media}));
  	}, 500);
  },
  afterRender: function() {
    this.$el.addClass(this.options.class);
    this.$el.css('background-color', 'rgba(255,255,255,0.8)');
    this.$el.append();
  },
  serialize: function() {
  	return { nco: this.model.attributes, checks: this.model._checks, cases: this.model._cases, sanctions: this.model._sanctions };
	}
});

// NCO PAGE CHECKS GRID
ncos.Views.NCOsChecksGrid = Backbone.View.extend({
	manage:true,
	initialize: function() {
    this.columns = [{
      name: 'date',
      label: 'Дата проверки',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
      },
      {
      name: 'authorityName',
      label: 'Орган',
			editable: false,
      cell: 'string'
      },
      {
      name: 'currentState',
      label: 'Текущий статус',
			editable: false,
      cell: 'string'
      },
      {
      name: 'currentStateDate',
      label: 'Дата статуса',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
      }];
    this.grid = new Backgrid.Grid({
    	row: ClickableRow,
      columns: this.columns,
      collection: this.collection,
    });
    $('.nco-checks').append(this.grid.render().$el);
  },
  close: function(){
    this.grid.remove();
    //this.paginator.remove();
    this.remove();
    this.unbind();
  }
});

// NCO PAGE CASES GRID
ncos.Views.NCOsCasesGrid = Backbone.View.extend({
	manage:true,
	initialize: function() {
    this.columns = [{
      name: 'authorityName',
      label: 'Орган',
			editable: false,
      cell: 'string'
      },
      {
      name: 'checkName',
      label: 'Проверка',
			editable: false,
      cell: 'string'
      },
      {
      name: 'currentState',
      label: 'Текущий статус',
			editable: false,
      cell: 'string'
      },
      {
      name: 'currentStateDate',
      label: 'Дата статуса',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
      }];
    this.grid = new Backgrid.Grid({
    	row: ClickableRow,
      columns: this.columns,
      collection: this.options.collection,
    });
    $('.nco-cases').append(this.grid.render().$el);
  },
  close: function(){
    this.grid.remove();
    this.remove();
    this.unbind();
  }
});

// NCO PAGE SANCTIONS GRID
ncos.Views.NCOsSanctionsGrid = Backbone.View.extend({
	manage:true,
	initialize: function() {
    this.columns = [{
      name: 'authorityName',
      label: 'Орган',
			editable: false,
      cell: 'string'
      },
      {
      name: 'caseName',
      label: 'Дело',
			editable: false,
      cell: 'string'
      },
      {
      name: 'currentState',
      label: 'Текущий статус',
			editable: false,
      cell: 'string'
      },
      {
      name: 'currentStateDate',
      label: 'Дата статуса',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
      }];
    this.grid = new Backgrid.Grid({
    	row: ClickableRow,
      columns: this.columns,
      collection: this.options.collection,
    });
    $('.nco-sanctions').append(this.grid.render().$el);
  },
  close: function(){
    this.grid.remove();
    this.remove();
    this.unbind();
  }
});

// NCO PAGE MEDIA GRID
ncos.Views.NCOsMediaGrid = Backbone.View.extend({
	manage:true,
	initialize: function() {
    this.columns = [{
      name: 'date',
      label: 'Дата',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
      },
      {
      name: 'title',
      label: 'Заголовок',
			editable: false,
      cell: 'string'
      },
      {
      name: 'media',
      label: 'СМИ',
			editable: false,
      cell: 'string'
      }];
    this.grid = new Backgrid.Grid({
    	row: ClickableRow,
      columns: this.columns,
      collection: this.options.collection,
    });
    $('.nco-media').append(this.grid.render().$el);
  },
  close: function(){
    this.grid.remove();
    this.remove();
    this.unbind();
  }
});

// CHECK PAGE VIEW
ncos.Views.CheckPage = Backbone.Page.extend({
	template: '#check-page'
});

// CHECK PAGE CASES GRID
ncos.Views.ChecksCasesGrid = Backbone.View.extend({
	manage:true,
	initialize: function() {
    this.columns = [{
      name: 'authorityName',
      label: 'Орган',
			editable: false,
      cell: 'string'
      },
      {
      name: 'checkName',
      label: 'Проверка',
			editable: false,
      cell: 'string'
      },
      {
      name: 'currentState',
      label: 'Текущий статус',
			editable: false,
      cell: 'string'
      },
      {
      name: 'currentStateDate',
      label: 'Дата статуса',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
      }];
    this.grid = new Backgrid.Grid({
    	row: ClickableRow,
      columns: this.columns,
      collection: this.options.collection,
    });
    $('.check-cases').append(this.grid.render().$el);
  },
  close: function(){
    this.grid.remove();
    //this.paginator.remove();
    this.remove();
    this.unbind();
  }
});

// CHECK PAGE SANCTIONS GRID
ncos.Views.ChecksSanctionsGrid = Backbone.View.extend({
	manage:true,
	initialize: function() {
    this.columns = [{
      name: 'authorityName',
      label: 'Орган',
			editable: false,
      cell: 'string'
      },
      {
      name: 'caseName',
      label: 'Дело',
			editable: false,
      cell: 'string'
      },
      {
      name: 'currentState',
      label: 'Текущий статус',
			editable: false,
      cell: 'string'
      },
      {
      name: 'currentStateDate',
      label: 'Дата статуса',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
      }];
    this.grid = new Backgrid.Grid({
    	row: ClickableRow,
      columns: this.columns,
      collection: this.options.collection,
    });
    $('.check-sanctions').append(this.grid.render().$el);
  },
  close: function(){
    this.grid.remove();
    //this.paginator.remove();
    this.remove();
    this.unbind();
  }
});

// CHECK PAGE MEDIA GRID
ncos.Views.ChecksMediaGrid = Backbone.View.extend({
	manage:true,
	initialize: function() {
    this.columns = [{
      name: 'date',
      label: 'Дата',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
      },
      {
      name: 'title',
      label: 'Заголовок',
			editable: false,
      cell: 'string'
      },
      {
      name: 'media',
      label: 'СМИ',
			editable: false,
      cell: 'string'
      }];
    this.grid = new Backgrid.Grid({
    	row: ClickableRow,
      columns: this.columns,
      collection: this.options.collection,
    });
    $('.check-media').append(this.grid.render().$el);
  },
  close: function(){
    this.grid.remove();
    //this.paginator.remove();
    this.remove();
    this.unbind();
  }
});

// CASE PAGE VIEW
ncos.Views.CasePage = Backbone.Layout.extend({
  options: {
    class: 'stack-item'
  },
	template: '#case-page',
  initialize: function() {
  	var self = this;
  	self.model.sanctions();
  	self.model.nco();
  	self.model.check();
  	var sanctions = self.model._sanctions;
  	var nco = self.model._nco;
  	var check = self.model._check;
  	setTimeout(function() {
  		self.insertView(new ncos.Views.CasesSanctionsGrid({collection:sanctions}));
  		self.insertView(new ncos.Views.CasesMediaGrid({collection:ncos.Data.media}));
  	}, 500);
  },
  afterRender: function() {
    this.$el.addClass(this.options.class);
    this.$el.css('background-color', 'rgba(255,255,255,0.8)');
    this.$el.append();
  },
  serialize: function() {
  	return { caseitem: this.model.attributes, sanctions: this.model._sanctions, nco: this.model._nco, check: this.model._check, };
	}
});

// CASE PAGE SANCTIONS GRID
ncos.Views.CasesSanctionsGrid = Backbone.View.extend({
	manage:true,
	initialize: function() {
    this.columns = [{
      name: 'authorityName',
      label: 'Орган',
			editable: false,
      cell: 'string'
      },
      {
      name: 'caseName',
      label: 'Дело',
			editable: false,
      cell: 'string'
      },
      {
      name: 'currentState',
      label: 'Текущий статус',
			editable: false,
      cell: 'string'
      },
      {
      name: 'currentStateDate',
      label: 'Дата статуса',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
      }];
    this.grid = new Backgrid.Grid({
    	row: ClickableRow,
      columns: this.columns,
      collection: this.options.collection,
    });
    $('.case-sanctions').append(this.grid.render().$el);
  },
  close: function(){
    this.grid.remove();
    //this.paginator.remove();
    this.remove();
    this.unbind();
  }
});

// CASE PAGE MEDIA GRID
ncos.Views.CasesMediaGrid = Backbone.View.extend({
	manage:true,
	initialize: function() {
    this.columns = [{
      name: 'date',
      label: 'Дата',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
      },
      {
      name: 'title',
      label: 'Заголовок',
			editable: false,
      cell: 'string'
      },
      {
      name: 'media',
      label: 'СМИ',
			editable: false,
      cell: 'string'
      }];
    this.grid = new Backgrid.Grid({
    	row: ClickableRow,
      columns: this.columns,
      collection: this.options.collection,
    });
    $('.case-media').append(this.grid.render().$el);
  },
  close: function(){
    this.grid.remove();
    //this.paginator.remove();
    this.remove();
    this.unbind();
  }
});

// SANCTION PAGE VIEW
ncos.Views.SanctionPage = Backbone.Layout.extend({
  options: {
    class: 'stack-item'
  },
	template: '#sanction-page',
  initialize: function() {
  	var self = this;
  	self.model.nco();
  	self.model.check();
  	self.model.case();
  	var nco = self.model._nco;
  	var check = self.model._check;
  	var caseitem = self.model.case;
  	setTimeout(function() {
  		self.insertView(new ncos.Views.SanctionsMediaGrid({collection:ncos.Data.media}));
  	}, 500);
  },
  afterRender: function() {
    this.$el.addClass(this.options.class);
    this.$el.css('background-color', 'rgba(255,255,255,0.8)');
    this.$el.append();
  },
  serialize: function() {
  	return { sanction: this.model.attributes, nco: this.model._nco, check: this.model._check, caseitem: this.model._case };
	}
});

// SANCTION PAGE MEDIA GRID
ncos.Views.SanctionsMediaGrid = Backbone.View.extend({
	manage:true,
	initialize: function() {
    this.columns = [{
      name: 'date',
      label: 'Дата',
			editable: false,
      cell: Backgrid.Extension.MomentCell.extend({
      	modelFormat: "X",
      	displayFormat: "DD.MM.YYYY",
      	displayInUTC: false
    	})
      },
      {
      name: 'title',
      label: 'Заголовок',
			editable: false,
      cell: 'string'
      },
      {
      name: 'media',
      label: 'СМИ',
			editable: false,
      cell: 'string'
      }];
    this.grid = new Backgrid.Grid({
    	row: ClickableRow,
      columns: this.columns,
      collection: this.options.collection,
    });
    $('.sanction-media').append(this.grid.render().$el);
  },
  close: function(){
    this.grid.remove();
    //this.paginator.remove();
    this.remove();
    this.unbind();
  }
});

// ABOUT PAGE VIEW
ncos.Views.AboutPage = Backbone.Layout.extend({
  options: {
    class: 'stack-item about'
  },
	template: '#about-page',
  initialize: function() {
		this.render();
  },
  afterRender: function() {
    this.$el.addClass(this.options.class);
    this.$el.css('background-color', 'rgba(255,255,255,0.9)');
    this.$el.append();
  }
});

// REPORT PAGE VIEW
ncos.Views.ReportPage = Backbone.Layout.extend({
  options: {
    class: 'stack-item report'
  },
	template: '#report-page',
  initialize: function() {
		this.render();
  },
  afterRender: function() {
    this.$el.addClass(this.options.class);
    this.$el.css('background-color', 'rgba(255,255,255,0.9)');
    this.$el.append();
  }
});
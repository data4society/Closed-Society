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
  	if(v.currentTarget.id == 'ru') {
  		window.location = 'http://closedsociety.org';
  	} else {
  		ncos.rooter.navigate('/en/' + v.currentTarget.id, {trigger: true});
  	}
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
  		placeholder: "Sector",
 	 		name: 'sectorEn'
		});
		$(this.$el).prepend(this.filterSector.render().el);
  	this.filterRegion = new Backgrid.Extension.ServerSelectFilter({
  		collection: this.options.collection,
  		placeholder: "Region",
 	 		name: 'regionEn'
		});
		$(this.$el).prepend(this.filterRegion.render().el);
  	this.filterSearch = new Backgrid.Extension.ServerSideSearch({
  		collection: this.options.collection,
  		placeholder: "Example: Мемориал",
 	 		name: ['ncoName','ncoFullName']
		});
		$(this.$el).prepend(this.filterSearch.render().el);
  	$(this.$el).prepend('<span title="download data" class="badge counter" data-toggle="tooltip">total: ' + this.options.collection.state.totalRecords + '</span>');
  	$(this.$el).prepend('<div class="btn-group data-menu" data-toggle="buttons-radio"><button type="button" title="The entire list of inspected NGOs" class="btn active" data-toggle="tooltip" data-section="checks" data-filter="all">All inspections <span title="" class="label label-inverse tip-left">' + ncos.State.Stats.all + '</span></button><button type="button" title="The NGOs suspended by the Ministry of Justice" class="btn" data-toggle="tooltip" data-section="suspended" data-filter="suspended">Suspended  <span title="" class="label label-inverse tip-left">' + ncos.State.Stats.suspended + '</span></button><button type="button" title="The NGOs which faced administrative cases on violations of the «foreign agents» law" class="btn" data-toggle="tooltip" data-section="cases" data-filter="administrative case">Administrative cases <span title="" class="label label-inverse tip-left">' + ncos.State.Stats.cases + '</span></button><button type="button" title="The NGOs which received official orders to register as «foreign agents» within one month of their respective dates of notice" class="btn" data-toggle="tooltip" data-section="submissions" data-filter="notice of violations">Notices of violations <span title="" class="label label-inverse tip-left">' + ncos.State.Stats.submissions + '</span></button><button type="button" title="The groups of NGOs were warned of a need to register as «foreign agents» if they plan to carry out political activities or to receive foreign funding in the future." class="btn" data-toggle="tooltip" data-section="warnings" data-filter="warning">Warnings <span title="" class="label label-inverse tip-left">' + ncos.State.Stats.warnings + '</span></button><button type="button" title="Others types of sanctions" class="btn" data-toggle="tooltip" data-section="other" data-filter="other">Other sanctions <span title="" class="label label-inverse tip-left">' + ncos.State.Stats.other + '</span></button></div>');
  },
  setFiltered: function() {
  	var self = this;
  	this.grid.removeColumn(this.grid.columns.models);
  	_.each(ncos.Grids.FilteredChecksEn, function(column) {
  		self.grid.insertColumn(column);
  	});
  },
  setAllChecks: function() {
  	var self = this;
  	this.grid.removeColumn(this.grid.columns.models);
  	_.each(ncos.Grids.ChecksEn, function(column) {
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
  		delete query['chronology.stateEn'];
  	} else {
  		query['chronology.stateEn'] = currentFilter;
  	}
  	ncos.rooter.navigate('/en/data/' + e.currentTarget.dataset.section, {trigger: false});
  	ncos.rooter.trigger('pseudo');
  	ncos.State.notify('show','Loading...');
  	this.collection.fetch().done(function() {
  		$('#info-alert').append(' Complete!')
  		setTimeout(function(){
				ncos.State.notify('hide')
			}, 1000);
  		if (e.currentTarget.dataset.section != 'checks' && currentSection == 'checks') {
				self.setFiltered();
  		}
  		else if (e.currentTarget.dataset.section == 'checks' && currentSection != 'checks') {
  			self.setAllChecks();
  		}
  	});
  },
  updateCounter: function() {
  	this.$el.find('span.counter').text('total: ' + this.options.collection.state.totalRecords);
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
  			changePropName(n,'ncoName','NGO');
  			changePropName(n,'sectorEn','sector');
  			changePropName(n,'regionEn','region');
  			changePropName(n,'date','inspection date');
  			changePropName(n,'authoritiesNameEn','authorities');
  			changePropName(n,'currentStateDate','current state date');
  			changePropName(n,'currentStateEn','current state');
  			changePropName(n,'currentStateSource','current state source');
  			changePropName(n,'source','inspection info source');
  			changePropName(n,'description','inspection description');
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

ncos.Views.CalendarPage = Backbone.Layout.extend({
  options: {
    class: 'stack-item about'
  },
	template: '#calendar-page',
  initialize: function() {
		this.render();
  },
  afterRender: function() {
    this.$el.addClass(this.options.class);
    this.$el.css('background-color', 'rgba(255,255,255,0.9)');
    this.$el.append(); 
  }
});

ncos.Views.NewsLibertyPage = Backbone.Layout.extend({
  options: {
    class: 'stack-item about'
  },
	template: '#news-liberty-page',
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
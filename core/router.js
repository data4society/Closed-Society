ncos.Routers.Main = Backbone.Router.extend({
  initialize: function() {
  },
  routes: {
    '' : 'index',
    'about' : 'about',
    'report': 'report',
    'data' : 'dataMain',
		'data/checks' : 'checks',
		'data/suspended' : 'suspended',
		'data/warnings' : 'warnings',
		'data/submissions' : 'submissions',
		'data/cases' : 'cases',
		'data/other' : 'other',
		'data/ncos/:id' : 'ncoView',
		'data/checks/:id' : 'checksView',
		'data/cases/:id' : 'casesView',
		'data/sanctions/:id' : 'sanctionsView'
  },
  
	list: function(colName,page,title,viewName) {
		var c = new OIdb.Collections[colName]()
		this.dataInit(page)
		this.setTitle(title)
		console.log('Welcome to ' + page + ' section!')
		this.routerFetch(c)
		this.fetching.done(function () {
			var v = new ncos.Views[viewName]({ collection: c, columns: ncos.Grids[colName] })
			ncos.Views.currentLayout = new OIdb.Views.MainLayout({rootView: v}).render()
			ncos.State.layoutInitialized = true
		})
	},
	
  index: function() {
  	ncos.rooter.navigate('/data/checks', {trigger: true});
  },
	dataMain: function() {
		ncos.rooter.navigate('/data/checks', {trigger: true});
	},
	about: function() {
  	this.dataInit('checks');
  	setTab('about');
  	var model = new Backbone.Model();
    var v = new ncos.Views.AboutPage({model:model});
    ncos.Views.currentLayout.view.addToStack(v);
	},
	report: function() {
  	this.dataInit('checks');
  	setTab('report');
  	var model = new Backbone.Model();
    var v = new ncos.Views.ReportPage({model:model});
    ncos.Views.currentLayout.view.addToStack(v);
	},
  checks: function() {
    this.dataInit('checks');
    var collection = ncos.Views.currentLayout.view.options.rootView.collection.fullCollection;
    collection.reset(ncos.Data.checks.fullCollection.models);
  },
  warnings: function() {
    this.dataInit('warnings');
    var collection = ncos.Views.currentLayout.view.options.rootView.collection.fullCollection;
    collection.reset(ncos.Data.checks.fullCollection.models);
    matcher = function(m){ 
			return _.contains(_.pluck(m.attributes.chronology, "state"),"предостережение");
		};
		collection.reset(collection.filter(matcher));
  },
  suspended: function() {
  	this.dataInit('suspended');
    var collection = ncos.Views.currentLayout.view.options.rootView.collection.fullCollection;
    collection.reset(ncos.Data.checks.fullCollection.models);
    matcher = function(m){ 
			return _.contains(_.pluck(m.attributes.chronology, "state"),"приостановление деятельности");
		};
		collection.reset(collection.filter(matcher));
  },
  submissions: function() {
  	this.dataInit('submissions');
    var collection = ncos.Views.currentLayout.view.options.rootView.collection.fullCollection;
    collection.reset(ncos.Data.checks.fullCollection.models);
    matcher = function(m){ 
			return _.contains(_.pluck(m.attributes.chronology, "state"),"представление");
		};
		collection.reset(collection.filter(matcher));
  },
  cases: function() {
  	this.dataInit('cases');
    var collection = ncos.Views.currentLayout.view.options.rootView.collection.fullCollection;
    collection.reset(ncos.Data.checks.fullCollection.models);
    matcher = function(m){ 
			return _.contains(_.pluck(m.attributes.chronology, "state"),"административное дело");
		};
		collection.reset(collection.filter(matcher));
  },
  other: function() {
  	this.dataInit('other');
    var collection = ncos.Views.currentLayout.view.options.rootView.collection.fullCollection;
    collection.reset(ncos.Data.checks.fullCollection.models);
    matcher = function(m){ 
    	var result = true;
    	var values = _.pluck(m.attributes.chronology, "state");
    	for (var i=0;i<values.length;i++) {
    		result = result && _.contains(['предостережение','представление','административное дело','приостановление деятельности','',null],values[i]);
    	}
			return !result;
		};
		collection.reset(collection.filter(matcher));
  },
  checksView: function(id) {
  	this.dataInit('checks');
    var check = ncos.Models.Check.create({_id:id});
    var v = new ncos.Views.CheckPage({ model: check });
    ncos.Views.currentLayout.view.addToStack(v);
  },
  ncoView: function(id) {
  	this.dataInit('checks');
    var nco = ncos.Models.NCO.create({_id:id});
    var v = new ncos.Views.NCOPage({ model: nco });
    ncos.Views.currentLayout.view.addToStack(v);
  },
  casesView: function(id) {
  	this.dataInit('checks');
    var caseitem = ncos.Models.Case.create({_id:id});
    var v = new ncos.Views.CasePage({ model: caseitem });
    ncos.Views.currentLayout.view.addToStack(v);
  },
  sanctionsView: function(id) {
  	this.dataInit('checks');
    var sanction = ncos.Models.Sanction.create({_id:id});
    var v = new ncos.Views.SanctionPage({ model: sanction });
    ncos.Views.currentLayout.view.addToStack(v);
  },
  dataInit: function(page) {
  	if (_.isUndefined(ncos.Views.currentLayout)) {
  		ncos.Data.checksShadow.reset(ncos.Data.checks.fullCollection.models);
  		var v = new ncos.Views.ChecksGrid({ collection: ncos.Data.checksShadow });
  		ncos.Views.currentLayout = new ncos.Views.AppLayout({rootView: v}).render();
  		ncos.Views.currentLayout.view.options.page = 'checks'
  		setTab('data');
  		this.listenTo(ncos.Data.checksShadow, "reset", function (collection) {
      	$('.counter').text('результат: ' + collection.fullCollection.length);
      });
      setButton(page);
			if (page != 'checks') {
				ncos.Views.currentLayout.view.options.rootView.setFilteredChecks();
			}
  	}
  },
  
 //HELPERS
	
	routerFetch: function(c) {
		var self = this;
		ncos.State.notify('show','Загрузка данных...');
		this.fetching = c.fetch().done(function(){
			$('#info').append(' Выполнена ;)')
			setTimeout(function(){
				OIdb.State.notify('hide')
			}, 2000);
			self.fetching.collection = c;
		});
  },
    
  dataInit: function(page,list)	{
  	if (!OIdb.State.layoutInitialized && list) {
  		this[list]()
  	}
  	this.setPage(page)
  },
  
  setPage: function(page) {
  	$('.sidebar .active').removeClass('active')
  	$('.sidebar li#' + page).addClass('active')
  },
  
  setTitle: function(title) {
  	$('.data-toolbox header').html('<b>' + title + '</b>')
  },
  
  storeRoute: function(e) {
    if(e != 'route') {
    	this.history.push(Backbone.history.fragment)
    }
  },
  
  previous: function() {
    if (this.history.length > 1) {
      this.navigate(this.history[this.history.length - 2], false)
      this.history.pop()
    } else {
      this.navigate(window.location.pathname.split('/')[1], true)
    }
  }
});

ncos.Routers.Main = Backbone.Router.extend({
  initialize: function() {
		this.on("all", this.storeRoute)
   	this.history = [];
   	this.history.push('/data/checks');
	},
  routes: {
  	'map' : 'map',
    'about(/)' : 'about',
    'calendar(/)': 'calendar',
    'news-radio-liberty(/)': 'newsLiberty',
    'report(/)': 'report',
    'data(/)' : 'dataMain',
		'data/checks(/)' : 'checks',
		'data/suspended(/)' : 'suspended',
		'data/warnings(/)' : 'warnings',
		'data/submissions(/)' : 'submissions',
		'data/cases(/)' : 'cases',
		'data/other(/)' : 'other',
		'data/ncos/:id' : 'ncoView',
		'data/checks/:id' : 'checksView',
		'data/cases/:id' : 'casesView',
		'data/sanctions/:id' : 'sanctionsView'
  },
  
	list: function(colName,columns,page,title,viewName,filter,section) {
		var c = new ncos.Collections[colName]()
		if (filter) {
		  c.queryParams.query = {}
		  c.queryParams.query['chronology.state'] = filter
		}
		this.dataInit(page)
		this.setTitle(title)
		this.routerFetch(c)
		this.fetching.done(function () {
			var v = new ncos.Views[viewName]({ collection: c, columns: ncos.Grids[columns] })
			ncos.Views.currentLayout = new ncos.Views.MainLayout({rootView: v}).render()
			ncos.State.layoutInitialized = true
			if (section) ncos.Views.currentLayout.view.options.rootView.$el.find('button[data-section=' + section + ']').button('toggle')
		})
	},
	
	view: function(id,page,list,modelName,viewName,relations) {
		var self = this,
				relationsData = {}
		this.dataInit(page,list)
		this.fetching.done(function () {
			var model = ncos.Models[modelName].create({_id:id})
			ncos.State.notify('show','Загрузка данных...');
			model.fetch().done(function() {
				$('#info-alert').append(' Выполнена!')
				setTimeout(function(){
					ncos.State.notify('hide')
				}, 1000);
				var v = new ncos.Views[viewName]({model: model, collection: self.fetching.collection, relations: relations})
				ncos.Views.currentLayout.view.addToStack(v)
			})
		})
	},
	
	map: function() {
		window.location = 'http://closedsociety.org';
	},
  index: function() {
  	ncos.rooter.navigate('/data/checks', {trigger: true});
  },
	dataMain: function() {
		ncos.rooter.navigate('/data/checks', {trigger: true});
	},
	about: function() {
  	this.dataInit('about','checks');
  	this.fetching.done(function () {
  		var model = new Backbone.Model();
    	var v = new ncos.Views.AboutPage({model:model});
    	ncos.Views.currentLayout.view.addToStack(v);
    });
	},
	calendar: function() {
  	this.dataInit('calendar','checks');
  	this.fetching.done(function () {
  		var model = new Backbone.Model();
    	var v = new ncos.Views.CalendarPage({model:model});
    	ncos.Views.currentLayout.view.addToStack(v);
    })
	},
	newsLiberty: function() {
  	this.dataInit('news-radio-liberty','checks');
  	this.fetching.done(function () {
  		var model = new Backbone.Model();
    	var v = new ncos.Views.NewsLibertyPage({model:model});
   		ncos.Views.currentLayout.view.addToStack(v);
    })
	},
	report: function() {
  	this.dataInit('report','checks');
  	this.fetching.done(function () {
  		var model = new Backbone.Model();
    	var v = new ncos.Views.ReportPage({model:model});
    	ncos.Views.currentLayout.view.addToStack(v);
    })
	},
  checks: function() {
  	if (window.location.hash != '') {
  		ncos.rooter.navigate('/data/checks/' + window.location.hash.substr(1), {trigger: true});
    }
    this.list('Checks','Checks','checks','Проверки','ChecksGrid')
  },
  warnings: function() {
    this.list('Checks','FilteredChecks','checks','Проверки','ChecksGrid','предостережение','warnings')
  },
  suspended: function() {
  	this.list('Checks','FilteredChecks','checks','Проверки','ChecksGrid','приостановление деятельности','suspended')
  },
  submissions: function() {
  	this.list('Checks','FilteredChecks','checks','Проверки','ChecksGrid','представление','submissions')
  },
  cases: function() {
  	this.list('Checks','FilteredChecks','checks','Проверки','ChecksGrid','административное дело','cases')
  },
  other: function() {
  	this.list('Checks','FilteredChecks','checks','Проверки','ChecksGrid','иная санкция','other')
  },
  checksView: function(id) {
  	this.history.pop();
  	ncos.rooter.navigate('/data/checks/#' + id, {trigger: false});
    this.view(id,'checks','checks','Check','CheckPage',ncos.Grids.CheckSubGrids)
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
  
 //HELPERS
	
	routerFetch: function(c) {
		var self = this;
		ncos.State.notify('show','Загрузка данных...');
		this.fetching = c.fetch().done(function(){
			$('#info-alert').append(' Выполнена!')
			setTimeout(function(){
				ncos.State.notify('hide')
			}, 1000);
			self.fetching.collection = c;
		});
  },
    
  dataInit: function(page,list)	{
  	if (!ncos.State.layoutInitialized && list) {
  		this[list]()
  	}
  	this.setPage(page)
  },
  
  setPage: function(page) {
		$('li.active').removeClass('active');
  	$('#' + page).addClass('active');
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

var map = L.map('map'),
		markerSize = 20,
		iframe = false;

if (window.location != window.parent.location) iframe = true;

//var iconsPath = iframe ? '../assets/img/markers/' : 'assets/img/markers/',
var iconsPath = iframe ? '../assets/img/' : 'assets/img/',
		attribution = iframe ? '<a class="logo-img" href="http://closedsociety.org" target="_blank">ClosedSociety.org</a><br />По данным <a href="http://closedsociety.org" target="_blank">ИАИ "Закрытое общество"</a>.' : '<a class="logo-img" href="http://www.svoboda.org/section/authorities-against-ngo/3228.html" target="_blank"><img src="assets/img/liberty.png" /></a><br />Карта проверок - совместный проект<br />с <a href="http://www.svoboda.org/section/authorities-against-ngo/3228.html" target="_blank">радиостанцией "Свобода"</a>.';

map.spin(true);

map.addLayer(L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'))
	.setView([55, 50], 5);

map.attributionControl.setPrefix('');

L.spriteIcon = function(marker) {
	var color = '';
	switch (marker) {
		case 1:
			color = 'blue';
			break;
		case 2:
			color = 'purple';
			break;
		case 4:
			color = 'green';
			break;
		case 8:
			color = 'orange';
			break;
		case 16:
			color = 'yellow';
			break;
		case 32:
			color = 'red';
			break;
		default:
			break;
	}
	return L.icon({
		className: "leaflet-sprite leaflet-sprite-" + color,
		iconSize: [24, 41],
		shadowsize: [41, 41],
		iconAnchor: [12, 41],
		iconUrl: iframe ? '../assets/img/blank.png' : 'assets/img/blank.png',
		shadowUrl: L.Icon.Default.imagePath + "/marker-shadow.png"
	});
};

L.MarkerClusterGroup.include({
	filter: function (f) {
		f = f || function (m) { return true; }
		var markersArr = Array();
		geoJsonLayer.eachLayer(function(l){
			var a = l.feature;
			if (!f(a)) { return true; }
			var marker = L.marker(new L.LatLng(a.geometry.coordinates[1], a.geometry.coordinates[0]), {
				icon: new L.spriteIcon(a.properties.marker),
				properties: a.properties
			});
			markersArr.push(marker);
		});
		this.clearLayers();
		this.addLayers(markersArr);
	}
});

var markers = L.markerClusterGroup({
	showCoverageOnHover: false,
	iconCreateFunction: function(cluster) {
		var murkersOfCluster = cluster.getAllChildMarkers();
		var l0 = murkersOfCluster.length;
		var byteInt = 0;
		var byteInt0;
		for(var i=0;i<l0;i++){
			if(murkersOfCluster[i].feature){
				byteInt0 = murkersOfCluster[i].feature.properties.marker;
			}
			else{
				byteInt0 = murkersOfCluster[i].options.properties.marker;
			}
			byteInt = byteInt | byteInt0;
		}
		return new L.DivIcon({
			iconSize: [2*markerSize, 2*markerSize],
			iconAnchor: [markerSize, markerSize],
			className: "cluster",
			//html: '<div style="width:'+2*markerSize+'px;height:'+2*markerSize+'px;line-height:'+2*markerSize+'px;background-image:url(\''+iconsPath+byteIntToString(byteInt)+'.png\');">' + cluster.getChildCount() + '</div>'
			html: '<div style="width:'+2*markerSize+'px;height:'+2*markerSize+'px;line-height:'+2*markerSize+'px;background-image:url(\''+iconsPath+'clusters.png\');background-position:'+(-40*byteInt)+'px 0px;">' + cluster.getChildCount() + '</div>'
		});
	}
});
		
var legendposition = iframe ? 'bottomleft' : 'bottomright',
		legend = L.control({position:legendposition});

legend.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'legend');
	this._div.innerHTML = '<ul id="legend"> \
		<li><span class="red"></span> - деятельность НКО приостановлена</li> \
		<li><span class="violet"></span> - возбуждено административное дело</li> \
		<li><span class="orange"></span> - НКО получившие представления</li> \
		<li><span class="yellow"></span> - НКО получившие предостережения</li> \
		<li><span class="green"></span> - иные методы давления</li> \
		<li><span class="blue"></span> - нет информации</li> \
		</ul>';
	return this._div;
};

legend.addTo(map);
		
var ShareControl = L.Control.extend({
	options: {
  	position: iframe ? 'topleft' : 'bottomright',
  	embed: '',
    url: '',
    text: ''
	},
	initialize: function(_, options) {
		L.setOptions(this, options);
	},
	onAdd: function(map) {
		this._map = map;
		var container = L.DomUtil.create('div', 'leaflet-control-share leaflet-bar');
		var link = L.DomUtil.create('a', 'share icon icon-share', container);
		link.href = '#';
		L.DomEvent.addListener(link, 'click', this._shareClick, this);
		L.DomEvent.disableClickPropagation(container);
		this._map.on('mousedown', this._clickOut, this);
		return container;
	},
	_clickOut: function(e) {
		if (this._popup) {
			this._map.removeLayer(this._popup);
			this._popup = null;
			return;
		}
	},
	_shareClick: function(e) {
		L.DomEvent.stop(e);
		if (this._popup) return this._clickOut(e);
		var url = this.options.url || 'http://closedsociety.org',
				text = this.options.text || 'Monitor pressure on Russian NGOs',
				embed = this.options.embed || 'http://closedsociety.org/map',
				twitter = 'http://twitter.com/intent/tweet?status=' + encodeURIComponent(text + '\n' + url),
				facebook = 'https://www.facebook.com/sharer.php?u=' + encodeURIComponent(url) + '&t=' + encodeURIComponent(text),
				share = "<a class='leaflet-popup-close-button' href='#close'>×</a>" +
					"<h3>Поделиться этой картой</h3>" + "<div class='share-buttons'><a class='share-facebook icon icon-facebook' target='_blank' href='" + 
					facebook + "'>Facebook</a>" + "<a class='share-twitter icon icon-twitter' target='_blank' href='" + 
					twitter + "'>Twitter</a></div>" + "<h3>Получить embed код</h3>" + "<small>Скопирйте и вставьте этот HTML код на вашу страницу.</small>" +
          "<textarea rows=4>&lt;iframe width='700' height='500' allowfullscreen='true' frameBorder='0' src='" + embed + "'&gt;&lt;/iframe&gt;</textarea>";
		this._popup = L.marker(this._map.getCenter(), {
			zIndexOffset: 10000,
			icon: L.divIcon({
				className: 'share-popup',
				iconSize: L.point(360, 240),
				iconAnchor: L.point(180, 120),
				html: share
			})
    })
		.on('mousedown', function(e) {
			L.DomEvent.stopPropagation(e.originalEvent);
		})
		.on('click', clickPopup, this).addTo(this._map);
		function clickPopup(e) {
			if (e.originalEvent && e.originalEvent.target.nodeName === 'TEXTAREA') {
				var target = e.originalEvent.target;
				target.focus();
				target.select();
			} else if (e.originalEvent && e.originalEvent.target.getAttribute('href') === '#close') {
				this._clickOut(e);
			}
		}
	}
});

var share = new ShareControl();
share.addTo(map);

L.control.fullscreen({
	position: iframe ? 'topleft' : 'bottomright',
	title: 'Полноэкранная версия'
}).addTo(map);

new L.Control.Attribution({
	position: iframe ? 'bottomright' : 'bottomleft',
}).setPrefix('').addAttribution(attribution).addTo(map);

var info = L.control();

info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info');
	this.create();
	this.update();
	this._div.addEventListener('click',filter);
	return this._div;
};

info.create = function () {
	this._div.innerHTML = '<div id="filter-wrapper"> \
		<ul id="filter"> \
		<li data-filter="all" class="all active">Все проверки</li> \
		<li data-filter="Прокуратура">Прокуратура</li> \
		<li data-filter="Минюст">Минюст</li> \
		<li data-filter="МВД">МВД</li> \
		<li data-filter="МЧС">МЧС</li> \
		<li data-filter="ФМС">ФМС</li> \
		<li data-filter="ФНС">ФНС</li> \
		<li data-filter="ФСБ">ФСБ</li> \
		<li data-filter="ФТС">ФТС</li> \
		<li data-filter="Роскомнадзор">Роскомнадзор</li> \
		<li data-filter="Роспотребнадзор">Роспотребнадзор</li> \
		<li data-filter="ОБЭП">ОБЭП</li> \
		<li data-filter="ЦПЭ">ЦПЭ</li> \
		</ul> \
		</div> \
		<div id="info"> \
		</div>';
};

info.update = function (props) {
	this._div.childNodes.item(2).innerHTML = props ? 
	getValue(props.name,'name','str') + getValue(props.formatted_address,'address','str') + getValue(props.checkDate,'check-date','date','проверена ') + getValue(props.authorities,'authorities','arr','проверяющие органы: ') + getValue(props.sector,'sector','arr','деятельность: ') + getValue(props.currentCheckState,'state','state','текущий статус: <br />') + getValue(props.check,'more','link') 
  : 'Нажмите на маркер чтобы получить информацию об НКО';
};

info.addTo(map);

var geoJsonLayer = L.geoJson.ajax("http://api.closedsociety.org/api/geo/ncos",{dataType:"json"});
geoJsonLayer.on('data:loaded',handleGeoJSON);
		
markers.on('click',function(e) {
	info.update(e.layer.options.properties)
});

function handleGeoJSON() {
	markers.addLayer(geoJsonLayer);
	map.addLayer(markers);
	var el = document.getElementById("loader");
	el.parentNode.removeChild(el);
	markers.filter();
	map.spin(false);
}
		
function filter(e) {
	if (e.target.localName != "li" || e.target.className.indexOf('active') > -1) return false;
	L.DomUtil.removeClass(e.target.parentNode.getElementsByClassName('active')[0],'active');
	e.target.className += ' active';
	markers.filter(function(f){
		if(e.target.dataset.filter == 'all') {
			return true;
		} else {
			var authorities = f.properties.authorities;
		  if (authorities != null) {
		  	return authorities.indexOf(e.target.dataset.filter) > -1;
			} else {
		  	return false;
			}
		}
	});
}
		
function getValue(val,name,type,label) {
	label = label || '';
	if (val != null && val != '' && type == 'str') {
		return '<span class="' + name + '">' + val + '</span>';
	} else if (val > 0 && type == 'date') {
		var date = new Date(parseInt(val)*1000);
		return '<span class="date ' + name + '">' + label + dateFormat(date, 'DD.MM.YYYY') + '</span>';
	} else if (type == 'arr' && val != null) {
		var i = 0,
				output = '<span class="' + name + '">' + label + '</span><ul class="' + name + '">';
		for (i; i < val.length; i++) {
			output += '<li>' + val[i] + '</li>';
		}
		if (i > 0) {
			output += '</ul>';
			return output;
		} else {
			return '';
		}
	} else if (type == 'state' && val != null) {
		if (val.state != null && val.stateDate == null) {
			return '<span class="' + name + '">' + label + '<i>' + val.state + '</i></span>';
		} else if (val.state != null && val.stateDate > 0) {
			var date = new Date(parseInt(val.stateDate)*1000);
		  return '<span class="' + name + '">' + label + '<i>' + val.state + ' (' + dateFormat(date, 'DD.MM.YYYY') + ')</i></span>';
		} else {
			return '';
		}
	} else if (type == 'link' && val != null) {
		return iframe ? '<span class="' + name + '"><a href="http://closedsociety.org/data/checks/#' + val + '" target="_blank">подробнее -></a></span>' : '<span class="' + name + '"><a href="http://closedsociety.org/data/checks/#' + val + '">подробнее -></a></span>';
	} else {
		return '';
	}
}
		
function dateFormat(date, format) {
	format = format.replace("DD", (date.getDate() < 10 ? '0' : '') + date.getDate());
	format = format.replace("MM", (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1));
	format = format.replace("YYYY", date.getFullYear());
	return format;
}

function byteIntToString(byteInt){
	var str = "";
	for(var i=0;i<6;i++){
		str = (byteInt%2)+str;
		byteInt=(byteInt-byteInt%2)/2;
	}
	return str;
}
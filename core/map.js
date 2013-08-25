var map = L.map('map');
		map.spin(true);

map.addLayer(L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'))
	.setView([55, 50], 5);

map.attributionControl.setPrefix('').addAttribution('По данным <a href="http://closedsociety.org" target="_blank">closedsociety.org</a>.');

L.MarkerClusterGroup.include({
	filter: function (f) {
		f = f || function (m) { return true; }
		var markers = Array();
		geoJsonLayer.eachLayer(function(l){
			var a = l.feature;
			if (!f(a)) { return true; }
			var marker = L.marker(new L.LatLng(a.geometry.coordinates[1], a.geometry.coordinates[0]), {
				icon: new L.Icon.Default(),
				properties: a.properties
			});
			markers.push(marker);
		});
		this.clearLayers();
		this.addLayers(markers);
	}
});
var markers = L.markerClusterGroup();
		
L.control.fullscreen({
	position: 'topleft',
	title: 'Полноэкранная версия'
}).addTo(map);
			
var info = L.control();

info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
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
	getValue(props.name,'name','str') + getValue(props.formatted_address,'address','str') + getValue(props.checkDate,'check-date','date','проверена ') + getValue(props.sector,'sector','arr','деятельность: ') + getValue(props.currentCheckState,'state','state','текущий статус: <br />') 
  : 'Нажмите на маркер чтобы получить информацию об НКО';
};

info.addTo(map);

var geoJsonLayer = L.geoJson.ajax("http://closedsociety.org/api/geo/ncos",{dataType:"json"});
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
	} else if (type == 'arr') {
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
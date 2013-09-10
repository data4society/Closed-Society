;$.fn.eventCalendar = function(options){
	var eventsOpts = $.extend({}, $.fn.eventCalendar.defaults, options);
	var flags = {
		wrap: "",
		directionLeftMove: "300",
		eventsJson: {}
	}
	this.each(function(){
		flags.wrap = $(this);
		flags.wrap.addClass('eventCalendar-wrap').append("<div class='eventsCalendar-list-wrap'><p class='eventsCalendar-subtitle'></p><span class='eventsCalendar-loading'>загрузка...</span><div class='eventsCalendar-list-content'><ul class='eventsCalendar-list'></ul></div></div>");
		if (eventsOpts.eventsScrollable) {
			flags.wrap.find('.eventsCalendar-list-content').addClass('scrollable');
		}
		setCalendarWidth();
		$(window).resize(function(){
			setCalendarWidth();
		});
		dateSlider("current");
		getEvents(eventsOpts.eventsLimit,false,false,false,false);
		changeMonth();
		flags.wrap.on('click','.eventsCalendar-day a',function(e){
			e.preventDefault();
			var year = flags.wrap.attr('data-current-year'),
				month = flags.wrap.attr('data-current-month'),
				day = $(this).parent().attr('rel');
			getEvents(false, year, month,day, "day");
		});
		flags.wrap.on('click','.monthTitle', function(e){
			e.preventDefault();
			var year = flags.wrap.attr('data-current-year'),
				month = flags.wrap.attr('data-current-month');
			getEvents(eventsOpts.eventsLimit, year, month,false, "month");
		})
	});
	flags.wrap.find('.eventsCalendar-list').on('click','.eventTitle',function(e){
		if(!eventsOpts.showDescription) {
			e.preventDefault();
			var desc = $(this).parent().find('.eventDesc');
			if (!desc.find('a').size()) {
				var eventUrl = $(this).attr('href');
				var eventTarget = $(this).attr('target');
				desc.append('<a href="' + eventUrl + '" target="'+eventTarget+'" class="bt">'+eventsOpts.txt_GoToEventUrl+'</a>')
			}
			if (desc.is(':visible')) {
				desc.slideUp();
			} else {
				if(eventsOpts.onlyOneDescription) {
					flags.wrap.find('.eventDesc').slideUp();
				}
				desc.slideDown();
			}
		}
	});
	function sortJson(a, b){
		return a.date.toLowerCase() > b.date.toLowerCase() ? 1 : -1;
	};
	function dateSlider(show, year, month) {
		var $eventsCalendarSlider = $("<div class='eventsCalendar-slider'></div>"),
			$eventsCalendarMonthWrap = $("<div class='eventsCalendar-monthWrap'></div>"),
			$eventsCalendarTitle = $("<div class='eventsCalendar-currentTitle'><a href='#' class='monthTitle'></a></div>"),
			$eventsCalendarArrows = $("<a href='#' class='arrow prev'><span>" + eventsOpts.txt_prev + "</span></a><a href='#' class='arrow next'><span>" + eventsOpts.txt_next + "</span></a>");
			$eventsCalendarDaysList = $("<ul class='eventsCalendar-daysList'></ul>"),
			date = new Date();
		if (!flags.wrap.find('.eventsCalendar-slider').size()) {
			flags.wrap.prepend($eventsCalendarSlider);
			$eventsCalendarSlider.append($eventsCalendarMonthWrap);
		} else {
			flags.wrap.find('.eventsCalendar-slider').append($eventsCalendarMonthWrap);
		}
		flags.wrap.find('.eventsCalendar-monthWrap.currentMonth').removeClass('currentMonth').addClass('oldMonth');
		$eventsCalendarMonthWrap.addClass('currentMonth').append($eventsCalendarTitle, $eventsCalendarDaysList);
		if (show === "current") {
			day = date.getDate();
			$eventsCalendarSlider.append($eventsCalendarArrows);
		} else {
			date = new Date(flags.wrap.attr('data-current-year'),flags.wrap.attr('data-current-month'),1,0,0,0); // current visible month
			day = 0;
			moveOfMonth = 1;
			if (show === "prev") {
				moveOfMonth = -1;
			}
			date.setMonth( date.getMonth() + moveOfMonth );
			var tmpDate = new Date();
			if (date.getMonth() === tmpDate.getMonth()) {
				day = tmpDate.getDate();
			}
		}
		var year = date.getFullYear(), // year of the events
			currentYear = (new Date).getFullYear(), // current year
			month = date.getMonth(), // 0-11
			monthToShow = month + 1;
		if (show != "current") {
			getEvents(eventsOpts.eventsLimit, year, month,false, show);
		}
		flags.wrap.attr('data-current-month',month)
			.attr('data-current-year',year);
		$eventsCalendarTitle.find('.monthTitle').html(eventsOpts.monthNames[month] + " " + year);
		var daysOnTheMonth = 32 - new Date(year, month, 32).getDate();
		var daysList = [];
		if (eventsOpts.showDayAsWeeks) {
			$eventsCalendarDaysList.addClass('showAsWeek');
			if (eventsOpts.showDayNameInCalendar) {
				$eventsCalendarDaysList.addClass('showDayNames');
				var i = 0;
				if (eventsOpts.startWeekOnMonday) {
					i = 1;
				}
				for (; i < 7; i++) {
					daysList.push('<li class="eventsCalendar-day-header">'+eventsOpts.dayNamesShort[i]+'</li>');
					if (i === 6 && eventsOpts.startWeekOnMonday) {
						daysList.push('<li class="eventsCalendar-day-header">'+eventsOpts.dayNamesShort[0]+'</li>');
					}
				}
			}
			dt=new Date(year, month, 01);
			var weekDay = dt.getDay(); // day of the week where month starts
			if (eventsOpts.startWeekOnMonday) {
				weekDay = dt.getDay() - 1;
			}
			if (weekDay < 0) { weekDay = 6; } // if -1 is because day starts on sunday(0) and week starts on monday
			for (i = weekDay; i > 0; i--) {
				daysList.push('<li class="eventsCalendar-day empty"></li>');
			}
		}
		for (dayCount = 1; dayCount <= daysOnTheMonth; dayCount++) {
			var dayClass = "";
			if (day > 0 && dayCount === day && year === currentYear) {
				dayClass = "today";
			}
			daysList.push('<li id="dayList_' + dayCount + '" rel="'+dayCount+'" class="eventsCalendar-day '+dayClass+'"><a href="#">' + dayCount + '</a></li>');
		}
		$eventsCalendarDaysList.append(daysList.join(''));
		$eventsCalendarSlider.css('height',$eventsCalendarMonthWrap.height()+'px');
	}
	function num_abbrev_str(num) {
		var len = num.length, last_char = num.charAt(len - 1), abbrev
		if (len === 2 && num.charAt(0) === '1') {
			abbrev = 'th'
		} else {
			if (last_char === '1') {
				abbrev = 'st'
			} else if (last_char === '2') {
				abbrev = 'nd'
			} else if (last_char === '3') {
				abbrev = 'rd'
			} else {
				abbrev = 'th'
			}
		}
		return num + '-е';
	}
	function getEvents(limit, year, month, day, direction) {
		var limit = limit || 0;
		var year = year || '';
		var day = day || '';
		if (typeof month != 'undefined') {
			var month = month;
		} else {
			var month = '';
		}
		flags.wrap.find('.eventsCalendar-loading').fadeIn();
		if (eventsOpts.jsonData) {
			eventsOpts.cacheJson = true;
			flags.eventsJson = eventsOpts.jsonData;
			getEventsData(flags.eventsJson, limit, year, month, day, direction);
		} else if (!eventsOpts.cacheJson || !direction) {
			$.getJSON(eventsOpts.eventsjson + "?limit="+limit+"&year="+year+"&month="+month+"&day="+day, function(data) {
				flags.eventsJson = data;
				getEventsData(flags.eventsJson, limit, year, month, day, direction);
			}).error(function() {
				showError("произошла ошибка: ");
			});
		} else {
			getEventsData(flags.eventsJson, limit, year, month, day, direction);
		}
		if (day > '') {
			flags.wrap.find('.current').removeClass('current');
			flags.wrap.find('#dayList_'+day).addClass('current');
		}
	}
	function getEventsData(data, limit, year, month, day, direction){
		directionLeftMove = "-=" + flags.directionLeftMove;
		eventContentHeight = "auto";
		subtitle = flags.wrap.find('.eventsCalendar-list-wrap .eventsCalendar-subtitle')
		if (!direction) {
			// first load
			subtitle.html(eventsOpts.txt_NextEvents);
			eventContentHeight = "auto";
			directionLeftMove = "-=0";
		} else {
			if (day != '') {
				subtitle.html(eventsOpts.txt_SpecificEvents_prev + eventsOpts.monthNames[month] + " " + num_abbrev_str(day) + " " + eventsOpts.txt_SpecificEvents_after);
			} else {
				subtitle.html(eventsOpts.txt_SpecificEvents_prev + eventsOpts.monthNames[month] + " " + eventsOpts.txt_SpecificEvents_after);
			}
			if (direction === 'prev') {
				directionLeftMove = "+=" + flags.directionLeftMove;
			} else if (direction === 'day' || direction === 'month') {
				directionLeftMove = "+=0";
				eventContentHeight = 0;
			}
		}
		flags.wrap.find('.eventsCalendar-list').animate({
			opacity: eventsOpts.moveOpacity,
			left: directionLeftMove,
			height: eventContentHeight
		}, eventsOpts.moveSpeed, function() {
			flags.wrap.find('.eventsCalendar-list').css({'left':0, 'height': 'auto'}).hide();
			var events = [];
			data = $(data).sort(sortJson);
			if (data.length) {
				var eventDescClass = '';
				if(!eventsOpts.showDescription) {
					eventDescClass = 'hidden';
				}
				var eventLinkTarget = "_self";
				if(eventsOpts.openEventInNewWindow) {
					eventLinkTarget = '_target';
				}
				var i = 0;
				$.each(data, function(key, event) {
					if (eventsOpts.jsonDateFormat == 'human') {
						var eventDateTime = event.date.split(" "),
							eventDate = eventDateTime[0].split("-"),
							eventTime = eventDateTime[1].split(":"),
							eventYear = eventDate[0],
							eventMonth = parseInt(eventDate[1]) - 1,
							eventDay = parseInt(eventDate[2]),
							//eventMonthToShow = eventMonth,
							eventMonthToShow = parseInt(eventMonth) + 1,
							eventHour = eventTime[0],
							eventMinute = eventTime[1],
							eventSeconds = eventTime[2],
							eventDate = new Date(eventYear, eventMonth, eventDay, eventHour, eventMinute, eventSeconds);
					} else {
						var eventDate = new Date(parseInt(event.date)),
							eventYear = eventDate.getFullYear(),
							eventMonth = eventDate.getMonth(),
							eventDay = eventDate.getDate(),
							eventDayToShow = (eventDay < 10 ? '0' : '') + eventDay,
							eventMonthToShow = (eventMonth < 9 ? '0' : '') + (eventMonth + 1),
							eventHour = eventDate.getHours() == '00' ? '' : eventDate.getHours(),
							eventMinute = eventDate.getHours() == '00' ? '' : (eventDate.getMinutes()<10?'0':'') + eventDate.getMinutes(),
							eventTime = (eventHour != '') ? '<small>'+eventHour+':'+eventMinute+'</small>' : '';
					}
					if (parseInt(eventMinute) <= 9) {
						eventMinute = "0" + parseInt(eventMinute);
					}
					if (limit === 0 || limit > i) {
						if ((month === false || month == eventMonth)
								&& (day == '' || day == eventDay)
								&& (year == '' || year == eventYear) // get only events of current year
							) {
								if (month === false && eventDate < new Date()) {
								} else {
									eventStringDate = eventDayToShow + "." + eventMonthToShow + "." + eventYear;
									if (event.url) {
										var eventTitle = '<a href="'+event.url+'" target="' + eventLinkTarget + '" class="eventTitle">' + event.title + '</a>';
									} else {
										var eventTitle = '<span class="eventTitle">'+event.nco.value+'</span>';
									}
									if (event.address.court != '' && event.address.formatted_address != '') {
									  var court = '<span class="court">' + event.address.court + ' (<a href="https://www.google.ru/maps/preview#!q=' + encodeURIComponent(event.address.formatted_address) + '" target="_blank">' + event.address.formatted_address + '</a>)</span>';
									} else if (event.address.court != '' && event.address.formatted_address == '') {
										var court = '<span class="court">' + event.address.court + '</span>';
									} else {
										var court = '';
									}
									events.push('<li id="' + key + '" class="'+event.type+'"><time datetime="'+eventDate+'"><em>' + eventStringDate + '</em>' + eventTime + '</time>' + eventTitle + '<p class="eventDesc ' + eventDescClass + '">' + event.description + '</p>' + court + '</li>');
									i++;
								}
						}
					}
					if (eventYear == flags.wrap.attr('data-current-year') && eventMonth == flags.wrap.attr('data-current-month')) {
						flags.wrap.find('.currentMonth .eventsCalendar-daysList #dayList_' + parseInt(eventDay)).addClass('dayWithEvents');
					}
				});
			}
			if (!events.length) {
				events.push('<li class="eventsCalendar-noEvents"><p>' + eventsOpts.txt_noEvents + '</p></li>');
			}
			flags.wrap.find('.eventsCalendar-loading').hide();
			flags.wrap.find('.eventsCalendar-list')
				.html(events.join(''));
			flags.wrap.find('.eventsCalendar-list').animate({
				opacity: 1,
				height: "toggle"
			}, eventsOpts.moveSpeed);
		});
		setCalendarWidth();
	}
	function changeMonth() {
		flags.wrap.find('.arrow').click(function(e){
			e.preventDefault();
			if ($(this).hasClass('next')) {
				dateSlider("next");
				var lastMonthMove = '-=' + flags.directionLeftMove;

			} else {
				dateSlider("prev");
				var lastMonthMove = '+=' + flags.directionLeftMove;
			}
			flags.wrap.find('.eventsCalendar-monthWrap.oldMonth').animate({
				opacity: eventsOpts.moveOpacity,
				left: lastMonthMove
			}, eventsOpts.moveSpeed, function() {
				flags.wrap.find('.eventsCalendar-monthWrap.oldMonth').remove();
			});
		});
	}
	function showError(msg) {
		flags.wrap.find('.eventsCalendar-list-wrap').html("<span class='eventsCalendar-loading error'>"+msg+" " +eventsOpts.eventsjson+"</span>");
	}
	function setCalendarWidth(){
		flags.directionLeftMove = flags.wrap.width();
		flags.wrap.find('.eventsCalendar-monthWrap').width(flags.wrap.width() + 'px');
		flags.wrap.find('.eventsCalendar-list-wrap').width(flags.wrap.width() + 'px');
	}
};
$.fn.eventCalendar.defaults = {
  eventsjson: 'js/events.json',
	eventsLimit: 30,
	monthNames: [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь","Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ],
	dayNames: [ 'Воскресение','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота' ],
	dayNamesShort: [ 'Вс','Пн','Вт','Ср','Чт','Пт','Сб' ],
	txt_noEvents: "К сожалению, у нас нет информации о судах в этот период.",
	txt_SpecificEvents_prev: "",
	txt_SpecificEvents_after: ":",
	txt_next: "далее",
	txt_prev: "назад",
	txt_NextEvents: "Ближайшие суды:",
	txt_GoToEventUrl: "See the event",
	showDayAsWeeks: true,
	startWeekOnMonday: true,
	showDayNameInCalendar: true,
	showDescription: true,
	onlyOneDescription: true,
	openEventInNewWindow: false,
	eventsScrollable: false,
	jsonDateFormat: 'timestamp',
	moveSpeed: 500,
	moveOpacity: 0.15,
	jsonData: "",
	cacheJson: true
};
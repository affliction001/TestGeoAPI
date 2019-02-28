'use strict';
//55.796782, 49.099031

// Macros
const $ = selector => document.querySelector(selector);

let balloonLayout = '<div><h1>Balloon title</h1><p>Balloon description must be here...</p></div>';

function init() {
	let myMap = new ymaps.Map('map', {
		center: [55.796782, 49.099031],
		zoom: 15
	});

	function MyBehavior() {
		this.options = new ymaps.option.Manager();
		this.events = new ymaps.event.Manager();
	}

	MyBehavior.prototype = {
	    constructor: MyBehavior,
	    enable: function () {
	        this._parent.getMap().events.add('click', this._onClick, this);
	    },
	    disable: function () {
	        this._parent.getMap().events.remove('click', this._onClick, this);
	    },
	    setParent: function (parent) { this._parent = parent; },
	    getParent: function () { return this._parent; },
	    _onClick: function (e) {
	        var coords = e.get('coords');
	        // this._parent.getMap().setCenter(coords); //Сдвигает центр карты к месту клика.
	        console.log(coords);
	        createPlacemark(myMap, coords, balloonLayout);
	    }
	};

	ymaps.behavior.storage.add('mybehavior', MyBehavior);
	myMap.behaviors.enable('mybehavior');
}

function createPlacemark(map, coordinates, content) {
	let placemark = new ymaps.Placemark(coordinates, {
		balloonContent: content
	}, {
		preset: 'islands#yellowStretchyIcon',
		balloonCloseButton: true,
		hideIconOnBalloonOpen: false
	});

	map.geoObjects.add(placemark);
}
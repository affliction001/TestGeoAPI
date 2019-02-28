'use strict';
//55.796782, 49.099031

// Macros
const $ = selector => document.querySelector(selector);

ymaps.ready(init);

function init() {
	let myMap = new ymaps.Map('map', {
		center: [55.796782, 49.099031],
		zoom: 15
	});

	let placemark1 = new ymaps.Placemark([55.796782, 49.099031], {
		baloonContent: '<p>Центральный манеж</p>',
		iconContent: 'Манеж'
	}, {
		preset: 'islands#yellowStretchyIcon',
		baloonCloseButton: true,
		hideIconOnBaloonOpen: false
	});

	myMap.geoObjects.add(placemark1);
}
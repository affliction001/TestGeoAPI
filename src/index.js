'use strict';
//55.796782, 49.099031

ymaps.ready(init);

function init() {
	const placemarks = [];

	const map = new ymaps.Map('map', {
			center: [55.796782, 49.099031],
			zoom: 15,
			controls: ['zoomControl', 'fullscreenControl']
		});

	var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
            '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
            '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
    );

	const clusterer = new ymaps.Clusterer({
		preset: 'islands#invertedVioletClusterIcons',
		clusterDisableClickZoom: true,
		clusterBalloonContentLayout: 'cluster#balloonCarousel',
		clusterBalloonItemContentLayout: customItemContentLayout
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
	        let coords = e.get('coords');

	        placemarks.push(createPlacemark(coords));
		    clusterer.add(placemarks);
			map.geoObjects.add(clusterer);
	    }
	};

	function createPlacemark(coordinates) {
		let placemark = new ymaps.Placemark(coordinates, {
			balloonContentHeader: 'Header',
            balloonContentBody: 'Body',
            balloonContentFooter: 'Footer',
			iconContent: '1'
		}, {
			preset: 'islands#violetIcon',
			balloonCloseButton: true,
			hideIconOnBalloonOpen: false
		});

		return placemark;
	}

	ymaps.behavior.storage.add('mybehavior', MyBehavior);
	map.behaviors.enable('mybehavior');
}

/*
	Определение адреса клика на карте с помощью обратного геокодирования
*/
/*
ymaps.ready(init);

function init() {
    var myPlacemark,
        myMap = new ymaps.Map('map', {
            center: [55.753994, 37.622093],
            zoom: 9
        }, {
            searchControlProvider: 'yandex#search'
        });

    // Слушаем клик на карте.
    myMap.events.add('click', function (e) {
        var coords = e.get('coords');

        // Если метка уже создана – просто передвигаем ее.
        if (myPlacemark) {
            myPlacemark.geometry.setCoordinates(coords);
        }
        // Если нет – создаем.
        else {
            myPlacemark = createPlacemark(coords);
            myMap.geoObjects.add(myPlacemark);
            // Слушаем событие окончания перетаскивания на метке.
            myPlacemark.events.add('dragend', function () {
                getAddress(myPlacemark.geometry.getCoordinates());
            });
        }
        getAddress(coords);
    });

    // Создание метки.
    function createPlacemark(coords) {
        return new ymaps.Placemark(coords, {
            iconCaption: 'поиск...'
        }, {
            preset: 'islands#violetDotIconWithCaption',
            draggable: true
        });
    }

    // Определяем адрес по координатам (обратное геокодирование).
    function getAddress(coords) {
        myPlacemark.properties.set('iconCaption', 'поиск...');
        ymaps.geocode(coords).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);

            myPlacemark.properties
                .set({
                    // Формируем строку с данными об объекте.
                    iconCaption: [
                        // Название населенного пункта или вышестоящее административно-территориальное образование.
                        firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
                        // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
                        firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                    ].filter(Boolean).join(', '),
                    // В качестве контента балуна задаем строку с адресом объекта.
                    balloonContent: firstGeoObject.getAddressLine()
                });
        });
    }
}
*/
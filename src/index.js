'use strict';

const $ = selector => document.querySelector(selector);

ymaps.ready(init);

function init() {
    const myMap = new ymaps.Map('map', {
        center: [66.489430, 25.684199],
        zoom: 15,
        controls: ['zoomControl', 'fullscreenControl']
    });

    const clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        clusterDisableClickZoom: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel'
    });

    const getPosition = async function(e) {
        const coords = e.get("coords");
        const geocode = await ymaps.geocode(coords);
        const address = geocode.geoObjects.get(0).properties.get("name");

        return {
            coords,
            address
        };
    }

    const createPlacemark = function(pos) {
        const placemark = new ymaps.Placemark(pos.coords, {
            balloonContentHeader: `<h3>${pos.address}</h3>`,
            balloonContentBody: `<p>Здесь должно быть поле с отзывами.</p>`,
            balloonContentFooter: `<p>Сюда можно засунуть форму для добавления отзывов.</p>`
        }, {
            preset: 'islands#violetIcon',
            hideIconOnBalloonOpen: false,
            balloonPanelMaxMapArea: 0
        });

        clusterer.add(placemark);
        myMap.geoObjects.add(clusterer);
    }

    myMap.events.add("click", async e => {
        const position = await getPosition(e);

        $('.review-window').style.display = 'block';
        $('.review-window').dataset.coords = position.coords;
        $('.address').innerText = position.address;

        const timer = $('.form-button').addEventListener('click', event => {
            const review = {
                name: $('.form-name').value,
                place: $('.form-place').value,
                text: $('.form-review').value,
                date: new Date().toLocaleString().replace(',', '')
            };

            if (localStorage[position.coords]) {
                const r = JSON.parse(localStorage[position.coords]);
                r.push(review);
                localStorage[position.coords] = JSON.stringify(r);
            } else {
                localStorage[position.coords] = JSON.stringify([review]);
            }

            createPlacemark(position);
        });
    });
}

/************************************************************************************/
/*
class Map {
  initMap(settings) {
    return new Promise((resolve, reject) => ymaps.ready(resolve)).then(() => {
      this.map = new ymaps.Map("map", settings);
      this.cluster = new ymaps.Clusterer({
        preset: "islands#invertedVioletClusterIcons",
        clusterDisableClickZoom: true,
        clusterBalloonContentLayout: "cluster#balloonCarousel"
      });
      return this.map;
    });
  }
  async getMapPosition(e) {
    const coords = e.get("coords");
    const geocode = await ymaps.geocode(coords);
    const address = geocode.geoObjects.get(0).properties.get("text");

    return {
      coords,
      address
    };
  }
};

class Controller {
  constructor() {
    this.myApiMap = new Map();

    this.init();
  }

  async init() {
    this.yandexApi = await this.myApiMap.initMap({
      center: [59.945, 30.264],
      zoom: 15,
      controls: ["zoomControl", "fullscreenControl"]
    });
    this.yandexApi.events.add("click", async e => {
      this.position = await this.myApiMap.getMapPosition(e);
    });
  }
}
*/

/***************************************************************************************/

/*
const $ = s => document.querySelector(s);

ymaps.ready(init);

const reviews = {};

function init() {
    const placemarks = [];

    const map = new ymaps.Map('map', {
            center: [66.489430, 25.684199],
            zoom: 15,
            controls: ['zoomControl', 'fullscreenControl']
        });

    let clustererBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            '<div>Тут еще будет головоломка.</div>'
        );

    const clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        clusterDisableClickZoom: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: clustererBalloonContentLayout
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

            ymaps.geocode(coords).then(res => {
                const address = res.geoObjects.get(0) ?
                    res.geoObjects.get(0).properties.get('name') :
                    'Не удалось определить адресс';

                let placemark = new ymaps.Placemark(coords, {
                    balloonContent: setBalloonContent(coords, address),
                    iconContent: ''
                }, {
                    preset: 'islands#violetIcon',
                    balloonCloseButton: true,
                    hideIconOnBalloonOpen: false,
                    balloonPanelMaxMapArea: 0
                });

                placemark.events.add('balloonopen', event => {
                    const coordinates = event.originalEvent.currentTarget.geometry._coordinates;
                    const reviewsStr = reviews.hasOwnProperty(coordinates) ?
                        reviews[coordinates].reduce((prev, current) => prev + current) : 'Отзывов пока нет';

                    placemark.properties.set('balloonContent', setBalloonContent(coords, address, reviewsStr));
                });

                placemark.events.add('balloonclose', event => {
                    placemark.properties.set('iconContent', reviews.hasOwnProperty(coords) ? reviews[coords].length : '');
                });

                placemarks.push(placemark);
                clusterer.add(placemarks);
                map.geoObjects.add(clusterer);
                placemark.balloon.open();
            });
        }
    };

    ymaps.behavior.storage.add('mybehavior', MyBehavior);
    map.behaviors.enable('mybehavior');
}

function addReview() {
    const date = new Date().toLocaleString().replace(',', '');
    const review = `<p><b>${$('.form-name').value}</b> ${$('.form-place').value} ${date}</p>` +
       `<p>${$('.form-impressions').value}</p>`;

    $('.balloon-reviews').innerHTML += review;
    $('.form-name').value = '';
    $('.form-place').value = '';
    $('.form-impressions').value = '';

    Array.isArray(reviews[$('.balloon-container').dataset.coordinates]) ?
        reviews[$('.balloon-container').dataset.coordinates].push(review) :
        reviews[$('.balloon-container').dataset.coordinates] = [review];
}

function setBalloonContent(coordinates, address='Не удалось узнать адресс.', reviews='') {
    return `<div class="balloon-container" data-coordinates=${coordinates}>` +
                `<div class="balloon-header">${address}</div>` +
                `<div class="balloon-reviews">${reviews}</div>` +
                `<div class="balloon-form` +
                    `<div class="form-title">ВАШ ОТЗЫВ</div>` +
                    `<input class="form-name" type="text" placeholder="Ваше имя">` +
                    `<input class="form-place" type="text" placeholder="Укажите место">` +
                    `<input class="form-impressions" type="text" placeholder="Поделитесь впечатлениями">` +
                    `<input class="form-button" type="button" value="Добавить" onclick="addReview()">` +
                `</div>` +
            `</div>`;
}
*/

'use strict';

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
                    iconContent: '1'
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

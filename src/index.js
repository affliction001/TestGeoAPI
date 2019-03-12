'use strict';

const $ = s => document.querySelector(s);

ymaps.ready(init);

let balloon = '<div class="balloon-container">' +
    '<div class="balloon-header"></div>' +
    '<div class="balloon-reviews"></div>' +
    '<div class="balloon-form' +
        '<div class="form-title">ВАШ ОТЗЫВ</div>' +
        '<input class="form-name" type="text" placeholder="Ваше имя">' +
        '<input class="form-place" type="text" placeholder="Укажите место">' +
        '<input class="form-impressions" type="text" placeholder="Поделитесь впечатлениями">' +
        '<input class="form-button" type="button" value="Добавить" onclick="addReview()">' +
    '</div>' +
'</div>';

function init() {
    const placemarks = [];

    const map = new ymaps.Map('map', {
            center: [55.796782, 49.099031],
            zoom: 15,
            controls: ['zoomControl', 'fullscreenControl']
        });

    let clustererBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            '<div>Здесь тоже какая то хуйня</div>'
        );

    let BalloonContentLayout = ymaps.templateLayoutFactory.createClass('<div>Да блять пиздец сука полный</div>');

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
                    balloonContent: BalloonContentLayout,
                    iconContent: '1'
                }, {
                    preset: 'islands#violetIcon',
                    balloonCloseButton: true,
                    hideIconOnBalloonOpen: false,
                    balloonPanelMaxMapArea: 0
                });

                // placemark.properties.set('balloonContent', BalloonContentLayout);
                placemarks.push(placemark);
                clusterer.add(placemarks);
                map.geoObjects.add(clusterer);
                placemark.balloon.open();
            });
        }
    };

    // function createPlacemark(coordinates, address, reviews) {
    //     let placemark = new ymaps.Placemark(coordinates, {
    //         balloonContent: BalloonContentLayout,
    //         iconContent: '1'
    //     }, {
    //         preset: 'islands#violetIcon',
    //         balloonCloseButton: true,
    //         hideIconOnBalloonOpen: false,
    //         balloonPanelMaxMapArea: 0
    //     });

    //     return placemark;
    // }

    ymaps.behavior.storage.add('mybehavior', MyBehavior);
    map.behaviors.enable('mybehavior');
}

// function addReview() {
//     const date = new Date().toLocaleString();

//     $('.balloon-reviews').innerHTML = `<p><b>${$('.form-name').value}</b> ${$('.form-place').value} ${date}</p>` +
//         `<p>${$('.form-impressions').value}</p>`;
// }

// function setBalloonContent(address="", reviews="Отзывов пока нет...") {
//     return `<div class="balloon-container">` +
//                 `<div class="balloon-header">${address}</div>` +
//                 `<div class="balloon-reviews">${reviews}</div>` +
//                 `<div class="balloon-form` +
//                     `<div class="form-title">ВАШ ОТЗЫВ</div>` +
//                     `<input class="form-name" type="text" placeholder="Ваше имя">` +
//                     `<input class="form-place" type="text" placeholder="Укажите место">` +
//                     `<input class="form-impressions" type="text" placeholder="Поделитесь впечатлениями">` +
//                     `<input class="form-button" type="button" value="Добавить" onclick="addReview()">` +
//                 `</div>` +
//             `</div>`;
// }


/*
    Настройка макета балуна метки
*/
/*
        counter = 0,

        // Создание макета содержимого балуна.
        // Макет создается с помощью фабрики макетов с помощью текстового шаблона.
        BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            '<div style="margin: 10px;">' +
                '<b>{{properties.name}}</b><br />' +
                '<i id="count"></i> ' +
                '<button id="counter-button"> +1 </button>' +
            '</div>', {

            // Переопределяем функцию build, чтобы при создании макета начинать
            // слушать событие click на кнопке-счетчике.
            build: function () {
                // Сначала вызываем метод build родительского класса.
                BalloonContentLayout.superclass.build.call(this);
                // А затем выполняем дополнительные действия.
                $('#counter-button').bind('click', this.onCounterClick);
                $('#count').html(counter);
            },

            // Аналогично переопределяем функцию clear, чтобы снять
            // прослушивание клика при удалении макета с карты.
            clear: function () {
                // Выполняем действия в обратном порядке - сначала снимаем слушателя,
                // а потом вызываем метод clear родительского класса.
                $('#counter-button').unbind('click', this.onCounterClick);
                BalloonContentLayout.superclass.clear.call(this);
            },

            onCounterClick: function () {
                $('#count').html(++counter);
                if (counter == 5) {
                    alert('Вы славно потрудились.');
                    counter = 0;
                    $('#count').html(counter);
                }
            }
        });

    var placemark = new ymaps.Placemark([55.650625, 37.62708], {
            name: 'Считаем'
        }, {
            balloonContentLayout: BalloonContentLayout,
            // Запретим замену обычного балуна на балун-панель.
            // Если не указывать эту опцию, на картах маленького размера откроется балун-панель.
            balloonPanelMaxMapArea: 0
        });

    map.geoObjects.add(placemark);
}
*/
'use strict';

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

    const MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="myBalloon">' +
            '<div class="arrow"></div>' +
            '<div>$[[options.contentLayout observeSize]]</div>' +
        '</div>', {
                build: function () {
                    this.constructor.superclass.build.call(this);
                    this._$element = $('.myBalloon', this.getParentElement());
                    this.applyElementOffset();
                    this._$element.find('.close').on('click', $.proxy(this.onCloseClick, this));
                },
                clear: function () {
                    this._$element.find('.close').off('click');
                    this.constructor.superclass.clear.call(this);
                },
                onSublayoutSizeChange: function () {
                    MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

                    if(!this._isElement(this._$element)) {
                        return;
                    }

                    this.applyElementOffset();
                    this.events.fire('shapechange');
                },
                applyElementOffset: function () {
                    this._$element.css({
                        left: 0,
                        top: -30
                    });
                },
                onCloseClick: function (e) {
                    e.preventDefault();
                    this.events.fire('userclose');
                },
                getShape: function () {
                    if(!this._isElement(this._$element)) {
                        return MyBalloonLayout.superclass.getShape.call(this);
                    }

                    let position = this._$element.position();

                    return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                        [position.left, position.top], [
                            position.left + this._$element[0].offsetWidth,
                            position.top + this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight
                        ]
                    ]));
                },
                _isElement: function (element) {
                    return element && element[0] && element.find('.arrow')[0];
                }
            }
        );

    const MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
        '<div>$[properties.balloonHeader]</div>' +
        '<div>$[properties.balloonContent]</div>' +
        '<div>$[properties.balloonFooter]</div>'
    );

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
        const myPlacemark = new ymaps.Placemark(pos.coords, {
            balloonHeader: setHeaderContent(pos.address),
            balloonContent: setContent(pos.coords),
            balloonFooter: `<form class="balloon-form" data-coords="${pos.coords}">` +
                                '<p class="form-title">ВАШ ОТЗЫВ</p>' +
                                '<input class="form-name" type="text" placeholder="Ваше имя">' +
                                '<input class="form-place" type="text" placeholder="Укажите место">' +
                                '<textarea class="form-review"></textarea>' +
                                '<input class="form-button" type="button" value="Добавить" onClick="addReview()">' +
                            '</form>'
        }, {
            preset: 'islands#violetIcon',
            hideIconOnBalloonOpen: true,
            balloonShadow: false,
            balloonLayout: MyBalloonLayout,
            balloonContentLayout: MyBalloonContentLayout,
            balloonPanelMaxMapArea: 0
        });

        myPlacemark.events.add('balloonopen', e => {
            myPlacemark.properties.set('balloonContent', setContent(pos.coords));
        });

        clusterer.add(myPlacemark);
        myMap.geoObjects.add(clusterer);
        myPlacemark.balloon.open();
    }

    myMap.events.add("click", async e => {
        const position = await getPosition(e);

        createPlacemark(position);
    });
}

function addReview() {
    const coords = document.querySelector('.balloon-form').dataset.coords;
    const review = {
        name: document.querySelector('.form-name').value,
        place: document.querySelector('.form-place').value,
        text: document.querySelector('.form-review').value,
        date: new Date().toLocaleString().replace(',', '')
    }

    if (localStorage[coords]) {
        const r = JSON.parse(localStorage[coords]);
        r.push(review);
        localStorage[coords] = JSON.stringify(r);
    } else {
        localStorage[coords] = JSON.stringify([review]);
    }

    document.querySelector('.balloon-reviews').innerHTML = setContent(coords);
}

function setHeaderContent(address) {
    return `<header class="balloon-header">` +
                `<div class="geo-logo"></div>` +
                `<div class="address">${address}</div>` +
                `<a class="close" href="#">X</a>` +
            `</header>`;
}

function setContent(coords) {
    const reviews = localStorage[coords] ?
        JSON.parse(localStorage[coords]) : 'Отзывов пока нет...';

    let rev = '';

    if (typeof reviews === 'string') {
        rev = reviews;
    } else {
        reviews.forEach(review => {
            rev +=  `<div>` +
                        `<p><b>${review.name}</b> ${review.place} ${review.date}</p>` +
                        `<p>${review.text}</p>` +
                    `</div>`;
        });
    }

    return `<div class="balloon-reviews">${rev}</div>`;
}

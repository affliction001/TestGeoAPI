'use strict';

// const $ = selector => document.querySelector(selector);

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

    // Создание вложенного макета содержимого балуна.
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
        const myPlacemark = window.myPlacemark = new ymaps.Placemark(pos.coords, {
            balloonHeader: '<a class="close" href="#">X</a>',
            balloonContent: 'Контент балуна',
            balloonFooter: 'Футер балуна'
        }, {
            preset: 'islands#violetIcon',
            hideIconOnBalloonOpen: true,
            balloonShadow: false,
            balloonLayout: MyBalloonLayout,
            balloonContentLayout: MyBalloonContentLayout,
            balloonPanelMaxMapArea: 0
        });

        clusterer.add(myPlacemark);
        myMap.geoObjects.add(clusterer);
    }

    myMap.events.add("click", async e => {
        const position = await getPosition(e);

        // $('.review-window').style.display = 'block';
        // $('.review-window').dataset.coords = position.coords;
        // $('.address').innerText = position.address;
        //
        // const timer = $('.form-button').addEventListener('click', event => {
        //     const review = {
        //         name: $('.form-name').value,
        //         place: $('.form-place').value,
        //         text: $('.form-review').value,
        //         date: new Date().toLocaleString().replace(',', '')
        //     };
        //
        //     if (localStorage[position.coords]) {
        //         const r = JSON.parse(localStorage[position.coords]);
        //         r.push(review);
        //         localStorage[position.coords] = JSON.stringify(r);
        //     } else {
        //         localStorage[position.coords] = JSON.stringify([review]);
        //     }
        //
        //     createPlacemark(position);
        // });

        createPlacemark(position);
    });
}

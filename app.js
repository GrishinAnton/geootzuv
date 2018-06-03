let myMap;
let myPlacemark;

// Дождёмся загрузки API и готовности DOM.
ymaps.ready(init);

function init () {
    myMap = new ymaps.Map('map', {
        center: [55.76, 37.64], 
        zoom: 10
    }, {
        searchControlProvider: 'yandex#search'
    });

    // Слушаем клик на карте.
    myMap.events.add('click', function (e) {
        var coords = e.get('coords');
        console.log(e.get('position'))
        console.log(e.get('domEvent').get('pageX'))
        creatBallon()

        myMap.balloon.open(coords, {
            contentHeader:'Событие!',
            contentBody:'<p>Кто-то щелкнул по карте.</p>' +
                '<p>Координаты щелчка: ' + [
                coords[0].toPrecision(6),
                coords[1].toPrecision(6)
                ].join(', ') + '</p>',
            contentFooter:'<sup>Щелкните еще раз</sup>'
        });

        // myPlacemark = createPlacemark(coords);
        // myMap.geoObjects.add(myPlacemark);
        // // Слушаем событие окончания перетаскивания на метке.
        // myPlacemark.events.add('dragend', function () {
        //     getAddress(myPlacemark.geometry.getCoordinates());
        // });
        
        // getAddress(coords);
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

function creatBallon() {
    console.log("++++");
               
}
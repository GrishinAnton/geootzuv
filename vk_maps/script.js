function vkApi(method, options) {
    if (!options.v) {
        options.v = '5.68';
    }

    return new Promise((resolve, reject) => {
        VK.api(method, options, data => {
            if (data.error) {
                reject(new Error(data.error.error_msg));
            } else {
                resolve(data.response);
            }
        });
    });
}

function vkInit() {
    return new Promise((resolve, reject) => {
        VK.init({
            apiId: 5267932
        });

        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 2);
    });
}

const cache = new Map();

function geocode(address) {
    if (cache.has(address)) {
        return Promise.resolve(cache.get(address));
    }

    return ymaps.geocode(address)
        .then(result => {
            const points = result.geoObjects.toArray();

            if (points.length) {
                const coors = points[0].geometry.getCoordinates();
                cache.set(address, coors);
                return coors;
            }
        });
}

let myMap;
let clusterer;

new Promise(resolve => ymaps.ready(resolve)) // ждем загрузку карты
    .then(() => vkInit()) // авторизация источника данных
    .then(() => vkApi('friends.get', { fields: 'city,country' })) // получаем список записей
    .then(friends => {
        console.log(friends)
        myMap = new ymaps.Map('map', {
            center: [55.76, 37.64], // Москва
            zoom: 5
        }, {
            searchControlProvider: 'yandex#search'
        });
        clusterer = new ymaps.Clusterer({
            preset: 'islands#invertedVioletClusterIcons',
            clusterDisableClickZoom: true,
            openBalloonOnClick: false
        });

        myMap.geoObjects.add(clusterer);

        return friends.items;
    }) // инициализация карты
    .then(friends => {
        const promises = friends
            .filter(friend => friend.country && friend.country.title)
            .map(friend => {
                let parts = friend.country.title;

                if (friend.city) {
                    parts += ' ' + friend.city.title;
                }

                return parts;
            })
            .map(geocode);

        return Promise.all(promises);
    }) // получение адресов и координат
    .then(coords => {
        const placemarks = coords.map(coord => {
            return new ymaps.Placemark(coord, {}, { preset: 'islands#blueHomeCircleIcon' })
        });

        clusterer.add(placemarks);
    }) // добавляем гео-объекты на карту
    .catch(e => alert('Ошибка: ' + e.message));

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
        var position = e.get('position');

        baseInformation(coords, position)

        // myMap.balloon.open(coords, {
        //     contentHeader:'Событие!',
        //     contentBody:'<p>Кто-то щелкнул по карте.</p>' +
        //         '<p>Координаты щелчка: ' + [
        //         coords[0].toPrecision(6),
        //         coords[1].toPrecision(6)
        //         ].join(', ') + '</p>',
        //     contentFooter:'<sup>Щелкните еще раз</sup>'
        // });

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
}

let information = {}

function baseInformation(coords, position) {
    geocode(coords)
    information[`${coords[0]}-${coords[1]}`] = {}
    information[`${coords[0]}-${coords[1]}`].position = position;    
} 

function geocode(coords) {
    ymaps.geocode(coords).then(res => {
        var firstGeoObject = res.geoObjects.get(0);
        information[`${coords[0]}-${coords[1]}`].address = firstGeoObject.getAddressLine();
        creatBallon(coords);
    })
}

function creatBallon(coords) {

    const wrapper = document.querySelector('.review-elem');


    wrapper.style.top = information[`${coords[0]}-${coords[1]}`].position[1] + 'px';
    wrapper.style.left = information[`${coords[0]}-${coords[1]}`].position[0] + 'px';
    wrapper.style.zIndex = '1';
    
    var item = information[`${coords[0]}-${coords[1]}`];
    
    wrapper.innerHTML = 
    `
    <div class="review">

        <div class="review-header">
            <div class="address">
                <p>${information[`${coords[0]}-${coords[1]}`].address}</p>
            </div>
            <button>x</button>
        </div>

        <div class="review-wrapper">

            <div class="review-body"></div>
        
            <div class="review-review">
                <p>Ваш отзыв</p>
                <div class="review-form">
                    <input class="review_name" type="text" placeholder="Ваше имя">
                    <input class="review_place" type="text" placeholder="Укажите место">
                    <textarea class="review_comment" placeholder="Поделитесь впечатлением"></textarea>
                </div>
            </div>
        
            <div class="review-footer">
                <button>Добавить</button>
            </div>
            
        </div>   
        
    </div>`;
    
    onButtonChange(coords);
               
}

function updateReview(coords) {
    var reviewBodyElem = document.querySelector('.review-body');
    var item = information[`${coords[0]}-${coords[1]}`];

    reviewBodyElem.innerHTML = '';

    for(let review of item.review ){
        var elem = document.createElement('div');
        elem.classList.add('.review-item');
        var item = `<p><span class="review-item_name"><b>${review.name}</b></span><span class="review-item_place">${review.place}</span><span class="review-item_date">10.10</span></p>
                        <p class="review-item_review">${review.comment}</p>
                    `;
        elem.innerHTML = item;
        reviewBodyElem.appendChild(elem);
    }
}

function onButtonChange(coords){
    var reviewElem = document.querySelector('.review-elem');
    var buttonAdd = document.querySelector('.review-footer button');
    var buttonClose = document.querySelector('.review-header button');
    var nameElem = document.querySelector('.review_name');
    var placeElem = document.querySelector('.review_place');
    var commentElem = document.querySelector('.review_comment');
    var arr = [];

    buttonAdd.addEventListener('click', function(){

        var item = information[`${coords[0]}-${coords[1]}`];
        var reviews = {}
        
        reviews.name = nameElem.value;
        reviews.place = placeElem.value;
        reviews.comment = commentElem.value;
        arr.push(reviews);

        item.review = arr;

        updateReview(coords);
    })

    buttonClose.addEventListener('click', function(){
        reviewElem.innerHTML = '';
    })
}
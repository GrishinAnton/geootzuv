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

        baseInformation(coords, position);
        clusterer.balloon.close();
    });  

    var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
            '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
            '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
    );
    
    clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        clusterDisableClickZoom: true,
        openBalloonOnClick: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel', 
        clusterBalloonItemContentLayout: customItemContentLayout
    });

    
}

let information = {};


//наполнение массива информацией
function baseInformation(coords, position) {
    geocode(coords);
    information[`${coords[0]}-${coords[1]}`] = {};
    information[`${coords[0]}-${coords[1]}`].position = position;    
} 


//получение адреса
function geocode(coords) {
    ymaps.geocode(coords).then(res => {
        var firstGeoObject = res.geoObjects.get(0);
        information[`${coords[0]}-${coords[1]}`].address = firstGeoObject.getAddressLine();
        creatBallon(coords);
    });
}


//создание основного блока
function creatBallon(coords) {

    let wrapper = document.querySelector('.review-elem');
    let item = information[`${coords[0]}-${coords[1]}`];


    wrapper.style.top = item.position[1] + 'px';
    wrapper.style.left = item.position[0] + 'px';
    wrapper.style.zIndex = '1';
    
    
    
    wrapper.innerHTML = 
    `
    <div class="review">

        <div class="review-header">
            <div class="address">
                <p>${item.address}</p>
            </div>
            <button>x</button>
        </div>

        <div class="review-wrapper">

            <div class="review-body">
                <span>Отзывов пока нет</span>
            </div>
        
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
    updateReview(coords);               
}


//обработка блока с отзывами
function updateReview(coords) {
    let reviewBodyElem = document.querySelector('.review-body');
    let item = information[`${coords[0]}-${coords[1]}`];
    
    if (item.reviews){
       
        reviewBodyElem.innerHTML = '';

        for (let review of item.reviews) {
            let elem = document.createElement('div');
            elem.classList.add('.review-item');
            let item = `<p><span class="review-item_name"><b>${review.name}</b></span><span class="review-item_place">${review.place}</span><span class="review-item_date">${review.date}</span></p>
                        <p class="review-item_review">${review.comment}</p>
                    `;
            elem.innerHTML = item;
            reviewBodyElem.appendChild(elem);
        }
    }
}


//Обработка кнопки Добавить
function onButtonChange(coords){
    let reviewElem = document.querySelector('.review-elem');
    let buttonAdd = document.querySelector('.review-footer button');
    let buttonClose = document.querySelector('.review-header button');
    let nameElem = document.querySelector('.review_name');
    let placeElem = document.querySelector('.review_place');
    let commentElem = document.querySelector('.review_comment');
    let item = information[`${coords[0]}-${coords[1]}`];
    let date = new Date().toLocaleString();
    let arr = item.reviews || [];

    buttonAdd.addEventListener('click', function(){

        if (nameElem.value.length == 0 || placeElem.value.length == 0 || commentElem.value.length == 0){
           
            return false
        }
        
        let review = {};
        
        review.name = nameElem.value;
        review.place = placeElem.value;
        review.comment = commentElem.value;
        review.date = date;
        arr.push(review);

        item.reviews = arr;

        updateReview(coords);
        createPlacemark(coords);

        nameElem.value = '';
        placeElem.value = '';
        commentElem.value = '';
    });

    buttonClose.addEventListener('click', function(){
        reviewElem.innerHTML = '';
    });
}

//Создание метки
function createPlacemark(coords) {
    let item = information[`${coords[0]}-${coords[1]}`];    
    let dataCoords = `${coords[0]}-${coords[1]}`;
    
    let placeMarkData = {
        balloonContentHeader: `${item.reviews[0].name}`,        
        balloonContentBody:  `<a href="#" class="clusters-link" data-coords="${dataCoords}">${item.address}</a>${item.reviews[0].comment}`,
        balloonContentFooter: `${item.reviews[0].date}`
    };    

    let options = {
        openBalloonOnClick: false
    };

    let myPlacemark = new ymaps.Placemark(coords, placeMarkData, options);

    myMap.geoObjects.add(myPlacemark);

    myPlacemark.events.add('click', function(){
        creatBallon(coords);
    });

    createCluster(myPlacemark);
}

//Добавление метки в кластер
function createCluster(placemarks) {  

    clusterer.add(placemarks);
    myMap.geoObjects.add(clusterer);
}

//Слушаем клик по адресу в карусели кластера
document.addEventListener('click', (e) => {
    e.preventDefault();

    if (e.target.className == 'clusters-link') {

        let coords = e.target.dataset.coords.split('-');
        
        clusterer.balloon.close();
        creatBallon(coords);
    }    
});
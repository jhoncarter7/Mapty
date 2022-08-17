'use strict'


const inputContainer = document.querySelector('.input-container');
const inputType = document.querySelector('.form-input-type');
const formDistance = document.querySelector('.form_distance');
const formDuration = document.querySelector('.form_Duration');
const formcondence = document.querySelector('.form_condence');
const formElev = document.querySelector('.form_Elev');

let map, mapEvent;

navigator.geolocation.getCurrentPosition(function (position) {
    const { latitude } = position.coords
    const { longitude } = position.coords
    const coords = [latitude, longitude]

    map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    map.on('click', function (mapE) {
        mapEvent = mapE;
        inputContainer.classList.remove('hidden')
        formDistance.focus()



    })


}, function () {
    alert('we cant access  your loction')
})

inputContainer.addEventListener('submit', function (e) {
    e.preventDefault()
    formDistance.value = formcondence.value = formDuration.value = formElev.value = '';
    console.log(mapEvent);
    const { lat, lng } = mapEvent.latlng;
    L.marker([lat, lng])
        .addTo(map)
        .bindPopup(L.popup({
            maxWidth: 200,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup'
        }))
        .setPopupContent("Workouts")
        .openPopup();
})

inputType.addEventListener('change', function(){
    formcondence.closest('.form-row').classList.toggle('hidden')
    formElev.closest('.form-row').classList.toggle('hidden')
})
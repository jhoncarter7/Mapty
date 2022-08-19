'use strict'

const workoutsmain = document.querySelector('.workouts-main');
const inputContainer = document.querySelector('.input-container');
const inputType = document.querySelector('.form-input-type');
const formDistance = document.querySelector('.form_distance');
const formDuration = document.querySelector('.form_Duration');
const formcondence = document.querySelector('.form_condence');
const formElev = document.querySelector('.form_Elev');



class Workout {
    date = new Date()
    id = (Date.now() + "").slice(-10);
    clicks = 0;
    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;


    }
    _setDiscription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.discription = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
    
click(){
    this.clicks++;
}

}


class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace()
        this._setDiscription()
    }

    calcPace() {
        this.pace = this.duration / this.distance
    }

}


class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevation) {
        super(coords, distance, duration);
        this.elevation = elevation;
        this.calcSpeed()
        this._setDiscription()
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
    }

}



class App {
    #map;
    #mapEvent
    #workouts = []
    constructor() {
        this._getPosition();
        this._getLocalStorage()
       
        inputContainer.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
        workoutsmain.addEventListener('click', this._moveToPopup.bind(this))
    }

    _getPosition() {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert('we cant access  your loction')
            })
    }

    _loadMap(position) {
        const { latitude } = position.coords
        const { longitude } = position.coords
        const coords = [latitude, longitude]

        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        this.#map.on('click', this._showForm.bind(this))
        this.#workouts.forEach(work => {this._renderWorkoutMarker(work)})
    }


    _showForm(mapE) {
        this.#mapEvent = mapE;
        inputContainer.classList.remove('hidden')
        formDistance.focus()
    }


    _hideForm() {
        formDistance.value = formcondence.value = formElev.value = formDuration.value = '';
        inputContainer.style.display = 'none'
        inputContainer.classList.add('hidden')
        setTimeout(() => inputContainer.style.display = 'grid', 1000)
    }

    _toggleElevationField() {
        formcondence.closest('.form-row').classList.toggle('Elev-hidden')
        formElev.closest('.form-row').classList.toggle('Elev-hidden')
    }


    _newWorkout(e) {
        e.preventDefault()
        const inputValid = (...inputs) =>
            inputs.every(input => Number.isFinite(input))

        const allPositive = (...inputs) =>
            inputs.every(input => input > 0)


        const { lat, lng } = this.#mapEvent.latlng
        let workout;


        const type = inputType.value
        const distance = +formDistance.value;
        const duration = +formDuration.value;


        if (type === 'Running') {
            const condence = +formcondence.value;
            if (!inputValid(distance, duration, condence) ||
                !allPositive(distance, duration, condence))
                return alert('please put positive number')

            workout = new Running([lat, lng], distance, duration, condence)
        }

        if (type === 'Cycling') {
            const elevation = +formElev.value;
            console.log(elevation)
            if (!inputValid(distance, duration, elevation) ||
                !allPositive(distance, duration)
            )
                return alert('please put positive number')
            workout = new Cycling([lat, lng], distance, duration, elevation)

        }

        this.#workouts.push(workout)
        this._renderWorkoutMarker(workout);
        this._renderWorkout(workout);
        this._hideForm();
        this._setLocalStorage()


    }
    _renderWorkoutMarker(workout) {
        
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 200,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`
            }))
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴🏼‍♂️'} ${workout.discription}`)
            .openPopup();

    }

    _renderWorkout(workout) {
        let html = `
        <li class="workouts workout_${workout.type}"  data-id = "${workout.id}">
          <h2 class="workout-title">${workout.discription}</h2>
         <div class="workouts-details">
            <span>${workout.type === 'running' ? '🏃‍♂️' : '🚴🏼‍♂️'}  </span>
            <span>💨</span>
            <span>${workout.distance}</span>
            <span>km</span>
         </div>
         <div class="workouts-details">
            <span>⏱</span>
            <span>${workout.duration}</span>
            <span>min</span>
          </div>
        `;
        if (workout.type === 'running') {
            html += `
          <div class="workouts-details">
            <span>⚡</span>
            <span>${workout.pace.toFixed(1)}</span>
            <span>min/km</span>
          </div>
          <div class="workouts-details">
            <span>🦶🏼</span>
            <span>${workout.cadence}</span>
            <span>SPM</span>
           </div>
        </li>
            `;
        }
        if (workout.type === 'cycling') {
            html += `
         <div class="workouts-details">
            <span>⚡</span>
            <span>${workout.speed.toFixed(1)}</span>
            <span>km/hr</span>
          </div>
          <div class="workouts-details">
            <span>⛰</span>
            <span>${workout.elevation}</span>
            <span>M</span>
          </div>
        </li>  
            `;
        }
        inputContainer.insertAdjacentHTML('afterend', html)
    }
    _moveToPopup(e) {
        const workoutEl = e.target.closest('.workouts')

        if (!workoutEl) return;


        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id)
        console.log(workout)
        this.#map.setView(workout.coords, 13, {
            animate: true,
            pan: {
                duration: 1
            }
        })
        // workout.click()

    }

    _setLocalStorage(){
        localStorage.setItem('workouts', JSON.stringify(this.#workouts))
  
    }
    _getLocalStorage(){
        const data = JSON.parse(localStorage.getItem('workouts'))

        if(!data) return;
        this.#workouts = data;

        this.#workouts.forEach(work => {this._renderWorkout(work)
     })
    }
   reset(){
    localStorage.removeItem('workouts')
    location.reload()
   }
}


const app = new App()


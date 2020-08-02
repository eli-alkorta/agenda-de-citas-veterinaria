'use strict';

let DB;

const form = document.querySelector('form'),
      pet = document.querySelector('#mascota'),
      client = document.querySelector('#cliente'),
      phone = document.querySelector('#telefono'),
      date = document.querySelector('#fecha'),
      time = document.querySelector('#hora'),
      symptoms = document.querySelector('#sintomas'),
      appointments = document.querySelector('#citas'),
      heading = document.querySelector('#administra');

window.addEventListener('load', () => {
  
  let createDB = window.indexedDB.open('appointments', 1);

  createDB.onerror = function() {
    console.log('ha habido un error')
  }

  createDB.onsuccess = function() {

    DB = createDB.result;

    showAppointments();

  }

  createDB.onupgradeneeded = function(e) {
    let db = e.target.result;
  
    let objectStore = db.createObjectStore('appointments', {keyPath: 'key', autoIncrement: true});

    objectStore.createIndex('pet', 'pet', {unique: false});
    objectStore.createIndex('client', 'client', {unique: false});
    objectStore.createIndex('phone', 'phone', {unique: false});
    objectStore.createIndex('date', 'date', {unique: false});
    objectStore.createIndex('time', 'time', {unique: false});
    objectStore.createIndex('symptoms', 'symptoms', {unique: false});
   
  }

  form.addEventListener('submit', addData);

  function addData(e) {
    e.preventDefault();
    
    const newAppointment = {
      pet: pet.value,
      client: client.value,
      phone: phone.value,
      date: date.value,
      time: time.value,
      symptoms: symptoms.value
    }
    
    let transaction = DB.transaction(['appointments'], 'readwrite');
    let objectStore = transaction.objectStore('appointments');

    let request = objectStore.add(newAppointment);

    request.onsuccess = () => {
      form.reset();
    }
    transaction.oncomplete = () => {
      showAppointments();
    }
    transaction.onerror = () => {
      console.log('hubo un error')
    }
  }

  function showAppointments() {

    while(appointments.firstChild) {
      appointments.removeChild(citas.firstChild);
    }

    let objectStore = DB.transaction('appointments').objectStore('appointments');

    objectStore.openCursor().onsuccess = function(e) {
      let cursor = e.target.result;

      if(cursor) {
        let appointmentHTML = document.createElement('li');
        appointmentHTML.setAttribute('data-appointment-id', cursor.value.key);
        appointmentHTML.classList.add('list-group-item');
        appointmentHTML.innerHTML = `<p class="font-weight-bold"> Mascota: <span class="font-weight-normal">${cursor.value.pet}</span></p>
        <p class="font-weight-bold"> Cliente: <span class="font-weight-normal">${cursor.value.client}</span></p>
        <p class="font-weight-bold"> Teléfono: <span class="font-weight-normal">${cursor.value.phone}</span></p>
        <p class="font-weight-bold"> Fecha: <span class="font-weight-normal">${cursor.value.date}</span></p>
        <p class="font-weight-bold"> Hora: <span class="font-weight-normal">${cursor.value.time}</span></p>
        <p class="font-weight-bold"> Síntomas: <span class="font-weight-normal">${cursor.value.symptoms}</span></p>
        `;

        const button = document.createElement('button');
        button.classList.add('borrar', 'btn', 'btn-danger');
        button.innerHTML = `<span aria-hidden="true">X</span> Borrar`; 
        button.onclick = deleteAppointment;
        appointmentHTML.appendChild(button);

        appointments.appendChild(appointmentHTML);
        cursor.continue();
      } else {
        if(!appointments.firstChild) {
          heading.textContent = 'Agrega citas para comenzar';
          let list = document.createElement('p');
          list.classList.add('text-center');
          list.textContent = 'No hay registros';
          appointments.appendChild(list);
        } else {
          heading.textContent = 'Gestiona tus citas';
        } 
      }
    }
  }

  function deleteAppointment(e) {
    let appointmentID = Number(e.target.parentElement.getAttribute('data-appointment-id'));

    let transaction = DB.transaction(['appointments'], 'readwrite');
    let objectStore = transaction.objectStore('appointments');

    let request = objectStore.delete(appointmentID);

    transaction.oncomplete = () => {
      e.target.parentElement.parentElement.removeChild(e.target.parentElement);

      if(!appointments.firstChild) {
        heading.textContent = 'Agrega citas para comenzar';
        let list = document.createElement('p');
        list.classList.add('text-center');
        list.textContent = 'No hay registros';
        appointments.appendChild(list);
      } else {
        heading.textContent = 'Gestiona tus citas';
      } 
    }
  }

})

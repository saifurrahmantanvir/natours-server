import '@babel/polyfill'
import { displayMap } from './mapbox'
import { login, logout } from './login'
import { updateSettings } from './updateSettings'
import { bookTour } from './stripe'

const map = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const logoutBtn = document.querySelector('.nav__el--logout')
const bookBtn = document.getElementById('book-tour')

if (map) {
   const locations = JSON.parse(map.dataset.locations);

   displayMap(locations)
}

if (loginForm) {
   loginForm.addEventListener('submit', (e) => {
      e.preventDefault()

      const { value: email } = document.getElementById('email');
      const { value: password } = document.getElementById('password');

      login(email, password)
   })
}

if (logoutBtn) {
   logoutBtn.addEventListener('click', logout)
}

if (userDataForm) {
   userDataForm.addEventListener('submit', (e) => {
      e.preventDefault()

      const { value: name } = document.getElementById('name');
      const { value: email } = document.getElementById('email');
      const photo = document.getElementById('photo').files[0]

      const form = new FormData()

      form.append('name', name)
      form.append('email', email)
      form.append('photo', photo)

      updateSettings(form, 'Data')
   })
}

if (userPasswordForm) {
   userPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      document.querySelector('.btn--save-password').textContent = 'Updating...'
      const { value: passwordCurrent } = document.getElementById('password-current');
      const { value: password } = document.getElementById('password');
      const { value: passwordConfirm } = document.getElementById('password-confirm');

      await updateSettings({
         passwordCurrent,
         password,
         passwordConfirm
      }, 'Password')

      document.querySelector('.btn--save-password').textContent = 'Save settings'
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
   })
}

if (bookBtn) {
   bookBtn.addEventListener('click', (e) => {
      e.target.textContent = 'Processing...'
      const { tourId } = e.target.dataset;

      bookTour(tourId)
   })
}
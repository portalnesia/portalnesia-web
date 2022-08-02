import {initializeApp} from 'firebase/app'

const firebaseConfig = {
    apiKey: "AIzaSyAQ7u4UWLyPZ9dgL9cwtBbXs4GX3th00Bg",
    authDomain: "portalnesia.firebaseapp.com",
    databaseURL: "https://portalnesia.firebaseio.com",
    projectId: "portalnesia",
    storageBucket: "portalnesia.appspot.com",
    messagingSenderId: "152584550462",
    appId: "1:152584550462:web:9e87f640a14eb1130d796f",
    measurementId: "G-V1ZMDC79KP"
}

const firebaseApp = initializeApp(firebaseConfig)

export default firebaseApp;
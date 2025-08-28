import { initializeApp } from './lib/firebase-app.js';
import { getDatabase, ref, onValue, set } from './lib/firebase-database.js';

// Deine Firebase Config
const firebaseConfig = {
apiKey: "AIzaSyBMnalYVBypC-xA6kyi_31y7hFgaLSZtKU",
authDomain: "permissionverwaltung.firebaseapp.com",
databaseURL: "https://permissionverwaltung-default-rtdb.europe-west1.firebasedatabase.app",
projectId: "permissionverwaltung",
storageBucket: "permissionverwaltung.firebasestorage.app",
messagingSenderId: "694700990399",
appId: "1:694700990399:web:daac7477171f5aa1318b0a",
measurementId: "G-W51KNVRRBP"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Permission-Daten live überwachen
function setColor(entityId, status) {
const colors = {
    granted: 'green',
    denied: 'red',
    temporary: 'yellow'
};
const el = document.querySelector(entityId);
if (el) el.setAttribute('material', 'color', colors[status] || 'gray');
}

// Listener für Mikrofon
onValue(ref(db, 'permissions/microphone'), (snapshot) => {
const data = snapshot.val();
if (data && data.access) {
    setColor('#micSphere', data.access);
    document.querySelector('#micSphere').setAttribute('permission-status', data.access);
}
});

// Listener für Kamera
onValue(ref(db, 'permissions/camera'), (snapshot) => {
const data = snapshot.val();
if (data && data.access) {
    setColor('#camSphere', data.access);
    document.querySelector('#camSphere').setAttribute('permission-status', data.access);
}
});

// Helper: Nächster Status im Kreis
      function nextStatus(current) {
        const order = ['denied', 'granted', 'temporary'];
        const idx = order.indexOf(current);
        return order[(idx + 1) % order.length];
      }

// A-Frame Component → Klick-Interaktion
      AFRAME.registerComponent('permission-toggle', {
        schema: { type: 'string' }, // z. B. 'microphone' oder 'camera'
        init: function () {
          this.el.addEventListener('click', () => {
            const current = this.el.getAttribute('permission-status') || 'denied';
            const newStatus = nextStatus(current);

            // Lokale Farbe ändern
            setColor(`#${this.el.id}`, newStatus);
            this.el.setAttribute('permission-status', newStatus);
            // Nach Firebase schreiben
            set(ref(db, 'permissions/' + this.data), {
              access: newStatus
            });
          });
        }

      });


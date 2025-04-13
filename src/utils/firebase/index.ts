import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC7LvfKsHB9mJqTjRYWMlo8_7A396czqF0",
  authDomain: "testweb-cbc45.firebaseapp.com",
  projectId: "testweb-cbc45",
  storageBucket: "testweb-cbc45.firebasestorage.app",
  messagingSenderId: "251722682250",
  appId: "1:251722682250:web:1f116b500e0bd96c53c273",
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export const fetchToken = (setTokenFound: any) => {
  return getToken(messaging, {
    vapidKey: "",
  })
    .then((currentToken) => {
      if (currentToken) {
        console.log("current token for client: ", currentToken);
        setTokenFound(true);
      } else {
        console.log("No registration token available. Request permission to generate one.");
        setTokenFound(false);
      }
    })
    .catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
    });
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

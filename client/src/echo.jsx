// // src/echo.js
// import Echo from "laravel-echo";
// import Pusher from "pusher-js";

// window.Pusher = Pusher;

// const echo = new Echo({
//   broadcaster: "reverb",
//   key: import.meta.env.VITE_REVERB_APP_KEY,
//   wsHost: window.location.hostname,
//   wsPort: 8080,
//   wssPort: 8080,
//   forceTLS: false,
//   enabledTransports: ["ws", "wss"],
//   authEndpoint: "http://travel-server.test/broadcasting/auth",
//   auth: {
//     headers: {
//       Authorization: `Bearer ${sessionStorage.getItem("token")}`,
//     },
//   },
// });

// export default echo;

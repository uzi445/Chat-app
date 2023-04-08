const socket = io();

// Elements
const $messageForm = document.querySelector("#messageForm");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#sendLocation");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#locationMessage-template"
).innerHTML;

// Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})
// const { username, room } = Object.fromEntries(
//   new URLSearchParams(location.search)
// );

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (message) => {
  //   console.log(url);
  const html = Mustache.render(locationMessageTemplate, {
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

document.querySelector("#messageForm").addEventListener("submit", (e) => {
  e.preventDefault();

  //   Disable form
  $messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.message.value;

  socket.emit("sendMessage", message, (error) => {
    // enable

    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("The mesage was delivered!");
  });
});

document.querySelector("#sendLocation").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your oldas potato browser");
  }

  // Disable send location
  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "SendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        console.log("Location shared");

        // Enable send location
        $sendLocationButton.removeAttribute("disabled");
      }
    );
  });
});

socket.emit("join", {
  username,
  room,
});

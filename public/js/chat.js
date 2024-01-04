const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector(
  "#locmessage-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // hight of the new message
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // height of messages container
  const containerHeight = $messages.scrollHeight;

  // how far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// server (emit) -> client (receive) - countUpdated
// client (emit) -> server (receive) - increment

socket.on("message", (message) => {
  // console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (url) => {
  // console.log(url.username);
  const html = Mustache.render(locationTemplate, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room: room,
    users: users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // disable form after submit
  $messageFormButton.setAttribute("disabled", "disabled");

  //disable

  const message = $messageFormInput.value;

  if (message === "") {
    // enable form after submit
    $messageFormButton.removeAttribute("disabled");
    return;
  }
  socket.emit("sendMessage", message, (error) => {
    // enable form after submit
    $messageFormButton.removeAttribute("disabled");
    // clear input
    $messageFormInput.value = "";
    // focus input
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    // console.log("Message Delivered");
  });
});

document.querySelector("#send-location").addEventListener("click", (e) => {
  e.preventDefault();
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  navigator.permissions.query({ name: "geolocation" }).then((res) => {
    // console.log(res);
    if (res.state === "denied") {
      return alert("Please allow permission to send location!");
    }
  });

  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position);
    $sendLocationButton.setAttribute("disabled", "disabled");

    socket.emit(
      "sendLocation",
      {
        Latitude: position.coords.latitude,
        Longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        // console.log("Location Shared");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

// document.querySelector("#increment").addEventListener("click", (e) => {
//   console.log("clicked");
//   socket.emit("increment");
// });

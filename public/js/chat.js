const socket = io();

//elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
//Location template
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
//sidebar template
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
//options
const { username, room } = Qs.parse(window.location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
 //new message element
 const $newMessage = $messages.lastElementChild;
 //Height of the last message
 const newMessageStyles = getComputedStyle($newMessage);
 const newMessageMargin = parseInt(newMessageStyles.marginBottom);
 const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
 //visible height
 const visibleHeight = $messages.offsetHeight;
 //Height of messages container
 const containerHeight = $messages.scrollHeight;
 //How far have i scrolled
 const scrollOffset = $messages.scrollTop + visibleHeight;
 if (containerHeight - newMessageHeight <= scrollOffset) {
  $messages.scrollTop = $messages.scrollHeight;
 }
};

socket.on("message", message => {
 console.log(message);
 const html = Mustache.render(messageTemplate, {
  username: message.username,
  message: message.text,
  createdAt: moment(message.createdAt).format("h:mm a")
 });
 $messages.insertAdjacentHTML("beforeend", html);
 autoscroll();
});

$messageForm.addEventListener("submit", e => {
 e.preventDefault();
 $messageFormButton.setAttribute("disabled", "disabled");

 //disable
 const message = e.target.elements.message.value;
 socket.emit("sendMessage", message, error => {
  $messageFormButton.removeAttribute("disabled");
  $messageFormInput.value = "";
  $messageFormInput.focus();
  //enable
  if (error) {
   return console.log(error);
  }
  console.log("Message delivered");
 });
});
socket.on("sendMessage", message => {
 console.log(message);
});
socket.on("locationMessage", message => {
 console.log(message);
 const html = Mustache.render(locationMessageTemplate, {
  username: message.username,
  url: message.text,
  createdAt: moment(message.createdAt).format("h:mm a")
 });
 $messages.insertAdjacentHTML("beforeend", html);
 autoscroll();
});

socket.on("roomData", data => {
 console.log(data);
 const html = Mustache.render(sidebarTemplate, {
  room: data.room,
  users: data.users
 });
 document.querySelector("#sidebar").innerHTML = html;
});
/**
|--------------------------------------------------
| get user location 
|--------------------------------------------------
*/
$sendLocationButton.addEventListener("click", () => {
 if (!navigator.geolocation) {
  return alert("Your Browser does not support Geolocation");
 }
 $sendLocationButton.setAttribute("disabled", "disabled");

 navigator.geolocation.getCurrentPosition(position => {
  console.log(position);
  let locationData = {
   lat: position.coords.latitude,
   long: position.coords.longitude
  };
  socket.emit("sendLocation", locationData, isLocationShared => {
   if (isLocationShared) {
    console.log(isLocationShared);

    $sendLocationButton.removeAttribute("disabled");
   }
  });
 });
});
/**
|--------------------------------------------------
| receive location sent by back end
|--------------------------------------------------
*/
socket.on("sendLocation", position => {
 console.log("user location is logged here", position);
 //  window.location.href = position;
});
socket.emit("join", { username, room }, error => {
 if (error) {
  alert(error);
  window.location.href = "/";
 }
});

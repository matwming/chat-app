const socket = io();
//elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
socket.on("message", value => {
 console.log(value);
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
 window.location.href = position;
});

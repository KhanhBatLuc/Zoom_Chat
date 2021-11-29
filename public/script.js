const socket = io("/");

let myVideoStream;
let nameUser = localStorage.getItem("name");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

// create peer

var peer = new Peer();

// get fill name user

const getNameUser = () => {
  let person = prompt("Please enter your name:");
  if (person == null || person == "") {
    localStorage.setItem("name", "no name");
  } else {
    localStorage.setItem("name", person);
  }
};
const addNewUser = (user) => {
  $(".list").append(`<li class="user__s">name user: ${user}</li>`);

  $(".name__connect").append(`<li class="name__ok">join: ${user}</li>`);
  setTimeout(() => {
    $(".name__ok").remove();
  }, 2000);
};

if (nameUser === null) {
  getNameUser();
}

// accept open video
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on("open", function (id) {
      socket.emit("join-room", ROOM_ID, nameUser, id);
    });
    // socket.io
    socket.on("user-connect", (user, idUser) => {
      addNewUser(user);
      connectNewUser(idUser, stream);
    });

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    // input value
    let text = $("input");
    // when press enter send message
    $("html").keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit("message", nameUser, text.val());
        text.val("");
      }
    });

    socket.on("createMessage", (nameUser, message) => {
      $(".messages").append(
        `<li class="message"><b>${nameUser}</b><br/>${message}</li>`
      );
      scrollToBottom();
    });

    socket.on("user-disconnected", (name) => {
      outGroup(name);
    });
  });

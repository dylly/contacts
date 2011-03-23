var socket = new WebSocket("ws://localhost:3000/");

socket.onopen = function (msg) {
//    postMessage("socket opened: " + msg);
};

socket.onclose = function (msg) {
	postMessage("socket closed: " + msg);
};

socket.onmessage = function (msg) {
		postMessage( msg.data);
};

onmessage = function (msg) {
//	postMessage("sending to server");
	socket.send(msg.data);
//	postMessage("sent to server");
};
	


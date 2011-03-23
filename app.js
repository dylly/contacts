var sys = require("sys"), 
    express = require("express"),
	ws= require("websocket-server"),
	mongo = require('mongodb');

var host = 'flame.mongohq.com';
var port = 27097; //mongo.Connection.DEFAULT_PORT;

// mongodb://<user>:<password>@flame.mongohq.com:27097/contacts
sys.puts("creating db { host: " + host + ", port: " + port);
var db = new mongo.Db('contacts', new mongo.Server(host, port, {}), {});
db.open(function (err, db) {
    sys.puts(sys.inspect(db));
});


db.createCollection('contact', function (err, collection) {
});

var app = express.createServer();
app.use(express.staticProvider(__dirname + "/public"));

app.get("/", function (req, res) {
		res.send("Hello contacts");
	});

app.listen(3000);



var server = ws.createServer({
		server: app
	});

server.addListener("listening", function () {
		sys.log("Listening for connections.");
	});

server.addListener("connection", function (conn) {
		sys.log("client connecting: " + conn.id + ".");
		conn.addListener("message", function (message) {
			sys.log("client sending message: " + conn.id + ".");
			
			db.collection('contact', function (err, collection) {
					sys.log(message);
					collection.insert(JSON.parse(message), function (err, obj) {
							var returnMessage = {
								type: "contact",
								data: obj
							};
							
							conn.send(JSON.stringify(returnMessage));
							
							collection.count(function (err, count) {
									var returnMessage = {
										type: "count",
										data: count
									};

									conn.send(JSON.stringify(returnMessage));
								});
							
							collection.find(function (err, cursor) {
									cursor.toArray(function (err, docs) {
											var returnMessage = {
												type: "contactList",
												data: docs
											};
											conn.send(JSON.stringify(returnMessage));
										});
								});
						});
				});
		});

	});

server.addListener("close", function (conn) {
		sys.log("client closing connection: " + conn.id + ".");
	});




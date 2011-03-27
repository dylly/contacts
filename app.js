var sys = require("sys"), 
    express = require("express"),
	ws = require("websocket-server"),
	mongo = require('mongodb');

var host = process.env.MONGO_HOST;
var port = process.env.MONGO_PORT;
var username = process.env.MONGO_USERNAME;
var password = process.env.MONGO_PASSWORD;

sys.puts("creating db \n{\n    host: " + host + ",\n    port: " + port + "\n}");

var db = new mongo.Db('contacts', new mongo.Server(host, port, {}), {});

sys.log("opening db");

db.open(function (err, x) {
		sys.log("authenticating user");
		db.authenticate(username, password, function (err, val) {
				if (err !== null) {
					sys.log("Error authenticating");
					// perhaps this case should exit also
				}
				sys.log("Authenticated.");

				db.createCollection('contact', function (err, collection) {
				});

			});
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

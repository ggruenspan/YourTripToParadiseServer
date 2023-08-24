//---------------------------------------------------------------------------
/// SERVER VARIABLES
//---------------------------------------------------------------------------

var express = require("express");
const userService = require("./app/controllers/userController.js");
const mongoose = require("mongoose");
const cors = require("cors");
const clientSessions = require("client-sessions");

require('dotenv').config();
const connectionString = process.env.MONGODB_CONN_STR;

var app = express();
app.use(cors({
    origin: 'http://localhost:8081',
    methods: ['POST', 'GET'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var HTTP_PORT = process.env.PORT || 8080;

//---------------------------------------------------------------------------
/// SERVER VARIABLES END
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
/// PRE LOADING DATABASE
//---------------------------------------------------------------------------

// connect to your mongoDB database
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

// log when the DB is connected
mongoose.connection.on("open", () => {
    console.log("Database connection open.");
});

//---------------------------------------------------------------------------
/// END PRE LOADING DATABASE
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
/// CREATES CLIENTSESSION
//---------------------------------------------------------------------------

app.use(clientSessions( {
    cookieName: "session",
    secret: process.env.MONGODB_CONN_STR || "your-trip-to-paradise",
    duration: 2*60*1000,
    activeDuration: 1000*60
}));

// app.use(function(req, res, next) {
//     res.locals.session = req.session;
//     next();
// });

//---------------------------------------------------------------------------
/// END CREATES CLIENTSESSION
//---------------------------------------------------------------------------


//---------------------------------------------------------------------------
/// ADDING ROUTES
//---------------------------------------------------------------------------

function onHttpStart() {                                                            // call this function after the http server starts listening for requests
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Your Trip To Paradise server." });
});

require("./app/routes/userRoutes")(app);

//---------------------------------------------------------------------------
/// END ADDING ROUTES
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
/// INITIALIZE
//---------------------------------------------------------------------------

console.log ("Ready for initialization");
userService.initialize()
.then(() => {
    console.log ("Server Initialized.");
    app.listen(HTTP_PORT, onHttpStart);  //setup http server to listen on HTTP_PORT
})
.catch(function(err) {
    console.log(err);
});

//---------------------------------------------------------------------------
/// END UNKNOW ROUTE AND INITIALIZE
//---------------------------------------------------------------------------
const user = require("../controllers/userController.js");
// const clientSessions = require("client-sessions");

module.exports = app => {
    var router = require("express").Router();

    // app.use(clientSessions( {
    //     cookieName: "session",
    //     secret: process.env.MONGODB_CONN_STR || "your-trip-to-paradise",
    //     duration: 2*60*1000,
    //     activeDuration: 1000*60
    // }));
    
    // app.use(function(req, res, next) {
    //     res.locals.session = req.session;
    //     next();
    // });

    // Registers a new user
    router.post("/register", function(req,res) {
        user.register(req.body)
        .then(() => res.status(200).json({successMessage: "User created"}))
        .catch (err => res.status(404).json({errorMessage: err}))
    });

    // Signs a user in
    router.post("/signIn", function(req,res) {
        req.body.userAgent = req.get('User-Agent');
        user.signIn(req.body)
        .then(user => {
            req.session.user = {
                userName: user.userName,
                email: user.accountSetting.personalInfo.email
            }
            res.status(200).json({successMessage: "User signed in"});
        })
        .catch(err => res.status(404).json({errorMessage: err}))
    });

    // User Session
    router.get("/userData", function(req, res) {
        const userData = {
            userName: req.session.user.userName || 'Guest',
            email: req.session.user.email || 'N/A',
        };
        res.json(userData);
    });
    
    app.use("/api", router);
};
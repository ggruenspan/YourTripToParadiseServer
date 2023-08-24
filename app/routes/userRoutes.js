const user = require("../controllers/userController.js");

module.exports = app => {
    var router = require("express").Router();

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
        if (req.session.user !== undefined) {
            const userData = {
                userName: req.session.user.userName || 'Guest',
                email: req.session.user.email || 'N/A',
            };
            res.json(userData);
        }
    });
    
    app.use("/api", router);
};
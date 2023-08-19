module.exports = app => {
    const user = require("../controllers/userController.js");

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
        .then(() => res.status(200).json({successMessage: "User signed in"}))
        .catch(err => res.status(404).json({errorMessage: err}))
    });

    // router.post("/signin", function(req,res) {
    //     req.body.userAgent = req.get('User-Agent');
    //     user.signIn(req.body)
    //     .then(user => {
    //         req.session.user = {
    //             userName: user.userName,
    //             email: user.email
    //         }
    //     })
    //     .catch(err => res.status(404).json({errorMessage: err}))
    // });

    app.use("/api", router);
};
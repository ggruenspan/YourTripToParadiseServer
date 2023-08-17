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
    router.post("/signin", function(req,res) {
        req.body.userAgent = req.get('User-Agent');
        user.signIn(req.body)
        .then(() => console.log("User signed in"))
        .catch(err => res.status(404).json({errorMessage: err}))
    });

    // app.post("/signin", function(req,res) {
    //     req.body.userAgent = req.get('User-Agent');
    //     dataServiceAuth.checkUser(req.body)
    //     .then(user => {
    //         req.session.user = {
    //             userName: user.userName,
    //             email: user.email
    //         }
    //         res.redirect("/");
    //     })
    //     .catch(err => {
    //         res.render("user/signin", {errorMessage:err, email:req.body.email} )
    //     }) 
    // });

    app.use("/api", router);
};
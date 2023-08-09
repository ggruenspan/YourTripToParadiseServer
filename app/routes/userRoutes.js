module.exports = app => {
    const user = require("../controllers/userController.js");

    var router = require("express").Router();

    // Registers a new user
    router.post("/register", user.register);

    app.use("/api", router);
};
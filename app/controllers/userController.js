const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
    email: { type: 'string', unique: true },
    userName: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    password: { type: 'string' },
});

let User; //to be defined on new connection (see initialize)

function initialize () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(process.env.MONGODB_CONN_STR, { useNewUrlParser: true });
        db.on('error', (err) => {
            reject(err);
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

function register(req, res) {
    if(req.body.password !== req.body.password2) {
        res.status(400).send({ message: 'Passwords do not match' });
    } else {
        User.find({email: req.body.email})
        .exec()
        .then((users) => {
            if (users.length > 0) {
            res.status(400).send({ message: 'There is already a user with that email: ' + req.body.email });
            }
            else {
                bcrypt.hash(req.body.password, 10)
                .then((hash) => {
                    req.body.password = hash;
                    let newUser = new User(req.body);
                    newUser.save(newUser)
                    .then(data => { res.send(data); })
                    .catch(err => {
                        res.status(500).send({ message: 'There was an error creating the user: ' + err.message });
                    });
                })
                .catch(err=>{ console.log(err); })
            }
        })
        .catch(() => { res.status(500).send({ message: 'Unable to find user: ' + req.body.email }); })
    }
}

module.exports = {
    initialize,
    register,
}
const User = require('../models/user');
const jwt = require('jwt-simple');
const Config = require('../config');
const bcrypt = require('bcrypt-nodejs');

exports.register = function(req, res) {
    let user = new User({
        email: req.body.email.toLowerCase(),
        name: req.body.name
    });
    user.password = user.generateHash(req.body.password);
    user.save(err => {
        if (err) {
            console.log(err.message);
            let msg = err.message;
            if(err.code == 11000)
                msg = "An account already exists with the email.";
            return res.redirect('/register?e='+encodeURIComponent(msg));
        }
        return res.redirect('/login?e='+encodeURIComponent("Account created"));
    });

}

exports.login = function(req, res) {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            console.log(err);
            return res.json({ status: "error", message: err.message });
        } else if (user && bcrypt.compareSync(req.body.password, user.password)) {
            const token = jwt.encode({ email: user.email }, Config.TOKEN_SECRET);
            req.session.user = user;
            res.redirect('/home');
        } else
            res.redirect('/login?e='+encodeURIComponent("Invalid email/password"));

    });
}

exports.user = function(req, res){
    console.log(JSON.stringify(req.user));
    return res.json({status:"success", data:req.user});
}
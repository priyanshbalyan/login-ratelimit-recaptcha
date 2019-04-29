const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const moment = require('moment');
const ratelimit = require('express-rate-limit');
const Config = require('../config');
const User = require('../models/user');
const AuthController = require('../controllers/auth');
const Recaptcha = require('express-recaptcha').RecaptchaV2;
const recaptcha = new Recaptcha(Config.RECAPTCHA_SITE_KEY, Config.RECAPTCHA_SECRET_KEY, { callback:'cb'});

function isAuthenticated(req, res, next) {
    if (!req.headers.authorization) {
        return res.send({ status:"error", message: "TokenMissing" });
    }

    let token = req.headers.authorization.split(' ')[1];
    let payload = null;
    try {
        payload = jwt.decode(token, Config.TOKEN_SECRET);
    } catch (err) {
        return res.send({ status:"error", message: "TokenInvalid" });
    }

    if (payload.exp <= moment().unix())
        return res.send({ status:"error", message: 'TokenExpired' });

    User.findOne({email:payload.email}, (err, user) => {
        if (!user) return res.send({ status:"error", message: 'UserNotFound' });
        req.user = user;
        next();
    });


}

const limiter = ratelimit({
    windowMs: Config.RATE_LIMIT_WINDOW,
    max: Config.RATE_LIMIT,
    handler:function(req, res, next){
        req.limit_flag = true;
        next();
    }
});

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/register', limiter, recaptcha.middleware.render, (req, res)=>{
    if(req.limit_flag){
        return res.render('register', { captcha: res.recaptcha,  });
    }
    return res.render('register', {captcha: false});
    
});

router.get('/home', (req, res)=>{
    if(req.session.user){
        return res.render("home", { name: req.session.user.name, email: req.session.user.email});
    }
    else
        return res.redirect('/login');
});

router.get('/logout', (req, res)=>{
    req.session.user = null;
    return res.redirect('/login');
});

router.get('/login', (req, res)=>{
    return res.render('login');
});

router.post('/login', AuthController.login);

router.post('/register', limiter, recaptcha.middleware.verify, (req, res)=>{
    if(req.limit_flag){
        if(req.recaptcha.error){
            console.log("RECAPTCHA ERROR:", req.recaptcha);
            return res.redirect('/register?e='+encodeURIComponent("Recaptcha not verfied"));
            // return res.json({status:"error", message:"Recaptcha not verified"});
        }
        console.log("RECAPTCHA VERFIED");
        return AuthController.register(req, res);
        // return res.render('register', {captcha: res.recaptcha, message: "Recaptcha not verified"});
    }
        return AuthController.register(req, res);
});


module.exports = router;
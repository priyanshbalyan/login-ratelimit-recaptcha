module.exports = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/proj',

    TOKEN_SECRET: process.env.TOKEN_SECRET || 'secret',

    API_PORT: process.env.API_PORT || 8080,

    RATE_LIMIT: 3,

    RATE_LIMIT_WINDOW: 24*60*60*1000,

    RECAPTCHA_SITE_KEY: process.env.SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",  // test key given by google

    RECAPTCHA_SECRET_KEY: process.env.SECRET_KEY || "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe" // test key given by google
}
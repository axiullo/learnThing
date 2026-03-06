const logger = require('pomelo-logger').getLogger('pomelo', __filename);

module.exports = function (app) {
    return new Remote(app);
}

function Remote(app) {
    this.app = app;
}

Remote.prototype.test = function (cb) {
    logger.info('test');
}

Remote.prototype.login = function (msg, cb) {
    let aid = msg.aid;
    logger.info('login, aid', aid);

    cb(null, { code: 200, msg: 'login ok.' });
}
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


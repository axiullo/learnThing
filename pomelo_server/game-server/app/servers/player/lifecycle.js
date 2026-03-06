var logger = require('pomelo-logger').getLogger('pomelo', __filename);

module.exports = {
    beforeStartup: function (app, callback) {
        logger.info('beforeStartup', app.get('serverId'));

        callback();
    },
    beforeShutdown: function (app, shutDownFunc, cancelShutDownTimerFunc) {
        logger.info('beforeShutdown', app.get('serverId'));

        shutDown();
    },
    afterStartup: function (app, callback) {
        callback();
    },
    afterStartAll: function (app) {
    }
}
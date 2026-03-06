var logger = require('pomelo-logger').getLogger('pomelo', __filename);
const serverUtil = require('../../util/serverUtil');

module.exports = {
    /**
     * 
     * @param {*} app 
     * @param {*} callback  调用组件的start的回调函数
     * @returns 
     */
    beforeStartup: async function (app, callback) {
        logger.info('beforeStartup', app.get('serverId'));

        if (!await serverUtil.serverInit(app)) {
            logger.error(`[MySQL-${process.pid}] ❌ Init failed`);
            this.stop();
            return;
        }

        callback();
    },

    /**
     * 
     * @param {*} app 
     * @param {*} callback  调用app.start时的cb
     */
    afterStartup: function (app, callback) {
        let result = true;
        //todo load config   配置有问题 result 为false

        //wmtest
        // setTimeout(() => {
        //     app.lifecycleCbs['testData'](app);
        // }, 1000);

        if (!result) {
            logger.error(`服务器启动失败`);
            app.stop();
            return;
        }

        callback();
    },

    beforeShutdown: async function (app, shutDownFunc, cancelShutDownTimerFunc) {
        logger.info('beforeShutdown', app.get('serverId'));
        cancelShutDownTimerFunc();
        shutDownFunc();

        await serverUtil.serverShutdown(app);
    },

    afterStartAll: function (app) {
        logger.debug('afterStartAll, serverConfig');

        setTimeout(() => {

        }, 10000);
    },

    testData: async function (app) {
        logger.debug('testData', app.get('serverId'));
        const userDao = require('../../dao/userDao');
        const User = require('../../data/user');
        let id = 1;
        let user = app.dataManager.getData('user', id);

        if (!user) {
            let data = await userDao.getUser(id);

            if (!data) {
                // 数据库中没有该用户 注册用户
                let newUserData = {
                    name: 'testUser',
                    password: '123456',
                    info: {
                        level: 1,
                        exp: 0,
                    }
                };

                let ret = await userDao.registerUser(newUserData);

                if (!ret) {
                    logger.error('testData, registerUser failed');
                    return;
                }

                newUserData.id = ret.insertId;
                user = new User(newUserData);
            }
            else {
                user = new User(data);
            }

            if (user) {
                app.dataManager.addData(user);

                setTimeout(() => {
                    user.addNumberValue('loginCount', 1);
                    user.dirty();
                    console.log('testData, user.loginCount=%d', user.loginCount);
                }, 2000);
            }
        }

        logger.debug('testData, user', user);
    }
};
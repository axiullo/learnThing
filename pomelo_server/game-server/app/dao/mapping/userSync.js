module.exports = {
    update: function (client, user, cb) {
        // console.log("updateUser", user);
        if (!user.dirty || Object.keys(user.dirty).length <= 0) {
            return;
        }

        // const { sql, args } = mapQueryUtil.formatUpdateQuery('user', user, { id: user.id });

        // Object.keys(user.dirty).forEach(key => {
        //     pomelo.app.hallManager.clearUserAfterSync(user.id, key);
        // })

        // client.query(sql, args, function (err, res) {
        //     if (!!err) {
        //         logger.error('user write mysql failed!', sql, JSON.stringify(args));
        //     }
        //     if (!!cb && typeof cb == 'function') {
        //         cb(!!err);
        //     }
        // });
    }
};
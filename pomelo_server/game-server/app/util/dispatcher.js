var crc = require('crc');
var pomelo = require('pomelo');

let exp = module.exports;

exp.GetServerByUid = function (sType, uid) {
	var dataServers = pomelo.app.GetCfgServers(sType);
	return dataServers[uid % dataServers.length];
}

var cfgServers = {};

exp.GetCfgServers = function (sType) {
	var dataServers = cfgServers[sType];

	if (!dataServers) {
		cfgServers[sType] = dataServers = [];
		var allServers = pomelo.app.getServersFromConfig();

		for (var svrid in allServers) {
			var sinfo = allServers[svrid];
			if (sinfo.serverType == sType) dataServers.push(sinfo);
		}

		dataServers.sort(function (a, b) { return (a.id < b.id) ? -1 : ((a.id > b.id) ? 1 : 0) });
	}

	return dataServers;
}

exp.dispatch = function (uid, servers) {
	// console.log("dispatch dispatch dispatch", uid, Math.abs(crc.crc32(uid.toString())));
	var index = Math.abs(crc.crc32(uid.toString())) % servers.length;
	// var index = uid % servers.length;
	return servers[index];
};

exp.directRoute = function (serverid, msg, app, cb) {
    cb(null, serverid);
}

exp.sessionRoute = function (servetType) {
    return function (session, msg, app, cb) {
        var serverid = session.get(servetType);

        // if (!serverid && app.serverType == "pkcon" && msg.method == "forwardMessage" && msg.args[0].route == "pkroom.handler.httpJoinGame") {
        //     var body = msg.args[0].body;
        //     session.bind(body.para.uid);
        //     msg.args[0].uid = body.para.uid;
        //     session.set(servetType, body.para.createPara.pkroom);
        //     serverid = session.get(servetType);
        //     session.push(servetType, function () {
        //         cb(null, serverid);
        //     });

        //     return;
        // }
        
        cb(null, serverid);
    }
}


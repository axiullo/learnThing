var exp = module.exports;

exp.formatUpdateQuery = function (tablename, data, where) {
    if (!data || !data.dirtyKeys) {
        console.error('data invaild!!!');
        return;
    }

    var sql = 'update ' + tablename + ' set ';
    var sql_params = [];
    var args = [];

    for (var key in data.dirtyKeys) {
        sql_params.push(key + '=?');

        if (data[key] instanceof Object) {
            args.push(JSON.stringify(data[key]));
        }
        else {
            args.push(data[key]);
        }
    }

    sql += sql_params.join(',');

    var where_str = ' where '
    var where_params = [];
    for (var key in where) {
        where_params.push(key + '=?');
        args.push(where[key]);
    }
    where_str += where_params.join(' and ');
    sql += where_str;

    return { sql, args };
}

exp.formatInsertQuery = function (tablename, data) {
    if (!data || !data.dirtyKeys) {
        console.error('data invaild!!!');
        return;
    }

    var sql = 'insert into ' + tablename + ' (';
    var sql_keys = [];
    var args = [];

    for (var key in data.dirtyKeys) {
        sql_keys.push(key);

        if (data[key] instanceof Object) {
            args.push(JSON.stringify(data[key]));
        }
        else {
            args.push(data[key]);
        }
    }

    sql += sql_keys.join(',');
    sql += ') values (';
    sql += sql_keys.map(() => '?').join(',');
    sql += ')';

    return { sql, args };
}
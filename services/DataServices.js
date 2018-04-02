var Database = require('arangojs').Database;
var db = new Database('http://127.0.0.1:8529');
db.useDatabase('node-arangodb');
db.useBasicAuth("root", "");

module.exports = {
    // [GET]: /users
    getAllUsers: function () {
        return db.query('FOR x IN User RETURN x')
            .then(function (value) {
                return value.all();
            });
    },

    // [GET]: /users/{userKey}
    getUserByKey: function (userKey) {
        var bindVars = {'userKey': userKey};
        return db.query('FOR x IN User FILTER x._key == @userKey RETURN x', bindVars)
            .then(function (value) {
                return value.all();
            });
    },

    // [POST]: /users
    addUser: function (user) {
        return db.collection('User').save(user);
    },

    // [POST]: /users/{userKey}/update
    updateUser: function (user) {
        var bindVars = {'key': user.key, 'username': user.username, "email": user.email};

        return db.query('FOR x IN User FILTER x._key == @key UPDATE x WITH { username:@username, email:@email } IN User', bindVars)
            .then(function (value) {
                return value.all();
            });
    },

    // [GET]: /users/{userKey}/delete
    removeUser: function (userKey) {
        var bindVars = {'userKey': userKey};

        return db.query('FOR x IN User FILTER x._key == @userKey REMOVE x IN User LET removed = OLD RETURN removed', bindVars)
            .then(function (value) {
                return value.all();
            });
    }
};
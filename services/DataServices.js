import Database from 'arangojs';

const db = new Database(process.env.DB_HOST);
db.useDatabase(process.env.DB_NAME);
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS);

module.exports = {
    // [GET]: /users
    getAllUsers: () => {
        return db.query('FOR x IN User RETURN x')
            .then((value) => {
                return value.all();
            });
    },

    // [GET]: /users/{userKey}
    getUserByKey: (userKey) => {
        const bindVars = {'userKey': userKey};
        return db.query('FOR x IN User FILTER x._key == @userKey RETURN x', bindVars)
            .then((value) => {
                return value.all();
            });
    },

    // [POST]: /users
    addUser: (user) => {
        return db.collection('User').save(user);
    },

    // [POST]: /users/{userKey}/update
    updateUser: (user) => {
        const bindVars = {'key': user.key, 'username': user.username, "email": user.email};

        return db.query('FOR x IN User FILTER x._key == @key UPDATE x WITH { username:@username, email:@email } IN User', bindVars)
            .then((value) => {
                return value.all();
            });
    },

    // [GET]: /users/{userKey}/delete
    removeUser: (userKey) => {
        const bindVars = {'userKey': userKey};

        return db.query('FOR x IN User FILTER x._key == @userKey REMOVE x IN User LET removed = OLD RETURN removed', bindVars)
            .then((value) => {
                return value.all();
            });
    }
};
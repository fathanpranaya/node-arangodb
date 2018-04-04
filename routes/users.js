import express from 'express';
import service from '../services/DataServices';

const router = express.Router();
/* GET users listing. */
router.get('/', function (req, res) {
    service.getAllUsers()
        .then((list) => {
            res.render('userlist', {"userlist": list});
        })
        .catch((err) => {
            console.error('Something went wrong:', err);
            res.send("There was a problem adding the information to the database. " + err);
        });
});

/* GET New User page. */
router.get('/newuser', (req, res) => {
    res.render('newuser', {title: 'Add New User'});
});

/* POST to Add User Service */
router.post('/adduser', (req, res) => {
    const user = {
        "username": req.body.username,
        "email": req.body.useremail
    };
    service.addUser(user)
        .then((result) => {
            console.log(result);
            res.redirect("/users");
        })
        .catch((err) => {
            console.error('Something went wrong:', err);
            res.send("There was a problem adding the information to the database. " + err);
        });
});

/* GET User by key. */
router.get('/:key', (req, res) => {
    const userkey = req.params.key;
    service.getUserByKey(userkey)
        .then((list) => {
            console.log(list);
            res.render('userinfo', {"user": list[0]});
        })
        .catch((err) => {
            console.error('Something went wrong:', err);
            res.send("There was a problem adding the information to the database. " + err);
        });
});

/* GET Delete User by key. */
router.get('/:key/delete', (req, res) => {
    const userkey = req.params.key;
    service.removeUser(userkey)
        .then((list) => {
            console.log(list);
            res.redirect("/users");
        })
        .catch((err) => {
            console.error('Something went wrong:', err);
            res.send("There was a problem adding the information to the database. " + err);
        });
});

/* GET to Update User */
router.get('/:key/update', (req, res) => {
    const userkey = req.params.key;
    service.getUserByKey(userkey)
        .then((list) => {
            res.render('userupdate', {"user": list[0]});
        })
        .catch((err) => {
            console.error('Something went wrong:', err);
            res.send("There was a problem adding the information to the database. " + err);
        });
});

/* POST to update User */
router.post('/:key/update', (req, res) => {
    const user = {
        "key": req.params.key,
        "username": req.body.username,
        "email": req.body.useremail
    };
    service.updateUser(user)
        .then((result) => {
            res.redirect("/users");
        })
        .catch((err) => {
            console.error('Something went wrong:', err);
            res.send("There was a problem adding the information to the database. " + err);
        });
});

module.exports = router;
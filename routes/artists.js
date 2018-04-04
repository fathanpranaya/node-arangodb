var express = require('express');
var request = require('request');
var getPem = require('rsa-pem-from-mod-exp');
var jwt = require('jsonwebtoken');
var router = express.Router();

var PKs;
var URL = 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_mNtq6o7l0/.well-known/jwks.json';

/* get public key */
console.log("Fetch public key...");
request.get(URL, function(err, response, body) {
    if(err) {
        console.log('Error while fetching public keys: ' + err);
        return;
    }

    if(body) PKs = JSON.parse(response.body).keys;

    console.log('Fetched: \n' + JSON.stringify(PKs));
});

/* GET artists listing. */
router.get('/', function (req, res, next) {
    var cookie = Object.keys(req.cookies).find(function(cookie) {
       return cookie.endsWith('accessToken');
    });

    var token = req.cookies[cookie];

    var decoded = jwt.decode(token, { complete: true });

    var PK = PKs.find(function(pk) {
        return pk.kid === decoded.header.kid;
    });

    var pem = getPem(PK.n, PK.e);

    jwt.verify(token, pem, function(err, decoded) {
        if(err) {
            console.error('Something went wrong while verifying:', err);
            res.send("There was a problem verifying the request. " + err);
        }

        if(decoded) {
            console.log('Decoded successfully: \n' + JSON.stringify(decoded));
            res.send({
                username: decoded.username
            });
        }
    })
});

module.exports = router;
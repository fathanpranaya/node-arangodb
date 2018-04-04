import express from 'express';
import request from 'request';
import getPem from 'rsa-pem-from-mod-exp';
import jwt from 'jsonwebtoken';

const router = express.Router();
let PKs = [];
const AWS_COGNITO_PK_URL = process.env.AWS_COGNITO_PK_URL;

/* get public key */
console.log("Fetch public key...");
request.get(AWS_COGNITO_PK_URL, (err, response, body) => {
    if (err) {
        console.log('Error while fetching public keys: ' + err);
        return;
    }

    if (body) PKs = JSON.parse(response.body).keys;

    console.log('Fetched: \n' + JSON.stringify(PKs));
});

/* GET artists listing. */
router.get('/', (req, res, next) => {
    const cookie = Object.keys(req.cookies).find((cookie) => {
        return cookie.endsWith('accessToken');
    });

    const token = req.cookies[cookie];

    const decoded = jwt.decode(token, {complete: true});

    const PK = PKs.find((pk) => {
        return pk.kid === decoded.header.kid;
    });

    const pem = getPem(PK.n, PK.e);

    jwt.verify(token, pem, (err, decoded) => {
        if (err) {
            console.error('Something went wrong while verifying:', err);
            res.send("There was a problem verifying the request. " + err);
        }

        if (decoded) {
            console.log('Decoded successfully: \n' + JSON.stringify(decoded));
            res.send({
                username: decoded.username
            });
        }
    })
});

module.exports = router;
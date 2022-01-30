const jwt = require('jsonwebtoken');
const InvalidArgumentError = require('../errors/invalid-argument-error');
const users = require('../users/users');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const accessTokenLife = parseInt(process.env.ACCESS_TOKEN_LIFE);
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokenLife = parseInt(process.env.REFRESH_TOKEN_LIFE);
const cookieExpiry = process.env.REFRESH_TOKEN_COOKIE_EXPIRY;

module.exports.authenticate = (req, res) => {
    return new Promise((resolve, reject) => {
        let username = req.body.username;
        let password = req.body.password;
        if(!username) {
            return reject(new InvalidArgumentError(400, 'Username is not in request.'));
        }
        if(!password) {
            return reject(new InvalidArgumentError(400, 'Password is not in request.'));
        }
        let user = users.find((u) => {
            return u.username == username;
        });
        if(!user) {
            return reject(new InvalidArgumentError(404, 'No user found with this username:', username));
        }
        if(user) {
            if(user.password !== password) {
                return reject(new InvalidArgumentError(403, `Password doesn't match for this username:`, username));
            }
            getOrRefreshToken(user, res);
            return resolve(true);
        }
    });
};

module.exports.authorize = (req, res) => {
    return new Promise((resolve, reject) => {
        let auth = req.headers.authorization;
        if(!auth) {
            return reject(new InvalidArgumentError(400, 'Authorization header not found in request.'));
        }
        var tokenArray = auth.split(' ');
        if(tokenArray[0] != 'Bearer') {
            return reject(new InvalidArgumentError(400, 'Invalid Bearer token in request.'));
        }
        let cookie = req.cookies['refreshToken'];
        if(!cookie) {
            return reject(new InvalidArgumentError(400, 'Refresh token not found in request.'));
        }
        let expiredAccess = false;
        let payload = {};
        jwt.verify(tokenArray[1], accessTokenSecret, (err, verifiedJwt) => {
            if(err) {
                if(err.name === 'TokenExpiredError') {
                    console.log('Access token expired');
                    expiredAccess = true;
                    payload = jwt.verify(tokenArray[1], accessTokenSecret, { ignoreExpiration: true });
                } else {
                    return reject(new InvalidArgumentError(401, 'Invalid access token in request.'));
                }
            } else {
                payload = verifiedJwt;
            }
        });
        let expiredRefresh = false;
        jwt.verify(cookie, refreshTokenSecret, (err, verifiedJwt) => {
            if(err) {
                if(err.name === 'TokenExpiredError') {
                    console.log('Refresh token expired');
                    expiredRefresh = true;
                    payload = jwt.verify(cookie, refreshTokenSecret, { ignoreExpiration: true });
                } else {
                    return reject(new InvalidArgumentError(401, 'Invalid refresh token in request.'));
                }
            } else {
                payload = verifiedJwt;
            }
        });
        if(expiredRefresh) {
            return reject(new InvalidArgumentError(401, 'Token expired.'));
        }
        if(expiredAccess) {
            getOrRefreshToken({ username: payload.username, password: payload.password }, res);
        } else {
            res.status(200).send('');
        }
        return resolve(true);
    });
};

function getOrRefreshToken(user, res) {
    var token = getToken(user, accessTokenSecret, accessTokenLife);
    var refreshToken = getToken(user, refreshTokenSecret, refreshTokenLife);

    let options = {
        httpOnly: true,
        secure: true,
        maxAge: 365 * 24 * 60 * 60 * 1000 * 1000,
        sameSite: 'strict'
    };

    res.cookie('refreshToken', refreshToken, options);
    res.json({ jwt: token });
}

function getToken(user, key, lifeTime) {
    return jwt.sign(user, key, { expiresIn: lifeTime });
}
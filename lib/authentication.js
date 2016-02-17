var config = require('./config');
var path = require('path');
var qs = require('querystring');
var async = require('async');
var colors = require('colors');
var express = require('express');
var jwt = require('jwt-simple');
var moment = require('moment');
var request = require('request');
var configuration = {

    // App Settings
    TOKEN_SECRET: process.env.TOKEN_SECRET || config.authentication.token,

    // OAuth 2.0

    GOOGLE_SECRET: process.env.GOOGLE_SECRET || config.authentication.google,
    GITHUB_SECRET: process.env.GITHUB_SECRET || config.authentication.github,
    FACEBOOK_SECRET: process.env.FACEBOOK_SECRET || config.authentication.facebook,
    LINKEDIN_SECRET: process.env.LINKEDIN_SECRET || config.authentication.linkedin

    //FOURSQUARE_SECRET: process.env.FOURSQUARE_SECRET || 'YOUR_FOURSQUARE_CLIENT_SECRET',
    //INSTAGRAM_SECRET: process.env.INSTAGRAM_SECRET || 'YOUR_INSTAGRAM_CLIENT_SECRET',
    //TWITCH_SECRET: process.env.TWITCH_SECRET || 'YOUR_TWITCH_CLIENT_SECRET',
    //WINDOWS_LIVE_SECRET: process.env.WINDOWS_LIVE_SECRET || 'YOUR_MICROSOFT_CLIENT_SECRET',
    //YAHOO_SECRET: process.env.YAHOO_SECRET || 'YOUR_YAHOO_CLIENT_SECRET',
    //BITBUCKET_SECRET: process.env.YAHOO_SECRET || 'YOUR_BITBUCKET_CLIENT_SECRET',

    // OAuth 1.0
    //TWITTER_KEY: process.env.TWITTER_KEY || 'YOUR_TWITTER_CONSUMER_KEY',
    //TWITTER_SECRET: process.env.TWITTER_SECRET || 'YOUR_TWITTER_CONSUMER_SECRET'
};

module.exports = function (app, cloudant) {

    var User = cloudant.db.use("users");

    /*
     |--------------------------------------------------------------------------
     | Login Required Middleware
     |--------------------------------------------------------------------------
     */
    function ensureAuthenticated(req, res, next) {
        if (!req.headers.authorization) {
            return res.status(401).send({message: 'Please make sure your request has an Authorization header'});
        }
        var token = req.headers.authorization.split(' ')[1];

        var payload = null;
        try {
            payload = jwt.decode(token, configuration.TOKEN_SECRET);
        }
        catch (err) {
            return res.status(401).send({message: err.message});
        }

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({message: 'Token has expired'});
        }

        req.user = payload.sub;
        next();
    }

    /*
     |--------------------------------------------------------------------------
     | Generate JSON Web Token
     |--------------------------------------------------------------------------
     */
    function createJWT(user) {
        var payload = {
            sub: user._id,
            iat: moment().unix(),
            exp: moment().add(14, 'days').unix()
        };
        return jwt.encode(payload, configuration.TOKEN_SECRET);
    }

    /*
     |--------------------------------------------------------------------------
     | GET /api/me
     |--------------------------------------------------------------------------
     */
    app.get('/auth/me', ensureAuthenticated, function (req, res) {
        User.get(req.user, function (err, user) {
            res.send(user);
        });
    });

    /*
     |--------------------------------------------------------------------------
     | Login with Google
     |--------------------------------------------------------------------------
     */
    app.post('/auth/google', function (req, res) {

        var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
        var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
        var params = {
            code: req.body.code,
            client_id: req.body.clientId,
            client_secret: configuration.GOOGLE_SECRET,
            redirect_uri: req.body.redirectUri,
            grant_type: 'authorization_code'
        };

        // Step 1. Exchange authorization code for access token.
        request.post(accessTokenUrl, {json: true, form: params}, function (err, response, token) {

            var accessToken = token.access_token;
            var headers = {Authorization: 'Bearer ' + accessToken};

            // Step 2. Retrieve profile information about the current user.
            request.get({url: peopleApiUrl, headers: headers, json: true}, function (err, response, profile) {

                if (profile.error) {
                    return res.status(500).send({message: profile.error.message});
                }

                // Step 3a. Link user accounts.
                if (req.headers.authorization) {

                    User.find({
                        "selector": {"google": profile.sub, "_id": {"$gt": 0}}
                    }, function (err, existingUser) {
                        if (existingUser.docs.length) {
                            return res.status(409).send({message: 'There is already a Google account that belongs to you'});
                        }
                        var token = req.headers.authorization.split(' ')[1];
                        var payload = jwt.decode(token, configuration.TOKEN_SECRET);
                        User.get(payload.sub, function (err, user) {
                            if (!user) {
                                return res.status(400).send({message: 'User not found'});
                            }
                            user.google = profile.sub;
                            user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
                            user.displayName = user.displayName || profile.name;
                            User.insert(user, function (err, result) {
                                user._id = result.id;
                                var token = createJWT(user);
                                res.send({token: token});
                            });
                        });
                    });

                } else {

                    // Step 3b. Create a new user account or return an existing one.
                    User.find({
                        "selector": {"google": profile.sub, "_id": {"$gt": 0}}
                    }, function (err, existingUser) {
                        existingUser = existingUser.docs.length ? existingUser.docs[0] : null;
                        if (existingUser) {
                            return res.send({token: createJWT(existingUser)});
                        }
                        var user = {
                            google: profile.sub,
                            picture: profile.picture.replace('sz=50', 'sz=200'),
                            displayName: profile.name
                        };
                        User.insert(user, function (err, result) {
                            user._id = result.id;
                            var token = createJWT(user);
                            res.send({token: token});
                        });

                    })
                }
            });

        })

    });

    /*
     |--------------------------------------------------------------------------
     | Login with GitHub
     |--------------------------------------------------------------------------
     */
    app.post('/auth/github', function (req, res) {
        var accessTokenUrl = 'https://github.com/login/oauth/access_token';
        var userApiUrl = 'https://api.github.com/user';
        var params = {
            code: req.body.code,
            client_id: req.body.clientId,
            client_secret: configuration.GITHUB_SECRET,
            redirect_uri: req.body.redirectUri
        };

        // Step 1. Exchange authorization code for access token.
        request.get({url: accessTokenUrl, qs: params}, function (err, response, accessToken) {
            accessToken = qs.parse(accessToken);
            var headers = {'User-Agent': 'Satellizer'};

            // Step 2. Retrieve profile information about the current user.
            request.get({
                url: userApiUrl,
                qs: accessToken,
                headers: headers,
                json: true
            }, function (err, response, profile) {

                // Step 3a. Link user accounts.
                if (req.headers.authorization) {

                    User.find({
                        "selector": {"github": profile.id, "_id": {"$gt": 0}}
                    }, function (err, existingUser) {
                        if (existingUser.docs.length) {
                            return res.status(409).send({message: 'There is already a GitHub account that belongs to you'});
                        }
                        var token = req.headers.authorization.split(' ')[1];
                        var payload = jwt.decode(token, configuration.TOKEN_SECRET);
                        User.get(payload.sub, function (err, user) {
                            if (!user) {
                                return res.status(400).send({message: 'User not found'});
                            }
                            user.github = profile.id;
                            user.picture = user.picture || profile.avatar_url;
                            user.displayName = user.displayName || profile.name;
                            User.insert(user, function (err, result) {
                                user._id = result.id;
                                var token = createJWT(user);
                                res.send({token: token});
                            });
                        });
                    });

                } else {

                    // Step 3b. Create a new user account or return an existing one.
                    User.find({
                        "selector": {"github": profile.id, "_id": {"$gt": 0}}
                    }, function (err, existingUser) {
                        existingUser = existingUser.docs.length ? existingUser.docs[0] : null;
                        if (existingUser) {
                            return res.send({token: createJWT(existingUser)});
                        }
                        var user = {
                            github: profile.id,
                            picture: profile.avatar_url,
                            displayName: profile.name
                        };
                        User.insert(user, function (err, result) {
                            user._id = result.id;
                            var token = createJWT(user);
                            res.send({token: token});
                        });
                    });

                }
            });
        });
    });

    /*
     |--------------------------------------------------------------------------
     | Login with LinkedIn
     |--------------------------------------------------------------------------
     */
    app.post('/auth/linkedin', function (req, res) {
        var accessTokenUrl = 'https://www.linkedin.com/uas/oauth2/accessToken';
        var peopleApiUrl = 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address,picture-url)';
        var params = {
            code: req.body.code,
            client_id: req.body.clientId,
            client_secret: configuration.LINKEDIN_SECRET,
            redirect_uri: req.body.redirectUri,
            grant_type: 'authorization_code'
        };

        // Step 1. Exchange authorization code for access token.
        request.post(accessTokenUrl, {form: params, json: true}, function (err, response, body) {
            if (response.statusCode !== 200) {
                return res.status(response.statusCode).send({message: body.error_description});
            }
            var params = {
                oauth2_access_token: body.access_token,
                format: 'json'
            };

            // Step 2. Retrieve profile information about the current user.
            request.get({url: peopleApiUrl, qs: params, json: true}, function (err, response, profile) {

                // Step 3a. Link user accounts.
                if (req.headers.authorization) {

                    User.find({
                        "selector": {"linkedin": profile.id, "_id": {"$gt": 0}}
                    }, function (err, existingUser) {
                        if (existingUser.docs.length) {
                            return res.status(409).send({message: 'There is already a LinkedIn account that belongs to you'});
                        }
                        var token = req.headers.authorization.split(' ')[1];
                        var payload = jwt.decode(token, configuration.TOKEN_SECRET);
                        User.get(payload.sub, function (err, user) {
                            if (!user) {
                                return res.status(400).send({message: 'User not found'});
                            }
                            user.linkedin = profile.id;
                            user.picture = user.picture || profile.pictureUrl;
                            user.displayName = user.displayName || profile.firstName + ' ' + profile.lastName;
                            User.insert(user, function (err, result) {
                                user._id = result.id;
                                var token = createJWT(user);
                                res.send({token: token});
                            });
                        });
                    });

                } else {

                    // Step 3b. Create a new user account or return an existing one.
                    User.find({
                        "selector": {"linkedin": profile.id, "_id": {"$gt": 0}}
                    }, function (err, existingUser) {
                        existingUser = existingUser.docs.length ? existingUser.docs[0] : null;
                        if (existingUser) {
                            return res.send({token: createJWT(existingUser)});
                        }
                        var user = {
                            linkedin: profile.id,
                            picture: profile.pictureUrl,
                            displayName: profile.firstName + ' ' + profile.lastName
                        };
                        User.insert(user, function (err, result) {
                            user._id = result.id;
                            var token = createJWT(user);
                            res.send({token: token});
                        });
                    });

                }
            });
        });
    });

    /*
     |--------------------------------------------------------------------------
     | Login with Facebook
     |--------------------------------------------------------------------------
     */
    app.post('/auth/facebook', function (req, res) {
        var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
        var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
        var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
        var params = {
            code: req.body.code,
            client_id: req.body.clientId,
            client_secret: configuration.FACEBOOK_SECRET,
            redirect_uri: req.body.redirectUri
        };

        // Step 1. Exchange authorization code for access token.
        request.get({url: accessTokenUrl, qs: params, json: true}, function (err, response, accessToken) {
            if (response.statusCode !== 200) {
                return res.status(500).send({message: accessToken.error.message});
            }

            // Step 2. Retrieve profile information about the current user.
            request.get({url: graphApiUrl, qs: accessToken, json: true}, function (err, response, profile) {
                if (response.statusCode !== 200) {
                    return res.status(500).send({message: profile.error.message});
                }
                if (req.headers.authorization) {

                    User.find({
                        "selector": {"facebook": profile.id, "_id": {"$gt": 0}}
                    }, function (err, existingUser) {
                        existingUser = existingUser.docs.length ? existingUser.docs[0] : null;
                        if (existingUser) {
                            return res.status(409).send({message: 'There is already a Facebook account that belongs to you'});
                        }
                        var token = req.headers.authorization.split(' ')[1];
                        var payload = jwt.decode(token, configuration.TOKEN_SECRET);
                        User.get(payload.sub, function (err, user) {
                            if (!user) {
                                return res.status(400).send({message: 'User not found'});
                            }
                            user.facebook = profile.id;
                            user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
                            user.displayName = user.displayName || profile.name;
                            User.insert(user, function (err, result) {
                                user._id = result.id;
                                var token = createJWT(user);
                                res.send({token: token});
                            });
                        });
                    });

                } else {

                    // Step 3b. Create a new user account or return an existing one.
                    User.find({
                        "selector": {"facebook": profile.id, "_id": {"$gt": 0}}
                    }, function (err, existingUser) {
                        existingUser = existingUser.docs.length ? existingUser.docs[0] : null;
                        if (existingUser) {
                            return res.send({token: createJWT(existingUser)});
                        }
                        var user = {
                            facebook: profile.id,
                            picture: 'https://graph.facebook.com/' + profile.id + '/picture?type=large',
                            displayName: profile.name
                        };
                        User.insert(user, function (err, result) {
                            user._id = result.id;
                            var token = createJWT(user);
                            res.send({token: token});
                        });
                    });

                }
            });
        });
    });

    return {
        ensureAuthenticated: ensureAuthenticated
    }

};
var extend = require('util')._extend;

module.exports = function (app, cloudant, authentication) {

    require('express-crud')(app);

    // Status

    app.get('/cloudant/status', function (req, res, next) {
        cloudant.db.list(function (err, allDbs) {
            res.json(allDbs);
        });
    });

    // Settings

    var db_settings = cloudant.db.use("settings");

    var settings = {
        set: function (key, value, cb) {
            db_settings.get(key, function (err, setting) {
                if (!setting) {
                    setting = {_id: key};
                }
                setting.value = value;
                db_settings.insert(setting, function (err, result) {
                    cb(err, result);
                });
            });
        },
        get: function (key, cb) {
            db_settings.get(key, function (err, setting) {
                cb(err, setting);
            });
        }
    };

    app.get('/cloudant/settings', function (req, res, next) {
        var result = {};
        if (req.query && req.query.key)
            settings.get(req.query.key, function (err, setting) {
                if (err)
                    res.json(result);
                else
                    res.json(setting.value);
            });
        else
            res.json(result);
    });

    app.post('/cloudant/settings', function (req, res, next) {
        var result = {};
        if (req.body && req.body.key && req.body.value)
            settings.set(req.body.key, req.body.value, function (err, setting) {
                res.json(err ? err : setting);
            });
        else
            res.json(result);
    });

    // Entities

    var db_entities = cloudant.db.use("entities");

    var entities = {
        create: function (query, model, cb) {
            model.user = query.user;
            db_entities.insert(model, function (err, result) {
                cb(null, result);
            });
        },
        delete: function (id, query, cb) {
            entities.readById(id, query, function (err, result) {
                items.read({"entity": result._id}, function (err, result) {
                    result.forEach(function (item) {
                        items.delete(item._id, {}, function (err, data) {
                        });
                    });
                });
                db_entities.destroy(result._id, result._rev, function (err, data) {
                    cb(err, data);
                });
            })
        },
        read: function (query, cb) {
            db_entities.find({
                "selector": {
                    "_id": {"$gt": 0}
                }
            }, function (err, result) {
                cb(err, result.docs);
            });
        },
        approved: function (query, cb) {
            db_entities.find({
                "selector": {
                    "_id": {"$gt": 0},
                    "approved": true
                }
            }, function (err, result) {
                cb(err, result.docs);
            });
        },
        readById: function (id, query, cb) {
            db_entities.get(id, function (err, entity) {
                items.read({"entity": entity._id}, function (err, items) {
                    entity.items = items;
                    cb(err, entity);
                });
            });
        },
        update: function (id, query, model, cb) {
            if (model && model.items)
                delete model['items'];
            entities.readById(id, query, function (err, result) {
                model = extend(result, model);
                db_entities.insert(model, function (err, result) {
                    cb(null, result);
                });
            });

        }
    };

    app.crud('cloudant/entities', authentication.ensureAuthenticated, function (req, res, next) {
        req.query.user = req.user;
        next();
    }, entities);

    // Items

    var db_items = cloudant.db.use("items");

    var items = {
        create: function (query, model, cb) {
            db_items.insert(model, function (err, result) {
                cb(null, result);
            });
        },
        delete: function (id, query, cb) {
            items.readById(id, query, function (err, result) {
                db_items.destroy(result._id, result._rev, function (err, data) {
                    cb(err, data);
                });
            })
        },
        read: function (query, cb) {
            query = extend(query, {"_id": {"$gt": 0}});
            db_items.find({
                "selector": query,
                "fields": ["_id", "entity", "question", "answer"]
            }, function (err, result) {
                cb(err, result.docs);
            });
        },
        readById: function (id, query, cb) {
            db_items.get(id, function (err, result) {
                cb(err, result);
            });
        },
        update: function (id, query, model, cb) {
            items.readById(id, query, function (err, result) {
                model = extend(result, model);
                db_items.insert(model, function (err, result) {
                    cb(null, result);
                });
            });

        }
    };

    app.crud('cloudant/items', items);

    return {
        settings: settings,
        entities: entities,
        items: items
    };


};
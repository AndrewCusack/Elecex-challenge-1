'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const Database = require('./lib/Database');

const setup = async () => {
    const database = new Database();
    const db = await database.init()
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });

    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.get('/devices', (req, res, next) => {
        return db.all('SELECT * FROM devices;')
            .then(devices => res.json(devices))
            .catch(next);
    });

    app.get('/devices/:deviceId', (req, res, next) => {
        return db.get('SELECT * FROM devices WHERE id = ?;', req.params.deviceId)
            .then(devices => (devices) ? res.json(devices) : res.status(404).json({error : 'Error #1'}))
            .catch(next);
    });

    app.get('/devices/active/:isActive', (req, res, next) => {
        if (req.params.isActive != 1 && req.params.isActive != 0 && typeof req.body.active !== 'boolean') {
            return res.status(404).json({error : 'Error #2'});
        }
        return db.all('SELECT * FROM devices WHERE active = ?;', req.params.isActive)
            .then(devices => res.json(devices))
            .catch(next);
    });

    app.post('/devices', (req, res, next) => {
        const newDevice = [req.body.siteId, req.body.name, req.body.active];
        if (!req.body.name || typeof req.body.active !== 'boolean') {
            return res.status(400).json({error : 'Error #3'});
        }

        return db.get('SELECT * FROM sites WHERE id = ?;', req.body.siteId)
            .then(devices => (!devices) ? res.status(400).json({error : 'Error #4'}) :
                db.run('INSERT INTO devices (siteId, name, active) VALUES (?, ?, ?)', newDevice)
                .then(insertResult => db.get('SELECT * FROM devices WHERE id = ?', insertResult.stmt.lastID)
                    .then(insertedDevice => res.json(insertedDevice))
                    .catch(next)
                )
                .catch(next)
            )
            .catch(next)
    });

    app.get('/sites/:id', (req, res, next) => {
        return db.get('SELECT * FROM sites WHERE id = ?;', req.params.id)
            .then(selectedSite => (!selectedSite) ? res.status(404).json({error : 'Error #5'}) :
                db.all('SELECT * FROM devices WHERE siteId = ?;', req.params.id)
                    .then(function(devices) { selectedSite.devices = devices; res.json(selectedSite); })
                    .catch(next)
            )
            .catch(next);
    });

    app
        .listen(3000, '0.0.0.0', () => { console.info('server listening on port: 3000'); })
        .on('request', (req) => { console.info(req.method, req.baseUrl + req.url); })
        .on('error', (err) => { console.error(err); });
};

setup();

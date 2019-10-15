/* eslint-disable */

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
            .then(devices => res.json(devices))
            .catch(next);
    });

    app.post('/devices', (req, res, next) => {
        const newDevice = [req.body.siteId, req.body.name, req.body.active];
        return db.run('INSERT INTO devices (siteId, name, active) VALUES (?, ?, ?)', newDevice)
            .then(insertResult => db.get('SELECT * FROM devices WHERE id = ?', insertResult.stmt.lastID))
            .then(insertedDevice => res.json(insertedDevice))
            .catch(next);
    });

    app
        .listen(3000, '0.0.0.0', () => { console.info('server listening on port: 3000'); })
        .on('request', (req) => { console.info(req.method, req.baseUrl + req.url); })
        .on('error', (err) => { console.error(err); });
};

setup();

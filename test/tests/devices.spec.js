/* eslint-env mocha */
/* eslint-env chai */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-console */

'use strict';

const expect = require('chai').expect;

const httpClient = require('../util/httpClient');
const Database = require('../../src/lib/Database');

describe('/devices', function () {
    beforeEach('DB Setup', function () {
        const database = new Database();
        return database.init();
    });

    describe('GET /devices', function () {
        it('GET /devices should return an array of device objects', function () {
            return httpClient.get('http://localhost:3000/devices')
                .then((fullResponse) => {
                    expect(fullResponse.statusCode).to.equal(200);
                    const devices = fullResponse.body;
                    expect(devices).to.be.an('array');
                    expect(devices[0].name).to.equal('Device 1');
                });
        });
    });

    describe('GET /devices/:id', function () {
        it('GET /devices/:id should return a single device object', function () {
            return httpClient.get('http://localhost:3000/devices/1')
                .then((fullResponse) => {
                    expect(fullResponse.statusCode).to.equal(200);
                    const device = fullResponse.body;
                    expect(device).to.be.an('object');
                    expect(device.name).to.equal('Device 1');
                });
        });
        it('GET /devices/:id should fail if the device doesn\'t exist', function () {
            return httpClient.get('http://localhost:3000/devices/10')
                .then((fullResponse) => {
                    expect(fullResponse.statusCode).to.equal(404);
                    expect(fullResponse.body.error).to.equal('Error #1');
                })
                .catch((err) => {
                    expect(err.statusCode).to.equal(404);
                    expect(err.response.body.error).to.equal('Error #1');
                });
        });
        it('GET /devices/:id should fail if the input is invalid', function () {
            return httpClient.get('http://localhost:3000/devices/a')
                .then((fullResponse) => {
                    expect(fullResponse.statusCode).to.equal(404);
                    expect(fullResponse.body.error).to.equal('Error #1');
                })
                .catch((err) => {
                    expect(err.statusCode).to.equal(404);
                    expect(err.response.body.error).to.equal('Error #1');
                });
        });
    });

    describe('GET /devices/active/:isActive', function () {
        it('GET /devices/active/:isActive should return all active devices', function () {
            return httpClient.get('http://localhost:3000/devices/active/1')
                .then((fullResponse) => {
                    expect(fullResponse.statusCode).to.equal(200);
                    const devices = fullResponse.body;
                    expect(devices).to.be.an('array');
                    expect(devices.length).to.equal(2);
                    expect(devices[0].name).to.equal('Device 1');
                    expect(devices[1].name).to.equal('Device 3');
                });
        });
        it('GET /devices/active/:isActive should fail if the input is invalid', function () {
            return httpClient.get('http://localhost:3000/devices/active/a')
                .then((fullResponse) => {
                    expect(fullResponse.statusCode).to.equal(404);
                    expect(fullResponse.body.error).to.equal('Error #2');
                })
                .catch((err) => {
                    expect(err.statusCode).to.equal(404);
                    expect(err.response.body.error).to.equal('Error #2');
                });
        });
    });

    describe('POST /devices', function () {
        it('POST /devices should create a new device and return it', function () {
            const newDevice = {
                siteId: 1,
                name: 'Device 4',
                active: false
            };
            return httpClient.post('http://localhost:3000/devices', newDevice)
                .then((fullResponse) => {
                    const device = fullResponse.body;
                    expect(device).to.be.an('object');
                    expect(device.name).to.equal('Device 4');
                });
        });
        it('POST /devices should fail if the site provided doesn\'t exist', function () {
          const newDevice = {
              siteId: 8,
              name: 'Device 4',
              active: false
          };
          return httpClient.post('http://localhost:3000/devices', newDevice)
              .then((fullResponse) => {
                    expect(fullResponse.statusCode).to.equal(400);
                    expect(fullResponse.body.error).to.equal('Error #4');
                })
                .catch((err) => {
                    expect(err.statusCode).to.equal(400);
                    expect(err.response.body.error).to.equal('Error #4');
                });
        });
        it('POST /devices should fail if the given name is invalid', function () {
          const newDevice = {
              siteId: 1,
              name: null,
              active: false
          };
          return httpClient.post('http://localhost:3000/devices', newDevice)
              .then((fullResponse) => {
                    expect(fullResponse.statusCode).to.equal(400);
                    expect(fullResponse.body.error).to.equal('Error #3');
                })
                .catch((err) => {
                    expect(err.statusCode).to.equal(400);
                    expect(err.response.body.error).to.equal('Error #3');
                });
        });
        it('POST /devices should fail if the active status is invalid', function () {
          const newDevice = {
              siteId: 1,
              name: 'Device 4',
              active: 6
          };
          return httpClient.post('http://localhost:3000/devices', newDevice)
              .then((fullResponse) => {
                    expect(fullResponse.statusCode).to.equal(400);
                    expect(fullResponse.body.error).to.equal('Error #3');
                })
                .catch((err) => {
                    expect(err.statusCode).to.equal(400);
                    expect(err.response.body.error).to.equal('Error #3');
                });
        });
    });
});

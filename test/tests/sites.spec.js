/* eslint-env mocha */
/* eslint-env chai */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-console */

'use strict';

const expect = require('chai').expect;

const httpClient = require('../util/httpClient');
const Database = require('../../src/lib/Database');

describe('/sites', function () {
    beforeEach('DB Setup', function () {
        const database = new Database();
        return database.init();
    });

    describe('GET /sites/:id', function () {
        it('GET /sites/:id should return a single site with related devices object', function () {
            return httpClient.get('http://localhost:3000/sites/1')
                .then((fullResponse) => {
                    expect(fullResponse.statusCode).to.equal(200);
                    const site = fullResponse.body;
                    expect(site).to.be.an('object');
                    expect(site.name).to.equal('Site 1');

                    expect(site.devices).to.be.an('array');
                    expect(site.devices.length).to.equal(2);

                    expect(site.devices[0].name).to.equal('Device 1');
                    expect(site.devices[0].active).to.equal(1);
                    expect(site.devices[1].name).to.equal('Device 2');
                    expect(site.devices[1].active).to.equal(0);
                });
        });
        it('GET /sites/:id should fail if the site doesn\'t exist', function () {
            return httpClient.get('http://localhost:3000/sites/10')
                .then((fullResponse) => {
                    expect(fullResponse.statusCode).to.equal(404);
                    expect(fullResponse.body.error).to.equal('Error #5');
                })
                .catch((err) => {
                    expect(err.statusCode).to.equal(404);
                    expect(err.response.body.error).to.equal('Error #5');
                });
        });
        it('GET /sites/:id should fail if the input is invalid', function () {
            return httpClient.get('http://localhost:3000/sites/a')
                .then((fullResponse) => {
                    expect(fullResponse.statusCode).to.equal(404);
                    expect(fullResponse.body.error).to.equal('Error #5');
                })
                .catch((err) => {
                    expect(err.statusCode).to.equal(404);
                    expect(err.response.body.error).to.equal('Error #5');
                });
        });
    });
});

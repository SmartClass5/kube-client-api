const request = require('request');
const {noSql: {strapiUrl}} = require('../../config/config');

let mongoApi = {};

mongoApi.getResearchLab = (username) => {
    return new Promise((resolve, reject) => {
        const options = {
            uri: strapiUrl+`/researchlabs/?username=${username}`,
            method: 'GET',
            body: {},
            json: true
        }
        request.get(options, async (err, res, body) => {
            resolve(res);
        })
    });
};

mongoApi.getDockerImage = (id) => {
    return new Promise((resolve, reject) => {
        const options = {
            uri: strapiUrl+`/dockerimages/`,
            method: 'GET',
            body: {},
            json: true
        }
        request.get(options, async (err, res, body) => {
            resolve(res);
        })
    });
}

mongoApi.getComputeLab = (id) => {
    return new Promise((resolve, reject) => {
        const options = {
            uri: strapiUrl+`/compute-labs/`,
            method: 'GET',
            body: {},
            json: true
        }
        request.get(options, async (err, res, body) => {
            resolve(res);
        })
    });
}

module.exports = mongoApi;
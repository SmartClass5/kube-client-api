const { User } = require('../models/user-permission');
const _ = require('lodash');
const k8sClient = require('../utils/k8s/client');
const k8sNamespace = require('../utils/k8s/namespace');
const config = require('../config/config');
let ClientController = {}


ClientController.form = async (req, res, next) => {
    const namespaces = await k8sNamespace.listNamespace();

    return res.json(namespaces)

}


module.exports = ClientController;
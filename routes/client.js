const express = require("express");

const router = express.Router();
const ClientController = require('../controller/client');

// POST /tweeets
router.get('/', ClientController.form);

module.exports = router;
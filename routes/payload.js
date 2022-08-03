const express = require("express");

const router = express.Router();
const PayloadController  = require('../controller/payload');
// POST /tweeets
router.post('/', PayloadController.form);

module.exports = router;
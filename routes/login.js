const express = require("express");

const router = express.Router();
const LoginController  = require('../controller/login');
// POST /tweeets
router.post('/', LoginController.form);

module.exports = router;
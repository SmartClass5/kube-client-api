const express = require("express");

const router = express.Router();
const SignUpController  = require('../controller/sign-up');
// POST /tweeets
router.post('/', SignUpController.form);

module.exports = router;
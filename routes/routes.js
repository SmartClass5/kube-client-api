const express = require("express");

const router = express.Router();

const LoginRouters = require('./login');
const SignUpRouters = require('./sign-up');
const PayloadRouters = require('./payload');

router.use('/login', LoginRouters);
router.use('/sign-up', SignUpRouters);
router.use('/payload', PayloadRouters);

module.exports = router;
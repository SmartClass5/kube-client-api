const express = require("express");

const router = express.Router();

const ClientRouters = require('./client');

router.use('/client', ClientRouters);


module.exports = router;
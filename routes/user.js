const express = require('express')
const router = express.Router()
const Users = require('../controllers/user')

/* GET users listing. */
router.post('/login', Users.userLogin);

module.exports = router;
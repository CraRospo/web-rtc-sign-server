const express = require('express')
const router = express.Router()
const Users = require('../controllers/user')

/* GET users listing. */
router.post('/login', Users.userLogin);
router.get('/group', (req, res, next) => {

  let data = []
  for (const [key, value] of global.map) {
    console.log(`${key} = ${value}`);
    data.push({
      id: key,
      name: value
    })
  }

  res.send(
    {
      code: 0,
      data
    }
  )
})

module.exports = router;
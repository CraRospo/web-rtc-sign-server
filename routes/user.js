const express = require('express')
const router = express.Router()
const Users = require('../controllers/user')

/* GET users listing. */
router.post('/login', Users.userLogin);
router.get('/group', (req, res, next) => {

  let data = []
  for (const [id, name] of global.map) {
    if (id !== req.session.userId) {
      const status = global.connect.has(id)

      data.push({
        id,
        status,
        name
      })
    }
  }

  res.send(
    {
      code: 0,
      data
    }
  )
})

module.exports = router;
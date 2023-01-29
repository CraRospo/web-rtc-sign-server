const User = require('../models/user')

// 获取账户详情
function userLogin(req, res, next) {
  const user = {
    username: req.body.username,
    password: req.body.password
  }
  User
    .findOne({ ...user })
    .exec(function (err, data) {
      if (err) { return next(err) }

      if (data) {
        res.send({ code: 0, data })
      } else {
        // Member.init()
        const instence = new User(user)

        instence
          .save(function(createErr, user) {
            if (createErr) return next(createErr)
            res.send({code: 0, data: user})

          })
      }
    });
}

module.exports = {
  userLogin
}
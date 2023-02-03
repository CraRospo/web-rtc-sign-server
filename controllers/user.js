const User = require('../models/user')
const uuid = require('uuid')

// 获取账户详情
function userLogin(req, res, next) {
  const session = uuid.v4();
  const user = {
    username: req.body.username,
    password: req.body.password,
  }

  User
    .findOne({ ...user })
    .exec(function (err, data) {
      if (err) { return next(err) }

      if (data) {
        // set-session
        req.session.userId = session
        req.session.userName = data.username

        res.send({ code: 0, data })
      } else {
        // Member.init()
        const instence = new User(user)

        instence
          .save(function(createErr, user) {
            if (createErr) return next(createErr)
            // set-session
            req.session.userId = session
            req.session.userName = user.username

            res.send({code: 0, data: user})
          })
      }
    });
}

module.exports = {
  userLogin
}
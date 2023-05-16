const User = require('../models/user')

// 获取账户详情
function userLogin(req, res, next) {
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
        req.session.userId = data.id
        req.session.userName = data.username

        res.send({ code: 0 })
      } else {
        // Member.init()
        const instence = new User(user)

        instence
          .save(function(createErr, user) {
            if (createErr) return next(createErr)
            // set-session
            req.session.userId = user.id
            req.session.userName = user.username

            res.send({code: 0, data: user})
          })
      }
    });
}

module.exports = {
  userLogin
}
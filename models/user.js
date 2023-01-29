// Require Mongoose
const mongoose = require('mongoose');

// 定义一个模式
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  // _id: Schema.Types.ObjectId,
  username: String,
  password: String,
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now }
})

// 导出函数来创建 "SomeModel" 模型类
module.exports = mongoose.model('User', UserSchema);
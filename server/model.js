var mongoose = require('mongoose');

var chatSchema = mongoose.Schema({
    name : String,
    password : String
  }, {
      timestamp : true
  });

var Chat = mongoose.model('Chat',chatSchema);

module.exports = Chat;

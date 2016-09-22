var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('accounts', Account);

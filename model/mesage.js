var mongoose = require('mongoose');
var messageSchema = new mongoose.Schema({
    message: String,
    created_at: {type: Date, default: Date.now}
});
mongoose.model('Messages', messageSchema);

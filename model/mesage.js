var mongoose = require('mongoose');
var messageSchema = new mongoose.Schema({
    message: {
        type: String,
        trim: true,
        required: true
    },
    created_at : {type: Date, default: Date.now()}
});
mongoose.model('Messages', messageSchema);

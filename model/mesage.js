var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var messageSchema = new mongoose.Schema({
    message: {
        type: String,
        trim: true,
        required: true
    },
    created_at : {type: Date, default: Date.now()},
    // _creator : { type: Schema.Types.ObjectId, ref: 'accounts' }
});
mongoose.model('Messages', messageSchema);

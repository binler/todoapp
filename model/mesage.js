var mongoose = require('mongoose');
var messageSchema = new mongoose.Schema({
    message: {
        type: String,
        trim: true,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at'
    }
});
mongoose.model('Messages', messageSchema);

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var roomSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    created_at : {type: Date, default: Date.now()},
});
mongoose.model('Rooms', roomSchema);

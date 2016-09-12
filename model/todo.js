var mongoose = require('mongoose');
var todoSchema = new mongoose.Schema({
  tododesc: String
});

mongoose.model('Todos', todoSchema);

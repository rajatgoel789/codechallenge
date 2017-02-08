var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var imageSchema = new mongoose.Schema({
	folder: {
		type: String,
	},
	title: {
		type: String,
		required: 'Image title required.'
	},
	counter: {
		type: Number,
		default: 0
	},
	isArchive: {
		type: Boolean,
		default: false
	},
});
imageSchema.statics.load = function(id, cb) {
	this.findOne({
			_id: id
		})
		.exec(cb);
};

var imageObj = mongoose.model('images', imageSchema);
module.exports = imageObj;
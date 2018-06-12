var mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: { type: String, required: true },
    grantor: { type: String, required: true },
    url: { type: String, required: true },
    dateStart: { type: Date, required: true },
    deadline: { type: Date, required: true },
    price: { type: Number, required: true },
    geoScale: { type: String, required: true },
    grantee: [{ type: String, required: true }],
    region: { type: String },
    city: { type: String },
    description: { type: String },
    categories: [{ type: String }],
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Grant', schema);

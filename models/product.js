var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic'); //library to replicate elastic search on data from monogodb  so we can search specific data

var Schema = mongoose.Schema;

var ProductSchema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: 'Category'},
  name: String,
  price: Number,
  image: String
});

ProductSchema.plugin(mongoosastic,{
  hosts:[
    'localhost:9200'    //default number for elastic search
  ]
});

module.exports=mongoose.model('Product',ProductSchema);

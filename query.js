var MongoClient = require('mongodb').MongoClient;
var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/scraper';

   var cursor =db.collection('restaurants').find();
   cursor.exec();
   console.log(cursor);

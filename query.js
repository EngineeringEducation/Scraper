var MongoClient = require('mongodb').MongoClient;
var assert = require('assert')
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://caitlin:caitlinadmin@ds063892.mongolab.com:63892/tc-scraper-data';

   var cursor =db.collection('restaurants').find();
   cursor.exec();
   console.log(cursor);

var cheerio = require('cheerio');
var request = require('request');
var mongo = require('./insertDocument');
var urllib = require('url');
var EventEmitter = require('events').EventEmitter;
var Scraper = require('./person_scraper.js')

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/scraper';
var insert = require('./insertDocument')

var db;
MongoClient.connect(url, function(err, mongo) {
	if (err != null) {
		console.log(err)
	}
	db = mongo;
	var collection = db.collection('contacts');
	this.collection = collection;
	createURLArray(collection);
});	

var Pages = [];
var contacts;

//generate URL array and return
function createURLArray(collection){
	contacts = collection;
	collection.find({}).toArray(function(err, docs){
		var urlArray = [];
		for (var i = 0; i < docs.length; i++) {
			var linkedIn = docs[i]._id;
			var first = docs[i].first;
			var last = docs[i].last;
			var company = docs[i].searchedCompany;
			var siteurl = 	"http://www.bing.com/search?q="
							+first+"%20"
							+last+"%20"
							+company+"&qs=n&form=QBRE&pq="
							+first+"%20"
							+last+"%20"
							+company+"&sc=1-19&sp=-1&sk=&cvid=c01155d732bb436383d015dc3631b214"
			var temp = {};
			temp.url = siteurl;
			temp.linkedIn = linkedIn;
			urlArray.push(temp);
		};
		Pages = urlArray;
		start();
	})
}

function wizard() {
  // if the Pages array is empty, we are Done!!
	if (!Pages.length) {
	return console.log('Done!!!!');
	}

	var url = Pages.pop();
	var scraper = new Scraper(url);
	console.log('Requests Left: ' + Pages.length);
	// if the error occurs we still want to create our
	// next request
	scraper.on('error', function (error) {
		console.log(error);
		wizard();
	});

	scraper.on('complete', function (doc, linkedIn) {
	    console.log("I'm complete");
	    console.log(doc);
	    var data = doc
	    var origLinkedIn = linkedIn;
	    updateData(data, origLinkedIn);
	    wizard();
	});
}

function start(){
	var numberOfParallelRequests = 1;
	for (var i = 0; i < numberOfParallelRequests; i++) {
	  wizard();
	}
}

function updateData(data, linkedIn){
	if (data != null){
		console.log(linkedIn);
		contacts.update(
		{_id : data.linkedIn},
			{$set : 
				{
					experience : data,
					altLinkedIn : linkedIn
				}
			}
		)
	}	
}





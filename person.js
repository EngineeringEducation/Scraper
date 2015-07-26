var cheerio = require('cheerio');
var request = require('request');
var mongo = require('./insertDocument');
var urllib = require('url');
var EventEmitter = require('events').EventEmitter;
var Scraper = require('./person_scraper.js')
var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var assert = require('assert');
var url = 'mongodb://caitlin:caitlinadmin@ds063892.mongolab.com:63892/tc-scraper-data';
var insert = require('./insertDocument')

var db;
run();

function run() {
	db = mongoose.connection;
	mongoose.connect(url);
	var schema = new Schema({ 
		name: String,
		first: String, 
		last: String, 
		searchedCompany: String,
		searchedCompanyWebsite: String,
		currentJob: String,
		currentTitle: String,
		validEmails: Array,
		validatedBy: String,
		permutations: Array
		}); 
	schema.set('collection','contacts');
	var Contact = mongoose.model('contacts', schema);
	createURLArray(Contact);

}

var Pages = [];
var contacts;

//generate URL array and return
function createURLArray(Contact){
	Contact.find(function(err,contacts){
		var urlArray = [];
		for (var i = 0; i < contacts.length; i++) {
			var linkedIn = contacts._id;
			var first = contacts.first;
			var last = contacts.last;
			var company = contacts.searchedCompany;
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





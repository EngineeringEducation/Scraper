var cheerio = require('cheerio');
var request = require('request');
var mongo = require('./insertDocument');
var urllib = require('url');
var EventEmitter = require('events').EventEmitter;
var Scraper = require('./Scraper.js')

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
	db = insert(mongo)
    loadCompanies(db)
});	
//queue for emails

var peepsArray = [];
var Pages = [];

//generate URL array and return
function createURLArray(array){
	var urlArray = [{url:"", company:""}];
	var companiesToSearch = array;
	var siteToSearch = "linkedin.com";
	var keywordsToSearch = "San+Francisco";
	for (var i = 0; i < companiesToSearch.length; i++) {
		var count = 1;
		for (var j = 0; j < 30; j++) {
			var resultNumber = count;
			var siteurl = 	"http://www.bing.com/search?q=site%3a"
							+siteToSearch+"%22"
							+keywordsToSearch+"%22%22"
							+companiesToSearch[i].companyName+"%22&qs=n&pq=site%3a"
							+siteToSearch+"%22"
							+keywordsToSearch+"%22%22"
							+companiesToSearch[i].companyName+"%22&sc=0-43&sp=-1&sk=&cvid=be5a31bf5381440ebbb0a7867e72b754&first="
							+resultNumber+"&FORM=PORE"
			urlArray.push({url:siteurl, company:companiesToSearch[i].companyName, companyWebsite:companiesToSearch[i].companyWebsite});
			if (count === 1){
				count = count + 8;
			} else count = count + 14;
		};
	}
	Pages = urlArray;
	console.log(Pages);
	start();
}

//Load the list of companies from the companies.csv file and return as an array
function loadCompanies(db){
	var columns = ["companyName", "companyWebsite"];
	require("csv-to-array")({
	   file: "./companies.csv",
	   columns: columns
	}, function(arr, array){
			createURLArray(array)	
		}	
)};

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

	scraper.on('complete', function (listing) {
	    console.log("I'm complete");
	    db.insertDocument(listing);
	    wizard();
	});
}

function start(){
	var numberOfParallelRequests = 20;
	for (var i = 0; i < numberOfParallelRequests; i++) {
	  wizard();
	}
}




var cheerio = require('cheerio');
var request = require('request');
var mongo = require('./insertDocument');
var urllib = require('url');
var EventEmitter = require('events').EventEmitter;
var Scraper = require('./Scraper.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var assert = require('assert');
var url = 'mongodb://caitlin:caitlinadmin@ds063892.mongolab.com:63892/tc-scraper-data';
var insert = require('./insertDocument')

var db;

module.exports = function run() {
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
	db = insert(Contact)
	loadCompanies(Contact)
}

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
		for (var j = 0; j < 3; j++) {
			var resultNumber = count;
			var siteurl = 	"http://www.bing.com/search?q=site%3a"
							+siteToSearch+"%22"
							+keywordsToSearch+"%22%22"
							+companiesToSearch[i].company+"%22&qs=n&pq=site%3a"
							+siteToSearch+"%22"
							+keywordsToSearch+"%22%22"
							+companiesToSearch[i].company+"%22&sc=0-43&sp=-1&sk=&cvid=be5a31bf5381440ebbb0a7867e72b754&first="
							+resultNumber+"&FORM=PORE"
			urlArray.push({url:siteurl, company:companiesToSearch[i].company, companyWebsite:companiesToSearch[i].website});
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
	var Tabletop = require('tabletop')
	Tabletop.init( { key: "1Z1PkBlNva_yMaLLkrcWG4zS4Jo8GR4aOGPgYGfXCuvg",
                     callback: showInfo,
                     simpleSheet: true } )

  	function showInfo(data, tabletop){
  		createURLArray(data);
  	}	
};

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




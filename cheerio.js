var cheerio = require('cheerio');
var request = require('request');
var mongo = require('./insertDocument');
var permutate = require('./createPermutations');
var verify = require('./verifyEmails');
var companies = require('./companies');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/scraper';
var insert = require('./insertDocument')

var searchedCompany = "Tradecraft"
console.log(companies[0]);
//open mdb connection
var db;
MongoClient.connect(url, function(err, mongo) {
	if (err != null) {
		console.log(err)
	}
	db = insert(mongo)
    next(db)
});

function next(db){
	var peepsArray = [];

	request("http://www.bing.com/search?q=site%3Alinkedin.com%2Fin%2F%20%22San%20Francisco%20Bay%20Area%E2%80%9D%20%22"+searchedCompany+"%22&qs=n&form=QBRE&pq=site%3Alinkedin.com%2Fin%2F%20%22san%20francisco%20bay%20area%E2%80%9D%20%22"+searchedCompany+"t%22&sc=0-0&sp=-1&sk=&cvid=102739f363c648d2b3dee2232ca0968a", function(error, response, body) {
	    if (!error && response.statusCode === 200) {
	    	var $ = cheerio.load(body);
	    	var name = $("#b_results");
	    	name = (name[0].children[0].children[0].children[0].children[0].children[0].data);
	    	var linkedInLink = $("cite strong");
	    	linkedInLink = ((linkedInLink[0].prev.data)+(linkedInLink[0].children[0].data)+(linkedInLink[0].next.data));

	    	console.log(linkedInLink)
	    	request(linkedInLink, function(error, response, body){
	    		if (!error && response.statusCode === 200) {
	    			var $ = cheerio.load(body);
	    			var job = $(".profile-overview-content");
	    			var jobStatus  = (job[0].children[1].children[0].children[0].children[0].children[0].data);
	    			var currentJob = (job[0].children[1].children[0].children[1].children[0].children[0].children[0].children[0].data);
	    			var title = $(".title");
	    			title = (title[0].children[0].data);
	    			var peeps = {name:name, linkedIn:linkedInLink, searchedCompany:searchedCompany, currentJob:currentJob, title:title}
	    			var emailsToTest = permutate(peeps);
	    			var verifiedEmail = verify(emailsToTest);
	    			//func(createPermutations)
	    			//func(validateEmailAddress)	    			
	    			db.insertDocument(peeps)
	    			console.log("end")

	    			}
				  });
	    		}
	    	})
}


var mongo = require('./insertDocument');
var permutate = require('./createPermutations');
var verify = require('./verifyEmails');
var companies = require('./companies.js');
var permutation = require('./createPermutations');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/scraper';
var insert = require('./insertDocument')

var companiesToSearch = companies();
var searchedCompany = "Apcera";
var searchedCompanyWebsite = "apcera.com"
//open mdb connection
var db;
MongoClient.connect(url, function(err, mongo) {
	if (err != null) {
		console.log(err)
	}
	db = insert(mongo)
    next(db)
});

function next(db, company){
	var peepsArray = [];
	request("http://www.bing.com/search?q=site%3alinkedin.com%2fin%2f+%22San+Francisco+Bay+Area%E2%80%9D+%22"+company+"%22&qs=n&pq=site%3alinkedin.com%2fin%2f+%22san+francisco+bay+area%E2%80%9D+%22"+company+"%22&sc=0-0&sp=-1&sk=&cvid=14df0bf097cf4d8b91590b5a2c33925c&first=9&FORM=PERE", function(error, response, body) {
	    if (!error && response.statusCode === 200) {
	    	var $ = cheerio.load(body);
	    	var nameSearch = $("#b_results");
	    	var linkedInLinkSearch = $("cite strong");
	    	for (var i = 0; i < nameSearch[0].children.length ; i++) {
	    		if (nameSearch[0].children[i].children[0].children[0].children[0].children != null) {
	    			var name = (nameSearch[0].children[i].children[0].children[0].children[0].children[0].data);
		    		console.log(name);
		    		if (linkedInLinkSearch[i] != null){	
		    			if (linkedInLinkSearch[i].next != null) {
				    		var linkedInLink = ((linkedInLinkSearch[i].prev.data)+(linkedInLinkSearch[i].children[0].data)+(linkedInLinkSearch[i].next.data));
					    } else {
				    		var linkedInLink = ((linkedInLinkSearch[i].prev.data)+(linkedInLinkSearch[i].children[0].data));
				    	}
				    	request(linkedInLink, function(error, response, body){
				    		if (!error && response.statusCode === 200) {
				    			var $ = cheerio.load(body);
				    			var insideName = $(".full-name") 
				    			insideName = (insideName[0].children[0].data);
				    			var job = $(".profile-overview-content");
				    			var jobStatus  = (job[0].children[1].children[0].children[0].children[0].children[0].data);
				    			var currentJob = (job[0].children[1].children[0].children[1].children[0].children[0].children[0].children[0].data);
				    			var title = $(".title");
				    			if (title[0] != null) {
				    				title = (title[0].children[0].data);
				    			} else {
				    				title = ""
				    			}
				    			var peeps = {name:insideName, searchedCompany:searchedCompany, currentJob:currentJob, title:title, validEmails:""}
				    			var permutations = permutation(peeps.name, searchedCompanyWebsite);
				    			if (peeps.currentJob === searchedCompany){
				    				console.log("companies matched");
				    				verify(peeps, permutations, true, emailValidated);  
				    			} else {
				    				verify(peeps, permutations, false, emailValidated);
				    			}		
							  }
				    	})		 
			    	}    		
	    		};

	    	}
	    }
	})
	function emailValidated(peeps){
		db.insertDocument(peeps)
		console.log(peeps)
}

};


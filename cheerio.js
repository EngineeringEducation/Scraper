var cheerio = require('cheerio');
var request = require('request');
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

var db;
MongoClient.connect(url, function(err, mongo) {
	if (err != null) {
		console.log(err)
	}
	db = insert(mongo)
    next(db)
});	
//queue for emails

	
function next(db){
	var columns = ["companyName", "companyWebsite"];
	require("csv-to-array")({
	   file: "./companies.csv",
	   columns: columns
	}, function (err, array) {
		companiesToSearch = array;
		for (var i = 0; i < companiesToSearch.length; i++) {
			var company = companiesToSearch[i];
			console.log(company.companyName);
			var peepsArray = [];
			request("http://www.bing.com/search?q=site%3Alinkedin.com%2Fin%2F%20%22San%20Francisco%20Bay%20Area%E2%80%9D%20%22"+company.companyName+"%22&qs=n&form=QBRE&pq=site%3Alinkedin.com%2Fin%2F%20%22san%20francisco%20bay%20area%E2%80%9D%20%22"+company.companyName+"t%22&sc=0-0&sp=-1&sk=&cvid=102739f363c648d2b3dee2232ca0968a", function(error, response, body) {
			    if (!error && response.statusCode === 200) {
			    	var $ = cheerio.load(body);
			    	var nameSearch = $("#b_results");
			    	var linkedInLinkSearch = $("cite strong");
			    	for (var i = 0; i < nameSearch[0].children.length ; i++) {
			    		if (nameSearch[0].children[i].children[0].children[0].children != null) {
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
							    			if (job[0].children[1].children[0] != null) {
							    				if (job[0].children[1].children[0].children[0].children[0].children != null){ 
							    					var jobStatus  = (job[0].children[1].children[0].children[0].children[0].children[0].data);
							    				} else jobStatus = ""
							    			} else jobStatus = ""
							    			if (job[0].children[1].children[0] != null) {
							    				if (job[0].children[1].children[0].children[1].children[0].children != null){
							    					if (job[0].children[1].children[0].children[1].children[0].children[0].children[0].children != null){
							    						if (job[0].children[1].children[0].children[1].children[0].children[0].children[0].children[0] != null){
							    							var currentJob = (job[0].children[1].children[0].children[1].children[0].children[0].children[0].children[0].data);
							    						} else currentJob = ""
							    					} else currentJob = ""
							    				} else currentJob = ""
							    			} else currentJob = ""
							    			var title = $(".title");
							    			if (title[0] != null) {
							    				title = (title[0].children[0].data);
							    			} else {
							    				title = ""
							    			}
							    			var peeps = {name:insideName, searchedCompany:company.companyName, currentJob:currentJob, title:title, validEmails:"", validatedBy:"", permutations:Array}
							    			var permutations = permutation(peeps.name, company.companyWebsite);
							    			peeps.permutations = permutations
							    			if (peeps.currentJob === company.companyName){
							    				verify(peeps, permutations, false, emailValidated);  
							    			} else {
							    				verify(peeps, permutations, false, emailValidated);
							    			}		
										}
							    	})		 
						    	} 
						   	}   		
			    		};
			    	}
			    }
			})
		};	    
	});	
};

function emailValidated(peeps){
	db.insertDocument(peeps)
}



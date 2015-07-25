var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter;
var util = require('util')
var request = require('request');
var http = require('http');

/*
 * Scraper Constructor
**/
function Scraper (url) {
    console.log(url);
    this.url = url.url;
    this.searchedCompanyWebsite = url.companyWebsite;
    this.searchedCompany = url.company
    this.init();
}
/*
 * Make it an EventEmitter
**/
util.inherits(Scraper, EventEmitter);


Scraper.prototype.init = function () {
    var model;
    var self = this;
    self.on('loaded', function (html) {
        model = self.parsePage(html);
        self.emit('complete', model);
    });
    self.loadWebPage();
};

Scraper.prototype.loadWebPage = function () {
  var self = this;
  console.log('Loading ');
  http.get(self.url, function (res) {
    var body = '';
    if(res.statusCode !== 200) {
      return self.emit('error', STATUS_CODES[res.statusCode]);
    }
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
     	self.emit('loaded', body);
    });
  })
  .on('error', function (err) {
    self.emit('error', err);
  });      
};

Scraper.prototype.parsePage = function(html){
	var self = this;
	console.log("here");
	var peeps = {
		name:"",
		firstName:"",
		lastName:"", 
		linkedIn:"",
		searchedCompany:"", 
		currentJob:"", 
		title:"", 
		validEmails:"", 
		validatedBy:"", 
		permutations:[{}]
	}	
	var $ = cheerio.load(html);
	var nameSearch = $("#b_results");
	if (nameSearch[0] != null){
    	for (var i = 0; i < nameSearch[0].children.length ; i++) {
    		if (nameSearch[0].children[i].children[0].children[0].children != null) {
	    		if (nameSearch[0].children[i].children[0].children[0].children[0].children != null) {
	    			if (nameSearch[0].children[i].children[0].children[0].children[0].children[0] != null){
		    			var name = (nameSearch[0].children[i].children[0].children[0].children[0].children[0].data);
		    			var linkedInLink = (nameSearch[0].children[i].children[0].children[0].children[0].parent.attribs.href);
		    			console.log("Name: "+name+" | LinkedIn: "+linkedInLink+" ");
		    			peeps.name = name;
		    			peeps.searchedCompany = self.searchedCompany;
		    			peeps.searchedCompanyWebsite = self.searchedCompanyWebsite;
		    			peeps.linkedIn = linkedInLink;
		    			var newName = name.split(' ');
		    			peeps.firstName = newName[0];
						peeps.lastName = newName[1];
		    			return peeps;
		    		}
		    	}
		    }
		}	
	}
}

module.exports = Scraper;
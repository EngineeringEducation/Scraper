var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter;
var util = require('util')
var request = require('request');
var http = require('http');

/*
 * Scraper Constructor
**/
function Scraper (url) {
    this.url = url.url;
    this.linkedIn = url.linkedIn;
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
    	self.parsePage(html, function(doc, linkedIn){
        	model = doc;
        	origLinkedIn = linkedIn;
       		if (model.experience !== undefined && model.experience.length > 0) {
       			if (model.current !== undefined) {
       				self.emit('complete', model, origLinkedIn);
       			} else self.emit('error', "Incomplete Data");
       		} else self.emit('error', "Incomplete Data");
        }) 
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

Scraper.prototype.parsePage = function(html, callback){
	var self = this;
	var temp = {
		current : String,
		location : String,
		experience : [],
		linkedIn : self.linkedIn,
		education : []
	}
	var $ = cheerio.load(html);
	var dataCheck = $("#b_context");
	var experience = $(".b_subModule");
	if (dataCheck[0].children != null) {
		if (dataCheck[0].children.length > 1){
			var current = $(".cbl");
			if (current[0] != null){	
				if (current[0].children[0].data === "Current:"){
					temp.current = current[0].next.data
				}
				if (current[1] != null){
					if (current[1].children[0].data === "Location:"){
						temp.location = current[1].next.data
					}
				}
			}
			for (var i = 0; i < experience.length; i++) {
				if (experience[i].children[0].children[0].data === "Experience"){
					for (var j = 0; j < experience[i].children[1].children.length; j++) {
						var job = {};
						job.title = (experience[i].children[1].children[j].children[0].data);
						if (experience[i].children[1].children[j].children[0].next.next.type === "tag"){
							job.years = (experience[1].children[1].children[j].children[0].next.next.next.data);
							job.companyName = (experience[1].children[1].children[j].children[0].next.next.children[0].data);
						} else {
							var company = (experience[i].children[1].children[j].children[0].next.next.data);
							company = company.split('·')
							job.companyName = company[0];
							job.years = company[1];
							temp.experience.push(job);
						}
					};
				}
			}
			var education = $('#mh_cdb_datagroupid_education');
			if (education[0] != null){
				for (var i = 0; i < education[0].next.children[0].children[0].children.length; i++) {
					var ed = {};
					if (education[0].next.children[0].children[0].children[i].children[0].data === undefined) {
						ed.school = (education[0].next.children[0].children[0].children[i].children[0].attribs.title);
					} else {
						ed.school = (education[0].next.children[0].children[0].children[i].children[0].data);
					}
					ed.program = (education[0].next.children[0].children[0].children[i].children[0].next.next.data);			
					temp.education.push(ed);
				}
			}

			var linkedIn = $('.b_hList');
			var altLinkedIn = "";
			if (linkedIn[0] != null){
				altLinkedIn = (linkedIn[0].children[0].children[0].attribs.href);
				if (temp.experience.length > 0){
					callback([temp, altLinkedIn]);
				}
			} else {
				if (temp.experience.length > 0){
					callback(temp, "");
				}callback(temp);
			} callback(temp);
		}callback(temp);
	}callback(temp);
}

module.exports = Scraper;


module.exports = function(db){
	console.log(db);
	this.db = db;
	this.insertDocument = function(document) {
		if (document){
		   	this.db.create({
		      _id : document.linkedIn,
		      "name" : document.name,
		      "first" : document.firstName,
		      "last" : document.lastName,
		      "searchedCompany" : document.searchedCompany,
		      "searchedCompanyWebsite" : document.searchedCompanyWebsite,
		      "currentJob" : document.currentJob,
		      "currentTitle" : document.title,
		      "validEmails" : document.validEmails,
		      "validatedBy" : document.validatedBy,
		      "permutations" : document.permutations
		  }, {upsert:true});
	   }
	};
	return this;
};




module.exports = function(db){
	this.db = db;
	this.insertDocument = function(document) {
		if (document){
		   	this.db.collection('contacts').insertOne({
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


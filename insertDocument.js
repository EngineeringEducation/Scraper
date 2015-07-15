

module.exports = function(db){
	this.db = db;
	this.insertDocument = function(document) {
	   this.db.collection('contacts').insertOne({
	      "name" : document.name,
	      "linkedIn" : document.linkedInLink,
	      "searchedCompany" : document.searchedCompany,
	      "currentJob" : document.currentJob
	  });
	console.log("inserted");

	};
	return this;
		
};


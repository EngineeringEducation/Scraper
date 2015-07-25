var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://caitlin:caitlinadmin@ds063892.mongolab.com:63892/tc-scraper-data';
var db;
var insert = require('./insertDocument');


MongoClient.connect(url, function(err, mongo) {
	if (err != null) {
		console.log(err)
	}
	db = mongo;
	var collection = db.collection('contacts');
	loadEmptyPermutations(collection);
});

function loadEmptyPermutations(collection){
	collection.find({}).toArray(function(err, docs){
		for (var i = 0; i < docs.length; i++) {
			if (collection.permutations === undefined){
				var perms = createPermutations(docs[i])
				collection.update(
				{_id : docs[i]._id},
					{$set : 
						{
							permutations : perms
						}
					}
				)
			}	
		};
	})
}

function createPermutations(doc, callback){
	var permutations = {
		firstName: {
			email: String,
			valid: Boolean,
			validatedBy: String,
		},
		lastName: {
			email: String,
			valid: Boolean,
			validatedBy: String,
		},
		firstNameLastName: {
			email: String,
			valid: Boolean,
			validatedBy: String,
		},
		firstNameDotLastName: {
			email: String,
			valid: Boolean,
			validatedBy: String,
		},
		firstInitialLastName: {
			email: String,
			valid: Boolean,
			validatedBy: String,
		},
		firstInitialDotLastName: {
			email: String,
			valid: Boolean,
			validatedBy: String,
		},
		firstInitial: {
			email: String,
			valid: Boolean,
			validatedBy: String,
		}
	}
	var fullName = doc.name;
	var first = doc.first;
	var initial = first.charAt(0);
	var last = doc.last;
	var site = doc.searchedCompanyWebsite;
	permutations.firstName.email = (first+"@"+site);
	permutations.lastName.email = (last+"@"+site);
	permutations.firstNameLastName.email = (first+last+"@"+site);
	permutations.firstNameDotLastName.email = (first+"."+last+"@"+site);
	permutations.firstInitialLastName.email = (first+last+"@"+site);
	permutations.firstInitialDotLastName.email = (initial+"."+last+"@"+site);
	permutations.firstInitial.email = (initial+"@"+site)
	console.log("permutated:"+fullName);
	return permutations
};
var emailExistence = require('email-existence');
var kickbox = require('kickbox').client('650f1e3c040b4d1ad1fece86a51777792fc32c16d8b717939d8a22d9ad9c4614').kickbox();
var validEmailFound = false;

module.exports = function(peeps, emails, checkForEmails, callback){
	var check = checkForEmails;
	if ((check === true) && (validEmailFound === false)){
		var insideEmail = emails;
		var count = 0;
		var emailObjectLength = 0;
		Object.keys(insideEmail).forEach(function (key) {
			emailObjectLength++;
		    var email = insideEmail[key];
		    console.log(email);
		    var validEmail = "";
		    emailExistence.check(email, function(err,res){
		        if (res === true){
		        	validEmail = email;
		        	console.log("valid email: "+validEmail);
			  		next(peeps, validEmail, false, "npm");
			  		//TODO: Add a "found by" log so we know which service is getting us results.
		        } else {
					kickbox.verify(email, function (err, response) {
						if (err != null){
							kickbox = require('kickbox').client('fe1d51397ea4b5c1a564c15cb6888973183bbbffb73813470a3d566c8eabbc00').kickbox();
							if (response != null){
								if ((response.body.result === 'deliverable') && (response.body.success === 'true') && (response.body.sendex > .95)){
							  		validEmail = email;
							  		console.log("valid email: "+validEmail);
							  		next(peeps, validEmail, false, "kickbox");
								} else {
									count++
									if (count === emailObjectLength) {
				        				next(peeps, validEmail, true);
									}
								};
							} else {
								count++
								if (count === emailObjectLength) {
			        				next(peeps, validEmail, true);
								}
							};
						} else {
							if ((response.body.result === 'deliverable') && (response.body.success === 'true') && (response.body.sendex > .95)){
							  		validEmail = email;
							  		console.log("valid email: "+validEmail);
							  		next(peeps, validEmail, false, "kickbox");
							}
						}
					})
				}
			})
		})
	} else next(peeps, "", true, "");

	function next(peeps, validEmail, check, validatedBy){
		console.log("next: "+peeps.name);
		peeps.validatedBy = validatedBy;
		peeps.validEmails = validEmail;
		callback(peeps);
	}


}	
								






module.exports = function(){
	var columns = ["companyName", "companyWebsite"];
	require("csv-to-array")({
	   file: "./companies.csv",
	   columns: columns
	}, function (err, array) {
	  return array;
	});
}
// var peeps = {name:"Caitlin Mohnike", linkedIn:"http://www.linkedin.com/in/caitlinmohnike", searchedCompany:"Tradecraft", currentJob:"Tradecraft", title:"Engineering"}

// var telnet = require('telnet-client');
// var connection = new telnet();

// var params = {
//   host: '127.0.0.1',
//   port: 23,
//   shellPrompt: '/ # ',
//   timeout: 1500,
//   // removeEcho: 4
// };

// connection.on('ready', function(prompt) {
//   connection.exec(cmd, function(response) {
//     console.log(response);
//   });
// });

// connection.on('timeout', function() {
//   console.log('socket timeout!')
//   connection.end();
// });

// connection.on('close', function() {
//   console.log('connection closed');
// });

// connection.connect(params);

module.exports = function (doc){
	console.log("got here");
	return doc
}
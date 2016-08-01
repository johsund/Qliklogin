/*
============================================================================================
File: AccessControlTestModule.js
Developer: Fredrik Lautrup
Created Date: Sometime in 2014

Description:
The AccessControlTestModule uses node.js and express.js to create a lightweight web
server for testing the ticketing authentication method in Qlik Sense Enterprise Server.

WARNING!:
This code is intended for testing and demonstration purposes only.  It is not meant for
production environments.  In addition, the code is not supported by Qlik.

Change Log
Developer                       Change Description                          Modify Date
--------------------------------------------------------------------------------------------
Fredrik Lautrup                 Initial Release                             circa Q4 2014
Jeffrey Goldberg                Updated for Expressjs v4.x                  01-June-2015
Fredrik Lautrup                 Added external config file                  03-November-2015
Steve Newman                    Updated Logout method and iframe support    07-January-2016

--------------------------------------------------------------------------------------------


============================================================================================
*/

var config = require('./config');
var https = require('https');
var http = require('http');
var express=require('express');
var fs = require('fs');
var url= require('url');
// Use LDAP
var ldap = require('ldapjs');


var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var querystring = require("querystring");

var app = express();
//set the port for the listener here
app.set('port', config.port);


//new Expressjs 4.x notation for configuring other middleware components
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: config.sessionSecret}));
app.use(cookieParser('Test'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
	//Store targetId and RESTURI in a session
	(typeof(req.query.proxyRestUri) == 'undefined' || req.query.proxyRestUri === null) ?
	req.session.RESTURI = config.RESTURI : req.session.RESTURI = req.query.proxyRestUri;
	
	(typeof(req.query.proxyRestUri) == 'undefined' || req.query.proxyRestUri === null) ?
	req.session.targetId = config.REDIRECT : req.session.targetId = req.query.targetId;
	
	req.session.LDAP = config.LDAP;
	req.session.DOMAIN = config.DOMAIN;
	
    console.log("Root request, received:", req.query);
	console.log("Session targetId: ",req.session.targetId);
	console.log("Session RESTURI: ",req.session.RESTURI);
	console.log("Session LDAP: ",req.session.LDAP);
	console.log("Session DOMAIN: ",req.session.DOMAIN);
	
    res.sendfile('login.html');
 });

app.post("/auth", function(req, res) {
	var url = req.session.LDAP;
	var userPrincipalName = req.body.uid + req.session.DOMAIN;
	var passwd = req.body.passwd;

	if (passwd === "") {
		res.send("The empty password trick does not work here.");
		return ;
	}

	// Bind as the user
	var adClient = ldap.createClient({ url: url });
	adClient.bind(userPrincipalName, passwd, function(err) {

		if (err != null) {
			if (err.name === "InvalidCredentialsError")

				res.redirect("/?login=failed&reason=credentials");
			else
				res.redirect("/?login=failed&reason=unknown");
		} else {
				//res.send("Authentication successful");
				var userDirectory = "QTSEL";
				var selectedUser = userPrincipalName.substr(0, userPrincipalName.indexOf('@'));
				
				//Request ticket and send user to hub.
				requestticket(req, res, selectedUser, userDirectory, req.session.RESTURI, req.session.targetId);
				req.session.destroy();				

		}  // End of the if err == null part
	});  // End of the function called by adClient.bind
});

app.get('/login', function (req, res) {
    var selectedUser = req.query.selectedUser;
    var userDirectory = req.query.userDirectory;
	
    console.log("Login user: ",selectedUser," Directory: ",userDirectory);

    requestticket(req, res, selectedUser, userDirectory, req.session.RESTURI, req.session.targetId);
	req.session.destroy();
});


function requestticket(req, res, selecteduser, userdirectory, RESTURI, targetId) {
    //Configure parameters for the ticket request
    var options = {
        host: url.parse(RESTURI).hostname,
        port: url.parse(RESTURI).port,
        path: url.parse(RESTURI).path + '/ticket?xrfkey=aaaaaaaaaaaaaaaa',
        method: 'POST',
        headers: { 'X-qlik-xrfkey': 'aaaaaaaaaaaaaaaa', 'Content-Type': 'application/json' },
		pfx: fs.readFileSync('client.pfx'),
		passphrase: config.certificateConfig.passphrase,
		rejectUnauthorized: false,
        agent: false
    };

	console.log("Path:", options.path.toString());
    //Send ticket request
    var ticketreq = https.request(options, function (ticketres) {
        console.log("statusCode: ", ticketres.statusCode);

        ticketres.on('data', function (d) {
            //Parse ticket response
			console.log(selecteduser, " is logged in");
			console.log("POST Response:", d.toString());
			
            var ticket = JSON.parse(d.toString());
			
			//Add the QlikTicket to the redirect URL regardless whether the existing REDIRECT has existing params.
			
			console.log("REDIRECT: ",config.REDIRECT);
			console.log("targetId: ",targetId);
			var myRedirect = url.parse(config.REDIRECT);
			
			var myQueryString = querystring.parse(myRedirect.query);
			myQueryString['QlikTicket'] = ticket.Ticket; 		

            // Redirect user to HUB
            res.redirect(myRedirect.href + '?' + querystring.stringify(myQueryString));
        });
    });

    //Send JSON request for ticket
    var jsonrequest = JSON.stringify({ 'UserDirectory': userdirectory.toString() , 'UserId': selecteduser.toString(), 'Attributes': [] });

    ticketreq.write(jsonrequest);
    ticketreq.end();

    ticketreq.on('error', function (e) {
        console.error('Error' + e);
    });
};

//Server options to run an HTTPS server
var httpsoptions = {
    pfx: fs.readFileSync('server.pfx'),
    passphrase: config.certificateConfig.passphrase
};

//Start listener
var server = https.createServer(httpsoptions, app);
server.listen(app.get('port'), function()
{
  console.log('Express server listening on port ' + app.get('port'));
});

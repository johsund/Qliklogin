var config = {}

//Certificate password used when exporting the certificate.
config.certificateConfig = {
    passphrase: ''
};

config.sessionSecret='uwotm8';

//Port you want Node.js to listen to for authentication requests. 
//Changing this requires a change in the Virtual Proxy redirect URI as well.
config.port='8084';

//Example RESTURI for API Endpoint. Do not forget to include virtual proxy in path.
//default: config.RESTURI='https://servername.com:4243/qps/custom';
config.RESTURI='https://sgsin-jsn1.qliktech.com:4243/qps/custom';

//REDIRECT for embedding. Use any of the following paths. Do not forget to include virtual proxy in path.
//
//  HUB Example (default): 
//  config.REDIRECT='https://servername.com/custom/hub';
//
//  SHEET Example: (use Dev-Hub Single Configurator to get your Sheet URL)
//  config.REDIRECT='https://servername.com/custom/single?appid=cd29ef8d-7c02-48d3-8d90-b5a40395c316&sheet=LSgtJH&opt=currsel&select=clearall';
config.REDIRECT='https://sgsin-jsn1.qliktech.com/custom/hub';

config.LDAP='ldap://qtadsg02.qliktech.com:389/';

config.DOMAIN = '@qliktech.com';

module.exports = config;

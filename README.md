# Qliklogin
QlikLogin is a sample login solution based on Node.JS for Qlik Sense with LDAP authentication

This is an example of a login module for Qlik Sense, using NodeJS and the ldapjs module + Qlik Sense ticket requests to authenticate LDAP users against Qlik Sense. The look and feel can be fully customized.

![alt tag](https://raw.githubusercontent.com/johsund/QlikLogin/master/qlik-screenshot.png)

# Installation

* Download QlikLogin and unzip into any location

* Go to Qlik Sense QMC and set up a virtual proxy based on ticket authentication
  * Add https://servername:port/ as the Authentication Module Redirect URI
  * Ensure the servername of your login module is whitelisted in the virtual proxy settings
  * Make sure your virtual proxy is attached to the proxy node
  
* Export certificates 
  * Windows format
  * Password optional (make sure you put it in _config.js_ if you add one)
  * Copy exported certificates to QlikLogin root folder (_client.pfx_ and _server.pfx_)
  
* Go through configuration steps in _config.js_  

* Run _QlikLogin.bat_ or launch _node indexauth.js_ from a command line

* Go to https://qlikserver/virtualproxy/hub and it should redirect you to your login page for LDAP authentication

# Config.js

```
var config = {}

//Certificate password used when exporting the certificate.
config.certificateConfig = {
    passphrase: ''
};

config.sessionSecret='uwotm8';

//Port you want Node.js to listen to for authentication requests. 
config.port='8084';

//Example RESTURI for API Endpoint. Do not forget to include virtual proxy in path.
//default: config.RESTURI='https://servername.com:4243/qps/custom';
config.RESTURI='https://qlikserver.domain.com.com:4243/qps/custom';

//If you're using the login page as the "landing page" instead of redirecting from a virtual proxy
// - make sure you set up this URI to redirect the user after authenticating and receiving a ticket 
config.REDIRECT='https://qlikserver.domain.com/custom/hub';

//Configure the path for the LDAP server you want to authenticate the user against
config.LDAP='ldap://ldapserver.domain.com:389/';

//This is appended to the username that the user provides in the form. Example: user keys in 'UserX' and the config.DOMAIN part appends '@domain.com'
config.DOMAIN = '@domain.com';

//Specify the name of the user directory you want to use for the Qlik Sense ticket requests
config.USERDIRECTORY = 'USERDIRECTORYNAME';

module.exports = config;
```

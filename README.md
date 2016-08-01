# Qliklogin
Sample login solution based on Node.JS for Qlik Sense with LDAP authentication

This is an example of a login module for Qlik Sense, using NodeJS and the ldapjs module + Qlik Sense ticket requests to authenticate LDAP users against Qlik Sense.

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

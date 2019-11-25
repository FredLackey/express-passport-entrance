# express-passport-entrance
Example entrance application using ExpressJS and PassportJS

# Background  
A friend was venturing into the world of software development and wanted to target MEAN / MERN.  He was having difficulty wrapping his head around Passport and OAuth.  This repo was the result of an afternoon "bootcamp" session to get him up to speed with the basics.

# Concept  
User is allowed to signup with a social media account (currently Facebook or Bootstrap).  Once logged in, they may _link_ or _unlink_ an additional social media account.  This allows them to login with _either_ service and load same user account:

![Profile Page](/docs/images/profile.png "Profile Page")

# Setup 
Installing the project is fairly straight forward:

1. Pull down the repo (clone, fork, download, etc.);
2. Install dependencies using `npm install` or `npm i`;
3. Create an app with your social media's developer portal;
4. Set the app's suppliedd `APP_ID` and `SECRET` using an environment variable.

# Environment Variables  
This project was created using Visual Studio Code and the `.vscode` folder was not checked in.  You will need to set the environment variables using `export` or however your system requires.  Here is a quick look at my VSCode *launch configuration* just in case you want to setup your machine like mine:

![Launch Configuration](/docs/images/launch-json.png "Launch Configuration")

# Adding Providers  
At the moment, this project is built to handle either Facebook, Google, or both.  However, adding a [PassportJS](http://www.passportjs.org/) provider should be quite easy.  Simply install the provider you want from [passportjs.org](http://www.passportjs.org/) and then create a defintion object in the `config.js` file similar to the following:

![Config File](/docs/images/config.png "Config File")

# Contact Info    
I'll be happy to help in any way I can.  If you find a bug, or have a question which cannot be answered from the usual sources... [Stack Overflow](http://stackoverflow.com/), [Experts Exchange](https://www.experts-exchange.com/), [CodeCall](http://forum.codecall.net/), etc.... feel free to drop me a line:

### Fred Lackey
### [fred.lackey@gmail.com](mailto://fred.lackey@gmail.com)

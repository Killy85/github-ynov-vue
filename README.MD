# Ynov-Vue

This application aim to be an easy to use way to watch evolution on repositories


# Usage

This project uses Vue.js, this means you may use it by downloading, or cloning the repository and accessing index.html using your favorite browser (it has only be tested using firefox).

This uses the github API to list repositories and commits on thoses, for user you pass as parameters in a json file.

In order to access the API you may want to feed your credentials in the *data/settings.json* file. Once your login and password written, you may access the index of the project and see repositories and commit you'll have in your list (*data/search.json*).

I also added the possibility to see the Readme of the projects from this interface.


# Developpement

This is, and will stay a class project aiming at discovering the [**Vue.js**](https://vuejs.org/v2/guide/) framework. 

This explain the wannabe quality of the code, the fact I may not respect all the javascript/Vue convention *I'm so sorry*.

I've began by treating the API calls, with authentication. I, of course, used a file to store parameters, which you may not have. You'll have to adapt this file, using your credentials to make the project usable.

# NB

This project is under development and may not work atm.

Settings are loaded from file:

- data/search.json : contains value for user and projects you want to be able to watch
- data/settings.json : contains the base url for the github API and the credentials we want to use to connect to the API

Not working on chrome, only tested using firefox. Chrome would not allow web app to load file from drive.

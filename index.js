  function loadJSON(filePath) {
      // Load json file;
      var json = loadTextFileAjaxSync(filePath, "application/json");
      // Parse json
      return JSON.parse(json);
    }   
    

    function Editor(input, preview) {
      this.update = function () {
        preview.innerHTML = markdown.toHTML(input.value);
      };
      input.editor = this;
      this.update();
    }

    function loadMD(url){
      get_readme_data(url, (status, val) => {
        var $ = function (id) { return document.getElementById(id); };
        test = {"value" : val}
        new Editor(test, $("preview"));
      })
    }

    


    // Load text with Ajax synchronously: takes path to file and optional MIME type
    function loadTextFileAjaxSync(filePath, mimeType)
    {
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.open("GET",filePath,false);
      if (mimeType != null) {
        if (xmlhttp.overrideMimeType) {
          xmlhttp.overrideMimeType(mimeType);
        }
      }
      xmlhttp.send();
      if (xmlhttp.status==200)
      {
        return xmlhttp.responseText;
      }
      else {
        return null;
      }
    }
  settings = loadJSON("./data/settings.json")
  search = loadJSON("./data/search.json")
  repos = [];
  urls_count = 0
  urls_fetched =0

  function getRepos(){
      urls = []
      app.repo = []
      test = app.selected_user ? app.selected_user.length : 0
      if(test >0) {
        if(app.selected_project){
            app.selected_user.forEach(user => {   
              urls.push(settings.baseURL + "repos/"+user +"/"+ app.selected_project)
            });
        }else{
          search.projects.forEach(project => {
            app.selected_user.forEach(user => {   
              urls.push(settings.baseURL + "repos/"+user +"/"+ project)
            });
          });
        }
      } else {
        if(app.selected_project){
            search.users.forEach(user => {   
              urls.push(settings.baseURL + "repos/"+user +"/"+ app.selected_project)
            });
        }else{
          search.projects.forEach(project => {
            search.users.forEach(user => {   
              urls.push(settings.baseURL + "repos/"+user +"/"+ project)
            });
          });
        }
      }

      urls_count = urls.length - 1 
      urls.forEach(url => {
        get_repos(url, (status, repository) => {
          get_commits(url,(status,commits_to_rep)=>{
            get_readme(url, (status,readme) => {
              urls_fetched++;
              if(!status){
                val = repository
                val["commits"] = commits_to_rep
                val["readme"] = readme
                app.repo.push(val)              
              }
            })
          }) 
      })
      })
      

  }

  var get_repos = function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'json';
      xhr.setRequestHeader("Authorization", "Basic " + btoa(settings.credentials.login+":"+settings.credentials.password))
      xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
          callback(null, xhr.response);
        } else {
          callback(status, xhr.response);
        }
      };
      xhr.send();
  };

  var get_commits = function(url, callback) {
    var xhr = new XMLHttpRequest();
    params = ""
    if(app.date_from && app.date_to){
      date_from = new Date(app.date_from)
      date_to = new Date(app.date_to)
      date_now = new Date()
      if(date_from <= date_to <= date_now){
        params = "?since="+date_from.toString()+"&until=" + date_to.toString()
      }

    }else if(app.date_from){
      date_from = new Date(app.date_from)
      date_now = new Date()
      if(date_from <= date_now){
        params = "?since="+date_from.toString()
      }
    }else if(app.date_to){
      date_to = new Date(app.date_to)
      date_now = new Date()
      if(date_to <= date_now){
        params = "?until=" + date_to.toString()
      }
    }

    xhr.open('GET', url + "/commits" +params, true);
    xhr.responseType = 'json';
    xhr.setRequestHeader("Authorization", "Basic " + btoa(settings.credentials.login+":"+settings.credentials.password))
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
  };

  var get_readme = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url + "/readme", true);
    xhr.responseType = 'json';
    xhr.setRequestHeader("Authorization", "Basic " + btoa(settings.credentials.login+":"+settings.credentials.password))
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

var get_readme_data = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function() {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};



var app = new Vue({
      el: '#feed',
      data: {
        repo : repos,
        users : search.users,
        projects : search.projects,
        selected_user : null,
        selected_project : null,
        date_from : null,
        date_to : null
      },
      watch: {
        selected_project : (val) => { getRepos(this)},
        selected_user : (val) => { getRepos(this)},
        date_from : (val) => { getRepos(this)},
        date_to : (val) => { getRepos(this)}
      }
})

getRepos(app)
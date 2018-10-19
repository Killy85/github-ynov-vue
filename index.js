  function loadJSON(filePath) {
      // Load json file;
      var json = loadTextFileAjaxSync(filePath, "application/json");
      // Parse json
      return JSON.parse(json);
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
      repos = []
      if(app.selected_project && app.selected_user){
        urls.push(settings.baseURL + "repos/"+app.selected_user +"/"+ app.selected_project)
      }else if(app.selected_project) {
        search.users.forEach(user => {   
          urls.push(settings.baseURL + "repos/"+user +"/"+ app.selected_project)
        });
      }else if( app.selected_user){
        search.projects.forEach(project => {
          urls.push(settings.baseURL + "repos/"+app.selected_user +"/"+ project)
        });
      }else {
        search.projects.forEach(project => {
          search.users.forEach(user => {   
            urls.push(settings.baseURL + "repos/"+user +"/"+ project)
          });
        });
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
                console.log(val)
                repos.push(val)
              }
              if(urls_count <= urls_fetched){
                app.repo = repos
                urls_fetched = 0
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
    xhr.open('GET', url + "/commits", true);
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
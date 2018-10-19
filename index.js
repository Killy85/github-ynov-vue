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
        // TODO Throw exception
        return null;
      }
    }
  settings = loadJSON("./data/settings.json")
  search = loadJSON("./data/search.json")
  repos = [];
  urls_count = 0
  urls_fetched =0

  function getRepos(app){
      urls = []
      search.projects.forEach(project => {
        search.users.forEach(user => {   
          urls.push(settings.baseURL + "repos/"+user +"/"+ project)
        });
      });
      urls_count = urls.length
      urls.forEach(url => {
        get_repos(url, (status, repository) => {
          get_commits(url,(status,commits_to_rep)=>{
          urls_fetched++;
          if(!status){
            val = repository
            val["commits"] = commits_to_rep
            repos.push(val)
          }    
          if(urls_count === urls_fetched){
            app.repo = repos
          } 
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

  var app = new Vue({
      el: '#feed',
      data: {
        repo : repos
      }
    })
    getRepos(app)
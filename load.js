var g_userName;
var hasCountTwitch, hasCountMixer;
var countHelix, countMixer;
var pageHelix, pageMixer;
var hasUserDataTwitch = false;
var hasUserDataMixer = false;
var userIndexTwitch, userIndexMixer;
var urlStreamsTwitch;
var dataUserTwitch, dataUserMixer;

function ToggleDisplay(selector) {
  return document.getElementById(selector).classList.toggle("show");
}

function AddListeners() {
  var input = document.getElementById("input-user");
  input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      LoadUser();
    }
  });
  input = document.getElementById("input-channel-twitch");
  input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      LoadChannel(document.getElementById("input-channel-twitch").value, "twitch");
    }
  });
  input = document.getElementById("input-channel-mixer");
  input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      LoadChannel(document.getElementById("input-channel-mixer").value, "mixer");
    }
  });
}

function ChangeResolution(newReso) {
  if (resoDropdown.classList.contains('show')) resoDropdown.classList.remove('show');
  var date = new Date();
  date.setTime(date.getTime()+(30*24*60*60*1000));
  var expires = "; expires="+date.toGMTString();
  if (newReso == "init") {
    var cname = "reso=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (let ii = 0 ; ii < ca.length ; ii++) {
      var c = ca[ii];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(cname) == 0) {
        return ChangeResolution(c.substring(cname.length, c.length));
      }
    }
    return ChangeResolution("360p");
  } else {
    if (newReso == "720p" && document.getElementById("frame-player").height != "720") {
      document.getElementById("frame-player").setAttribute("width", "1280");
      document.getElementById("frame-player").setAttribute("height", "720");
      document.getElementById("frame-chat").setAttribute("height", "720");
      document.cookie = "reso=720p" + expires + "; path=/";
    } else if (newReso == "480p" && document.getElementById("frame-player").height != "480") {
      document.getElementById("frame-player").setAttribute("width", "852");
      document.getElementById("frame-player").setAttribute("height", "480");
      document.getElementById("frame-chat").setAttribute("height", "480");
      document.cookie = "reso=480p" + expires + "; path=/";
    } else if (newReso == "360p" && document.getElementById("frame-player").height != "360") {
      document.getElementById("frame-player").setAttribute("width", "640");
      document.getElementById("frame-player").setAttribute("height", "360");
      document.getElementById("frame-chat").setAttribute("height", "360");
      document.cookie = "reso=360p" + expires + "; path=/";
    }
  }
}

function LoadChannel(channelName, service) {
  if (channelDropdown.classList.contains("show")) channelDropdown.classList.remove("show");
  if (channelName == "") {
    document.getElementById("current-channel").innerHTML = "No Channel Loaded";
    document.getElementById("frame-player").setAttribute("src", "about:blank");
    document.getElementById("frame-chat").setAttribute("src", "about:blank");
  } else {
    document.getElementById("current-channel").innerHTML = channelName;
    if (service == "twitch") {
      document.getElementById("frame-player").setAttribute("src", "https://player.twitch.tv/?channel="+channelName+"&muted=false");
      document.getElementById("frame-chat").setAttribute("src", "https://www.twitch.tv/embed/"+channelName+"/chat");
      document.getElementById("frame-chat").setAttribute("width", "340");
    } else {
      document.getElementById("frame-player").setAttribute("src", "https://mixer.com/embed/player/"+channelName+"?muted=false");
      document.getElementById("frame-chat").setAttribute("src", "https://mixer.com/embed/chat/"+channelName);
      document.getElementById("frame-chat").setAttribute("width", "350");
    }
  }
}

function LoadUser() {
  if (userDropdown.classList.contains("show")) userDropdown.classList.remove("show");
  var userName = document.getElementById("input-user").value;
  var oldTable = document.getElementById("follow-table-helix");
  if (oldTable) oldTable.parentNode.removeChild(oldTable);
  oldTable = document.getElementById("follow-table-mixer");
  if (oldTable) oldTable.parentNode.removeChild(oldTable);
  if (userName == "") {
    document.getElementById("current-user").innerHTML = "No User Loaded";
  } else {
    document.getElementById("current-user").innerHTML = userName;
    g_userName = userName;
    StepOneHelix();
    StepOneMixer();
  }
}

function StepOneHelix() {
  $.ajax({
    type: "GET",
    url: "https://api.twitch.tv/helix/users?login=" + g_userName,
    headers: { "Client-ID": "88pfy9ckfkxt3mp678i4ar9b0tr2q6" },
    success: function(data, status, jqxhr) {
      //console.log(data);
      dataUserTwitch = data;
      hasUserDataTwitch = true;
    },
    complete: function(jqxhr, status) {
      if (!dataUserTwitch.data[0]) {
        document.getElementById("invalid-username-helix").classList.add("show");
        hasUserDataTwitch = false;
      } else if (status == "success") {
        document.getElementById("invalid-username-helix").classList.remove("show");
        return StepTwoHelix(true, false);
      }
    }
  });
}

function StepTwoHelix(init, destroy) {
  if (init) {
    userIndexTwitch = 0;
    hasCountTwitch = false;
    pageHelix = "";
    if (!destroy) {
      let tableT = document.createElement("div");
      tableT.setAttribute("id", "follow-table-helix");
      document.getElementById("follows-helix").appendChild(tableT);
    }
  }
  if (destroy) {
    let oldTableT = document.getElementById("follow-table-helix");
    if (oldTableT) oldTableT.parentNode.removeChild(oldTableT);
    let tableT = document.createElement("div");
    tableT.setAttribute("id", "follow-table-helix");
    document.getElementById("follows-helix").appendChild(tableT);
  }
  document.getElementById("follows-helix").classList.remove("show");
  document.getElementById("loading-helix").classList.add("show");
  $.ajax({
    type: "GET",
    url: "https://api.twitch.tv/helix/users/follows?from_id=" + dataUserTwitch.data[0].id + "&first=100&after=" + pageHelix,
    headers: { "Client-ID": "88pfy9ckfkxt3mp678i4ar9b0tr2q6" },
    success: function(data, status, jqxhr) {
      //console.log(data);
      if (!hasCountTwitch) {
        countHelix = parseInt(data.total);
        countHelix -= data.data.length;
        hasCountTwitch = true;
      } else {
        countHelix -= data.data.length;
      }
      pageHelix = data.pagination.cursor;
      let isFirstId = true;
      urlStreamsTwitch = "https://api.twitch.tv/helix/streams";
      for (let ii = 0 ; ii < data.data.length ; ii++) {
        if (isFirstId) { // with first id add ? instead of &
          urlStreamsTwitch = urlStreamsTwitch + "?user_id=" + data.data[ii].to_id;
          isFirstId = false;
        } else {
          urlStreamsTwitch = urlStreamsTwitch + "&user_id=" + data.data[ii].to_id;
        }
      }
    },
    complete: function(jqxhr, status) {
      if (status == "success") {
        return StepThreeHelix();
      } else {
        document.getElementById("loading-helix").classList.remove("show");
        document.getElementById("follows-helix").classList.add("show");
      }
    }
  });
}

function StepThreeHelix() {
  $.ajax({
    type: "GET",
    url: urlStreamsTwitch,
    headers: { "Client-ID": "88pfy9ckfkxt3mp678i4ar9b0tr2q6" },
    success: function(data, status, jqxhr) {
      //console.log(data);
      if (data.data.length > 0) {
        var divT;
        var spanT;
        for (let ii = 0 ; ii < data.data.length ; ii++) {
          if (data.data[ii].type == "live" && userIndexTwitch < 20) {
            divT = document.createElement("div");
            divT.classList.add("followtablediv");
            document.getElementById("follow-table-helix").appendChild(divT);
            spanT = document.createElement("span");
            spanT.classList.add("spanlink");
            spanT.index = data.data[ii].user_name;
            spanT.innerHTML = data.data[ii].user_name + " (" + data.data[ii].viewer_count + " viewers)";
            spanT.title = data.data[ii].title;
            spanT.onclick = function(event) { LoadChannel(event.target.index, "twitch"); };
            divT.appendChild(spanT);
            userIndexTwitch++;
          }
        }
      }
    },
    complete: function(jqxhr, status) {
      if (status == "success") {
        if (countHelix > 0 && userIndexTwitch < 20) {
          return StepTwoHelix(false, false);
        } else {
          document.getElementById("loading-helix").classList.remove("show");
          document.getElementById("follows-helix").classList.add("show");
        }
      } else {
        document.getElementById("loading-helix").classList.remove("show");
        document.getElementById("follows-helix").classList.add("show");
      }
    }
  });
}

function UpdateFollowListHelix() {
  if (hasUserDataTwitch) return StepTwoHelix(true, true);
}

function StepOneMixer() {
  $.ajax({
    type: "GET",
    url: "https://mixer.com/api/v1/channels/" + g_userName,
    headers: { "Client-ID": "07b3b0eaa709e93934f6720d6130f2aa0ec716a93c5033d6" },
    success: function(data, status, jqxhr) {
      //console.log(data);
      dataUserMixer = data;
      hasUserDataMixer = true;
    },
    complete: function(jqxhr, status) {
      if (status == "success") {
        return StepTwoMixer(true, false);
      }
    }
  });
}

function StepTwoMixer(init, destroy) {
  if (init) {
    userIndexMixer = 0;
    hasCountMixer = false;
    pageMixer = 0;
    if (!destroy) {
      let tableM = document.createElement("div");
      tableM.setAttribute("id", "follow-table-mixer");
      document.getElementById("follows-mixer").appendChild(tableM);
    }
  }
  if (destroy) {
    let oldTableM = document.getElementById("follow-table-mixer");
    if (oldTableM) oldTableM.parentNode.removeChild(oldTableM);
    let tableM = document.createElement("div");
    tableM.setAttribute("id", "follow-table-mixer");
    document.getElementById("follows-mixer").appendChild(tableM);
  }
  document.getElementById("follows-mixer").classList.remove("show");
  document.getElementById("loading-mixer").classList.add("show");
  $.ajax({
    type: "GET",
    url: "https://mixer.com/api/v1/users/" + dataUserMixer.user.id + "/follows?limit=100&page=" + pageMixer,
    headers: { "Client-ID": "07b3b0eaa709e93934f6720d6130f2aa0ec716a93c5033d6" },
    success: function(data, status, jqxhr) {
      //console.log(data);
      var dataFollowsMixer = data;
      if (!hasCountMixer) {
        countMixer = jqxhr.getResponseHeader("x-total-count");
        countMixer -= dataFollowsMixer.length;
        hasCountMixer = true;
      } else {
        countMixer -= dataFollowsMixer.length;
      }
      pageMixer++;
      var divM;
      var spanM;
      for (let ii = 0 ; ii < dataFollowsMixer.length ; ii++) {
        if (dataFollowsMixer[ii].online == true && userIndexMixer < 20) {
          divM = document.createElement("div");
          divM.classList.add("followtablediv");
          document.getElementById("follow-table-mixer").appendChild(divM);
          spanM = document.createElement("span");
          spanM.classList.add("spanlink");
          spanM.index = dataFollowsMixer[ii].user.username;
          spanM.innerHTML = dataFollowsMixer[ii].user.username + " (" + dataFollowsMixer[ii].viewersCurrent + " viewers)";
          spanM.title = dataFollowsMixer[ii].name;
          spanM.onclick = function(event) { LoadChannel(event.target.index, "mixer"); };
          divM.appendChild(spanM);
          userIndexMixer++;
        }
      }
    },
    complete: function(jqxhr, status) {
      if (status == "success") {
        if (countMixer > 0 && userIndexMixer < 20) {
          return StepTwoMixer(false, false);
        } else {
          document.getElementById("loading-mixer").classList.remove("show");
          document.getElementById("follows-mixer").classList.add("show");
        }
      } else {
        document.getElementById("loading-mixer").classList.remove("show");
        document.getElementById("follows-mixer").classList.add("show");
      }
    }
  });
}

function UpdateFollowListMixer() {
  if (hasUserDataMixer) return StepTwoMixer(true, true);
}

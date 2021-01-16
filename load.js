var g_token, g_userName, g_hasCountTwitch, g_countHelix, g_pageHelix,
  g_hasFirstInTableTwitch, g_urlStreamsTwitch, g_dataUserTwitch, g_dataFollowsTwitch;
var g_overlayIndex = 0;
var g_hasToken = false;
var g_hasUserDataTwitch = false;

function ToggleDisplay(selector) {
  if (document.getElementById(selector).classList.contains("show")) {
    RemoveDisplay();
  } else {
    RemoveDisplay();
    document.getElementById(selector).classList.toggle("show");
  }
}

function RemoveDisplay() {
  document.getElementById("resoDropdown").classList.remove("show");
  document.getElementById("userDropdown").classList.remove("show");
  document.getElementById("channelDropdown").classList.remove("show");
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
}

function ChangeResolution(newReso) {
  if (resoDropdown.classList.contains("show")) RemoveDisplay();
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
      document.cookie = "reso=720p" + expires + "; path=/";
    } else if (newReso == "480p" && document.getElementById("frame-player").height != "480") {
      document.getElementById("frame-player").setAttribute("width", "852");
      document.getElementById("frame-player").setAttribute("height", "480");
      document.cookie = "reso=480p" + expires + "; path=/";
    } else if (newReso == "360p" && document.getElementById("frame-player").height != "360") {
      document.getElementById("frame-player").setAttribute("width", "640");
      document.getElementById("frame-player").setAttribute("height", "360");
      document.cookie = "reso=360p" + expires + "; path=/";
    }
  }
}

function LoadChannel(channelName, service) {
  if (channelDropdown.classList.contains("show")) RemoveDisplay();
  if (channelName == "") {
    document.getElementById("current-channel").innerHTML = "No Channel Loaded";
    document.getElementById("frame-player").setAttribute("src", "about:blank");
    document.getElementById("frame-chat").setAttribute("src", "about:blank");
  } else {
    document.getElementById("current-channel").innerHTML = channelName;
    if (service == "twitch") {
      document.getElementById("frame-player").setAttribute("src", "https://player.twitch.tv/?channel="+channelName+"&parent=stffdtiger.github.io&muted=false");
      if (document.getElementById("checkbox-darkchat").checked === true) {
        document.getElementById("frame-chat").setAttribute("src", "https://www.twitch.tv/embed/"+channelName+"/chat?parent=stffdtiger.github.io&darkpopout");
      } else {
        document.getElementById("frame-chat").setAttribute("src", "https://www.twitch.tv/embed/"+channelName+"/chat?parent=stffdtiger.github.io");
      }
    }
  }
}

function LoadUser() {
  if (userDropdown.classList.contains("show")) RemoveDisplay();
  var userName = document.getElementById("input-user").value;
  var oldTable = document.getElementById("follow-table-helix");
  if (oldTable) oldTable.parentNode.removeChild(oldTable);
  if (g_hasToken === true && userName !== "") {
    document.getElementById("current-user").innerHTML = userName;
    g_userName = userName;
    return StepOneHelix();
  } else if (g_hasToken === false) {
    alert("You need to authenticate to use the follow list feature.");
  } else {
    document.getElementById("current-user").innerHTML = "No User Loaded";
  }
}

function GetToken() {
  if (document.location.hash !== "") {
    let hash = document.location.hash.split("&");
    for (let ii = 0 ; ii < hash.length ; ii++) {
      if (hash[ii].indexOf("#access_token") === 0) {
        g_token = hash[ii];
        break;
      }
    }
    hash = g_token.split("=");
    let found = false;
    for (let ii = 0 ; ii < hash.length ; ii++) {
      if (found === false && hash[ii].indexOf("#access_token" === 0)) {
        found = true;
        continue;
      }
      if (found = true) {
        g_token = hash[ii];
        g_hasToken = true;
      }
    }
  }
}

function GetDarkChatState() {
  document.cookie = "darkchatstate=" + document.getElementById("checkbox-darkchat").checked;
}

function SetDarkChatState() {
  var cname = "darkchatstate="
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (let ii = 0 ; ii < ca.length ; ii++) {
    var c = ca[ii];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(cname) == 0) {
      document.getElementById("checkbox-darkchat").checked = c.substring(cname.length, c.length);
    }
  }
}

function StepOneHelix() {
  $.ajax({
    type: "GET",
    url: "https://api.twitch.tv/helix/users?login=" + g_userName,
    headers: {
      "Client-ID": "k8nkd1h57i2l2a3mp4g46iwm2z15tg",
      "Authorization": "Bearer " + g_token
    },
    success: function(data, status, jqxhr) {
      //console.log(data);
      g_dataUserTwitch = data;
      g_hasUserDataTwitch = true;
    },
    complete: function(jqxhr, status) {
      if (!g_dataUserTwitch.data[0]) {
        document.getElementById("invalid-username-helix").classList.add("show");
        g_hasUserDataTwitch = false;
      } else if (status == "success") {
        document.getElementById("invalid-username-helix").classList.remove("show");
        return StepTwoHelix(true, false);
      }
    }
  });
}

function StepTwoHelix(init, destroy) {
  if (init) {
    g_hasCountTwitch = false;
    g_pageHelix = "";
    g_hasFirstInTableTwitch = false;
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
    url: "https://api.twitch.tv/helix/users/follows?from_id=" + g_dataUserTwitch.data[0].id + "&first=100&after=" + g_pageHelix,
    headers: {
      "Client-ID": "k8nkd1h57i2l2a3mp4g46iwm2z15tg",
      "Authorization": "Bearer " + g_token
    },
    success: function(data, status, jqxhr) {
      //console.log(data);
      g_dataFollowsTwitch = data;
      if (!g_hasCountTwitch) {
        g_countHelix = parseInt(data.total);
        g_countHelix -= parseInt(data.data.length);
        g_hasCountTwitch = true;
      } else {
        g_countHelix -= parseInt(data.data.length);
      }
      g_pageHelix = data.pagination.cursor;
      let isFirstId = true;
      g_urlStreamsTwitch = "https://api.twitch.tv/helix/streams";
      for (let ii = 0 ; ii < parseInt(data.data.length) ; ii++) {
        if (isFirstId) { // with first id add '?' instead of '&'
          g_urlStreamsTwitch = g_urlStreamsTwitch + "?user_id=" + data.data[ii].to_id;
          isFirstId = false;
        } else {
          g_urlStreamsTwitch = g_urlStreamsTwitch + "&user_id=" + data.data[ii].to_id;
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
    url: g_urlStreamsTwitch,
    headers: {
      "Client-ID": "k8nkd1h57i2l2a3mp4g46iwm2z15tg",
      "Authorization": "Bearer " + g_token
    },
    success: function(data, status, jqxhr) {
      //console.log(data);
      var spanT;
      var isLiveTwitch;
      //console.log(g_dataFollowsTwitch.data.length);
      for (let ii = 0 ; ii < parseInt(g_dataFollowsTwitch.data.length) ; ii++) {
        isLiveTwitch = false;
        spanT = document.createElement("span");
        spanT.classList.add("spanlink");
        spanT.index = g_dataFollowsTwitch.data[ii].to_name;
        for (let jj = 0 ; jj < parseInt(data.data.length) ; jj++) {
          if (data.data[jj].user_name === g_dataFollowsTwitch.data[ii].to_name && data.data[jj].type === "live") {
            spanT.classList.add("live");
            spanT.innerHTML = g_dataFollowsTwitch.data[ii].to_name + " (" + data.data[jj].viewer_count + " viewers)";
            spanT.title = data.data[jj].title;
            isLiveTwitch = true;
            break;
          }
        }
        if (!isLiveTwitch) {
          spanT.innerHTML = g_dataFollowsTwitch.data[ii].to_name;
        }
        spanT.onclick = function(event) { LoadChannel(event.target.index, "twitch"); };
        if (!g_hasFirstInTableTwitch) {
          document.getElementById("follow-table-helix").appendChild(spanT);
          g_hasFirstInTableTwitch = true;
        } else {
          if (isLiveTwitch) {
            document.getElementById("follow-table-helix").insertBefore(spanT, document.getElementById("follow-table-helix").firstChild);
          } else {
            document.getElementById("follow-table-helix").appendChild(spanT);
          }
        }
      }
    },
    complete: function(jqxhr, status) {
      if (status == "success") {
        if (g_countHelix > 0) {
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
  if (g_hasUserDataTwitch) return StepTwoHelix(true, true);
}

function MakeMeFamous() {
  document.getElementById("button-contact").classList.toggle("highlight");
}

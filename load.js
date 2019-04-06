var g_userName;
var hasCountTwitch, hasCountMixer;
var countHelix, countMixer;
var pageHelix, pageMixer;
var userIndexTwitch, userIndexMixer;
var urlUsersTwitch, urlStreamsTwitch;
var dataUserTwitch, dataUsersTwitch;
var dataUserMixer;
var userObjT = {};
var tableT, rowT, cellT, pT, spanT;
var tableM, rowM, cellM, pM, spanM;
//var reset;

function AssignButtons() {
  var element;
  element = document.getElementById("input-channel-twitch");
  element.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
      document.getElementById("button-channel-twitch").click();
    }
  });
  element = document.getElementById("input-channel-mixer");
  element.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
      document.getElementById("button-channel-mixer").click();
    }
  });
  element = document.getElementById("input-user");
  element.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
      document.getElementById("button-user").click();
    }
  });
}

function ToggleDisplay(selector) {
  return document.getElementById(selector).classList.toggle("show");
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
      document.getElementById("frame-player").setAttribute("src", "https://player.twitch.tv/?channel="+channelName);
      document.getElementById("frame-chat").setAttribute("src", "https://www.twitch.tv/embed/"+channelName+"/chat");
      document.getElementById("frame-chat").setAttribute("width", "340");
    } else {
      document.getElementById("frame-player").setAttribute("src", "https://mixer.com/embed/player/"+channelName);
      document.getElementById("frame-chat").setAttribute("src", "https://mixer.com/embed/chat/"+channelName);
      document.getElementById("frame-chat").setAttribute("width", "350");
    }
  }
}

function LoadUser(userName) {
  if (userDropdown.classList.contains("show")) userDropdown.classList.remove("show");
  var oldTableT = document.getElementById("follow-table-helix");
  if (oldTableT) oldTableT.parentNode.removeChild(oldTableT);
  var oldTableM = document.getElementById("follow-table-mixer");
  if (oldTableM) oldTableM.parentNode.removeChild(oldTableM);
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
      //reset = parseInt(jqxhr.getResponseHeader("Ratelimit-Remaining"));
      //alert(reset);
    },
    complete: function(jqxhr, status) {
      if (status == "success") {
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
      tableT = document.createElement("div");
      tableT.classList.add("divtable");
      tableT.setAttribute("id", "follow-table-helix");
      document.getElementById("follows-helix").appendChild(tableT);
    }
  }

  if (destroy) {
    let oldTableT = document.getElementById("follow-table-helix");
    if (oldTableT) oldTableT.parentNode.removeChild(oldTableT);
    tableT = document.createElement("div");
    tableT.classList.add("divtable");
    tableT.setAttribute("id", "follow-table-helix");
    document.getElementById("follows-helix").appendChild(tableT);
  }

  document.getElementById("follows-helix").style.display = "none";
  document.getElementById("loading-helix").style.display = "block";

  $.ajax({
    type: "GET",
    url: "https://api.twitch.tv/helix/users/follows?from_id=" + dataUserTwitch.data[0].id + "&first=100&after=" + pageHelix,
    headers: { "Client-ID": "88pfy9ckfkxt3mp678i4ar9b0tr2q6" },
    success: function(data, status, jqxhr) {
      //console.log(data);
      var dataFollowsTwitch = data;
      //reset = parseInt(jqxhr.getResponseHeader("Ratelimit-Remaining"));
      if (!hasCountTwitch) {
        countHelix = parseInt(dataFollowsTwitch.total);
        countHelix -= dataFollowsTwitch.data.length;
        hasCountTwitch = true;
      } else {
        countHelix -= dataFollowsTwitch.data.length;
      }
      pageHelix = dataFollowsTwitch.pagination.cursor;
      let isFirstId = true;
      urlUsersTwitch = "https://api.twitch.tv/helix/users";
      urlStreamsTwitch = "https://api.twitch.tv/helix/streams";
      for (let ii = 0 ; ii < dataFollowsTwitch.data.length ; ii++) {
        if (isFirstId) { // with first id add ? instead of &
          urlUsersTwitch = urlUsersTwitch + "?id=" + dataFollowsTwitch.data[ii].to_id;
          urlStreamsTwitch = urlStreamsTwitch + "?user_id=" + dataFollowsTwitch.data[ii].to_id;
          isFirstId = false;
        } else {
          urlUsersTwitch = urlUsersTwitch + "&id=" + dataFollowsTwitch.data[ii].to_id;
          urlStreamsTwitch = urlStreamsTwitch + "&user_id=" + dataFollowsTwitch.data[ii].to_id;
        }
      }
    },
    complete: function(jqxhr, status) {
      if (status == "success") {
        return StepThreeHelix();
      } else {
        document.getElementById("loading-helix").style.display = "none";
        document.getElementById("follows-helix").style.display = "block";
      }
    }
  });
}

function StepThreeHelix() {
  $.ajax({
    type: "GET",
    url: urlUsersTwitch,
    headers: { "Client-ID": "88pfy9ckfkxt3mp678i4ar9b0tr2q6" },
    success: function(data, status, jqxhr) {
      //console.log(data);
      dataUsersTwitch = data;
      //reset = parseInt(jqxhr.getResponseHeader("Ratelimit-Remaining"));
      userObjT.user = [];
      for (let ii = 0 ; ii < dataUsersTwitch.data.length ; ii++) {
        userObjT.user[dataUsersTwitch.data[ii].login] = { id: dataUsersTwitch.data[ii].id, viewers: "", live: "", title: "" };
      }
    },
    complete: function(jqxhr, status) {
      if (status == "success") {
        return StepFourHelix();
      } else {
        document.getElementById("loading-helix").style.display = "none";
        document.getElementById("follows-helix").style.display = "block";
      }
    }
  });
}

function StepFourHelix() {
  $.ajax({
    type: "GET",
    url: urlStreamsTwitch,
    headers: { "Client-ID": "88pfy9ckfkxt3mp678i4ar9b0tr2q6" },
    success: function(data, status, jqxhr) {
      //console.log(data);
      var dataStreamsTwitch = data;
      //reset = parseInt(jqxhr.getResponseHeader("Ratelimit-Remaining"));
      for (let ii = 0 ; ii < dataUsersTwitch.data.length ; ii++) {
        for (let jj = 0 ; jj < dataStreamsTwitch.data.length ; jj++) {
          if (userObjT.user[dataUsersTwitch.data[ii].login].id == dataStreamsTwitch.data[jj].user_id) {
            userObjT.user[dataUsersTwitch.data[ii].login].viewers = dataStreamsTwitch.data[jj].viewer_count;
            userObjT.user[dataUsersTwitch.data[ii].login].live = dataStreamsTwitch.data[jj].type;
            userObjT.user[dataUsersTwitch.data[ii].login].title = dataStreamsTwitch.data[jj].title;
          }
        }
      }
    },
    complete: function(jqxhr, status) {
      if (status == "success" ) {
        return StepFiveHelix();
      } else {
        document.getElementById("loading-helix").style.display = "none";
        document.getElementById("follows-helix").style.display = "block";
      }
    }
  });
}

function StepFiveHelix() {
  for (let ii = 0 ; ii < dataUsersTwitch.data.length ; ii++) {
    if (userObjT.user[dataUsersTwitch.data[ii].login].live == "live" && userIndexTwitch < 20) {
      rowT = document.createElement("div");
      rowT.classList.add("divrow");
      tableT.appendChild(rowT);
      cellT = document.createElement("div");
      cellT.classList.add("divcell");
      rowT.appendChild(cellT);
      pT = document.createElement("p");
      cellT.appendChild(pT);
      spanT = document.createElement("span");
      spanT.classList.add("spanlink");
      pT.appendChild(spanT);
      spanT.index = dataUsersTwitch.data[ii].login;
      spanT.innerHTML = dataUsersTwitch.data[ii].login + " (" + userObjT.user[dataUsersTwitch.data[ii].login].viewers + " viewers)"; // display names from twitch IDs
      spanT.title = userObjT.user[dataUsersTwitch.data[ii].login].title;
      spanT.onclick = function(event) { LoadChannel(event.target.index, "twitch") }; // create links for fast channel changes
      userIndexTwitch++;
    }
  }
  if (countHelix > 0 && userIndexTwitch < 20) {
    return StepTwoHelix(false, false);
  } else {
    document.getElementById("loading-helix").style.display = "none";
    document.getElementById("follows-helix").style.display = "block";
  }
}

function UpdateFollowListHelix() {
  return StepTwoHelix(true, true);
}

function StepOneMixer() {
  $.ajax({
    type: "GET",
    url: "https://mixer.com/api/v1/channels/" + g_userName,
    headers: { "Client-ID": "07b3b0eaa709e93934f6720d6130f2aa0ec716a93c5033d6" },
    success: function(data, status, jqxhr) {
      //console.log(data);
      dataUserMixer = data;
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
      tableM = document.createElement("div");
      tableM.classList.add("divtable");
      tableM.setAttribute("id", "follow-table-mixer");
      document.getElementById("follows-mixer").appendChild(tableM);
    }
  }

  if (destroy) {
    let oldTableM = document.getElementById("follow-table-mixer");
    if (oldTableM) oldTableM.parentNode.removeChild(oldTableM);
    tableM = document.createElement("div");
    tableM.classList.add("divtable");
    tableM.setAttribute("id", "follow-table-mixer");
    document.getElementById("follows-mixer").appendChild(tableM);
  }

  document.getElementById("follows-mixer").style.display = "none";
  document.getElementById("loading-mixer").style.display = "block";

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

      for (let ii = 0 ; ii < dataFollowsMixer.length ; ii++) {
        if (dataFollowsMixer[ii].online == true && userIndexMixer < 20) {
          rowM = document.createElement("div");
          rowM.classList.add("divrow");
          tableM.appendChild(rowM);
          cellM = document.createElement("div");
          cellM.classList.add("divcell");
          rowM.appendChild(cellM);
          pM = document.createElement("p");
          cellM.appendChild(pM);
          spanM = document.createElement("span");
          spanM.classList.add("spanlink");
          pM.appendChild(spanM);
          spanM.index = dataFollowsMixer[ii].token;
          spanM.innerHTML = dataFollowsMixer[ii].token + " (" + dataFollowsMixer[ii].viewersCurrent + " viewers)"; // display names from mixer IDs
          spanM.title = dataFollowsMixer[ii].name;
          spanM.onclick = function(event) { LoadChannel(event.target.index, "mixer") }; // create links for fast channel changes
          userIndexMixer++;
        }
      }
    },
    complete: function(jqxhr, status) {
      if (status == "success") {
        if (countMixer > 0 && userIndexMixer < 20) {
          return StepTwoMixer(false, false);
        } else {
          document.getElementById("loading-mixer").style.display = "none";
          document.getElementById("follows-mixer").style.display = "block";
        }
      } else {
        document.getElementById("loading-mixer").style.display = "none";
        document.getElementById("follows-mixer").style.display = "block";
      }
    }
  });
}

function UpdateFollowListMixer() {
  return StepTwoMixer(true, true);
}


/*
window.onclick = function(event) {
  if (!event.target.matches('.resoButton')) {
    var resoDropdown = document.getElementById("resoDropdown");
    if (resoDropdown.classList.contains('show')) {
        resoDropdown.classList.remove('show');
    }
  }
}
*/

/*
function UpdateResetForm() {
  if (reset) {
    if (document.getElementById("reset-form").innerHTML !== reset) {
      document.getElementById("reset-form").innerHTML = reset;
    }
  } else if (document.getElementById("reset-form").innerHTML != "broken") {
    document.getElementById("reset-form").innerHTML = "broken";
  }
}

var x = setInterval(UpdateResetForm(), 1000);
*/
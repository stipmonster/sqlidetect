var {Cc, Ci} = require("chrome");
var data = require("sdk/self").data;

var panel = require("sdk/panel").Panel({
  width: 260,
  height: 160,
  contentURL: data.url("panel.html"),
  contentScriptFile:data.url("script.js"),
});


var httpRequestObserver =
{
  observe: function(subject, topic, data) 
  {
    if (topic == "http-on-modify-request") {
      var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
      var score=testForSqli(httpChannel.originalURI.path);
	  if(score>=5){
	  	panel.show();
	    panel.port.emit("display",httpChannel.originalURI.host + httpChannel.originalURI.path,score);
		console.log("SCORE:"+ score + " " +httpChannel.originalURI.path);
		
		
	  }
    }
  }
};

var observerService = Cc["@mozilla.org/observer-service;1"]
                                .getService(Ci.nsIObserverService);
observerService.addObserver(httpRequestObserver, "http-on-modify-request", false);


function testForSqli(url) {
	var score=0;
	if (/ASC/.test(url) || /DESC/.test(url)) {
		score=score+2;
	}
	if (/AND/.test(url) || /OR/.test(url)) {
		score=score+1;
	}
	if (/LIKE/.test(url)) {
		score=score+3;
	}
	if (/SELECT/.test(url) || /GROUP BY/.test(url)|| /GROUP%20BY/.test(url)) {
		score=score+5;
	}
	console.log("SCORE:"+ score + " " +url);
	
	return score;
}


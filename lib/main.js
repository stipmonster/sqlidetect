var {Cc, Ci} = require("chrome");
var data = require("sdk/self").data;

var panel = require("sdk/panel").Panel({
  width: 300,
  height: 160,
  contentURL: data.url("panel.html"),
  contentScriptFile:data.url("script.js"),
});

var widget=require("sdk/widget").Widget({
  id: "sqli-detect-btn",
  label: "sqli-detect",
  content: "sqli detect",
  panel: panel,
  width: 50,
});

var httpRequestObserver =
{
  observe: function(subject, topic, data) 
  {
    if (topic == "http-on-modify-request") {
      var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
      var score=testForSqli(httpChannel.originalURI.path);
	  if(score>=5){
	  	widget.panel.show();
	    widget.panel.port.emit("display",httpChannel.originalURI.host + httpChannel.originalURI.path,score);
	  }
	  if(score>0){
		  console.error("SCORE: "+ score + ","+ httpChannel.originalURI.host + httpChannel.originalURI.path);
	  }
    }
  }
};

var observerService = Cc["@mozilla.org/observer-service;1"]
                                .getService(Ci.nsIObserverService);
observerService.addObserver(httpRequestObserver, "http-on-modify-request", false);


function testForSqli(url) {
	var score=0;
	if (/ASC/.test(url) ) {
		var total=url.match(/ASC/g).length;
		score=score+(2*total);
	}
	if (/DESC/.test(url)) {
		var total=url.match(/DESC/g).length;
		score=score+(2*total);
	}
	
	if (/AND/.test(url) ) {
		var total=url.match(/AND/g).length ;
		score=score+(1*total);
	}
	if  (/OR/.test(url)) {
		var total= url.match(/OR/g).length;
		score=score+(1*total);
	}
	
	if (/LIKE/.test(url)) {
		var total=url.match(/LIKE/g).length;
		score=score+(3*total);
	}
	if (/SELECT/.test(url)) {
		
		var total=url.match(/SELECT/g).length;
		score=score+(5*total);
	}
	if (/GROUP BY/.test(url)|| /GROUP%20BY/.test(url)) {
		
		var total= url.match(/GROUP%20BY/g).length;
		score=score+(5*total);
	}
	
	console.log("SCORE:"+ score + " " +url);
	
	return score;
}

data = require("sdk/self").data

var clockPanel = require("sdk/panel").Panel({
  width:260,
  height:160,
  contentURL: data.url("panel.html"),
  contentScriptFile:data.url("script.js"),
  
});



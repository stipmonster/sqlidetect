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
	score =testRegex(/ASC/g,url,2,score);
	score =testRegex(/DESC/g,url,2,score);
	score =testRegex(/AND/g,url,1,score);
	score =testRegex(/OR/g,url,1,score);
	score =testRegex(/LIKE/g,url,3,score);
	score =testRegex(/SELECT/g,url,5,score);
	score =testRegex(/GROUP%20BY/g,url,5,score);
	score =testRegex(/WHERE/g,url,3,score);
	score =testRegex(/UNION/g,url,4,score);

	console.log("SCORE:"+ score + " " +url);
	
	return score;
}
function testRegex(regex,url,score,oldscore){
	if (regex.test(url) ) {
		var total=url.match(regex).length;
		oldscore=oldscore+(score*total);
	}
	return oldscore;
	
}

data = require("sdk/self").data

var clockPanel = require("sdk/panel").Panel({
  width:260,
  height:160,
  contentURL: data.url("panel.html"),
  contentScriptFile:data.url("script.js"),
  
});



self.port.on("display", function (url,score) {
  var div = document.getElementById('data');
  console.log("GETING DATA");
  alert(url + " SCORE: " + score);
});

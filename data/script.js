self.port.on("display", function (url,score) {
  var div = document.getElementById('data');
  div.innerHTML=url + " SCORE: " + score;
});

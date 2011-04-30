if (window.top === window) {
  safari.self.addEventListener("message", function(evtMsg) {
    if (evtMsg.name == "title") {
      document.getElementById("browsercrawler_url").innerText = evtMsg.message;
    }
    if (evtMsg.name == "start") {
      var div = document.createElement("div");
      document.body.appendChild(div);
      div.innerHTML = "<div style='background-color: white; font-size: medium; color: black; padding: 5px 5px 5px 5px; z-index: 10000; position: absolute; left: 100px; top: 100px; width: 1024px; height: 50px;'><span id='browsercrawler_url'>Starting</span><br><button style='position: absolute; bottom: 0; left: 0;' id='browsercrawler_cancelbutton'>Cancel</button></div>";
      document.getElementById("browsercrawler_cancelbutton").addEventListener("click", function() {
        safari.self.tab.dispatchMessage("cancel");
      }, true);
    }
  }, false);
}
if (top == self) {
  safari.self.addEventListener("message", function(evtMsg) {
    if (evtMsg.name == "title") {
      document.title = evtMsg.message;
    }
  }, false);
}
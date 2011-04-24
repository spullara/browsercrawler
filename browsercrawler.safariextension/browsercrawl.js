// Install our event listeners
function handleCrawl(event) {
  var debug = false;
  var ses = safari.extension.secureSettings;
  if (event.command == 'crawl') {
    var bw = event.target.browserWindow;
    bw = bw ? bw : this.activeBrowserWindow;
    if (bw) {
      if (!debug && (ses.accesskey == null || ses.secretkey == null || ses.bucket == null)) {
        alert("You must set your access key, secret key and bucket name in settings to crawl.");
      } else {
        S3Ajax.KEY_ID = ses.accesskey;
        S3Ajax.SECRET_KEY = ses.secretkey;
        var seed = bw.activeTab.url;
        var domain = seed.match(/^(https?:\/\/[^/]+)/)[1];
        var lastIndexOf = seed.lastIndexOf("/");
        var root = lastIndexOf == -1 ? seed : seed.substring(0, lastIndexOf + 1);
        var queue = [seed];
        var crawled = {};

        function next() {
          var url = queue.shift();
          console.log(url);
          if (url) {
            if (!crawled[url]) {
              crawled[url] = true;
              safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("title", "Crawling: " + url);
              $.get(url, function(data) {
                var name = url.match(/https?:\/\/(.+)/)[1];
                if (name.match(/\/$/)) {
                  name += "index.html";
                }
                name = name.replace("[?]", "_").replace("[&]", "_");
                if (!debug) {
                  S3Ajax.put(ses.bucket, name, data);
                }
                $(data).find("a").each(function() {
                  var href = $(this).attr('href');
                  if (href) {
                    var anchorPosition = href.indexOf("#");
                    href = anchorPosition == -1 ? href : href.substring(0, anchorPosition);
                    var query = href.match(/([^?]*)(\?.*)/);
                    if (query) {
                      href = query[1];
                      query = query[2];
                    }
                    if (href.match(/^\//)) {
                      href = domain + href;
                    } else if (!href.match(/^[a-z]+:/)) {
                      var lastIndexOf = url.lastIndexOf("/");
                      var urlroot = lastIndexOf == -1 ? url : url.substring(0, lastIndexOf + 1);
                      href = urlroot + href;
                    }
                    if (query) {
                      href = href + query;
                    }
                    if (href.match(root)) {
                      if (!crawled[href]) {
                        queue.push(href);
                      }
                    }
                  }
                });
                if (!debug) {
                  next();
                }
              }).error(function() {
                next();
              });
            } else {
              next();
            }
          } else {
            safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("title", "Done Crawling");
          }
        }
        next();
      }
    }
  }
}
safari.application.addEventListener("command", handleCrawl, false);
safari.application.addEventListener("contextmenu", handleCrawl, false);
safari.application.addEventListener("validate", function(event) {
  if (event.command == 'crawl') {
    var bw = event.target.browserWindow;
    bw = bw ? bw : this.activeBrowserWindow;
    if (bw) {
      event.target.disabled = !bw.activeTab.url;
    }
  }
}, false);

// Listen for messages from the client
safari.application.addEventListener("message", function(msgEvent) {
}, false);
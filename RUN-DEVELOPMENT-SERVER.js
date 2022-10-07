const https = require('https')
const fs = require('fs')
const path = "/home/user/Downloads/0-aaaPROFESSIONAL-PROGRAMMING/0000-LOCALHOST-HTTPS-CERTIFICATES/"

const PORT = 4443

const options = {
  key: fs.readFileSync(path + "localhost-key.pem"),
  cert: fs.readFileSync(path + "localhost.pem"),
}

console.log("Started server. Listening ...")

https
  .createServer(options, function (req, res) {
    // server code
    //console.log("Incoming request.", req.url)
    fs.readFile("." + req.url, function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    })

  })
  .listen({port: PORT});


  
const express = require('express');
const app = express();
const fs = require('fs');
const WebTorrent = require('webtorrent')
const http = require("http");
const socketIo = require("socket.io");
var client = new WebTorrent()
var magnetURI = 'magnet:?xt=urn:btih:C7B46F7B80349DF21FD1C55A1245E50D18B80C86&dn=Feral.2020.720p.WEBRip.800MB.x264-GalaxyRG+%E2%AD%90&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.iamhansen.xyz%3A2000%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2Fexplodie.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.moeking.me%3A6969%2Fannounce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu%3A80%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2Ftracker.zer0day.to%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fcoppersurfer.tk%3A6969%2Fannounce'
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var io = require('socket.io').listen(app.listen(4000))




app.get('/',(req, res) =>{

    res.sendFile(process.cwd() + "/public/home.html")
})


app.post('/torrent',(req, res) =>{
	client.add(req.body.link, { path: process.cwd() }, function (torrent) {
        
        res.writeHead(200,{"Content-Type":"text/html"});
        //Passing HTML To Browser
        res.write(fs.readFileSync("./public/torrent.html"));
        //Ending Response
        res.end();
        io.sockets.on("connection",function(socket){
        var interval = setInterval(function(str1, str2) {
            socket.emit("progress","Progress: " + (torrent.progress*100).toFixed(1));
        }, 2000);
        for (var number in torrent.files){
            socket.emit("files",torrent.files[number].path);
        }
        torrent.on('done', function () {
            socket.emit("progress","Progress: 100" );
            clearInterval(interval);
        })

      
})
 	})
})


app.get('/stream/:path(*)', function(req, res) {
  const path = req.params.path
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] 
      ? parseInt(parts[1], 10)
      : fileSize-1
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
});

// const port = process.env.PORT || 4000;
// server.listen(4000, function () {
// 	console.log('App is running on port 4000')
// })
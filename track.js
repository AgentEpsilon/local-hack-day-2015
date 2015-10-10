const client = { //Clarifai info
    id: 'xv599yIQI0SsYj62g5Ol47avkPoqrEtDo2TqsOcl',
    secret: 'QS0Ax2Vf1rvAsEBgYuqX8ac07GSapoqSROtkVZH0'
}
const cloudinaryconfig = { //Cloudinary info
    cloud_name: 'dq91gnmad',
    api_key: '582658239798378',
    api_secret: 'QaLFI9Y5iaaGp7RNRFSW26svBlo'
}
var cloudinary = require('cloudinary')
cloudinary.config(cloudinaryconfig)

var clarifai = require('./clarifai_node.js')
clarifai.initAPI(client.id, client.secret)

navigator.getUserMedia  = navigator.getUserMedia ||
              navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia ||
              navigator.msGetUserMedia;
              
var width = 320
var height = 0

var streaming = false;

var video = document.querySelector('video')
var canvas = document.querySelector('canvas')
var photo = document.querySelector('#photo')
var startbutton = document.querySelector('#capture')
var classes = document.querySelector('#classes')
var classheader = document.querySelector('#classheader')

if (navigator.getUserMedia) {
    navigator.getUserMedia({audio: false, video: true}, function(stream) {
        video.src = window.URL.createObjectURL(stream);
    }, function(err){throw err});
}

video.addEventListener('canplay', function(){
    if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);
      
        if (isNaN(height)) {
          height = width / (4/3);
        }
      
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        photo.setAttribute('width', width);
        photo.setAttribute('height', height);
        streaming = true;
      }
}, false)

startbutton.addEventListener('click', function(ev){
    classheader.innerHTML = "Loading, please wait..."
    takepicture();
    ev.preventDefault();
}, false);
    
function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
}
clearphoto()

function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
    
      var data = canvas.toDataURL('image/png', 0.9);
      photo.setAttribute('src', data);
      
    //   var decoded = window.atob(data.split(",")[1])
    //   var array = [];
    //     for(var i = 0; i < decoded.length; i++) {
    //         array.push(decoded.charCodeAt(i));
    //     }
    //     var blob = new window.Blob([new Uint8Array(array)], {type: 'image/jpeg'});
      
    //   clarifai.tagData(blob, null, clarifaicallback)
        cloudinary.uploader.upload(data, function(result){
            clarifai.tagURL(result.secure_url, null, function(err, res){
                if(err) throw err
                res.results.forEach(function(obj){
                    classes.innerHTML = ""
                    const o = obj.result.tag
                    for(var i = 0; i < o.classes.length; i++){
                        var term = o.classes[i]
                        var prob = (o.probs[i].toPrecision(4) * 100).toString().substr(0, 5)
                        classes.innerHTML += "<li class='tagclass'>"+term+' <span>'+prob+'%</span></li>'
                    }
                })
                classheader.style.display = "none";
                cloudinary.uploader.destroy(result.public_id)
            })
        })
    } else {
      clearphoto();
    }
}
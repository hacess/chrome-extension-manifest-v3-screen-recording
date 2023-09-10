var mediaRecorder ;
var recordedChunks = [];
var seconds = 0

function stopRecord(recordedChunks){
    if(mediaRecorder.state == 'recording'){
        mediaRecorder.stop();
    }
    var blob = new Blob(recordedChunks, {
        'type': 'video/mp4'
      });
      var url = URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');

    // Set the anchor's attributes
    downloadLink.href = url;
    downloadLink.download = 'demo.mp4'; // Specify the desired filename

    // Programmatically trigger a click event on the anchor to initiate the download
    downloadLink.click();
}
// Listen for messages from content / popup
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request)
        if(request.type =="tabRecord"){
            recordTab(request.streamId,request.tabId);
            sendResponse("startRecord");
        }
        if(request.type  == "stopRecording"){
            mediaRecorder.stop();
            sendResponse("stopRecord");
        }
    }
);
// record the tab only
async function recordTab(streamId,tabId){
    
    config = {
        "video": {
            "mandatory": {
                "chromeMediaSourceId": streamId,
                "chromeMediaSource": "tab"
            }
        },
        "audio": {
            "mandatory": {
                "chromeMediaSourceId": streamId,
                "chromeMediaSource": "tab"
            }
        }
    }

    navigator.mediaDevices.getUserMedia(config).then(function (desktop) {
            var stream = new MediaStream();
            if(desktop){
                video = desktop.getVideoTracks()[0];
                stream.addTrack(video);
            }
            mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=h264',
            });
            
            recordedChunks = [];
            mediaRecorder.onstop=function(){
                var tracks = {};
                tracks.a = stream ? stream.getTracks() : [];
                tracks.b = desktop ? desktop.getTracks() : [];
                tracks.c =  [];
                tracks.total = [...tracks.a, ...tracks.b,...tracks.c];
                /*  */
                for (var i = 0; i < tracks.total.length; i++) {
                    if (tracks.total[i]) {
                        tracks.total[i].stop();
                    }
                }
                stopRecord(recordedChunks)
            }
            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };
            stream.onended = function(){
                mediaRecorder.stop()
            }
            mediaRecorder.start()
    })
    }
const onButtonClick = (event) => {
  const button = event.target;
  if (button.id === "record") {
    window.chrome.tabs.query({ currentWindow: !0, active: !0 }, function (e) {
      var n = e[0];
      chrome.tabCapture.getMediaStreamId({consumerTabId: n.id}, (streamId) => {
          chrome.tabs.sendMessage(n.id, {type:"tabRecord",streamId:streamId,tabId:n.id});
      });
  });
  } else if (button.id === "stop") {
     window.chrome.tabs.query({ currentWindow: !0, active: !0 }, function (e) {
        var n = e[0];
        window.chrome.tabs.sendMessage(n.id, { type: "stopRecording" });
    });
  }
};

document.getElementById("record").addEventListener("click", onButtonClick);
document.getElementById("stop").addEventListener("click", onButtonClick);
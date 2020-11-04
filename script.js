window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx     = new AudioContext(),
    audioElement,
    audioSrc,
    analyser     = audioCtx.createAnalyser(),
    numberOfBars = 180,
    spectrum     = document.getElementById('spectrum'),
    W            = window.innerWidth,
    H            = (window.innerHeight - 60),
    size         = Math.min(W, H),
    playBtn      = document.querySelector('.logo'),
    bars         = [],
    record         = document.querySelector('.record');
    warning         = document.querySelector('.warning');


analyser.fftSize = 2048;
analyser.minDecibels = -90;
analyser.maxDecibels = 0;

var bufferLength = analyser.frequencyBinCount,
    frequencyData = new Uint8Array(bufferLength);

var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;



var MusicVisuals = {
  call: null,
  render: function() {
    for (let i = 0; i <  numberOfBars; i++) {
      let div = document.createElement('div');
      div.id = 'bar-' + i;
      div.className = 'bar';
      spectrum.appendChild(div);
      bars.push(div);
      bars[i].style.height = size/18 + 'px';
    }
  },

  destroy: function() {
    let divs= document.querySelectorAll('.bar');
    if ( divs.length ) {
      for (let i = 0; i < numberOfBars; i++) {
        spectrum.removeChild(divs[i]);
      }
    }
  },

  start: function() {
    analyser.getByteFrequencyData(frequencyData);

    var barcount = 0,
        steps = numberOfBars,
        min = Math.min.apply(Math, frequencyData),
        max = Math.max.apply(Math, frequencyData),
        k = max - min;

    
    for (let i = 0; i < numberOfBars; i += 1) {
      let y = frequencyData[i];
      y = (y - min ) / k * 7;
      
      if (barcount > numberOfBars) {
        barcount = 0;
      }


      
      let bar = bars[barcount];
      
      if (bar) {
        var angle = (Math.PI * 2 / numberOfBars) * i;
        var deg = angle*180/Math.PI;
        var hsl = "hsl(" + frequencyData[i] + ',100%,' + 50 + '%)';
        bar.style.transform = "rotate(" + deg + "deg) " + "scaleY(" + y + ")";
        bar.style.backgroundColor = hsl;
        
        if (max === 0) {
          bar.style.transform = "rotate(" + deg + "deg) " + "scaleY(" + 0 + ")";
        }

      }
      barcount++;
    }
    
    MusicVisuals.call = requestAnimationFrame(MusicVisuals.start);
  }
};

playBtn.addEventListener("click", playSound);

function playSound() {
  startRec();
  MusicVisuals.render();
  MusicVisuals.start();
  playBtn.classList.add("invisible");
}

function startRec() {
  if (isFirefox) {
    if (!audioSrc) {
      navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
      navigator.getUserMedia(
          { audio: true, video: false },
          function (mediaStream) {
            audioSrc = audioCtx.createMediaStreamSource(mediaStream);
            audioSrc.connect(analyser);
            record.classList.add('ap-disap');
          },
          function (err) {
            console.log("There was an error when getting microphone input: " + err);
          }
      );
    } else {
      audioSrc.disconnect();
      audioSrc = null;
    }
  } else {
    warning.classList.add('visible');
  }
}

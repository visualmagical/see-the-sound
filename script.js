///////////////////////////  audio  ///////////////////////////  
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx     = new AudioContext(),
    audioElement,
    audioSrc     = null,
    analyser     = audioCtx.createAnalyser(),
    bufferLength = analyser.frequencyBinCount,
    frequencyData = new Uint8Array(bufferLength);

analyser.fftSize = 2048;
analyser.minDecibels = -90;
analyser.maxDecibels = 0; 

///////////////////////////  visuals  ///////////////////////////  
var numberOfBars = 180,
    spectrum     = document.getElementById('spectrum'),
    W            = window.innerWidth,
    H            = (window.innerHeight - 60),
    size         = Math.min(W, H),

///////////////////////////  UI   ///////////////////////////
    playBtn      = document.querySelector('.play'),
    bars         = [],
    fileBtn      = document.querySelector('.file-open'),
    fileInput    = document.getElementById('file'),
    upload       = document.querySelector('.upload'),
    mp3          = document.querySelector('.mp3'),
    listItems    = document.querySelectorAll('.item'),
    hello        = document.querySelector('.hello'),
    record       = document.querySelector('.record');


// a = [].slice().call(a);

///////////////////////////  visuals  ///////////////////////////

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



///////////////////////////  events / function calls  ///////////////////////////

handleList();

fileInput.addEventListener('change', function(e) {
  e.stopPropagation();
  
  var file = fileInput.files[0];

  audioElement = document.createElement('audio');
  audioElement.src = URL.createObjectURL(file);
  audioElement.id = 'audioElement';
  document.body.appendChild(audioElement);
  audioSrc     = audioCtx.createMediaElementSource(audioElement);
  audioSrc.connect(audioCtx.destination);
  audioSrc.connect(analyser);

  playBtn.classList.add('dis-block');
  upload.classList.remove('dis-flex');
  audioElement.addEventListener('ended', onEnded);

})

playBtn.addEventListener('click', function(){
  playSound();
  MusicVisuals.render();
  MusicVisuals.start();
});


hello.addEventListener('click', function(e) {
  e.stopPropagation();
  if ( this.classList.contains('move') ) {
    
    for (let j = 0; j < listItems.length; j++) {
      listItems[j].classList.remove('disabled');
      listItems[j].classList.remove('collapse');
      listItems[j].classList.remove('voice-trans');
    }
    
    this.classList.remove('move');
    record.classList.remove('ap-disap');
    mp3.classList.remove('dis-block');
    upload.classList.remove('dis-flex');
    playBtn.classList.remove('dis-block');
    playBtn.style.opacity = "1";


    if (audioSrc !== null) {
      audioSrc.disconnect(); 
      audioSrc = null;
    }
  }
})



/////////////////////////// functions  ///////////////////////////

function playSound() {
  if (!audioElement.paused) {
    audioElement.pause();
    setTimeout(function(){
      playBtn.style.opacity = "1";
    }, 700)

  } else {
    playBtn.style.opacity = "0";

    setTimeout(function(){
      audioElement.play();
    },300)
  }
}

function onEnded() {
  document.body.removeChild(this);
  upload.classList.add('dis-flex');
  playBtn.classList.remove('dis-block');
  playBtn.style.opacity = "1";
  audioSrc.disconnect(); 
  audioSrc = null; 
}


function handleList() {
  for (let j = 0; j < listItems.length; j++) {

    setTimeout( function(){
      listItems[j].classList.remove('disabled');
    }, 6000)

    listItems[j].addEventListener("click", function(e) {
      e.stopPropagation();
       
      listItems[j].classList.add('button--active');
      listItems[j].classList.add('disabled');
      listItems[j].classList.add('voice-trans');

      removeOtherItems();
      listItems[j].classList.remove('button--active');
      hello.classList.add('move');
      
      let dataType = this.getAttribute('data-type');
      

      if (dataType === "sound") {
        record.classList.remove('ap-disap');
        mp3.classList.add('dis-block');
        upload.classList.add('dis-flex');

      } else if ( dataType === "voice" ) {
        mp3.classList.remove('dis-block');
        upload.classList.remove('dis-flex');

        startRec();
        MusicVisuals.render();
        MusicVisuals.start();
      } 
    })
  }
}

function removeOtherItems () {
  for (let k = 0; k < listItems.length; k++ ) {
    if (!listItems[k].classList.contains('button--active')) {
        listItems[k].classList.add('collapse');
    } 
  }
}

function startRec() {
  if (audioSrc === null) {
    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getUserMedia(
        { audio: true, video: false }, 
        function (mediaStream) {
            audioSrc = audioCtx.createMediaStreamSource(mediaStream);
            audioSrc.connect(analyser);
            record.classList.add('ap-disap'); 
            console.log('ololo');
        }, 
        function (err) {
          console.log("There was an error when getting microphone input: " + err);
        }
    );
  } else {
    audioSrc.disconnect(); 
    audioSrc = null; 
  }
}
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
    playBtn      = document.querySelector('.play'),
    bars         = [],
    fileBtn      = document.querySelector('.file-open'),
    fileInput    = document.getElementById('file'),
    mp3form         = document.querySelector('.mp3'),
    listItems    = document.querySelectorAll('.item'),
    hello        = document.querySelector('.hello');


analyser.fftSize = 2048;
analyser.minDecibels = -90;
analyser.maxDecibels = 0; 

var bufferLength = analyser.frequencyBinCount,
    frequencyData = new Uint8Array(bufferLength);






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
  mp3form.classList.remove('dis-none');
  playBtn.classList.remove('dis-block');
  playBtn.style.opacity = "1";
}



fileInput.addEventListener('change', function(e) {
  e.stopPropagation();
  var file = this.files[0];

  audioElement = document.createElement('audio');
  audioElement.src = URL.createObjectURL(file);
  audioElement.id = 'audioElement';
  document.body.appendChild(audioElement);
  audioSrc     = audioCtx.createMediaElementSource(audioElement);
  audioSrc.connect(audioCtx.destination);
  audioSrc.connect(analyser);
  playBtn.classList.add('dis-block');
  mp3form.classList.add('dis-none');
  audioElement.addEventListener('ended', onEnded);
})

playBtn.addEventListener("click", playSound);
MusicVisuals.render();
MusicVisuals.start();


for (let j = 0; j < listItems.length; j++) {

  listItems[j].addEventListener("click", function() {
     
    this.classList.add('button--active');
    removeOther();
    this.classList.remove('button--active');
    hello.classList.add('move');
    
    let dataType = this.getAttribute('data-type');
    console.log(dataType);

    if (dataType === "sound") {
      mp3form.classList.add('dis-flex');
    } 

  })
}


function removeOther () {
  for (let k = 0; k < listItems.length; k++ ) {
    if (!listItems[k].classList.contains('button--active')) {
        listItems[k].classList.add('collapse');
    } 
  }
}

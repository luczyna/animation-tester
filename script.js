/* define our DOM elements that we will interact with */
var d = {
    controlPlayback: document.getElementById('playback'),
    controlSettings: document.getElementById('settings'),
    image          : document.getElementsByTagName('img')[0],
    info           : document.getElementById('info'),
    closer         : document.getElementById('accept'),
    dropzone       : document.getElementById('filedump')
};

/* define our variables that will store our information */
var playbackStatus,
    directory,
    framerate,
    repeat,
    animate,
    images = [];

/* this will get the ball rolling when the app is loaded */
d.controlSettings.addEventListener('click', showInfo);





/* hide the information panel */
function hideInfo() {
    //first check if we can use the information provided
    if (!getFrameRate()) {
        return;
    }
    willItRepeat();

    //change the image to the first one available
    gifInit();

    //now hide the info and reset any animation
    d.info.style.display = 'none';

    // clean up after ourselves
    d.closer.removeEventListener('click', hideInfo);
    d.controlSettings.addEventListener('click', showInfo);
}

/* show the information panel */
function showInfo() {
    info.style.display = 'block';
    
    // clean up after ourselves
    d.controlSettings.removeEventListener('click', showInfo);
    d.closer.addEventListener('click', hideInfo);
}



/* lets get the information */
function getFrameRate() {
    var rate = document.getElementById('fps').textContent ;
    if ( rate.match(/[a-zA-Z;-]/) ) {
        //this isn't a valid rate for us to use...
        window.alert('please enter a proper value for the Frame Rate, without spaces or letters');
        return false;
    } else {
        framerate = Number(rate);
        return rate;
    }
}


function willItRepeat() {
    var checkbox = document.getElementById('repeat');
    if (checkbox.checked) {
        repeat = true;
    } else {
        repeat = false;
    }
}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    //define where the files are coming from
    var files = evt.dataTransfer.files;

    //get our list ready
    var list = document.getElementById('filelist');
    list.innerHTML = '';

    //loop through the fileList of File objects,
    //and record the src of the file into our images array
    //first empty the array to clear it of any wrong doing
    images.length = 0;

    for (var i = 0, f; f = files[i]; i++) {
        // console.log(f);

        //instantiate a new FileReader
        var reader = new FileReader();

        //capture the file information
        //theFile will reference f
        //this function will fire once reader
        //has been told to read the information a certain way
        reader.onload = (function(theFile) {
            return function(e) {
                var item = document.createElement('li');
                item.textContent = theFile.name;
                list.appendChild(item);
                // console.log(theFile.name);
                images.push(e.target.result);

            };
        })(f);

        //tell the FileReader to read f as a DataURL
        reader.readAsDataURL(f);
    }

    // console.log(images);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    //tell us this is a copy action
    evt.dataTransfer.dropEffect = 'copy';
}

d.dropzone.addEventListener('dragover', handleDragOver, false);
d.dropzone.addEventListener('drop', handleFileSelect, false);

//change the image to the first of the available set in images
function gifInit() {
    d.image.src = images[0];
    d.image.setAttribute('data-frame', 0);
    d.controlPlayback.addEventListener('click', playAnimation);
}

function playAnimation() {
    //prepare the frame rate into a useable number
    //exm = 1 sec / x frames 
    var t = 1 / framerate * 1000;

    animate = window.setInterval(changeFrame, t)
    
    //change the event tied to the play button
    d.controlPlayback.textContent = 'pause';
    d.controlPlayback.setAttribute('data-current', 'playing');
    d.controlPlayback.removeEventListener('click', playAnimation);
    d.controlPlayback.addEventListener('click', pauseAnimation);
}

function changeFrame() {
    var currentFrame = parseInt(d.image.getAttribute('data-frame'), 10);
    var nextFrame;

    if (currentFrame + 1 < images.length) {
        nextFrame = currentFrame + 1;
    } else if (currentFrame + 1 === images.length && repeat) {
        nextFrame = 0;
    } else {
        //we've reached the end and we're not supposed to repeat
        window.clearInterval(animate);
        d.controlPlayback.textContent = 'play'
        d.controlPlayback.setAttribute('data-current', 'paused');
        d.controlPlayback.removeEventListener('click', pauseAnimation);

        //reset it to the beginning
        gifInit();
        return;
    }

    //change the frame, and update the attribute
    d.image.src = images[nextFrame];
    d.image.setAttribute('data-frame', nextFrame);
}

function pauseAnimation() {
    window.clearInterval(animate);

    d.controlPlayback.textContent = 'play';
    d.controlPlayback.setAttribute('data-current', 'paused');
    d.controlPlayback.removeEventListener('click', pauseAnimation);
    d.controlPlayback.addEventListener('click', playAnimation);
}
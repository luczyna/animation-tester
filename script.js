/* define our elements that we will interact with */
var controlPlayback = document.getElementById('playback'),
    controlSettings = document.getElementById('settings'),
    image           = document.getElementsByTagName('img')[0],
    info            = document.getElementById('info')
    closer          = document.getElementById('accept'),
    dropzone        = document.getElementById('filedump');

/* define our variables that will store our information */
var playbackStatus,
    directory,
    framerate,
    repeat,
    animate,
    images = [];

/* hide the information panel */
function hideInfo() {
    //first check if we can use the information provided
    if (!getFrameRate()) {
        return;
    }
    willItRepeat();
    //change the image to the first one available
    gifInit();

    //now set the animation into motion
    var opacity = 1;

    var timer = setInterval( function() {
        //stop our fadeOut if it is barely visible
        if (opacity < 0.1) {
            info.style.opacity = '0';
            info.style.filter = 'alpha(opacity=0)';
            info.style.display = 'none';
            clearInterval(timer);

            // clean up after ourselves
            closer.removeEventListener('click', hideInfo);
            controlSettings.addEventListener('click', showInfo);
        }
        //slowly increment the opacity down
        info.style.opacity = opacity;
        info.style.filter = 'alpha(opacity=' + (opacity * 100) + ')';
        
        //reduce the opacity a little
        opacity -= opacity * 0.1;
    }, 15);
}

/* show the information panel */
function showInfo() {
    var opacity = 0.01;

    //initiate the animation
    info.style.opacity = 0;
    info.style.filter = 'alpha(opacity=0)';
    info.style.display = 'block';

    var timer = setInterval( function() {
        //stop our fadeOut if it is barely visible
        if (opacity > 0.90) {
            info.style.opacity = 1;
            info.style.filter = 'alpha(opacity=100)';
            clearInterval(timer);

            // clean up after ourselves
            controlSettings.removeEventListener('click', showInfo);
            closer.addEventListener('click', hideInfo);
        }

        //slowly increment the opacity down
        info.style.opacity = opacity;
        info.style.filter = 'alpha(opacity=' + (opacity * 100) + ')';
        
        //reduce the opacity a little
        opacity += opacity * 1.5;
    }, 15);
}
controlSettings.addEventListener('click', showInfo);



/* lets get the information */
function getFrameRate() {
    var rate = document.getElementById('fps').textContent ;
    if ( rate.match(/[a-zA-Z;-]/) ) {
        //this isn't a valid rate for us to use...
        window.alert('please enter a proper value for the Frame Rate, without spaces or letters');
        return false;
    } else {
        framerate = rate;
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

// // Check for the various File API support.
// if (window.File && window.FileReader && window.FileList && window.Blob) {
//   // Great success! All the File APIs are supported.
//   console.log('you are able to use the file system');
// } else {
//   alert('The File APIs are not fully supported in this browser.');
// }

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

dropzone.addEventListener('dragover', handleDragOver, false);
dropzone.addEventListener('drop', handleFileSelect, false);

//change the image to the first of the available set in images
function gifInit() {
    image.src = images[0];
    controlPlayback.addEventListener('click', playAnimation);
}

function playAnimation() {
    //prepare the frame rate into a useable number
    //exm = 1 sec / x frames 
    var t = 1 / framerate * 1000;

    animate = window.setInterval(changeFrame, t)
    
    //change the event tied to the play button
    controlPlayback.textContent = 'pause';
    controlPlayback.setAttribute('data-current', 'playing');
    controlPlayback.removeEventListener('click', playAnimation);
    controlPlayback.addEventListener('click', pauseAnimation);
}

function changeFrame() {
    var currentFrame = parseInt(image.getAttribute('data-frame'), 10);
    var nextFrame;

    if (currentFrame + 1 < images.length) {
        nextFrame = currentFrame + 1;
    } else if (currentFrame + 1 === images.length && repeat) {
        nextFrame = 0;
    } else {
        //we've reached the end and we're not supposed to animate
        window.clearInterval(animate);
        return;
    }

    //change the frame, and update the attribute
    image.src = images[nextFrame];
    image.setAttribute('data-frame', nextFrame);
}

function pauseAnimation() {
    window.clearInterval(animate);

    controlPlayback.textContent = 'play';
    controlPlayback.setAttribute('data-current', 'paused');
    controlPlayback.removeEventListener('click', pauseAnimation);
    controlPlayback.addEventListener('click', playAnimation);
}
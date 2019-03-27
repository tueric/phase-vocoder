var WaveSurfer = require('wavesurfer')
var TimelinePlugin = require('./node_modules/wavesurfer/plugin/wavesurfer.timeline.js'); 
var { SHA3 } = require('sha3')

var Chart = require('chart.js')

let wavesurfer = null
let numInputs = 0
let currentUid = null

function generatePitchGraph(pitchData, gc=1000) {
	const dataLength = pitchData.length
    var data = [];
    for (var x = 0; x < dataLength; x+=gc) {
        data.push({x: x/44100, y: pitchData[x]})
    }
    var options = {
        title: {
            display: true,
            text: 'Pitch Over Time (Hz, s)'
        },
        responsive: true,
        maintainAspectRatio: false, 
    }

    var ctx = document.getElementById('pitchChart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
				label: 'Pitch',
				data: data,
				borderColor: '#2196f3',
				backgroundColor: '#2196f3',
            }]
        },
        options: options,
    });
}

function readFile(event) {
    /*
    Handler for the "Choose file" button.
   	Sends the selected file to the detect_pitch endpoint.
    It also loads the file for WaveSurfer for playing and seeking.
    */
    event.preventDefault()

    var fileForm = document.forms[0];
    const path = fileForm.sampleFile.files[0].path

    wavesurfer = WaveSurfer.create({
        container: '#waveform',
    });

    WaveSurfer.Timeline.init({
        wavesurfer: wavesurfer,
        container: "#wave-timeline"
    });

    // Load the uploaded file so it can be played
    wavesurfer.load(path);
    wavesurfer.on('ready', function () {
    	console.log('DEBUG: ready to play file')
    })

    const url = "http://127.0.0.1:3000/detect_pitch"
    const formData = new FormData(fileForm)

    // Send the data and graph stuff
    fetch(url, {
        method : "POST",
        body: formData,
    })
	.then(
		function(response) {
			return response.json();
		})
	.then(
        function(responseBody) {
        	var pitchValues = responseBody.pitch
        	currentUid = responseBody.uid
     		pitchValues = pitchValues.split(',').map(el => parseInt(el))
     		generatePitchGraph(pitchValues)
        })
}

function addInput(num) {
    /*
    Adds a row of input [a, b, pitch]
    */
    var removeButton = document.createElement('button')

    var aInput = document.createElement("input")
    var bInput = document.createElement("input")
    var pitchInput = document.createElement("input")

    // set some field restrictions
    // TODO: reflect these restrictions on the frontend
    const timePattern = "[0-9]+.?[0-9]*"
    aInput.pattern = timePattern
    bInput.pattern = timePattern
    pitchInput.pattern= "[A-Ga-g](s|b)?[0-8]"

    removeButton.onclick = removeInput
    removeButton.id = `inputs_remove_${num}`
    removeButton.innerHTML = "Remove"
    removeButton.type = "button"

    aInput.id = `inputs_a_${num}`
    bInput.id = `inputs_b_${num}`
    pitchInput.id = `inputs_pitch_${num}`

    var inputsTable = document.getElementById('inputs_table')

    // children[0].children.length
    var numRows = inputsTable.children[0].children.length
    var row = inputsTable.insertRow(numRows)
    row.id = `inputs_row_${num}`
    var aCell = row.insertCell(0)
    var bCell = row.insertCell(1)
    var pitchCell = row.insertCell(2)
    var removeButtonCell = row.insertCell(3)

    aCell.appendChild(aInput)
    bCell.appendChild(bInput)
    pitchCell.appendChild(pitchInput)
    removeButtonCell.appendChild(removeButton)
    numInputs += 1
}

function removeInput(event) {
    /*
    Removes a particular row of input
    */
    var rowNum = event.target.id.split('_')[2]
    var toRemove = document.getElementById(`inputs_row_${rowNum}`)
    toRemove.remove()
}

function submit(event) {
    /*
    Gets the form data and sends it to the correct_pitch endpoint
    */
    const len = event.target.length
    var pitch_shifts = []
    for (var i = 0; i < len; i++) {
        i += 1
        if (i + 2 >= len) break // lmao
        var shift = {
            'start_time': event.target[i].value,
            'end_time': event.target[i+1].value,
            'desired_note': event.target[i+2].value,
        }
        pitch_shifts.push(shift)
        i += 2
    }
    const payload = {
        uid: currentUid,
        pitch_shifts,
    }

    const url = "http://0.0.0.0:3000/correct_pitch";
    fetch(url, {
        method : "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(
    	function(response) {
			return response.text();
			// return response.json()
		})
    .then(
        function(responseBody) {
        	console.log('aaa', responseBody)
		    var result = document.getElementById('result')

		}
    )

    event.preventDefault()
}

window.addEventListener("load", 
    function(){
        // Initialize everything!

        // Upload button
        var uploadButton = document.getElementById('audioFileChooser')
        uploadButton.onclick = readFile

        // Play/Pause
        var playPauseButton = document.getElementById('button_play_pause')
        playPauseButton.onclick = () => { wavesurfer.playPause() }

        // Initialize progress time
        var progress = document.getElementById('menu-bar_progress')
        setInterval(
            () => { 
                if (wavesurfer) {
                    progress.innerHTML = `${wavesurfer.getCurrentTime()}` 
                }
            },
            100)

        // Add inputs listener
        var addInputButton = document.getElementById('inputs_add')
        addInputButton.onclick = () => { addInput(numInputs + 1)}

        // Set up the form submission
        const form = document.getElementById('form');
        form.onsubmit = submit;
    })




const videoHeight = "360px";
const videoWidth = "480px";
let poseLandmarker = undefined;
let runningMode = "VIDEO";

//initially fill the Canva with black color
const canvas = document.getElementById("output_canvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const controls = window;
const drawingUtils = window;
const mpFaceMesh = window;

const config = {
    locateFile: (file) => {
      return (
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@` +
        `${mpFaceMesh.VERSION}/${file}`
      );
    }
};

// Configuration options for the formula
const solutionOptions = {
  selfieMode: true,
  enableFaceGeometry: false,
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
  k: 0.72
};

const videoElement = document.getElementById("webcam")
const canvasElement = document.getElementById("output_canvas")
const canvasCtx = canvasElement.getContext("2d")
const controlsElement = document.getElementById("control-div")

const heightElement = document.getElementById("est-height")
const headElement = document.getElementById("est-head")
const depthElement = document.getElementById("est-depth")


const fpsControl = new controls.FPS();
const faceMesh = new mpFaceMesh.FaceMesh(config);
faceMesh.setOptions(solutionOptions);
faceMesh.onResults(onResults);

let heightFilterArr = [];
function onResults(results) {
  
    // Update the frame
    fpsControl.tick();
  
    var width = results.image.width;
    var height = results.image.height;
  
    // Draw the overlays.
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    var irisLeftMinX = -1;
    var irisLeftMaxX = -1;
    
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        for (const point of FACEMESH_LEFT_IRIS) {
          var point0 = landmarks[point[0]];
  
          if (irisLeftMinX == -1 || point0.x * width < irisLeftMinX) {
            irisLeftMinX = point0.x * width;
          }
          if (irisLeftMaxX == -1 || point0.x * width > irisLeftMaxX) {
            irisLeftMaxX = point0.x * width;
          }
        }
        
        //Draw right eye point
        drawingUtils.drawConnectors( canvasCtx, landmarks, mpFaceMesh.FACEMESH_LEFT_IRIS, { color: "#30FF30", lineWidth: 1 });
        // Draw left eye point
        drawingUtils.drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {color: '#FF3030'});

        //draw lips
        drawingUtils.drawConnectors( canvasCtx, landmarks, mpFaceMesh.FACEMESH_LIPS, {color: '#E0E0E0'})
        //draw face mesh
        drawingUtils.drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});

        // Define eye landmarks indices
        const right_eyeLandmarkIndex = 468; 
        const left_eyeLandmarkIndex = 473;
  
        // Calculate Euclidean distance
        const R_eyeLandmark = landmarks[right_eyeLandmarkIndex];
        const L_eyeLandmark = landmarks[left_eyeLandmarkIndex];
        
        var eye_x = (R_eyeLandmark.x + L_eyeLandmark.x)/2;
        var eye_y = (R_eyeLandmark.y + L_eyeLandmark.y)/2;

        //get mouth landmarks by index 14
        const mouth_landmark = landmarks[14];
        
       const distance = Math.sqrt(
          Math.pow(eye_x - mouth_landmark.x, 2) +
          Math.pow(eye_y - mouth_landmark.y, 2)
        ).toFixed(2)
  
        var dx = irisLeftMaxX - irisLeftMinX;
        var dX = 11.7;
  
        // Logitech HD Pro C922 Norm focalLogiLogitech HD Pro C922 Norm focaltech HD Pro C922 Norm focal
        var normalizedFocaleX = 1.40625;
        var fx = Math.min(width, height) * normalizedFocaleX;
        // Calculate camera depth
        var dZ = (fx * (dX / dx)) / 10.0;
        
        depthElement.innerText = dZ.toFixed(0);
        // Display esti_height 
        canvasCtx.fillStyle = "red";
        canvasCtx.font = "bold 24px Times New Roman";
        canvasCtx.fillText(`Depth: ${dZ.toFixed(2)} cm`, width * 0.1, 50);

        //calucalte forehead distance
        var fore_head_distance = Math.sqrt(
          Math.pow(landmarks[10].x - landmarks[152].x, 2) +
          Math.pow(landmarks[10].y - landmarks[152].y, 2)
        );

        var head_size_cm = (solutionOptions.k * dZ * (fore_head_distance));
        //the height of a person is approximately 8 time of his head size
        var esti_height = (head_size_cm + (head_size_cm * (0.35))) * 7.7;

        //collected 10 height records and calculate the estimated height by its average
        if(heightFilterArr.length >=10){
          //get the height average
          let final_height = (heightFilterArr.reduce((val,cur)=> val+cur, 0) / 10).toFixed(0)

          if(measure_status){
            //push the calculated calculated height to the measured_heights during measuring time interval
            measured_heights.push(final_height)
          }

          heightElement.innerText= final_height + "cm"
          headElement.innerText = (final_height/8).toFixed(0) + "cm"
          heightFilterArr=[]
          
        }else{
          heightFilterArr.push(esti_height)
        }
        
      }
    }

    drawLineCrossCenter()
    drawFaceOval()

    // show the counting timer on the video
    if(measure_status){
      canvasCtx.fillStyle = "black";
      canvasCtx.font = "bold 42px Times New Roman";
      canvasCtx.fillText(second, canvas.width * 0.7, 50);
    }
   
}

// Present a control panel through which the user can manipulate the solution
// options.
new controls.ControlPanel(controlsElement, solutionOptions)
  .add([
    new controls.StaticText({ title: "Control Panel" }),
    fpsControl,
    new controls.Toggle({ title: "Selfie Mode", field: "selfieMode" }),
    new controls.SourcePicker({
      onFrame: async (input, size) => {
        const aspect = size.height / size.width;
        let width, height;
        if (window.innerWidth > window.innerHeight) {
          height = window.innerHeight;
          width = height / aspect;
        } else {
          width = window.innerWidth;
          height = width * aspect;
        }
        canvasElement.width = width;
        canvasElement.height = height;
        await faceMesh.send({ image: input });
      }
    }),
    new controls.Slider({
      title: "Min Detection Confidence",
      field: "minDetectionConfidence",
      range: [0, 1],
      step: 0.01
    }),
    new controls.Slider({
      title: "Min Tracking Confidence",
      field: "minTrackingConfidence",
      range: [0, 1],
      step: 0.01
    }),
    new controls.Slider({
      title: "K",
      field: "k",
      range: [0, 1],
      step: 0.01
    }),
  ])
  .on((x) => {
    const options = x;
    videoElement.classList.toggle("selfie", options.selfieMode);
    faceMesh.setOptions(options);
});


let measured_heights= [];
let second = 10; // duration for taking frame snapshorts when measure button is clicked
let measure_status = false;

// Function to be called when the measure button is clicked
function measure(){

  measure_status = true
  let countInerval = setInterval(async () => {
    second -=1;
    if(second==0){
      clearInterval(countInerval);
      measure_status = false;

      //sort the heights data that collected and retrive the medium
      measured_heights.sort((a, b)=> a-b);
      let avg_height = measured_heights[(measured_heights.length/2).toFixed(0)]
      
      let avg_height_label = document.getElementById("avg-height");
      avg_height_label.innerText = avg_height + "cm"
      second= 10;
      measured_heights = []
    }
  }, 1000);
}

function drawFaceOval() {

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radiusX = canvas.width * 0.18; // Horizontal radius
  const radiusY = canvas.height * 0.3; // Vertical radius
  const rotation = 0; // Rotation of the oval
  const startAngle = 0; // Starting angle, in radians
  const endAngle = 2 * Math.PI; // Ending angle, in radians
  const counterClockwise = false; // Draw clockwise

  canvasCtx.beginPath();
  canvasCtx.ellipse(centerX, centerY, radiusX, radiusY, rotation, startAngle, endAngle, counterClockwise);
  canvasCtx.lineWidth = 2; // Border width
  canvasCtx.strokeStyle = 'black'; // Border color
  canvasCtx.stroke();
  
}

function drawLineCrossCenter() {

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  canvasCtx.beginPath();
  
  // Draw horizontal line
  canvasCtx.moveTo(0, centerY);
  canvasCtx.lineTo(canvas.width, centerY);
  
  // Draw vertical line
  canvasCtx.moveTo(centerX, 0);
  canvasCtx.lineTo(centerX, canvas.height);
  
  canvasCtx.lineWidth = 3; // Set the line width
  canvasCtx.strokeStyle = 'red'; // Set the line color
  canvasCtx.stroke();
}


window.measure= measure
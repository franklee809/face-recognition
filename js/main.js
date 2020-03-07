
const video = document.getElementById('video');
let predictedAges = []; // use to predict ages


Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(startVideo);

function startVideo(){
    navigator.getUserMedia(
        { video: {}}, 
        stream => {(video.srcObject = stream);console.log(video.srcObject)},
        err => console.error(err)
    )
} 

video.addEventListener("playing",()=> {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas);

    const displaySize = { width: video.width, height: video.height}
    faceapi.matchDimensions(canvas, displaySize);

    setInterval( async()=> {
        // Detect face and return face size- detectAllFaces() & face landmarks - withFaceLandmarks()
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                                        .withFaceLandmarks()
                                        .withFaceExpressions()
                                        .withAgeAndGender();

        const resizedDetections = faceapi.resizeResults(detections,displaySize);
        // Clear every old canvas - clearRect()
        canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height);

        // Draw face canvas every 200 milliseconds - drawDetections
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        // console.log(resizedDetections);
        try{
            const age = resizedDetections[0].age;
            const interpolatedAge = interpolatedAgePredictions(age);
            const bottomRight = { 
                x : resizedDetections[0].detection.box.bottomRight.x-50, 
                y : resizedDetections[0].detection.box.bottomRight.y
            }
    
            new faceapi.draw.DrawTextField(
                [`${faceapi.utils.round(interpolatedAge, 0)} years `],
                bottomRight
            ).draw(canvas);
        }catch(err){
        }
    }, 100);
});

function interpolatedAgePredictions(age) {
    console.log(age);
    predictedAges = [age].concat(predictedAges).slice(0,30);
    console.log(predictedAges);
    const avgPredictedAge = predictedAges.reduce((total,a)=>total + a)/ predictedAges.length;

    return avgPredictedAge;
}
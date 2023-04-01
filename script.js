function getDate() {
    let currentDate = new Date()
    currentDate.setHours(0)
    currentDate.setMinutes(0)
    currentDate.setSeconds(0)
    currentDate.setMilliseconds(0)
    return currentDate
}

var previousClass='Plátano Podrido'
const socket = io('http://localhost:8080');
socket.on("connect", () => {
    console.log(socket.connected); // true
});

socket.on("disconnect", () => {
    console.log(socket.connected); // false
});
// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/pXK5IpCJa/";

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(400, 400, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
} async function loop() {
    webcam.update(); //
    //update the webcam frame 
    await predict();
    window.requestAnimationFrame(loop);
} // run the webcam image through
//the image model 
async function predict() { // predict can take in an image, video or canvas html element const
    prediction = await model.predict(webcam.canvas);
    claseMaxima = 0
    nombreClase = ''
    linkImagen = ''
    color = ''
    nomFor = ''
    emitidor = 'cliente:insertarFresco'
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability.toFixed(2) > claseMaxima) {
            nombreClase = prediction[i].className
            if(nombreClase !== previousClass){
                console.log('Predicted class has changed!');
                nomFor = nombreClase.substring(0, 7);
                socket.emit(emitidor, { fecha: getDate(), nombre: nomFor })
            }
            claseMaxima = prediction[i].probability.toFixed(2);
            previousClass = nombreClase
            if (nombreClase == 'Manzana Fresca') {
                linkImagen = 'https://cdn-icons-png.flaticon.com/512/3136/3136947.png'
                color = '#3abe25'
            } else if (nombreClase == 'Naranja Fresca') {
                linkImagen = 'https://cdn-icons-png.flaticon.com/512/135/135389.png'
                color = '#Ff7e10'
            } else if (nombreClase == 'Plátano Fresco') {
                linkImagen = 'https://cdn-icons-png.flaticon.com/512/2909/2909759.png'
                color = '#Fff210'
            } else if (nombreClase.includes('Podrido') || nombreClase.includes('Podrida')) {
                linkImagen = 'https://cdn-icons-png.flaticon.com/512/6724/6724568.png'
                color = '#E40909'
                emitidor = 'cliente:insertarPodrido'
            } else {
                linkImagen = 'https://cdn-icons-png.flaticon.com/512/838/838412.png'
                color = '#3245EB'
            }
            labelContainer.style.background = color;
        }
        const classPrediction = `<img src="` + linkImagen + `" width="200" height="200" alt=""><h3>` + nombreClase + `</h3>`;
        labelContainer.innerHTML = classPrediction;
    }
}
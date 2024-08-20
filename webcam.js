// JavaScript for Webcam Currency Detection

// Define the currency labels array
const currencyLabels = [
    '10000_YEN_Note', '1000_CHF', '1000_SGD', '1000_YEN_Note', '100_AUD_NOTE',
    '100_BRL', '100_CAD_Note', '100_CHF', '100_CNY_Note', '100_EUR_Note',
    '100_INR', '100_SGD', '100_US_NOTE', '10_AUD_NOTE', '10_BRL',
    '10_CAD_Note', '10_CHF', '10_CNY_Note', '10_EUR_Note', '10_GBP_Note',
    '10_INR', '10_SGD', '10_US_NOTE', '1_CNY_Note', '1_US_NOTE', '2000_INR',
    '2000_YEN_Note', '200_CHF', '200_EUR_Note', '200_INR', '20_AUD_NOTE',
    '20_BRL', '20_CAD_Note', '20_CHF', '20_CNY_Note', '20_EUR_Note',
    '20_GBP_Note', '20_INR', '20_SGD', '20_US_NOTE', '2_BRL', '2_SGD',
    '5000_YEN_Note', '500_EUR_Note', '500_INR', '50_AUD_NOTE', '50_BRL',
    '50_CHF', '50_CNY_Note', '50_Cad_Note', '50_EUR_Note', '50_GBP_Note',
    '50_INR', '50_SGD', '50_US_NOTE', '5_AUD_NOTE', '5_BRL', '5_CAD_Note',
    '5_CNY_Note', '5_EUR_Notes', '5_GBP_Note', '5_SGD', '5_US_NOTE'
];


let model;
let webcamElement = document.getElementById('webcam');
let canvasElement = document.getElementById('canvas');
let startButton = document.getElementById('startButton');
let stopButton = document.getElementById('stopButton');
let resultText = document.getElementById('resultText');
let webcamSelect = document.getElementById('webcamSelect');
let currentStream;

async function loadModel() {
    try {
        console.log("Loading model...");
        model = await tf.loadLayersModel('model/model.json');
        console.log("Model loaded.");
    } catch (error) {
        console.error("Failed to load model:", error);
        resultText.innerText = "Failed to load model.";
    }
}

async function getWebcams() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        // Populate the webcam select dropdown
        videoDevices.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Webcam ${index + 1}`;
            webcamSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error accessing webcams:", error);
        resultText.innerText = "Error accessing webcams.";
    }
}

async function setupWebcam(deviceId) {
    if (currentStream) {
        // Stop the current stream before starting a new one
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: deviceId } });
        webcamElement.srcObject = stream;
        currentStream = stream;

        return new Promise((resolve) => {
            webcamElement.onloadedmetadata = () => {
                resolve();
            };
        });
    } catch (error) {
        console.error("Failed to access webcam:", error);
        resultText.innerText = "Failed to access webcam.";
    }
}

async function detectCurrency() {
    canvasElement.width = webcamElement.videoWidth;
    canvasElement.height = webcamElement.videoHeight;
    const ctx = canvasElement.getContext('2d');

    ctx.drawImage(webcamElement, 0, 0, canvasElement.width, canvasElement.height);
    const imgData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const input = tf.browser.fromPixels(imgData).resizeNearestNeighbor([224, 224]).toFloat().expandDims();

    const predictions = await model.predict(input).data();
    const maxPrediction = Math.max(...predictions);
    const predictionIndex = predictions.indexOf(maxPrediction);
    const currencyName = currencyLabels[predictionIndex];

    resultText.innerText = `Detected Currency: ${currencyName}`;
}

startButton.addEventListener('click', async () => {
    startButton.style.display = 'none';
    stopButton.style.display = 'inline-block';
    await loadModel();
    await setupWebcam(webcamSelect.value);

    const detectInterval = setInterval(detectCurrency, 1000);

    stopButton.addEventListener('click', () => {
        clearInterval(detectInterval);
        currentStream.getTracks().forEach(track => track.stop());
        webcamElement.srcObject = null;

        startButton.style.display = 'inline-block';
        stopButton.style.display = 'none';
        resultText.innerText = "Detection stopped.";
    });
});

// Listen for changes in the webcam selection dropdown
webcamSelect.addEventListener('change', () => {
    setupWebcam(webcamSelect.value);
});

// Populate the webcam selection dropdown when the page loads
getWebcams();

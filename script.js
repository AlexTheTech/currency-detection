// Array of currency labels corresponding to the model's output classes
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

// Load the model for currency prediction
async function loadModel() {
    try {
        console.log("Starting to load the model...");
        document.getElementById('loadingIndicator').style.display = 'flex'; // Show loading indicator
        const model = await tf.loadLayersModel('model/model.json');
        console.log("Model loaded successfully.");
        document.getElementById('loadingIndicator').style.display = 'none'; // Hide loading indicator
        return model;
    } catch (error) {
        console.error("Error loading the model:", error);
        document.getElementById('loadingIndicator').innerHTML = '<p style="color: red;">Failed to load the model. Please try again later.</p>';
    }
}

// Preprocess image for model input
function preprocessImage(image) {
    try {
        console.log("Starting image preprocessing...");
        let tensor = tf.browser.fromPixels(image)
            .resizeNearestNeighbor([224, 224]) // MobileNetV2 requires 224x224 images
            .toFloat()
            .expandDims();
        console.log("Image preprocessing completed.");
        return tensor;
    } catch (error) {
        console.error("Error in image preprocessing:", error);
    }
}

// Predict the currency based on the processed image
async function predictCurrency(model, image) {
    try {
        console.log("Starting prediction...");
        const processedImage = preprocessImage(image);
        const predictions = await model.predict(processedImage).data();
        console.log("Predictions Array:", predictions);
        return predictions;
    } catch (error) {
        console.error("Error during prediction:", error);
    }
}

// Display the prediction result
function displayPrediction(predictions) {
    try {
        console.log("Displaying prediction...");
        const maxPrediction = Math.max(...predictions);
        console.log("Max Prediction Value:", maxPrediction);

        const predictionIndex = predictions.indexOf(maxPrediction);
        console.log("Prediction Index:", predictionIndex);

        const currencyName = currencyLabels[predictionIndex];
        console.log("Predicted Currency Name:", currencyName);

        document.getElementById("analyzingText").style.display = "none";
        document.getElementById("prediction").innerText = `Predicted Currency: ${currencyName}`;
        document.getElementById("prediction").style.display = "block";
        console.log("Prediction displayed.");
    } catch (error) {
        console.error("Error displaying prediction:", error);
    }
}

// Handle file upload and image prediction
async function handleImageUpload(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        document.getElementById("errorMessage").style.display = "block";
        return;
    }

    document.getElementById("errorMessage").style.display = "none"; // Hide error message if validation passed
    const model = await loadModel();

    document.getElementById("analyzingText").style.display = "block";
    document.getElementById("prediction").style.display = "none";

    const uploadedImage = document.getElementById('uploadedImage');
    uploadedImage.src = URL.createObjectURL(file);
    uploadedImage.style.display = 'block';

    uploadedImage.onload = async function() {
        const predictions = await predictCurrency(model, uploadedImage);
        displayPrediction(predictions);
    };
}

// Handle drag-and-drop functionality
const dropZone = document.getElementById('dropZone');
const imageUpload = document.getElementById('imageUpload');

// When the drop zone is clicked, trigger file upload
dropZone.addEventListener('click', () => imageUpload.click());

// Highlight drop zone on drag over
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.style.backgroundColor = '#555';
});

// Remove highlight when drag leaves
dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '#444';
});

// Handle file drop event
dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.style.backgroundColor = '#444';
    const file = event.dataTransfer.files[0];
    handleImageUpload(file);
});

// Handle file selection from file input
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    handleImageUpload(file);
});

// Highlight the current page in the sidebar
const currentPage = 'currencyLink'; // Set this based on the current page
document.getElementById(currentPage).classList.add('active-page');

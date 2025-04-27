// VANTA.NET background with your customized settings
VANTA.NET({
  el: "#vanta-background",
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.00,
  minWidth: 200.00,
  scale: 1.00,
  scaleMobile: 1.00,
  color: 0xff3f81,
  backgroundColor: 0x23153c,
  points: 10,
  maxDistance: 20,
  spacing: 15,
  showDots: true
});

// API key
const apiKey = 'AIzaSyDEsgs4kZYYXhmJNRECWcZ_FcDseYrB2rA'; // <-- Replace with your API key

// Elements
const fileInput = document.getElementById('fileInput');
const analyzeButton = document.getElementById('analyzeButton');
const resultDiv = document.getElementById('result');
const loaderDiv = document.getElementById('loader');
const chooseLanguageButton = document.getElementById('chooseLanguageButton');
const languageOptions = document.getElementById('languageOptions');

let selectedLanguage = null;

// Toggle Language Options
chooseLanguageButton.addEventListener('click', () => {
  languageOptions.classList.toggle('hidden');
});

// Select Language
document.querySelectorAll('.language-button').forEach(button => {
  button.addEventListener('click', () => {
    selectedLanguage = button.dataset.language;
    chooseLanguageButton.innerText = `Language: ${selectedLanguage.toUpperCase()}`;
    analyzeButton.disabled = false;
    languageOptions.classList.add('hidden');
  });
});

// Convert Image to Base64
function convertImageToBase64(file, callback) {
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64String = e.target.result.split(',')[1];
      callback(base64String);
    };
    reader.readAsDataURL(file);
  } else {
    console.error("No file selected!");
  }
}

// Analyze the Report
async function analyzeMedicalReport(base64Image) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const promptText = `Analyze this medical report image. Explain it simply in ${selectedLanguage}. Write short and clear. Recommend some fruits too.`;

  const requestData = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();
    console.log(data);

    if (data.candidates && data.candidates.length > 0) {
      resultDiv.innerText = data.candidates[0].content.parts[0].text;
    } else {
      resultDiv.innerText = "No result found.";
    }
  } catch (error) {
    console.error('Error analyzing report:', error);
    resultDiv.innerText = "Error occurred. Check console.";
  } finally {
    loaderDiv.style.display = "none";
    resultDiv.style.display = "block";
  }
}

// Analyze Button Click
analyzeButton.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (!file) {
    alert('Please upload an image first!');
    return;
  }
  if (!selectedLanguage) {
    alert('Please choose a language!');
    return;
  }

  resultDiv.style.display = "none";
  loaderDiv.style.display = "block";

  convertImageToBase64(file, function (base64String) {
    analyzeMedicalReport(base64String);
  });
});

let currentWordElem = null; // Store the current selected word element
let sentenceData = JSON.parse(localStorage.getItem("sentenceData")) || []; // Load from localStorage if available
let currentSentence = sentenceData.length > 0 ? sentenceData[sentenceData.length - 1] : {}; // Use last saved sentence or start fresh
let originalWords = []; // Store the original word list with their indices

// Function to process text from the textarea and convert it into clickable words
function processText() {
    let textInput = document.getElementById("textInput").value.trim();

    // Split the text into words and reset originalWords array
    let words = textInput.split(/\s+/);
    originalWords = words.map((word, index) => ({ word, index }));

    // Clear the clickable words container
    let clickableWordsContainer = document.getElementById("clickableWordsContainer");
    clickableWordsContainer.innerHTML = '';

    // Create clickable words
    words.forEach((word, index) => {
        let span = document.createElement("span");
        span.textContent = word;
        span.className = 'word-span';
        span.onclick = function () {
            selectWord(span, word, index);
        };
        clickableWordsContainer.appendChild(span);
        clickableWordsContainer.appendChild(document.createTextNode(" ")); // Add a space after each word
    });
}

// Function to handle word selection
function selectWord(spanElement, word, index) {
    // Unhighlight previously selected word
    if (currentWordElem) {
        currentWordElem.classList.remove('highlight');
    }

    // Highlight the selected word
    currentWordElem = spanElement;
    currentWordElem.classList.add('highlight');
}

// Function to tag the selected word and remove it from the box
function tagWord(tag) {
    if (!currentWordElem) {
        alert("Please select a word first!");
        return;
    }

    // Get the word and tag it
    let word = currentWordElem.textContent;

    // Remove the word from any existing tag
    for (let existingTag in currentSentence) {
        if (currentSentence[existingTag].includes(word)) {
            currentSentence[existingTag] = currentSentence[existingTag].filter(w => w !== word);
            if (currentSentence[existingTag].length === 0) {
                delete currentSentence[existingTag];
            }
        }
    }

    // Add the word under the new tag
    if (!currentSentence[tag]) {
        currentSentence[tag] = [];
    }
    currentSentence[tag].push(word);

    // Remove the word from the clickable box
    currentWordElem.remove();

    // Update the UI to show the tagged word
    currentWordElem.classList.add('tagged');
    currentWordElem.setAttribute('data-tag', tag);
    currentWordElem.title = tag; // Show tag on hover

    // Update the JSON data
    updateJSONData();

    // Display the tagged output
    displayTaggedOutput();
}

// Function to undo the tag of the selected word and place it back in its original position
function undo() {
    if (!currentWordElem) {
        alert("Please select a word first!");
        return;
    }

    let word = currentWordElem.textContent;
    let tag = currentWordElem.getAttribute('data-tag');

    if (tag && currentSentence[tag]) {
        // Remove the word from the current sentence under the respective tag
        currentSentence[tag] = currentSentence[tag].filter(w => w !== word);

        // If the tag array becomes empty, delete the tag from the current sentence
        if (currentSentence[tag].length === 0) {
            delete currentSentence[tag];
        }

        // Remove the tag from the word element UI
        currentWordElem.classList.remove('tagged');
        currentWordElem.removeAttribute('data-tag');
        currentWordElem.title = ""; // Remove tag tooltip

        // Find the original index of the word and place it back in its original position
        let originalIndex = originalWords.find(obj => obj.word === word).index;
        let clickableWordsContainer = document.getElementById("clickableWordsContainer");
        let span = document.createElement("span");
        span.textContent = word;
        span.className = 'word-span';
        span.onclick = function () {
            selectWord(span, word);
        };

        // Insert the word back at the correct position
        let children = clickableWordsContainer.children;
        if (children.length > originalIndex * 2) {
            clickableWordsContainer.insertBefore(span, children[originalIndex * 2]);
            clickableWordsContainer.insertBefore(document.createTextNode(" "), children[originalIndex * 2 + 1]);
        } else {
            clickableWordsContainer.appendChild(span);
            clickableWordsContainer.appendChild(document.createTextNode(" "));
        }
    }

    // Update the JSON data
    updateJSONData();

    // Display the updated tagged output
    displayTaggedOutput();
}

// Function to update the JSON data instantly
function updateJSONData() {
    // Clear existing data and add the current sentence
    sentenceData = [currentSentence];
    localStorage.setItem("sentenceData", JSON.stringify(sentenceData)); // Save data to localStorage
}

// Function to display the tagged output in a simplified format
function displayTaggedOutput() {
    let output = document.getElementById("tagged-output");

    // Create a custom display format like "NN: <word1>, <word2>"
    let formattedOutput = '';

    for (let tag in currentSentence) {
        formattedOutput += `${tag}: ${currentSentence[tag].join(', ')}<br>`;
    }

    // Update the display with the simplified format
    output.innerHTML = formattedOutput;
}

// Function to clear everything and start fresh
function clearData() {
    currentWordElem = null;
    sentenceData = [];
    currentSentence = {};
    document.getElementById("tagged-output").innerHTML = "";
    document.getElementById("clickableWordsContainer").innerHTML = "";
    localStorage.removeItem("sentenceData"); // Clear localStorage
}

// Function to download the tagged output as a JSON file
function downloadFile() {
    if (sentenceData.length === 0) {
        alert("No data to download!");
        return;
    }

    // Create a JSON Blob
    let jsonContent = JSON.stringify(sentenceData, null, 2);
    let blob = new Blob([jsonContent], { type: 'application/json' });

    // Create a download link
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tagged_output.json';

    // Append link, trigger download, and remove link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Call this function on page load to restore previous state
window.onload = function () {
    displayTaggedOutput(); // Restore the tagged output from the stored data
};
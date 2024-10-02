let currentWordElem = null; 
let sentenceData = JSON.parse(localStorage.getItem("sentenceData")) || []; 
let currentSentence = sentenceData.length > 0 ? sentenceData[sentenceData.length - 1] : {};
let originalWords = []; 
let selectedWord = ""; // Store the selected word
let isEditing = true;  // Flag to track editing state

function processText() {
    if (isEditing) {
        let textInputDiv = document.getElementById("textInput");
        let textInput = textInputDiv.textContent.trim();  // Get the text content

        if (textInput.length === 0) {
            alert("Please enter some text.");
            return;
        }

        let words = textInput.split(/\s+/);
        textInputDiv.innerHTML = '';

        words.forEach((word, index) => {
            let span = document.createElement("span");
            span.textContent = word;
            span.className = 'word-span';
            span.onclick = function () {
                selectWord(span, word, index);
            };
            textInputDiv.appendChild(span);
            textInputDiv.appendChild(document.createTextNode(" "));
        });

        textInputDiv.setAttribute('contentEditable', 'false');
        isEditing = false;
    }
}
function editText() {
    if (!isEditing) {
        let textInputDiv = document.getElementById("textInput");

        // Get the words back from the spans
        let words = Array.from(textInputDiv.children)
            .filter(node => node.nodeName === 'SPAN')
            .map(span => span.textContent);

        // Convert back to plain text
        textInputDiv.textContent = words.join(' ');
        
        // Enable editing
        textInputDiv.setAttribute('contentEditable', 'true');
        isEditing = true;
    }
}

function selectWord(spanElement, word, index) {
    if (currentWordElem) {
        currentWordElem.classList.remove('highlight');
    }

    currentWordElem = spanElement;
    currentWordElem.classList.add('highlight');
    selectedWord = word; // Store the selected word
}


function tagWord(tag) {
    if (!currentWordElem) {
        alert("Please select a word first!");
        return;
    }

  
    let word = currentWordElem.textContent;

    
    for (let existingTag in currentSentence) {
        if (currentSentence[existingTag].includes(word)) {
            currentSentence[existingTag] = currentSentence[existingTag].filter(w => w !== word);
            if (currentSentence[existingTag].length === 0) {
                delete currentSentence[existingTag];
            }
        }
    }

    
    if (!currentSentence[tag]) {
        currentSentence[tag] = [];
    }
    currentSentence[tag].push(word);

    
    currentWordElem.remove();

  
    currentWordElem.classList.add('tagged');
    currentWordElem.setAttribute('data-tag', tag);
    currentWordElem.title = tag; 

   
    updateJSONData();

    
    displayTaggedOutput();
}
function undo() {
    // Check if a word was previously selected and tagged
    if (!currentWordElem && selectedWord) {
        // Find the previously tagged word in the document
        let taggedWordElems = Array.from(document.getElementsByClassName('tagged'));
        currentWordElem = taggedWordElems.find(elem => elem.textContent === selectedWord);
    }

    if (!currentWordElem) {
        alert("Please select a word first!");
        return;
    }

    let word = currentWordElem.textContent;
    let tag = currentWordElem.getAttribute('data-tag');

    if (tag && currentSentence[tag]) {
        // Remove the word from the tag
        currentSentence[tag] = currentSentence[tag].filter(w => w !== word);

        // If the tag is now empty, remove it from the currentSentence
        if (currentSentence[tag].length === 0) {
            delete currentSentence[tag];
        }

        // Remove the tag-related styles and attributes from the word
        currentWordElem.classList.remove('tagged');
        currentWordElem.removeAttribute('data-tag');
        currentWordElem.title = "";

        // Find the original position based on the saved index
        let originalIndex = originalWords.find(obj => obj.word === word)?.index;
        if (originalIndex !== undefined) {
            let textInputDiv = document.getElementById("textInput");

            // Create a new span element for the word
            let span = document.createElement("span");
            span.textContent = word;
            span.className = 'word-span';
            span.onclick = function () {
                selectWord(span, word, originalIndex);
            };

            // Insert the span back into the correct position
            let children = textInputDiv.childNodes;
            let spaceNode = document.createTextNode(" ");  // Create a space node
            
            // Insert at the correct position, multiplying by 2 to account for space nodes
            if (children.length > originalIndex * 2) {
                textInputDiv.insertBefore(span, children[originalIndex * 2]);
                textInputDiv.insertBefore(spaceNode, children[originalIndex * 2 + 1]);
            } else {
                textInputDiv.appendChild(span);
                textInputDiv.appendChild(spaceNode);
            }

            // Remove the last entry from the tagged output
            let outputDiv = document.getElementById('tagged-output');
            if (outputDiv.lastChild) {
                outputDiv.removeChild(outputDiv.lastChild);
            }
        }
    }

    // Update JSON data and output
    updateJSONData();
    displayTaggedOutput();

    // Reset currentWordElem and selectedWord after undo
    currentWordElem = null;
    selectedWord = "";
}


function updateJSONData() {
    
    sentenceData = [currentSentence];
    localStorage.setItem("sentenceData", JSON.stringify(sentenceData));
}


function displayTaggedOutput() {
    let output = document.getElementById("tagged-output");

   
    let formattedOutput = '';

    for (let tag in currentSentence) {
        formattedOutput += `${tag}: ${currentSentence[tag].join(', ')}<br>`;
    }

   
    output.innerHTML = formattedOutput;
}

function clearData() {
    currentWordElem = null;
    sentenceData = [];
    currentSentence = {};
    document.getElementById("tagged-output").innerHTML = "";
    document.getElementById("clickableWordsContainer").innerHTML = "";
    localStorage.removeItem("sentenceData"); 
}

function downloadFile() {
    if (sentenceData.length === 0) {
        alert("No data to download!");
        return;
    }

   
    let jsonContent = JSON.stringify(sentenceData, null, 2);
    let blob = new Blob([jsonContent], { type: 'application/json' });

    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tagged_output.json';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function toggleInput(id) {
    const element = document.getElementById(id);
    
    // Toggle only the clicked input field
    if (element.style.display === "none" || element.style.display === "") {
        element.style.display = "block";  // Show the input area

        // If the input is a dropdown, automatically open it
        const selectElement = element.querySelector("select");
        if (selectElement) {
            selectElement.focus();  // Focus the dropdown to ensure it opens

            // Dynamically adjust dropdown size based on number of options
            if (id === 'caseMarkersDropdown') {
                selectElement.size = 6;  // Show all 6 options for Case Markers
            } else if (id === 'numberDropdown') {
                selectElement.size = 2;  // Show both options for Number
            }
        }
    } else {
        element.style.display = "none";   // Hide the input area
    }
}

function showProcessText() {
    if (!selectedWord) {
        alert("Please select a word first!");
        return;
    }

    // Display the processText div
    document.getElementById('processText').style.display = 'block';

    // Show the selected word in the nounNav div
    document.getElementById('nounNav').innerHTML = `<p>Selected Word: ${selectedWord}</p>`;
}

function tagNoun() {
    if (!currentWordElem) {
        alert("Please select a word to tag.");
        return;
    }

    showProcessText();
}

    function toggleInput(inputId) {
        const inputArea = document.getElementById(inputId);
        inputArea.style.display = (inputArea.style.display === "none" || inputArea.style.display === "") ? "block" : "none";
    }
    

    function saveProcessText() {
        const noun = document.getElementById('nounInput').querySelector('textarea').value;
        const number = document.getElementById('numberDropdown').querySelector('select').value;
        const filler = document.getElementById('fillerInput').querySelector('textarea').value;
        const caseMarker = document.getElementById('caseMarkersDropdown').querySelector('select').value;
        const postposition = document.getElementById('postpositionInput').querySelector('textarea').value;
    
        // Display output
        const outputDiv = document.getElementById('tagged-output');
        const outputItem = document.createElement('div');
        outputItem.classList.add('output-item');
        outputItem.innerHTML = `<strong>Word:</strong> ${selectedWord}<br>
                                <strong>Noun:</strong> ${noun} <br>
                                <strong>Number:</strong> ${number} <br>
                                <strong>Fillers:</strong> ${filler} <br>
                                <strong>Case Markers:</strong> ${caseMarker} <br>
                                <strong>Postposition:</strong> ${postposition}`;
        outputDiv.appendChild(outputItem);
    
        // Clear input fields
        document.getElementById('nounInput').querySelector('textarea').value = '';
        document.getElementById('fillerInput').querySelector('textarea').value = '';
        document.getElementById('postpositionInput').querySelector('textarea').value = '';
        document.getElementById('processText').style.display = 'none'; // Hide processText div after saving
    
        // Remove the selected word from textInput
        if (currentWordElem) {
            currentWordElem.remove();
        }
    
        // Reset the selection
        selectedWord = "";
        currentWordElem = null;
    }
// Call this function on page load to restore previous state
window.onload = function () {
    displayTaggedOutput(); // Restore the tagged output from the stored data
};

let currentWordElem = null; 
let sentenceData = JSON.parse(localStorage.getItem("sentenceData")) || []; 
let currentSentence = sentenceData.length > 0 ? sentenceData[sentenceData.length - 1] : {};
let originalWords = []; 


function processText() {
    let textInput = document.getElementById("textInput").value.trim();

   
    let words = textInput.split(/\s+/);
    originalWords = words.map((word, index) => ({ word, index }));

  
    let clickableWordsContainer = document.getElementById("clickableWordsContainer");
    clickableWordsContainer.innerHTML = '';

   
    words.forEach((word, index) => {
        let span = document.createElement("span");
        span.textContent = word;
        span.className = 'word-span';
        span.onclick = function () {
            selectWord(span, word, index);
        };
        clickableWordsContainer.appendChild(span);
        clickableWordsContainer.appendChild(document.createTextNode(" ")); 
    });
}


function selectWord(spanElement, word, index) {
   
    if (currentWordElem) {
        currentWordElem.classList.remove('highlight');
    }

    
    currentWordElem = spanElement;
    currentWordElem.classList.add('highlight');
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
    if (!currentWordElem) {
        alert("Please select a word first!");
        return;
    }

    let word = currentWordElem.textContent;
    let tag = currentWordElem.getAttribute('data-tag');

    if (tag && currentSentence[tag]) {
        
        currentSentence[tag] = currentSentence[tag].filter(w => w !== word);

        
        if (currentSentence[tag].length === 0) {
            delete currentSentence[tag];
        }

     
        currentWordElem.classList.remove('tagged');
        currentWordElem.removeAttribute('data-tag');
        currentWordElem.title = "";

       
        let originalIndex = originalWords.find(obj => obj.word === word).index;
        let clickableWordsContainer = document.getElementById("clickableWordsContainer");
        let span = document.createElement("span");
        span.textContent = word;
        span.className = 'word-span';
        span.onclick = function () {
            selectWord(span, word);
        };

        
        let children = clickableWordsContainer.children;
        if (children.length > originalIndex * 2) {
            clickableWordsContainer.insertBefore(span, children[originalIndex * 2]);
            clickableWordsContainer.insertBefore(document.createTextNode(" "), children[originalIndex * 2 + 1]);
        } else {
            clickableWordsContainer.appendChild(span);
            clickableWordsContainer.appendChild(document.createTextNode(" "));
        }
    }

    
    updateJSONData();
    displayTaggedOutput();
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

// Call this function on page load to restore previous state
window.onload = function () {
    displayTaggedOutput(); // Restore the tagged output from the stored data
};

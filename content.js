// content.js
// Author:
// Author URI: https://
// Author Github URI: https://www.github.com/
// Project Repository URI: https://github.com/
// Description: Handles all the webpage level activities (e.g. manipulating page data, etc.)
// License: MIT

const HelpButtonURL = chrome.runtime.getURL("assets/ai3.png");
const AZ_PROBLEM_KEY = "AZ_PROBLEM_KEY";

const chatBoxStyles = `
    #ai-chat-box {
            display: inline-block;
            margin-right: 10px; /* Creates spacing between chatBox and the ask-doubt button */
            width: 500px;
            background-color: #f9f9f9;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            font-family: Arial, sans-serif;
        }

        #chat-header {
            background-color: #4CAF50;
            color: white;
            padding: 10px;
            font-size: 16px;
            font-weight: bold;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            text-align: center;
        }

        #chat-messages {
            padding: 10px;
            height: 150px;
            overflow-y: auto;
            border-bottom: 1px solid #ccc;
        }

        #chat-input {
            width: calc(100% - 80px);
            padding: 10px;
            margin: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        #send-button {
            padding: 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        #send-button:hover {
            background-color: #45a049;
        }
`;

let lastPageVisited = "";

const observer = new MutationObserver(() => {
    handleContentChange();
})

function isPageChange() {
    const currentPage = window.location.pathname;
    if(currentPage === lastPageVisited) return false;
    lastPageVisited = currentPage;
    return true;
}

observer.observe(document.body,{childList: true, subtree: true});

handleContentChange();

function handleContentChange(){
    if(isPageChange()){
        handlePageChange();
    }
}

function onProblemsPage() {
    return window.location.pathname.startsWith("/problems/");
}

function cleanUpPage() {
    const existingButton = document.getElementById("add-help-button");
    if(existingButton) existingButton.remove();

    const existingchatbox = document.getElementById("ai-chat-box");
    if(existingchatbox) existingchatbox.remove();
}

function handlePageChange(){
    if(onProblemsPage()){
        cleanUpPage();
        addHelpButton();
    }
}


function addHelpButton() {
    console.log("Trigerring ! ");
    if(!onProblemsPage() || document.getElementById("add-help-button")) return;

    const helpButton = document.createElement("img");
    helpButton.id = "add-help-button";
    helpButton.src = HelpButtonURL;
    helpButton.style.width = "30px";
    helpButton.style.height = "30px";

    const askdoubtbutton = document.getElementsByClassName("coding_ask_doubt_button__FjwXJ")[0];

    askdoubtbutton.parentNode.insertAdjacentElement("afterend",helpButton);

    helpButton.addEventListener("click", openAIHelpHandler);
    console.log("finished !! ");
}

function openAIHelpHandler() {
    console.log("AI button clicked !!");

    if(!onProblemsPage() || document.getElementById("ai-chat-box")) return;

    const existingchatbox = document.getElementById("ai-chat-box");
    if(existingchatbox) existingchatbox.remove();

    const chatBox = document.createElement("div");
    chatBox.id = "ai-chat-box";
    chatBox.innerHTML = `
        <div id="chat-header">AI Assistance</div>
        <div id="chat-messages"></div>
        <input id="chat-input" type="text" placeholder="Ask your question...">
        <button id="send-button">Send</button>
    `;

    // Insert chatBox to the left of the ask-doubt button
    const askdoubtbutton = document.getElementById("add-help-button");
    askdoubtbutton.parentNode.insertAdjacentElement("afterend", chatBox);

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.textContent = chatBoxStyles;
    document.head.appendChild(styleSheet);

    
}


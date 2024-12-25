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
        width: 95%;
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
        height: 250px;  /* Increased height for more chat visibility */
        overflow-y: auto;
        border-bottom: 1px solid #ccc;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .chat-message {
        display: flex;
        align-items: flex-start;
        margin-bottom: 10px;
        padding: 8px;
        border-radius: 5px;
        max-width: 80%;
    }

    .chat-message.user {
        background-color: #e0f7fa; /* Light cyan for user */
        align-self: flex-end; /* Align user messages to the right */
        text-align: right;
    }

    .chat-message.bot {
        background-color: #e8f5e9; /* Light green for bot */
        align-self: flex-start; /* Align bot messages to the left */
        text-align: left;
    }

    #chat-input {
        width: calc(100% - 80px);
        padding: 10px;
        margin: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
    }

    #send-button {
        padding: 10px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }

    #send-button:hover {
        background-color: #45a049;
    }

    #chat-input, #send-button {
        margin-bottom: 10px;
    }

    /* Optional styling for the chat box header */
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

    sendButton = document.getElementById("send-button");

    sendButton.addEventListener("click", () => handleSendMessage());

}



async function handleSendMessage() {
    console.log("Send button clicked");
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Get user input and clear the input field
    const userMessage = chatInput.value;
    chatInput.value = "";  // Clear input after sending
    
    // Display user message in chat
    addMessageToChat(userMessage, 'user');

    // Send the message to the AI API and await the response
    const botReply = await sendMessageToAPI(userMessage);

    console.log("Bot Reply:", botReply);

    // Display bot response in chat
    addMessageToChat(botReply, 'bot');
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chat-messages');

    // Create a new message element
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);  // Add sender class to distinguish user/bot

    // Add message content
    messageDiv.textContent = message;

    // Append the message to the chat
    chatMessages.appendChild(messageDiv);

    // Scroll to the latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


async function sendMessageToAPI(userMessage){
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const API_KEY = "AIzaSyA3ix28txG_5rH15PqkuPNoQF85dtJY4Fs";

    try{
        const payload = {
            contents: [
                {
                    parts: [
                        { text: userMessage }
                    ]
                }
            ]
        };
        
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if(!response.ok) {
            console.log(await response.text());
            throw new Error(`Error : ${response.status} ${response.statusText}`)
            ;
        }

        const data = await response.json();

        return data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0].text
        ? data.candidates[0].content.parts[0].text
        : "No response from the API.";

        
    }
    catch(error) {
        console.log("Error sending message to API : ",error);
        return "An error occured while connecting to the API. ";
    }
}


// JavaScript code to extract content from divs with class "undefined markdown-renderer"
function extractProblemDescription() {
    // Select all div elements with the specified class
    const divElements = document.querySelectorAll('div.undefined.markdown-renderer');

    // Initialize an array to hold the extracted text
    const extractedContent = [];

    // Iterate through the selected div elements
    divElements.forEach(div => {
        // Push the text content of each div to the array
        extractedContent.push(div.textContent.trim());
    });

    // Join the extracted content into a single string
    const problemDescription = extractedContent.join('\n\n');

    // Log the combined result to the console
    console.log(problemDescription);

    // Return the result in case further processing is needed
    return problemDescription;
};



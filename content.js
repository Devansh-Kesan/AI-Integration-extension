// content.js
// Author:
// Author URI: https://
// Author Github URI: https://www.github.com/
// Project Repository URI: https://github.com/
// Description: Handles all the webpage level activities (e.g. manipulating page data, etc.)
// License: MIT

const HelpButtonURL = chrome.runtime.getURL("assets/ai3.png");
// let addButton = true;


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
        background-color: #ddf6ff;
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
        background-color: #ddf6ff;
        color: black;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }

    #send-button:hover {
        background-color: #ddf6ff;
    }

    #chat-input, #send-button {
        margin-bottom: 10px;
    }

    /* Optional styling for the chat box header */
    #chat-header {
        background-color: #ddf6ff;
        color: black;
        padding: 10px;
        font-size: 16px;
        font-weight: bold;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        text-align: center;
    }

`;

let lastPageVisited = "";

addInjectScript();

const problemDataMap = new Map();

window.addEventListener("xhrDatafetched", (event) => {
    const data = event.detail;

    console.log("Data received in content.js",data);

    if(data.url && data.url.match(/https:\/\/api2\.maang\.in\/problems\/user\/\d+/)){
        const idMatch = data.url.match(/\/(\d+)$/);
        if(idMatch){
            const id = idMatch[1];
            problemDataMap.set(id,data.response); // Store response data by ID
            console.log(`Stored data for problem ID ${id}:`,data.response);
        }
    }

})

const observer = new MutationObserver(() => {
    handleContentChange();
})

// const observer = new MutationObserver((mutations) => {
//     mutations.forEach((mutation) => {
//         // Check if relevant part of the DOM has changed
//         if (mutation.addedNodes.length > 0) {
//             handleContentChange();
//         }
//     });
// });


function isPageChange() {
    const currentPage = window.location.pathname;
    if(currentPage === lastPageVisited) return false;
    lastPageVisited = currentPage;
    return true;
}

observer.observe(document.body,{childList: true, subtree: true});

handleContentChange();


function handleContentChange(){
    if(isPageChange() || !document.getElementById("add-help-button")){
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

function addInjectScript(){
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("inject.js");
    script.onload = () => script.remove();
    document.documentElement.appendChild(script);
}

function handlePageChange(){
    if(onProblemsPage()){
        cleanUpPage();
        addInjectScript();
        addHelpButton();
    }
}

function getProblemKey() {
    // Select the element using its class name
    const headingElement = document.getElementsByClassName('Header_resource_heading__cpRp1');
    
    if (headingElement.length > 0) {

        console.log("if entered : ");
        // Get the text content of the element
        const headingText = headingElement[headingElement.length-1].textContent;
        console.log('Extracted Heading:', headingElement);
        return headingText;
    } else {
        console.log('Heading element not found.');
        return null;
    }
}

function getProblemId() {
    const idMatch = window.location.pathname.match(/-(\d+)$/);
    return idMatch ? idMatch[1] : null;
}

function getProblemDataById(id) {
    if(id && problemDataMap.has(id)){
        return problemDataMap.get(id);
    }
    console.log(`No data found for problem ID ${id}`);
    return null;
}

////////////////////////////

function addHelpButton() {

    console.log("Trigerring ! ");
    if(!onProblemsPage() || document.getElementById("add-help-button")) return;

    ///////
    // if(!addButton){
    //     return;
    // }
    ///////
    if(document.getElementsByClassName("coding_ask_doubt_button__FjwXJ").length == 0) {
        return;
    }

    
    const helpButton = document.createElement("img");
    helpButton.id = "add-help-button";
    helpButton.src = HelpButtonURL;
    helpButton.style.width = "30px";
    helpButton.style.height = "30px";

    const askdoubtbutton = document.getElementsByClassName("coding_ask_doubt_button__FjwXJ")[0];

    askdoubtbutton.parentNode.insertAdjacentElement("afterend",helpButton);

    helpButton.addEventListener("click", openAIHelpHandler);
    console.log("finished !! ");

    // console.log("Enter");
    // console.log(getProblemKey());
    // console.log("Exit");
    
}    



async function openAIHelpHandler() {
    console.log("AI button clicked !!");

    let problemId = getProblemId();

    // try {
    //     // Wait for the heading content to be extracted
    //     problemId = await waitForElementAndGetContent('Header_resource_heading__cpRp1');
    //     console.log(`PROBLEM KEY : ${problemId}`);

    //     // After the key is extracted, log success message
    //     console.log("Problem key extracted successfully!");
    // } catch (error) {
    //     console.error(error); // Handle any error that occurs while waiting for the element
    // }

    console.log("Problem key extracted succesfully !");
    console.log(problemId);

    console.log("Send button clicked");

    console.log(getChatHistory(problemId));

    loadMessagesForProblem(problemId);

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

// function waitForElementAndGetContent(selector, interval = 100) {
//     return new Promise((resolve, reject) => {
//         const checkExist = setInterval(() => {
//             const elements = document.getElementsByClassName(selector);
//             if (elements.length > 0 && elements[elements.length - 1].textContent.trim() !== "") {
//                 clearInterval(checkExist); // Stop checking once the element is found
//                 resolve(elements[elements.length - 1].textContent.trim());
//             }
//         }, interval);

//         // Optional timeout after 10 seconds to prevent infinite waiting
//         setTimeout(() => {
//             clearInterval(checkExist);
//             reject('Element not found within timeout');
//         }, 10000);
//     });
// }



async function handleSendMessage() {
    let problemId = getProblemId();

    // let problemId = "";

    // try {
    //     // Wait for the heading content to be extracted
    //     problemId = await waitForElementAndGetContent('Header_resource_heading__cpRp1');
    //     console.log(`PROBLEM KEY : ${problemId}`);

    //     // After the key is extracted, log success message
    //     console.log("Problem key extracted successfully!");
    // } catch (error) {
    //     console.error(error); // Handle any error that occurs while waiting for the element
    // }

    console.log("Problem key extracted succesfully !");
    console.log(problemId);

    console.log("Send button clicked");

    // loadMessagesForProblem(problemId);

    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    let promptMessage = "";

    // Get user input and clear the input field
    const userMessage = chatInput.value;
    chatInput.value = "";  // Clear input after sending
    
    // Display user message in chat
    addMessageToChat(userMessage, 'user',problemId);

    // const problemDescription = extractProblemDescription();

    // const element = document.getElementsByClassName("d-flex align-items-center gap-1 text-blue-dark")[0];

    // const language = element?.textContent.trim();

    // const userProblemCode = getUserCode(problemId,language);

    // promptMessage = `This is the description of the current problem the user is dealing with:\n\n${problemDescription}\n\nThe user code is : \n\n${userProblemCode}\n\nIf the question asked below is irrelavant to the description, say that the question asked is irrelevant in one line. \n\n Please provide the answer to the following question:\n${userMessage}`;
    


    // Send the message to the AI API and await the response
    const botReply = await sendMessageToAPI(userMessage);

    console.log("Bot Reply:", botReply);

    // Display bot response in chat
    // console.log(botReply);
    addMessageToChat(botReply, 'bot',problemId);

    

    // getUserCode(problemId,language);
}


////////////////////////////////////

function addMessageToChat(message, sender, problemId) {
    const chatMessages = document.getElementById('chat-messages');
    console.log(message);

    // Create a new message element
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender); // Add sender class to distinguish user/bot

    // Add message content inside a <pre> tag for formatting
    const preElement = document.createElement('pre');
    preElement.textContent = message; // Use textContent to avoid HTML injection risks
    messageDiv.appendChild(preElement);

    // Append the message to the chat
    chatMessages.appendChild(messageDiv);

    // Scroll to the latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // let problemId = "";

    saveMessageToStorage(message,sender, problemId);
}

// function saveMessageToStorage(message, sender, problemId){
//     chromme.storage.local.get([problemId] , (result) => {
//         let messages = result[problemId] || [];
//         messages.push({ message,sender });
//         chrome.storage.local.set({ [problemId]: messages}, () => {
//             console.log('Message saved for problem:',problemId);
//         });
//     });
// }

function saveMessageToStorage(message, sender, problemId) {

    chrome.runtime.sendMessage({ action: "getProblemMessages", problemId }, (response) => {
        const messages = response?.messages || [];
        
        // Check if the message already exists to avoid duplicates
        const isDuplicate = messages.some(
            (msg) => msg.message === message && msg.sender === sender
        );
        
        if (!isDuplicate) {
            // Add the new message if it's not a duplicate
            messages.push({ message, sender });
            chrome.storage.local.set({ [problemId]: messages }, () => {
                console.log('Message saved for problem:', problemId);
            });
        } else {
            console.log('Duplicate message detected, not saving.');
        }
    });
}


function loadMessagesForProblem(problemId) {
    chrome.runtime.sendMessage({ action: "getProblemMessages", problemId }, (response) => {
        const messages = response?.messages || [];
        messages.forEach(({ message, sender }) => {
            addMessageToChat(message, sender, problemId);
        });
    });
}

// Function to clear chat messages (optional)
function clearChatMessages(problemId) {
    chrome.storage.local.remove(problemId, () => {
        console.log('Messages cleared for problem:', problemId);
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = ''; // Clear the chat UI
    });
}

// Function to retrive chat history from Chrome storage
function getChatHistory(id){
    return new Promise((resolve,reject) => {
        chrome.storage.local.get([id], (result) => {
            if(chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            }
            else{
                resolve(result[id] || []); // Default to an empty array if no history is found
            }
        });
    });
}


// let chatHistory = []; // Maintain conversation history

async function sendMessageToAPI(userMessage){
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const API_KEY = "AIzaSyA3ix28txG_5rH15PqkuPNoQF85dtJY4Fs";

    try{
        console.log("Inside sendmessagetoapi");
        const id = getProblemId();
        let chatHistory = await getChatHistory(id);

        if(chatHistory.length === 0){
            // if the chat history is empty, build the initial prompt
            const initialprompt = await buildInitialPrompt(userMessage);

            chatHistory = [{
                role: "user",
                parts: [{ text: initialprompt }]
            }];
        }
        else{
            // Add the user's message to the chat history
            console.log(chatHistory);
            chatHistory.push({
                role: "user",
                parts: [{text: userMessage}]
            });
        }

        
        const payload = {
            contents: chatHistory
        };
        
        // send the request
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

        const aiResponse = data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0].text
        ? data.candidates[0].content.parts[0].text
        : "No response from the API.";

        // Add the AI's response to the chat history
        console.log(typeof chatHistory, Array.isArray(chatHistory), chatHistory);
        chatHistory.push({
            role: "model",
            parts: [{text: aiResponse}]
        });

        // await setChatHistory(id,chatHistory);

        return aiResponse;


    }
    catch(error) {
        console.log("Error sending message to API : ",error);
        return "An error occured while connecting to the API. ";
    }
}

function setChatHistory(id, chatHistory) {
    return new Promise((resolve,reject) => {
        const data = {};
        data[id] = chatHistory;

        chrome.storage.local.set(data, () => {
            if(chrome.runtime.lastError){
                reject(chrome.runtime.lastError);
            }
            else{
                resolve();
            }
        });
    });
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



// AI button disappears when we change tabs like from description to hints
// Extract hints from hint section and also codes


function getUserCode(problemId,language){
    // for (let i = 0; i < localStorage.length; i++) {
    //     const key = localStorage.key(i);
    //     const value = localStorage.getItem(key);
    //     console.log(`Key: ${key}, Value: ${value}`);
    // }
    const keys = Object.keys(localStorage);

    const targetKey = keys.find(key => key.includes(`${problemId}_${language}`));

    if(targetKey) {
        const value = localStorage.getItem(targetKey);
        console.log(`Key found: ${targetKey}, Value: ${value}`);
        return value;
    }
    else {
        console.log("No key with the specified substring found.");
        return null;
    }
}



async function buildInitialPrompt(userMessage){

    console.log("Building initial prompt ::");
    const problemId = getProblemId();

    const element = document.getElementsByClassName("d-flex align-items-center gap-1 text-blue-dark")[0];

    const language = element?.textContent.trim();

    const problemData = getProblemDataById(problemId);
    const currentCode = getUserCode(problemId,language);

    console.log(`Problem Data : ${problemData}`);

    promptMessage = `The user code is : \n\n${currentCode}\n\nPlease provide the answer to the following question:\n${userMessage}`;
    

    return promptMessage;
}
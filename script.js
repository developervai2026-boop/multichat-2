// ওপেনরাউটারের এপিআই লিঙ্ক
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// ⚠️ এখানে নিজের ওপেনরাউটার এপিআই কী বসিয়ে দিন
let API_KEY = "আপনার_ওপেনরাউটার_এপিআই_কী_এখানে_দিন"; 

// ডম উপাদানগুলো নির্বাচন
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const generatePromptBtn = document.getElementById("generatePromptBtn");
const promptType = document.getElementById("promptType");

// বার্তা পাঠানোর কাজ
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// স্বয়ংক্রিয় প্রম্পট তৈরি করার কাজ
generatePromptBtn.addEventListener("click", generatePrompt);

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) {
        alert("অনুগ্রহ করে কিছু লিখুন!");
        return;
    }

    // ব্যবহারকারীর বার্তা দেখানো
    addMessageToChat("আপনি", message, "user-message");
    userInput.value = "";

    // নির্বাচিত এআই মডেলগুলো বের করা
    const selectedModels = Array.from(document.querySelectorAll('input[name="model"]:checked'))
        .map(checkbox => checkbox.value);

    if (selectedModels.length === 0) {
        addMessageToChat("বিজ্ঞপ্তি", "অনুগ্রহ করে অন্তত একটি এআই মডেল বেছে নিন।", "ai-message");
        return;
    }

    // প্রতিটি নির্বাচিত মডেলের জন্য অনুরোধ পাঠানো
    selectedModels.forEach(async (modelId) => {
        addLoadingMessage(modelId);

        try {
            const modelDetails = getModelDetails(modelId);
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "মাল্টি এজেন্ট এআই চ্যাটবট"
                },
                body: JSON.stringify({
                    model: modelDetails.id,
                    messages: [{ role: "user", content: message }],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            const data = await response.json();
            removeLoadingMessage(modelId);
            
            if (data.choices && data.choices[0]) {
                addMessageToChat(modelDetails.name, data.choices[0].message.content, "ai-message");
            } else {
                addMessageToChat(modelDetails.name, "দুঃখিত, কোনো উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।", "ai-message");
            }
        } catch (error) {
            removeLoadingMessage(modelId);
            addMessageToChat(modelId, `ত্রুটি: ${error.message}`, "ai-message");
        }
    });
}

// মডেলের বিবরণ পাওয়া
function getModelDetails(id) {
    const models = {
        gemini: { id: "google/gemini-flash-1.5", name: "গুগল জেমিনি" },
        mistral: { id: "mistralai/mistral-7b-instruct", name: "মিস্ট্রাল এআই" },
        llama: { id: "meta-llama/llama-3-8b-instruct", name: "লামা ৩" },
        gpt: { id: "openai/gpt-3.5-turbo", name: "জিপিটি-৩.৫ টার্বো" }
    };
    return models[id] || { id: "", name: "অজানা মডেল" };
}

// চ্যাটে বার্তা যুক্ত করা
function addMessageToChat(sender, text, className) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${className}`;
    
    const senderName = document.createElement("div");
    senderName.className = "model-name";
    senderName.textContent = sender;
    
    const messageText = document.createElement("div");
    messageText.textContent = text;
    
    messageDiv.appendChild(senderName);
    messageDiv.appendChild(messageText);
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chat

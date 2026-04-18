// chat.js
let stompClient = null;
let currentChatUserId = null;
let currentChatUserName = null;

const currentUserId = localStorage.getItem("userId");
const currentUserName = localStorage.getItem("username");
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("chat")) {
        loadChatContacts();
        connectWebSocket();
    }
});

function connectWebSocket() {
    if (!token || !currentUserId) return;

    // Use SockJS connection with URL parameter auth fallback, or just regular SockJS 
    // depending on the backend config. Since we used ChannelInterceptor, we can pass it via STOMP headers
    const socket = new SockJS(`${BASE_URL}/ws`);
    stompClient = Stomp.over(socket);
    
    // Disable debug logging for cleaner console
    stompClient.debug = () => {};

    stompClient.connect({ 'Authorization': 'Bearer ' + token }, function (frame) {
        console.log('Connected: ' + frame);
        
        // Subscribe to user queue for private messages
        stompClient.subscribe('/user/queue/messages', function (message) {
            const chatMessage = JSON.parse(message.body);
            // If the message is from the user we're currently chatting with, display it
            if (chatMessage.senderId == currentChatUserId || chatMessage.senderId == currentUserId) {
                appendMessage(chatMessage, chatMessage.senderId == currentUserId);
            } else {
                // Show notification / highlight contact
                if (typeof showToast === 'function') {
                    showToast(`New message from ${chatMessage.senderName}`, "info");
                } else {
                    alert(`New message from ${chatMessage.senderName}: ${chatMessage.content}`);
                }
            }
        });
    }, function(error) {
        console.error('STOMP connection error:', error);
        setTimeout(connectWebSocket, 5000);
    });
}

async function loadChatContacts() {
    if (!currentUserId) return;
    try {
        const contacts = await apiFetch(`/chat/contacts/${currentUserId}`);
        const contactsContainer = document.getElementById("chatContacts");
        contactsContainer.innerHTML = "";

        if (contacts.length === 0) {
            contactsContainer.innerHTML = `<p class="text-muted">No contacts found.</p>`;
            return;
        }

        contacts.forEach(contact => {
            const div = document.createElement("div");
            div.className = "contact-item text-muted";
            div.style.padding = "10px";
            div.style.borderBottom = "1px solid var(--glass-border)";
            div.style.cursor = "pointer";
            div.style.borderRadius = "4px";
            // Check identity, if username is patient use username or email
            const displayName = contact.username || contact.email || `User #${contact.id}`;
            div.innerHTML = `<strong>${displayName}</strong><br><small>${contact.role}</small>`;
            
            div.onclick = () => {
                // Highlight active
                document.querySelectorAll(".contact-item").forEach(el => {
                    el.style.background = "transparent";
                    el.style.color = "var(--text-muted)";
                });
                div.style.background = "rgba(255, 255, 255, 0.1)";
                div.style.color = "var(--text-main)";
                
                openChat(contact.id, displayName);
            };
            contactsContainer.appendChild(div);
        });

    } catch (error) {
        console.error("Error loading chat contacts:", error);
        const contactsContainer = document.getElementById("chatContacts");
        if (contactsContainer) {
            contactsContainer.innerHTML = `<p class="text-danger">Failed to load contacts. Ensure backend is running locally.</p>`;
        }
    }
}

async function openChat(userId, userName) {
    currentChatUserId = userId;
    currentChatUserName = userName;

    document.getElementById("chatInput").disabled = false;
    document.getElementById("chatSendBtn").disabled = false;
    
    // Clear current messages
    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = `<p class="text-muted text-center" style="margin-top: auto; margin-bottom: auto;">Loading history...</p>`;

    // Fetch history
    try {
        const history = await apiFetch(`/chat/history/${currentUserId}/${currentChatUserId}`);
        chatMessages.innerHTML = "";
        
        if(history.length === 0) {
           chatMessages.innerHTML = `<p class="text-muted text-center" style="margin-top: auto; margin-bottom: auto;">No previous messages. Start the conversation!</p>`;
        }
        
        history.forEach(msg => {
            appendMessage(msg, msg.senderId == currentUserId);
        });
        
    } catch(err) {
        chatMessages.innerHTML = `<p class="text-muted text-center" style="margin-top: auto; margin-bottom: auto;">Error loading history.</p>`;
    }
}

function appendMessage(message, isSelf) {
    const chatMessages = document.getElementById("chatMessages");
    // remove placeholder if exists
    if(chatMessages.innerHTML.includes("No previous messages") || chatMessages.innerHTML.includes("Select a doctor") || chatMessages.innerHTML.includes("Select a patient")) {
        chatMessages.innerHTML = "";
    }
    
    const div = document.createElement("div");
    div.style.maxWidth = "70%";
    div.style.padding = "10px";
    div.style.borderRadius = "8px";
    div.style.marginBottom = "5px";
    div.style.wordWrap = "break-word";
    
    if (isSelf) {
        // align right
        div.style.alignSelf = "flex-end";
        div.style.background = "var(--primary-color)";
        div.style.color = "white";
    } else {
        // align left
        div.style.alignSelf = "flex-start";
        div.style.background = "var(--glass-border)";
        div.style.color = "var(--text-main)";
    }
    
    // Add times logic if needed, simplify for now
    div.innerHTML = `<div>${message.content}</div>`;
    
    chatMessages.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    const chatMessages = document.getElementById("chatMessages");
    if (!chatMessages) return;
    
    // Use setTimeout to ensure the element has been rendered
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 10);
}

function sendChatMessage() {
    const input = document.getElementById("chatInput");
    const content = input.value.trim();
    
    if (content && stompClient && currentChatUserId) {
        const chatReq = {
            senderId: parseInt(currentUserId, 10),
            receiverId: parseInt(currentChatUserId, 10),
            senderName: currentUserName,
            content: content
        };
        
        console.log("Sending chat request:", chatReq);
        const headers = { 'content-type': 'application/json' };
        stompClient.send("/app/chat", headers, JSON.stringify(chatReq));
        appendMessage(chatReq, true);
        input.value = "";
    }
}

// Ensure the switchSection adds an indicator if needed, we reuse existing logic.

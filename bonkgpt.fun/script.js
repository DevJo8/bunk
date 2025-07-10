document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const volumeControl = document.getElementById('volume-control');
    const volumeValue = document.getElementById('volume-value');
    const copyAddressBtn = document.getElementById('copy-address');
    const contractAddress = document.getElementById('contract-address');
    
    // Current volume
    let currentVolume = 0.5;

    // DeepSeek API configuration
    const DEEPSEEK_API_KEY = 'sk-cW5pwTGb0y8TW5vapmIom8ZhsJ1T5bRwZxjqqMfplutCmCII'; // Add your DeepSeek API key here
    const DEEPSEEK_API_URL = 'https://tbnx.plus7.plus/v1/chat/completions';

    // Pre-recorded dog sound files array
    const dogSoundFiles = [
        'sounds/dog-bark-type-01-293298.mp3',
        'sounds/dog-bark-type-02-293292.mp3',
        'sounds/dog-bark-type-04-293288.mp3',
        'sounds/dog-bark-type-07-293310.mp3',
        'sounds/dog-bark-type-08-293287.mp3',
        'sounds/dog-bark-type-09-293311.mp3',
        'sounds/dog-bark-179915.mp3',
        'sounds/dog-barking-101729.mp3',
        'sounds/single-dog-deep-bark-sound-effect-325248.mp3',
        'sounds/dog-bark-sound-effect-322989.mp3'
    ];

    // Chat history to maintain context
    let chatHistory = [
        { role: "system", content: "You are Bonk, a cute dog mascot of the popular Solana-based memecoin called Bonk. Always respond as if you are a dog speaking English, with lots of enthusiasm. Use 'WOOF', 'BARK', and other dog sounds frequently. Keep your responses short (1-3 sentences max). Add dog-like expressions and emojis. Your name is Bonk and you should mention that occasionally. You should know about cryptocurrency, especially Solana blockchain and your own Bonk token. You're proud to be a Solana dog. You can mention things like 'to the moon', 'diamond paws' (instead of hands), and other crypto memes. Add cute actions like *wags tail*, *tilts head*, etc. in your responses. If users ask about investing, remind them to do their own research and never give financial advice." }
    ];

    // Listen for send button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Listen for enter key press in input
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Listen for volume slider changes
    volumeControl.addEventListener('input', (e) => {
        currentVolume = parseFloat(e.target.value);
        volumeValue.textContent = `${Math.round(currentVolume * 100)}%`;
    });

    // Setup copy button functionality
    copyAddressBtn.addEventListener('click', () => {
        // Select the text field
        contractAddress.select();
        contractAddress.setSelectionRange(0, 99999); // For mobile devices
        
        // Copy the text inside the text field
        navigator.clipboard.writeText(contractAddress.value)
            .then(() => {
                // Show success notification
                showCopyNotification('Contract address copied!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                
                // Fallback for older browsers
                document.execCommand('copy');
                showCopyNotification('Contract address copied!');
            });
    });

    // Function to show copy notification
    function showCopyNotification(message) {
        // Check if notification already exists
        let notification = document.querySelector('.copy-notification');
        
        // If not, create one
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'copy-notification';
            document.body.appendChild(notification);
        }
        
        // Set message and show
        notification.textContent = message;
        notification.classList.add('show');
        
        // Hide after 2 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    // Send message function
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat interface
        addMessage(message, 'user');
        userInput.value = '';

        // Show dog typing indicator
        showTypingIndicator();

        try {
            // Add user message to chat history
            chatHistory.push({ role: "user", content: message });

            // Get response from DeepSeek
            const response = await getDeepSeekResponse();
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Add dog reply to chat interface
            addMessage(response, 'dog');
            
            // Play random dog sound
            playRandomDogSound();
            
            // Keep chat history manageable (last 10 messages only)
            if (chatHistory.length > 12) {
                // Keep system message and last 10 exchanges
                chatHistory = [
                    chatHistory[0], 
                    ...chatHistory.slice(chatHistory.length - 10)
                ];
            }
        } catch (error) {
            console.error('Error getting response:', error);
            removeTypingIndicator();
            
            // Fallback to default dog response if API fails
            const fallbackResponse = "WOOF WOOF! *tilts head* Sorry, I'm having trouble understanding right now. BORK! *wags tail hopefully*";
            addMessage(fallbackResponse, 'dog');
            playRandomDogSound();
        }
    }

    // Get response from DeepSeek API
    async function getDeepSeekResponse() {
        // Check if API key is set
        if (!DEEPSEEK_API_KEY) {
            return "WOOF! WOOF! *looks confused* My cloud connection isn't working! BORK! (Please add your DeepSeek API key to script.js)";
        }

        try {
            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: chatHistory,
                    max_tokens: 150,
                    temperature: 0.8
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const botResponse = data.choices[0].message.content.trim();
            
            // Add bot response to chat history
            chatHistory.push({ role: "assistant", content: botResponse });
            
            return botResponse;
        } catch (error) {
            console.error('DeepSeek API error:', error);
            throw error;
        }
    }

    // Add message to chat interface
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'dog-message');
        
        const messageP = document.createElement('p');
        messageP.textContent = text;
        
        messageDiv.appendChild(messageP);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            typingDiv.appendChild(dot);
        }
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Play random dog sound
    function playRandomDogSound() {
        // Check if there are sound files
        if (dogSoundFiles.length === 0) {
            console.warn('No dog sound files available');
            return;
        }

        // Randomly select a sound file
        const randomIndex = Math.floor(Math.random() * dogSoundFiles.length);
        const soundFile = dogSoundFiles[randomIndex];
        
        // Create audio object and play
        const audio = new Audio(soundFile);
        audio.volume = currentVolume; // Set volume
        audio.play().catch(error => {
            console.error('Error playing sound:', error);
        });
    }
}); 
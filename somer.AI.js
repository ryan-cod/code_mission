// Somer AI Chat Application JavaScript - Advanced Version

// Global variables
let recognition = null;
let isListening = false;
let isSpeaking = false;
let speechSynthesis = null;
let analyser = null;
let animationFrame = null;
let currentTool = null;
let conversationHistory = [];
let apiKey = 'YOUR_OPENAI_API_KEY_HERE'; // Replace with your actual API key - WARNING: Never expose API keys in client-side code in production

// DOM elements
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const typingIndicator = document.getElementById('typing-indicator');
const micBtn = document.getElementById('mic-btn');
const talkBtn = document.getElementById('talk-btn');
const speakBtn = document.getElementById('speak-btn');
const voiceAvatar = document.getElementById('voice-avatar');

// Initialize audio context
function initAudio() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Audio context not supported');
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 256;
            updateVisualizer();
        })
        .catch(err => {
            console.error('Error accessing microphone:', err);
        });
}

// Voice state management
function setVoiceState(state) {
    if (state === 'listening') {
        talkBtn.classList.add('active');
        voiceAvatar.classList.remove('hidden');
    } else if (state === 'speaking') {
        voiceAvatar.classList.add('speaking');
        voiceAvatar.classList.add('happy');
        voiceAvatar.classList.add('emotion-strong');
        voiceAvatar.classList.remove('hidden');
    } else {
        talkBtn.classList.remove('active');
        voiceAvatar.classList.add('hidden');
    }
}

function speakResponse(text) {
    if (!speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices().find(v => v.lang.includes('en')) || null;
    utterance.rate = 1;
    utterance.pitch = 1.05;
    utterance.onstart = () => {
        setVoiceState('speaking');
    };
    utterance.onend = () => {
        if (!isListening) {
            setVoiceState('idle');
        }
    };
    speechSynthesis.speak(utterance);
}

// Speech Recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            isListening = true;
            micBtn.classList.add('recording');
            talkBtn.classList.add('active');
            showStatus('Listening...');
            setVoiceState('listening');
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            sendMessage();
        };

        recognition.onend = function() {
            isListening = false;
            micBtn.classList.remove('recording');
            showStatus('Ready');
            talkBtn.classList.remove('active');
            if (!isSpeaking) {
                setVoiceState('idle');
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            showStatus('Voice recognition error');
            setVoiceState('idle');
        };
    }
}

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

// Send message on Enter
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Send message
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Analyze message for insights
    const insights = getAdvancedInsights(message);

    // Hide welcome screen
    const welcomeScreen = document.querySelector('.welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }

    // Add user message
    addMessage(message, 'user');

    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';

    // Show typing indicator
    typingIndicator.classList.add('active');

    // Scroll to bottom
    scrollToBottom();

    // Show advanced status
    showAdvancedStatus('Processing your message', insights);

    try {
        // Generate response
        const response = await generateResponse(message);
        
        // Hide typing indicator
        typingIndicator.classList.remove('active');
        
        // Add AI response
        addMessage(response, 'bot');
        scrollToBottom();

        // Speak response if speech is enabled
        if (isSpeaking) {
            speakResponse(response);
        }

        showAdvancedStatus('Response generated successfully');
    } catch (error) {
        console.error('Error generating response:', error);
        typingIndicator.classList.remove('active');
        addMessage("I'm sorry, I encountered an error while processing your advanced AI request. Please check your API key and try again.", 'bot');
        scrollToBottom();
        showAdvancedStatus('Error occurred');
    }
}

// Send quick message from suggestions
function sendQuickMessage(message) {
    userInput.value = message;
    sendMessage();
}

// Start new chat
function startNewChat() {
    messagesContainer.innerHTML = `
        <div class="welcome-screen">
            <div class="welcome-icon">AI</div>
            <h2 class="welcome-title">Hello! I'm Somer.AI</h2>
            <p class="welcome-subtitle">Your intelligent companion for creativity, problem-solving, and conversation. Choose a tool or start chatting!</p>

            <div class="suggestion-grid">
                <div class="suggestion-card" onclick="sendQuickMessage('Create a mind map for project planning')">
                    <div class="suggestion-icon">🧠</div>
                    <div class="suggestion-title">Mind Map</div>
                    <div class="suggestion-desc">Visualize ideas and plan projects</div>
                </div>
                <div class="suggestion-card" onclick="sendQuickMessage('Tell me a creative story')">
                    <div class="suggestion-icon">📖</div>
                    <div class="suggestion-title">Story Time</div>
                    <div class="suggestion-desc">Generate imaginative stories</div>
                </div>
                <div class="suggestion-card" onclick="sendQuickMessage('Help me solve this problem')">
                    <div class="suggestion-icon">💡</div>
                    <div class="suggestion-title">Problem Solver</div>
                    <div class="suggestion-desc">Find solutions to challenges</div>
                </div>
                <div class="suggestion-card" onclick="sendQuickMessage('What does this dream mean?')">
                    <div class="suggestion-icon">🌙</div>
                    <div class="suggestion-title">Dream Analysis</div>
                    <div class="suggestion-desc">Interpret dreams and symbols</div>
                </div>
            </div>
        </div>
    `;
    currentTool = null;
    document.querySelectorAll('.tool-item').forEach(item => item.classList.remove('active'));
}

// Add message to chat
function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = type === 'user' ? 'You' : 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(content);

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
}

// Format message content
function formatMessage(text) {
    // Basic formatting for code and links
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\n/g, '<br>');
    return text;
}

// Generate AI response using OpenAI API
async function generateResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Check for image generation requests
    if (lowerMessage.includes('generate') && (lowerMessage.includes('image') || lowerMessage.includes('photo') || lowerMessage.includes('picture') || lowerMessage.includes('draw') || lowerMessage.includes('create'))) {
        setTimeout(() => {
            generateImage(message);
        }, 1500);
        return "🎨 Generating your image... This may take a few moments!";
    }

    // If API key is not set, fall back to basic responses
    if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
        return generateFallbackResponse(message);
    }

    try {
        // Add user message to history
        conversationHistory.push({ role: 'user', content: message });

        // Keep only last 10 messages for context
        if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(-10);
        }

        // Prepare messages for API
        const messages = [
            {
                role: 'system',
                content: `You are Somer.AI, an advanced intelligent companion for creativity, problem-solving, and conversation. You have access to various tools including mind mapping, storytelling, digital art, image generation, music composition, logical analysis, problem solving, dream interpretation, future prediction, game design, world building, emotion mapping, and chaos generation.

Current active tool: ${currentTool || 'none'}

Be helpful, creative, and engaging. Provide detailed, thoughtful responses. If a tool is active, focus your response on that tool's domain.`
            },
            ...conversationHistory
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Using the most advanced model available
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Add AI response to history
        conversationHistory.push({ role: 'assistant', content: aiResponse });

        return aiResponse;

    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return generateFallbackResponse(message);
    }
}

// Fallback response generator for when API is not available
function generateFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Tool-specific responses
    if (currentTool) {
        return generateToolResponse(message, currentTool);
    }

    // General responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! I'm Somer.AI, your advanced intelligent companion. I can help you with creative tasks, problem-solving, storytelling, image generation, and much more. What would you like to work on today?";
    }

    if (lowerMessage.includes('help')) {
        return "I am an advanced AI with capabilities in:\n\n🧠 **Mind Mapping** - Visualize ideas and plan projects\n📖 **Storytelling** - Create imaginative stories\n🎨 **Digital Art** - Generate artistic concepts\n🖼️ **Image Generation** - Create AI-generated images\n🎵 **Music** - Compose and describe music\n💡 **Problem Solving** - Find solutions to challenges\n🔍 **Logic Analysis** - Systematic thinking\n🌙 **Dream Interpretation** - Analyze dreams\n🔮 **Future Prediction** - Strategic foresight\n🎮 **Game Design** - Create engaging games\n🌍 **World Building** - Construct detailed worlds\n❤️ **Emotion Mapping** - Understand feelings\n🎲 **Chaos Generation** - Embrace creativity\n\nChoose a tool from the sidebar or just ask me anything!";
    }

    if (lowerMessage.includes('thank')) {
        return "You're welcome! I'm here whenever you need advanced AI assistance or creative inspiration. What else can I help you with?";
    }

    // Advanced fallback responses
    const responses = [
        "That's a fascinating query! Let me analyze this from multiple perspectives and provide you with a comprehensive response.",
        "I appreciate you bringing this up. As an advanced AI, I can offer insights from various domains including psychology, technology, creativity, and strategic thinking.",
        "Excellent question! My advanced reasoning capabilities allow me to consider this from different angles. Here's my analysis...",
        "I'm intrigued by this topic. Let me draw from my extensive knowledge base to provide you with the most relevant and helpful information.",
        "That's a complex and interesting subject! As an advanced AI, I can help you explore this through multiple lenses including scientific, philosophical, and practical approaches."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
}

// Generate tool-specific responses
function generateToolResponse(message, tool) {
    const responses = {
        mindmap: [
            "Let's create a mind map for this! Start by identifying the central idea, then branch out to related concepts. What should be at the center of your mind map?",
            "For effective mind mapping, focus on keywords and images rather than full sentences. What are the main categories that branch from your central idea?",
            "Mind maps work best when you let ideas flow freely. Don't worry about organization initially - we can structure it later. What's the first idea that comes to mind?"
        ],
        story: [
            "Every great story needs a compelling beginning. Let's start with an intriguing hook. What kind of story world interests you - fantasy, mystery, adventure?",
            "Character development is key to engaging stories. Let's create a protagonist with depth. What motivates your main character?",
            "Stories thrive on conflict and resolution. What's the central challenge your character will face in this story?"
        ],
        art: [
            "Visual art is about expressing emotion through imagery. What mood or feeling would you like your artwork to convey?",
            "Color theory plays a big role in visual impact. What colors speak to you for this piece - warm and energetic, or cool and calming?",
            "Composition guides the viewer's eye. Let's think about focal points and balance. What should be the most prominent element?"
        ],
        image: [
            "I can generate images from your descriptions! Try prompts like 'a serene mountain landscape at sunset' or 'a futuristic city with flying cars'. What would you like me to create?",
            "For best results, be specific about style, lighting, mood, and subject. For example: 'oil painting of a cat wearing sunglasses, impressionist style'. What's your image idea?",
            "Image generation works best with detailed descriptions. Include elements like setting, lighting, colors, and style. What scene should I generate for you?"
        ],
        music: [
            "Music has the power to evoke deep emotions. What feeling would you like your composition to express - joy, melancholy, energy?",
            "Rhythm and tempo set the pace. Would you prefer something fast and lively, or slow and contemplative?",
            "Musical themes can tell stories. What narrative would you like your music to suggest?"
        ],
        logic: [
            "Logical thinking requires clear premises and valid conclusions. What problem are we analyzing today?",
            "Breaking complex issues into smaller parts often reveals solutions. What are the key components of this situation?",
            "Different logical frameworks can illuminate different aspects. Should we approach this deductively or inductively?"
        ],
        problem: [
            "Effective problem-solving starts with clear definition. Can you describe the problem in specific terms?",
            "Every problem has constraints and requirements. What are the key limitations and goals here?",
            "Creative solutions often come from looking at problems from new angles. What assumptions might we challenge?"
        ],
        dream: [
            "Dreams often symbolize unconscious thoughts and emotions. What stood out most vividly in this dream?",
            "Dream imagery can be highly personal. What emotions did you experience during the dream?",
            "Recurring symbols in dreams often carry significant meaning. Are there any familiar elements that appear frequently?"
        ],
        future: [
            "Future prediction involves analyzing current trends and possibilities. What time frame are you interested in?",
            "Multiple scenarios help us prepare for different outcomes. What variables might influence this future?",
            "Strategic foresight combines data with imagination. What signals are you seeing in the present?"
        ],
        game: [
            "Great games balance challenge with achievable goals. What type of gameplay excites you most?",
            "Player motivation drives engagement. What will make players want to keep playing?",
            "Game mechanics should feel intuitive yet offer depth. What's the core action players will repeat?"
        ],
        world: [
            "World-building starts with fundamental rules and characteristics. What kind of world are you envisioning?",
            "Culture and society give worlds life and authenticity. What values define this civilization?",
            "Conflict and stakes create compelling narratives. What challenges threaten this world?"
        ],
        emotion: [
            "Emotions are complex and often layered. What primary emotion are you experiencing right now?",
            "Understanding emotional triggers helps us respond effectively. What situations tend to evoke this feeling?",
            "Emotional intelligence involves recognizing patterns. How does this emotion typically manifest for you?"
        ],
        chaos: [
            "Embracing chaos can lead to unexpected creativity. What constraints would you like to break?",
            "Random elements can spark innovation. What would happen if we combined seemingly unrelated ideas?",
            "Chaos often reveals hidden patterns. What unexpected connections are emerging?"
        ]
    };

    const toolResponses = responses[tool] || ["I'm ready to help with this! What specific aspect would you like to explore?"];
    return toolResponses[Math.floor(Math.random() * toolResponses.length)];
}

// Generate images using DALL-E API
async function generateImage(prompt) {
    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'generated-image-container';
    imageContainer.innerHTML = `
        <div class="image-placeholder">
            <div class="image-loading">
                <div class="loading-spinner"></div>
                <p>Generating image with AI...</p>
            </div>
        </div>
        <div class="image-caption">${prompt}</div>
    `;

    // Add to chat
    const chatMessages = document.getElementById('messages');
    chatMessages.appendChild(imageContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Check if API key is available
    if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
        // Fallback to placeholder
        setTimeout(() => {
            const placeholderImages = [
                'https://picsum.photos/400/300?random=1',
                'https://picsum.photos/400/300?random=2',
                'https://picsum.photos/400/300?random=3',
                'https://picsum.photos/400/300?random=4',
                'https://picsum.photos/400/300?random=5'
            ];
            const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
            imageContainer.innerHTML = `
                <div class="generated-image">
                    <img src="${randomImage}" alt="${prompt}" onload="this.style.opacity='1'">
                    <div class="image-overlay">
                        <button class="image-action-btn" onclick="downloadImage('${randomImage}', '${prompt}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7,10 12,15 17,10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download
                        </button>
                    </div>
                </div>
                <div class="image-caption">${prompt}</div>
            `;
        }, 2000);
        return;
    }

    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                n: 1,
                size: '512x512',
                model: 'dall-e-3' // Most advanced image generation model
            })
        });

        if (!response.ok) {
            throw new Error(`Image generation failed: ${response.status}`);
        }

        const data = await response.json();
        const imageUrl = data.data[0].url;

        imageContainer.innerHTML = `
            <div class="generated-image">
                <img src="${imageUrl}" alt="${prompt}" onload="this.style.opacity='1'">
                <div class="image-overlay">
                    <button class="image-action-btn" onclick="downloadImage('${imageUrl}', '${prompt}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7,10 12,15 17,10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download
                    </button>
                </div>
            </div>
            <div class="image-caption">${prompt}</div>
        `;
    } catch (error) {
        console.error('Error generating image:', error);
        // Fallback to placeholder
        const placeholderImages = [
            'https://picsum.photos/400/300?random=1',
            'https://picsum.photos/400/300?random=2',
            'https://picsum.photos/400/300?random=3',
            'https://picsum.photos/400/300?random=4',
            'https://picsum.photos/400/300?random=5'
        ];
        const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
        imageContainer.innerHTML = `
            <div class="generated-image">
                <img src="${randomImage}" alt="${prompt}" onload="this.style.opacity='1'">
                <div class="image-overlay">
                    <button class="image-action-btn" onclick="downloadImage('${randomImage}', '${prompt}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7,10 12,15 17,10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download
                    </button>
                </div>
            </div>
            <div class="image-caption">${prompt}</div>
        `;
    }
}

// Download generated image
function downloadImage(imageUrl, prompt) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `somer-ai-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Activate tool
function activateTool(toolName) {
    currentTool = toolName;

    // Update UI
    document.querySelectorAll('.tool-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tool === toolName) {
            item.classList.add('active');
        }
    });

    // Generate advanced tool activation message
    const toolMessages = {
        mindmap: "🧠 **Advanced Mind Map Creator** activated! Utilizing cognitive science principles and visual thinking methodologies to help you organize complex ideas. What central concept shall we map today?",
        story: "📖 **AI Story Weaver** activated! Leveraging narrative theory, character development frameworks, and plot structures from literature to craft compelling stories. What's your narrative vision?",
        art: "🎨 **Digital Art Synthesizer** activated! Combining principles of color theory, composition, and artistic movements with AI creativity. What artistic expression calls to you?",
        image: "🖼️ **DALL-E 3 Image Generator** activated! Using state-of-the-art diffusion models to create photorealistic and imaginative visuals. Describe your vision in detail.",
        music: "🎵 **AI Music Composer** activated! Employing music theory, emotional resonance, and generative algorithms to create harmonious compositions. What mood should your symphony evoke?",
        logic: "🔍 **Advanced Logic Analyzer** activated! Applying formal logic, critical thinking frameworks, and analytical methodologies to dissect complex problems. What shall we analyze?",
        problem: "💡 **Strategic Problem Solver** activated! Using advanced problem-solving methodologies, root cause analysis, and creative solution generation. What's the challenge?",
        dream: "🌙 **Dream Interpreter Pro** activated! Drawing from Jungian psychology, symbolism databases, and subconscious pattern recognition. Share your dream for deep analysis.",
        future: "🔮 **Future Prediction Engine** activated! Utilizing trend analysis, scenario planning, and predictive modeling to explore possible futures. What timeline interests you?",
        game: "🎮 **Game Design AI** activated! Incorporating game theory, player psychology, and interactive design principles. What gaming experience shall we create?",
        world: "🌍 **World Builder Advanced** activated! Using world-building frameworks from fantasy literature, sociology, and environmental science. What world shall we construct?",
        emotion: "❤️ **Emotion Intelligence AI** activated! Leveraging emotional intelligence research and sentiment analysis to explore the human emotional landscape. How are you feeling?",
        chaos: "🎲 **Chaos Theory Generator** activated! Embracing complexity theory, emergence, and creative unpredictability for breakthrough innovation. What constraints shall we break?"
    };

    const activationMessage = toolMessages[toolName] || `🔬 **Advanced ${toolName} Tool** activated! Using cutting-edge AI capabilities for specialized assistance.`;
    addMessage(activationMessage, 'bot');

    if (isSpeaking) {
        speakResponse(activationMessage);
    }

    showAdvancedStatus(`Tool activated: ${toolName}`);
}

// Audio controls
micBtn.addEventListener('click', function() {
    if (!recognition) {
        initSpeechRecognition();
    }

    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
});

talkBtn.addEventListener('click', function() {
    if (!recognition) {
        initSpeechRecognition();
    }

    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
});

speakBtn.addEventListener('click', function() {
    isSpeaking = !isSpeaking;
    speakBtn.classList.toggle('active');

    if (isSpeaking) {
        speakResponse("Voice synthesis activated. I'll now speak my responses!");
    } else {
        speechSynthesis.cancel();
        if (!isListening) {
            setVoiceState('idle');
        }
    }
});

// Audio visualization
function updateVisualizer() {
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function update() {
        analyser.getByteFrequencyData(dataArray);

        const bars = document.querySelectorAll('.bar');
        for (let i = 0; i < bars.length; i++) {
            const value = dataArray[Math.floor(i * bufferLength / bars.length)];
            const height = (value / 255) * 100;
            bars[i].style.height = height + '%';
        }

        animationFrame = requestAnimationFrame(update);
    }

    update();
}

// Advanced features
function clearConversationHistory() {
    conversationHistory = [];
    showStatus('Conversation history cleared');
}

function analyzeSentiment(text) {
    // Simple sentiment analysis (in a real implementation, use a proper NLP library)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'joy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'disappointed', 'horrible', 'worst'];

    const lowerText = text.toLowerCase();
    let score = 0;

    positiveWords.forEach(word => {
        if (lowerText.includes(word)) score += 1;
    });

    negativeWords.forEach(word => {
        if (lowerText.includes(word)) score -= 1;
    });

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
}

function getAdvancedInsights(message) {
    const sentiment = analyzeSentiment(message);
    const wordCount = message.split(' ').length;
    const hasQuestions = message.includes('?');
    const hasExclamation = message.includes('!');

    return {
        sentiment,
        wordCount,
        hasQuestions,
        hasExclamation,
        complexity: wordCount > 20 ? 'high' : wordCount > 10 ? 'medium' : 'low'
    };
}

// Enhanced status updates with more information
function showAdvancedStatus(message, insights = null) {
    let statusMessage = `Status: ${message}`;
    if (insights) {
        statusMessage += ` | Sentiment: ${insights.sentiment} | Complexity: ${insights.complexity}`;
    }
    console.log(statusMessage);
    // In a real implementation, update a status bar in the UI
}

// Scroll to bottom
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Initialize
initAudio();
initSpeechRecognition();

// Welcome message after a short delay
setTimeout(() => {
    showAdvancedStatus('Advanced AI System Online - GPT-4o and DALL-E 3 Integration Active');
}, 500);
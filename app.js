// Initialize state
let currentUsername = localStorage.getItem('currentUsername') || '';
let state = {
    phase: currentUsername ? 'menu' : 'login',
    username: currentUsername,
    schoolCode: localStorage.getItem('currentSchoolCode') || '',
    isSchoolAdmin: false,
    isSuperAdmin: false,
    subject: localStorage.getItem('currentSubject') || '',
    yearGroup: localStorage.getItem('currentYearGroup') || '',
    teams: [],
    currentTeam: 0,
    currentCard: null,
    remaining: [],
    history: [],
    currentGameSet: 'default',
    editingGameSet: null,
    showOrchestraInfo: false,
    editingCardIndex: 0,
    editingCards: []
};

// Load user data if logged in
if (currentUsername) {
    try {
        const schoolCode = localStorage.getItem('currentSchoolCode') || '';
        let userData = null;
        
        // Try to get user from school first
        if (schoolCode) {
            const school = getSchool(schoolCode);
            if (school && school.users && school.users[currentUsername]) {
                userData = school.users[currentUsername];
            }
        }
        
        // Fallback to legacy user system
        if (!userData) {
            userData = getUserData(currentUsername);
        }
        
        // Restore teams with their total scores
        if (userData && userData.teams && userData.teams.length > 0) {
            state.teams = userData.teams.map(team => ({
                name: team.name,
                score: 0, // Reset current game score
                skipped: 0, // Reset current game skipped
                totalScore: userData.totalScore?.[team.name] || team.totalScore || 0
            }));
        } else if (userData) {
            state.teams = [
                { name: 'Team 1', score: 0, skipped: 0, totalScore: userData.totalScore?.['Team 1'] || 0 },
                { name: 'Team 2', score: 0, skipped: 0, totalScore: userData.totalScore?.['Team 2'] || 0 }
            ];
        } else {
            state.teams = [
                { name: 'Team 1', score: 0, skipped: 0, totalScore: 0 },
                { name: 'Team 2', score: 0, skipped: 0, totalScore: 0 }
            ];
        }
        state.currentGameSet = (userData && userData.currentGameSet) ? userData.currentGameSet : 'default';
    } catch (e) {
        console.error('Error loading user data:', e);
        // Set default teams if error
        state.teams = [
            { name: 'Team 1', score: 0, skipped: 0, totalScore: 0 },
            { name: 'Team 2', score: 0, skipped: 0, totalScore: 0 }
        ];
        state.currentGameSet = 'default';
    }
}

// Login/User Functions
function login() {
    try {
        // Clear any previous error messages
        const errorDiv = document.getElementById('login-error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
        
        const schoolCode = document.getElementById('school-code-input')?.value.trim().toUpperCase();
        const username = document.getElementById('username-input')?.value.trim();
        const subject = document.getElementById('subject-input')?.value.trim();
        const yearGroup = document.getElementById('year-group-input')?.value.trim();
        const email = document.getElementById('email-input')?.value.trim() || '';
        
        // Validate username - warn if it looks like a full name
        if (username && username.split(' ').length > 1) {
            if (!confirm('⚠️ Warning: Your username looks like a full name. For safety, please use a nickname instead. Continue anyway?')) {
                return;
            }
        }
        
        if (!schoolCode) {
            showLoginError('Please enter a school code');
            return;
        }
        if (!username) {
            showLoginError('Please enter a username (use a nickname, not your full name)');
            return;
        }
        
        // Check if school exists
        const school = getSchool(schoolCode);
        if (!school) {
            showLoginError('School not found. Please check the school code or create a new school.');
            return;
        }
        
        // Check if user has a password set (for existing users)
        const existingUser = school.users && school.users[username] ? school.users[username] : null;
        if (existingUser && existingUser.password) {
            // User has a password - need to verify it
            const passwordInput = document.getElementById('password-input');
            if (!passwordInput || !passwordInput.value) {
                showLoginError('This account requires a password. Please enter your password.');
                const passwordContainer = document.getElementById('password-field-container');
                if (passwordContainer) {
                    passwordContainer.style.display = 'block';
                }
                if (passwordInput) passwordInput.focus();
                return;
            }
            if (passwordInput.value !== existingUser.password) {
                showLoginError('Incorrect password. Please try again.');
                if (passwordInput) {
                    passwordInput.value = '';
                    passwordInput.focus();
                }
                return;
            }
        }
        
        // Join school or get existing user (email is optional for existing users)
        let result;
        try {
            result = joinSchool(schoolCode, username, subject, yearGroup, email);
            if (!result || !result.success) {
                showLoginError(result?.error || 'Failed to join school. Please try again.');
                return;
            }
        } catch (e) {
            console.error('Error joining school:', e);
            showLoginError('Error: ' + (e.message || 'Failed to join school. Please try again.'));
            return;
        }
        
        // Get school again to ensure we have the latest data
        const updatedSchool = getSchool(schoolCode);
        if (!updatedSchool) {
            showLoginError('Error: School not found after joining. Please try again.');
            return;
        }
        
        // Get user data from school
        const userData = (updatedSchool.users && updatedSchool.users[username]) || result.user;
        if (!userData) {
            showLoginError('Error: Could not load user data. Please try again.');
            return;
        }
        
        // Set state
        currentUsername = username;
        state.username = username;
        state.schoolCode = schoolCode;
        state.subject = subject;
        state.yearGroup = yearGroup;
        state.isSchoolAdmin = false;
        
        // Save to localStorage
        localStorage.setItem('currentUsername', username);
        localStorage.setItem('currentSchoolCode', schoolCode);
        localStorage.setItem('currentSubject', subject);
        localStorage.setItem('currentYearGroup', yearGroup);
        
        // Restore teams with their total scores
        if (userData.teams && userData.teams.length > 0) {
            state.teams = userData.teams.map(team => ({
                name: team.name,
                score: 0, // Reset current game score
                skipped: 0, // Reset current game skipped
                totalScore: userData.totalScore?.[team.name] || team.totalScore || 0
            }));
        } else {
            state.teams = [
                { name: 'Team 1', score: 0, skipped: 0, totalScore: userData.totalScore?.['Team 1'] || 0 },
                { name: 'Team 2', score: 0, skipped: 0, totalScore: userData.totalScore?.['Team 2'] || 0 }
            ];
        }
        state.currentGameSet = userData.currentGameSet || 'default';
        // Reset game state to ensure we show menu, not playing
        state.currentCard = null;
        state.remaining = [];
        state.history = [];
        state.phase = 'menu';
        render();
    } catch (e) {
        console.error('Login error:', e);
        showLoginError('An unexpected error occurred. Please try again. Error: ' + e.message);
    }
}

function showLoginError(message) {
    // Remove any existing error message
    const existingError = document.getElementById('login-error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.id = 'login-error-message';
    errorDiv.className = 'mb-4 p-4 bg-red-100 border-2 border-red-400 rounded-lg text-red-700 font-semibold';
    errorDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="text-xl">⚠️</span>
            <span>${message}</span>
        </div>
    `;
    
    // Insert error message before the Sign In button
    const signInButton = document.querySelector('button[onclick="login()"]');
    if (signInButton && signInButton.parentElement) {
        signInButton.parentElement.insertBefore(errorDiv, signInButton);
    } else {
        // Fallback: append to the form container
        const formContainer = document.querySelector('.bg-white.rounded-3xl');
        if (formContainer) {
            const lastChild = formContainer.lastElementChild;
            if (lastChild) {
                formContainer.insertBefore(errorDiv, lastChild);
            } else {
                formContainer.appendChild(errorDiv);
            }
        }
    }
    
    // Scroll error into view
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function createNewSchool() {
    const schoolName = document.getElementById('school-name-input').value.trim();
    const schoolCodeInput = document.getElementById('new-school-code-input');
    const schoolCode = schoolCodeInput ? schoolCodeInput.value.trim().toUpperCase() : '';
    const adminPassword = document.getElementById('admin-password-input').value.trim();
    
    if (!schoolName || !adminPassword) {
        alert('Please fill in school name and admin password');
        return;
    }
    
    // Auto-generate school code if not provided
    let finalSchoolCode = schoolCode;
    if (!finalSchoolCode || finalSchoolCode.length < 3) {
        finalSchoolCode = generateSchoolCode(schoolName);
        // Update the input field to show the generated code
        if (schoolCodeInput) {
            schoolCodeInput.value = finalSchoolCode;
        }
    }
    
    const result = window.createSchool ? window.createSchool(schoolName, finalSchoolCode, adminPassword) : createSchool(schoolName, finalSchoolCode, adminPassword);
    if (result.success) {
        alert(`School "${schoolName}" created successfully!\n\nSchool Code: ${finalSchoolCode}\n\nShare this code with your students so they can join.`);
        state.phase = 'login';
        render();
    } else {
        alert(result.error || 'Failed to create school');
    }
}

function generateSchoolCode(schoolName) {
    // Generate a school code from the school name
    // Remove special characters, spaces, and convert to uppercase
    let code = schoolName
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '') // Remove spaces
        .toUpperCase()
        .substring(0, 10); // Limit to 10 characters
    
    // If code is too short, pad with numbers
    if (code.length < 3) {
        code = code + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    } else {
        // Add a random number suffix to ensure uniqueness
        code = code + Math.floor(Math.random() * 100).toString().padStart(2, '0');
    }
    
    // Check if code already exists, if so, add more numbers
    const allData = getAllData();
    const schools = allData.schools || {};
    let finalCode = code;
    let attempts = 0;
    
    while (schools[finalCode] && attempts < 100) {
        finalCode = code.substring(0, code.length - 2) + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        attempts++;
    }
    
    return finalCode;
}

function autoGenerateSchoolCode() {
    const schoolName = document.getElementById('school-name-input')?.value.trim();
    const schoolCodeInput = document.getElementById('new-school-code-input');
    
    if (schoolName && schoolCodeInput) {
        const generatedCode = generateSchoolCode(schoolName);
        schoolCodeInput.value = generatedCode;
    }
}

function loginAsSchoolAdmin() {
    const schoolCode = document.getElementById('admin-school-code-input').value.trim().toUpperCase();
    const password = document.getElementById('admin-password-login-input').value.trim();
    
    if (!schoolCode || !password) {
        alert('Please enter school code and password');
        return;
    }
    
    const school = getSchool(schoolCode);
    if (!school) {
        alert('School not found');
        return;
    }
    
    if (school.adminPassword !== password) {
        alert('Incorrect password');
        return;
    }
    
    state.schoolCode = schoolCode;
    state.isSchoolAdmin = true;
    state.isSuperAdmin = false;
    state.username = `admin_${schoolCode}`;
    state.phase = 'school-admin';
    render();
}

function loginAsSuperAdmin() {
    const email = document.getElementById('super-admin-email-input').value.trim();
    const password = document.getElementById('super-admin-password-input').value.trim();
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    if (!verifySuperAdmin(email, password)) {
        alert('Incorrect email or password');
        return;
    }
    
    state.isSuperAdmin = true;
    state.isSchoolAdmin = false;
    state.username = email;
    state.phase = 'super-admin-dashboard';
    render();
}

function logout() {
    // Auto-save scores before logout (no confirmation needed)
    if (state.phase === 'playing' && state.teams.length > 0 && !state.isSuperAdmin) {
        const userData = getUserData(state.username);
        if (!userData.totalScore) userData.totalScore = {};
        state.teams.forEach(team => {
            userData.totalScore[team.name] = (userData.totalScore[team.name] || 0) + team.score;
            team.totalScore = userData.totalScore[team.name];
        });
        saveUserData(state.username, userData);
    }
    if (!state.isSuperAdmin) {
        saveCurrentGame();
    // Data is automatically saved to server via saveAllData
    }
    currentUsername = '';
    localStorage.removeItem('currentUsername');
    state.phase = 'login';
    state.username = '';
    state.isSuperAdmin = false;
    state.isSchoolAdmin = false;
    state.schoolCode = '';
    render();
}

function saveCurrentGame() {
    if (!state.username) return;
    const userData = getUserData(state.username);
    // Save teams (but preserve totalScore separately)
    userData.teams = state.teams.map(team => ({
        name: team.name,
        score: team.score,
        skipped: team.skipped,
        totalScore: team.totalScore
    }));
    userData.currentGameSet = state.currentGameSet;
    if (!userData.totalScore) userData.totalScore = {};
    // Update totalScore for each team
    state.teams.forEach(team => {
        if (!userData.totalScore[team.name]) {
            userData.totalScore[team.name] = team.totalScore || 0;
        } else {
            // Keep the higher total score
            userData.totalScore[team.name] = Math.max(userData.totalScore[team.name], team.totalScore || 0);
        }
    });
    saveUserData(state.username, userData);
}

// Auto-save on page unload
window.addEventListener('beforeunload', () => {
    saveCurrentGame();
    // Data is automatically saved to server via saveAllData
});

// Data is automatically saved to server on every saveAllData call

// Settings Mode
function openSettings() {
    state.phase = 'settings';
    render();
}

function closeSettings() {
    state.phase = 'menu';
    render();
}

// Game Set Management
function createGameSet() {
    const name = prompt('Enter game set name:');
    if (!name) return;
    const setId = 'set_' + Date.now();
    const newSet = {
        name: name,
        description: '',
        cards: [],
        createdAt: new Date().toISOString()
    };
    saveGameSet(setId, newSet);
    state.editingGameSet = setId;
    state.editingCardIndex = 0;
    state.editingCards = [{ id: 1, title: '', family: '', hint: '', taboo: [], soundMethod: '', size: '', sound: '', position: '' }];
    state.phase = 'visual-card-editor';
    render();
}

function editGameSet(setId) {
    state.editingGameSet = setId;
    const gameSets = getGameSets();
    const gameSet = gameSets[setId];
    if (gameSet && gameSet.cards && gameSet.cards.length > 0) {
        // Load existing cards
        state.editingCards = gameSet.cards.map(card => ({
            id: card.id || 0,
            title: card.title || '',
            family: card.family || '',
            hint: card.hint || '',
            taboo: card.taboo || [],
            soundMethod: card.soundMethod || '',
            size: card.size || '',
            sound: card.sound || '',
            position: card.position || ''
        }));
    } else {
        // Start with empty card
        state.editingCards = [{ id: 1, title: '', family: '', hint: '', taboo: [], soundMethod: '', size: '', sound: '', position: '' }];
    }
    state.editingCardIndex = 0;
    state.phase = 'visual-card-editor';
    render();
}

function saveGameSetEdit() {
    const gameSets = getGameSets();
    const gameSet = gameSets[state.editingGameSet];
    if (!gameSet) return;

    gameSet.name = document.getElementById('set-name').value;
    gameSet.description = document.getElementById('set-description').value;
    
    const cardsText = document.getElementById('set-cards').value;
    const lines = cardsText.split('\n').filter(l => l.trim());
    gameSet.cards = lines.map((line, idx) => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 3) {
            const card = {
                id: idx + 1,
                title: parts[0],
                family: parts[1] || 'General',
                hint: parts[2] || '',
                taboo: []
            };
            
            // Find where taboo words end (usually 5 taboo words, but could be more)
            // Educational info starts after hint + taboo words
            let tabooEnd = 3;
            // Look for educational fields (they typically don't match taboo word patterns)
            for (let i = 3; i < parts.length; i++) {
                if (parts[i].toLowerCase().includes('vibrate') || 
                    parts[i].toLowerCase().includes('cm') || 
                    parts[i].toLowerCase().includes('sound:') ||
                    parts[i].toLowerCase().includes('position:')) {
                    tabooEnd = i;
                    break;
                }
            }
            
            // If no educational info found, use all remaining as taboo
            if (tabooEnd === 3) {
                tabooEnd = parts.length;
            }
            
            card.taboo = parts.slice(3, tabooEnd).filter(t => t);
            
            // Extract educational info if present
            if (parts.length > tabooEnd) {
                const remaining = parts.slice(tabooEnd);
                card.soundMethod = remaining[0] || '';
                card.size = remaining[1] || '';
                card.sound = remaining[2] || '';
                card.position = remaining[3] || '';
            }
            
            return card;
        }
        return null;
    }).filter(c => c);

    saveGameSet(state.editingGameSet, gameSet);
    state.editingGameSet = null;
    state.phase = 'menu';
    render();
}

// Visual Card Editor Functions
function saveCurrentEditingCard() {
    if (!state.editingCards || state.editingCardIndex < 0 || state.editingCardIndex >= state.editingCards.length) return;
    
    const card = state.editingCards[state.editingCardIndex];
    card.title = document.getElementById('card-title').value.trim();
    card.family = document.getElementById('card-family').value.trim();
    card.hint = document.getElementById('card-hint').value.trim();
    
    // Get taboo words (split by comma or newline)
    const tabooInput = document.getElementById('card-taboo').value.trim();
    card.taboo = tabooInput ? tabooInput.split(/[,\n\r]+/).map(w => w.trim()).filter(w => w) : [];
    
    // Get extra information
    card.soundMethod = document.getElementById('card-soundMethod').value.trim();
    card.size = document.getElementById('card-size').value.trim();
    card.sound = document.getElementById('card-sound').value.trim();
    card.position = document.getElementById('card-position').value.trim();
    
    // Ensure ID is set
    if (!card.id) {
        card.id = state.editingCardIndex + 1;
    }
}

function nextCard() {
    saveCurrentEditingCard();
    
    // Move to next card or create new one
    if (state.editingCardIndex < state.editingCards.length - 1) {
        state.editingCardIndex++;
    } else {
        // Add new card
        state.editingCards.push({
            id: state.editingCards.length + 1,
            title: '',
            family: '',
            hint: '',
            taboo: [],
            soundMethod: '',
            size: '',
            sound: '',
            position: ''
        });
        state.editingCardIndex = state.editingCards.length - 1;
    }
    
    state.showOrchestraInfo = false;
    render();
}

function previousCard() {
    saveCurrentEditingCard();
    
    if (state.editingCardIndex > 0) {
        state.editingCardIndex--;
    }
    
    state.showOrchestraInfo = false;
    render();
}

function finishEditingCards() {
    saveCurrentEditingCard();
    
    // Save all cards to game set
    const gameSets = getGameSets();
    const gameSet = gameSets[state.editingGameSet];
    if (!gameSet) return;
    
    gameSet.name = document.getElementById('set-name').value;
    gameSet.description = document.getElementById('set-description').value;
    gameSet.cards = state.editingCards.filter(card => card.title.trim() !== '');
    
    saveGameSet(state.editingGameSet, gameSet);
    state.editingGameSet = null;
    state.editingCards = [];
    state.editingCardIndex = 0;
    state.phase = 'menu';
    render();
}

function showAIGenerator() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">🤖 Generate Cards with AI</h3>
            
            <div class="space-y-4 mb-6">
                <div>
                    <label class="block text-sm font-bold mb-2 text-gray-700">Category/Topic *</label>
                    <input id="ai-category" type="text" placeholder="e.g., Musical Instruments, Tempo Terms, Ukulele Chords" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">
                </div>
                
                <div>
                    <label class="block text-sm font-bold mb-2 text-gray-700">Number of Cards</label>
                    <input id="ai-count" type="number" value="5" min="1" max="20" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">
                </div>
                
                <div>
                    <label class="block text-sm font-bold mb-2 text-gray-700">Age Level (optional)</label>
                    <select id="ai-age" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">
                        <option value="">Any age</option>
                        <option value="primary">Primary (5-11 years)</option>
                        <option value="secondary">Secondary (11-16 years)</option>
                    </select>
                </div>
                
                <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-4">
                    <p class="text-xs text-blue-700 mb-2">
                        <strong>💡 Note:</strong> This uses free AI services. Generated cards will be added to your current game set. You can edit them after generation.
                    </p>
                    <details class="text-xs">
                        <summary class="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold">🔑 Optional: Add API Key for Better Results</summary>
                        <div class="mt-2 space-y-2">
                            <div>
                                <label class="block text-xs font-semibold mb-1">Google Gemini API Key (Recommended - Free, No Credit Card)</label>
                                <input id="gemini-api-key" type="password" placeholder="Enter your Gemini API key" class="w-full px-2 py-1 border rounded text-xs mb-1" value="${localStorage.getItem('geminiApiKey') || ''}">
                                <p class="text-xs text-blue-600">Get free key at <a href="https://aistudio.google.com/apikey" target="_blank" class="underline">Google AI Studio</a></p>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold mb-1">OpenAI API Key (Free Trial Available)</label>
                                <input id="openai-api-key" type="password" placeholder="Enter your OpenAI API key" class="w-full px-2 py-1 border rounded text-xs mb-1" value="${localStorage.getItem('openaiApiKey') || ''}">
                                <p class="text-xs text-blue-600">Get key at <a href="https://platform.openai.com/api-keys" target="_blank" class="underline">OpenAI Platform</a> (free trial, then pay-as-you-go)</p>
                            </div>
                            <button onclick="saveApiKeys()" class="w-full px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Save API Keys</button>
                        </div>
                    </details>
                </div>
            </div>
            
            <div id="ai-status" class="mb-4 hidden"></div>
            
            <div class="flex gap-3">
                <button onclick="generateAICards()" class="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">
                    Generate Cards
                </button>
                <button onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold">
                    Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('ai-category').focus();
}

async function generateAICards() {
    try {
        const category = document.getElementById('ai-category').value.trim();
        const count = parseInt(document.getElementById('ai-count').value) || 5;
        const ageLevel = document.getElementById('ai-age').value;
        
        if (!category) {
            alert('Please enter a category/topic');
            return;
        }
        
        const statusDiv = document.getElementById('ai-status');
        statusDiv.className = 'mb-4';
        statusDiv.innerHTML = '<div class="bg-blue-100 border-2 border-blue-300 rounded-lg p-3"><p class="text-blue-700">🔄 Generating cards using free AI service... This may take 20-40 seconds (models may need to "wake up").</p><p class="text-xs mt-2 text-blue-600">Using: Hugging Face Inference API (free, no API key needed)</p></div>';
        
        // Use a free AI service - trying multiple endpoints
        // The AI should work for ANY category, not just predefined ones
        const prompt = `You are an expert at creating educational taboo game cards. Create exactly ${count} unique, specific taboo game cards for the category "${category}"${ageLevel ? ` suitable for ${ageLevel} students (ages ${ageLevel === 'primary' ? '5-11' : '11-16'})` : ''}.

CRITICAL REQUIREMENTS:
1. Each card MUST have a REAL, SPECIFIC title from the "${category}" category
2. DO NOT use generic titles like "Item 1", "Example 1", "${category} Item 1", or any variation
3. Each title must be a real, actual term/concept from "${category}"
4. Taboo words must be 3-5 specific words that people would naturally use to describe that title
5. Hints must help players guess the title WITHOUT using any taboo words
6. Make each card unique and different from the others

For each card, provide this EXACT structure:
{
  "title": "A REAL SPECIFIC TERM FROM ${category}",
  "family": "${category}",
  "hint": "A helpful clue without using taboo words",
  "taboo": ["word1", "word2", "word3", "word4", "word5"],
  "soundMethod": "",
  "size": "",
  "sound": "",
  "position": ""
}

Examples for different categories:
- If category is "Musical Instruments": titles like "Violin", "Piano", "Guitar", "Trumpet"
- If category is "Mathematical Terms": titles like "Addition", "Subtraction", "Multiplication", "Division", "Fraction", "Decimal"
- If category is "Science": titles like "Photosynthesis", "Gravity", "Atom", "Molecule"
- If category is "History": titles like "Renaissance", "Revolution", "Empire", "Monarchy"

Return ONLY a valid JSON array with exactly ${count} cards. Each card must have a unique, real title from "${category}". NO generic titles allowed.

Example for "Musical Instruments" category:
{
  "title": "Violin",
  "family": "Musical Instruments",
  "hint": "Smallest string instrument played with a bow",
  "taboo": ["bow", "strings", "small", "fiddle", "orchestra"],
  "soundMethod": "Bowed strings vibrate to create sound",
  "size": "Smallest (about 60cm long)",
  "sound": "High and bright",
  "position": "Front of orchestra"
}

Example for "Tempo" category:
{
  "title": "Allegro",
  "family": "Tempo",
  "hint": "A fast tempo marking",
  "taboo": ["fast", "quick", "speed", "tempo", "brisk"],
  "soundMethod": "",
  "size": "",
  "sound": "",
  "position": ""
}

Return ONLY a valid JSON array with ${count} cards. Each card must have a unique, specific title. Do NOT use generic titles like "Item 1" or "Category Item". Return ONLY the JSON array, no other text.`;

        let cards = null;
        let lastError = null;
        
        // Try OpenAI API first if API key is available (best quality)
        const openaiApiKey = localStorage.getItem('openaiApiKey');
        if (openaiApiKey) {
            try {
                statusDiv.innerHTML = '<div class="bg-blue-100 border-2 border-blue-300 rounded-lg p-3"><p class="text-blue-700">🔄 Using OpenAI API...</p></div>';
                
                const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${openaiApiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [{
                            role: 'user',
                            content: prompt
                        }],
                        temperature: 0.7,
                        max_tokens: 2000
                    })
                });
                
                if (openaiResponse.ok) {
                    const openaiData = await openaiResponse.json();
                    if (openaiData.choices && openaiData.choices[0]?.message?.content) {
                        const generatedText = openaiData.choices[0].message.content;
                        // Extract JSON from response
                        const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
                        if (jsonMatch) {
                            try {
                                cards = JSON.parse(jsonMatch[0]);
                                if (Array.isArray(cards) && cards.length > 0) {
                                    // Success with OpenAI!
                                }
                            } catch (parseError) {
                                console.log('OpenAI JSON parse error:', parseError);
                            }
                        }
                    }
                } else {
                    const errorData = await openaiResponse.json().catch(() => ({}));
                    console.log('OpenAI API error:', errorData);
                }
            } catch (openaiError) {
                console.log('OpenAI API failed, trying fallback:', openaiError);
            }
        }
        
        // Try Google Gemini API if OpenAI didn't work and Gemini key is available
        if ((!cards || !Array.isArray(cards) || cards.length === 0)) {
            const geminiApiKey = localStorage.getItem('geminiApiKey');
            if (geminiApiKey) {
                try {
                    statusDiv.innerHTML = '<div class="bg-blue-100 border-2 border-blue-300 rounded-lg p-3"><p class="text-blue-700">🔄 Using Google Gemini API...</p></div>';
                    
                    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: prompt
                                }]
                            }]
                        })
                    });
                    
                    if (geminiResponse.ok) {
                        const geminiData = await geminiResponse.json();
                        if (geminiData.candidates && geminiData.candidates[0]?.content?.parts?.[0]?.text) {
                            const generatedText = geminiData.candidates[0].content.parts[0].text;
                            // Extract JSON from response
                            const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
                            if (jsonMatch) {
                                try {
                                    cards = JSON.parse(jsonMatch[0]);
                                    if (Array.isArray(cards) && cards.length > 0) {
                                        // Success with Gemini!
                                    }
                                } catch (parseError) {
                                    console.log('Gemini JSON parse error:', parseError);
                                }
                            }
                        }
                    } else {
                        const errorData = await geminiResponse.json().catch(() => ({}));
                        console.log('Gemini API error:', errorData);
                    }
                } catch (geminiError) {
                    console.log('Gemini API failed, trying fallback:', geminiError);
                }
            }
        }
        
        // If Gemini didn't work, try Hugging Face (free but less reliable)
        if (!cards || !Array.isArray(cards) || cards.length === 0) {
            // Try multiple free AI endpoints with retries
            // Note: Hugging Face models may need to "wake up" if not used recently (can take 20-30 seconds)
            const endpoints = [
            {
                url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    inputs: prompt, 
                    parameters: { 
                        max_new_tokens: 2000, 
                        temperature: 0.7,
                        return_full_text: false
                    } 
                })
            },
            {
                url: 'https://api-inference.huggingface.co/models/google/flan-t5-large',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    inputs: prompt, 
                    parameters: { 
                        max_new_tokens: 1500, 
                        temperature: 0.7 
                    } 
                })
            }
        ];
        
        // Try each endpoint with retries (models may be loading)
        for (const endpoint of endpoints) {
            for (let retry = 0; retry < 2; retry++) {
                try {
                    if (retry > 0) {
                        statusDiv.innerHTML = `<div class="bg-blue-100 border-2 border-blue-300 rounded-lg p-3"><p class="text-blue-700">🔄 Retrying AI service... (attempt ${retry + 1})</p></div>`;
                        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
                    }
                    
                    const response = await fetch(endpoint.url, {
                        method: endpoint.method,
                        headers: endpoint.headers,
                        body: endpoint.body
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        let text = '';
                        
                        // Handle different response formats
                        if (Array.isArray(data) && data[0]?.generated_text) {
                            text = data[0].generated_text;
                        } else if (data.generated_text) {
                            text = data.generated_text;
                        } else if (typeof data === 'string') {
                            text = data;
                        } else if (data.error) {
                            // Model is loading
                            if (data.error.includes('loading') || data.estimated_time) {
                                const waitTime = data.estimated_time || 20;
                                statusDiv.innerHTML = `<div class="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3"><p class="text-yellow-700">⏳ AI model is loading... Estimated wait: ${waitTime} seconds. Please wait...</p></div>`;
                                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                                continue; // Retry after waiting
                            }
                            throw new Error(data.error);
                        }
                        
                        // Try to extract JSON
                        if (text) {
                            const jsonMatch = text.match(/\[[\s\S]*\]/);
                            if (jsonMatch) {
                                try {
                                    cards = JSON.parse(jsonMatch[0]);
                                    if (Array.isArray(cards) && cards.length > 0) {
                                        break; // Success!
                                    }
                                } catch (parseError) {
                                    console.log('JSON parse error, trying next endpoint:', parseError);
                                }
                            }
                        }
                    } else if (response.status === 503) {
                        // Service unavailable - model loading
                        const errorData = await response.json().catch(() => ({}));
                        const waitTime = errorData.estimated_time || 25;
                        statusDiv.innerHTML = `<div class="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3"><p class="text-yellow-700">⏳ AI model is starting up... Estimated wait: ${waitTime} seconds. Please wait...</p></div>`;
                        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                        continue; // Retry after waiting
                    }
                } catch (err) {
                    lastError = err;
                    if (retry === 1) {
                        console.log(`Endpoint ${endpoint.url} failed after retries:`, err);
                    }
                }
            }
            
            if (cards && Array.isArray(cards) && cards.length > 0) {
                break; // Success, stop trying other endpoints
            }
        }
        
        // If AI failed, try template-based generation as fallback (only for known categories)
        if (!cards || !Array.isArray(cards) || cards.length === 0) {
            // Only use templates for known categories, otherwise show helpful message
            const knownCategories = ['Musical Instruments', 'Tempo', 'Dynamics', 'Chords', 'Rhythm', 'Brass Band'];
            const isKnownCategory = knownCategories.some(cat => cat.toLowerCase() === category.toLowerCase());
            
            if (isKnownCategory) {
                statusDiv.innerHTML = '<div class="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3"><p class="text-yellow-700">⚠️ AI service unavailable. Using template-based generation...</p></div>';
                cards = generateCardsTemplate(category, count, ageLevel);
            } else {
                // For unknown categories, show message with retry button
                statusDiv.innerHTML = `<div class="bg-orange-100 border-2 border-orange-300 rounded-lg p-3">
                    <p class="text-orange-700">⚠️ AI service is currently unavailable or slow. The AI should be able to generate cards for "${category}".</p>
                    <p class="text-sm mt-2">The free AI service may need time to "wake up" (20-40 seconds on first use).</p>
                    <div class="flex gap-2 mt-3">
                        <button onclick="generateAICards()" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold">
                            🔄 Retry Now
                        </button>
                        <button onclick="document.querySelector('.fixed').remove()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold">
                            Use Manual Editor
                        </button>
                    </div>
                </div>`;
                return;
            }
        }
        
        // Validate and add cards
        if (!Array.isArray(cards) || cards.length === 0) {
            statusDiv.innerHTML = `<div class="bg-red-100 border-2 border-red-300 rounded-lg p-3"><p class="text-red-700">❌ No cards could be generated. Please use the manual card editor instead.</p></div>`;
            return;
        }
        
        // Add generated cards to editing cards
        saveCurrentEditingCard();
        
        const startIndex = state.editingCards.length;
        let validCardsAdded = 0;
        cards.slice(0, count).forEach((card, idx) => {
            if (card && card.title) {
                // Ensure taboo words are properly formatted
                let tabooWords = [];
                if (Array.isArray(card.taboo) && card.taboo.length > 0) {
                    tabooWords = card.taboo.filter(w => w && w.trim() && w.length > 0).slice(0, 5);
                } else if (typeof card.taboo === 'string' && card.taboo.trim()) {
                    // If taboo is a string, split it
                    tabooWords = card.taboo.split(/[,\n]/).map(w => w.trim()).filter(w => w && w.length > 0).slice(0, 5);
                }
                
                // If no taboo words, generate some basic ones based on title
                if (tabooWords.length === 0) {
                    const titleLower = (card.title || '').toLowerCase();
                    const titleWords = titleLower.split(/\s+/).filter(w => w.length > 2);
                    tabooWords = [
                        ...titleWords.slice(0, 2),
                        category.toLowerCase(),
                        'term',
                        'word'
                    ].filter(w => w && w.length > 0).slice(0, 5);
                }
                
                state.editingCards.push({
                    id: startIndex + idx + 1,
                    title: card.title || '',
                    family: card.family || category,
                    hint: card.hint || `A ${category.toLowerCase()} term - describe it without using the taboo words`,
                    taboo: tabooWords,
                    soundMethod: card.soundMethod || '',
                    size: card.size || '',
                    sound: card.sound || '',
                    position: card.position || ''
                });
                validCardsAdded++;
            }
        });
        
        // Move to first generated card
        if (state.editingCards.length > startIndex) {
            state.editingCardIndex = startIndex;
        }
        
        const addedCount = validCardsAdded;
        if (addedCount < count) {
            statusDiv.innerHTML = `<div class="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3"><p class="text-yellow-700">⚠️ Generated ${addedCount} valid cards (requested ${count}). Some generic cards were filtered out. You can edit them now or generate more.</p></div>`;
        } else {
            statusDiv.innerHTML = `<div class="bg-green-100 border-2 border-green-300 rounded-lg p-3"><p class="text-green-700">✅ Generated ${addedCount} cards! They've been added to your game set. You can edit them now.</p></div>`;
        }
        
        setTimeout(() => {
            const modal = document.querySelector('.fixed');
            if (modal) modal.remove();
            render();
        }, 2000);
    }
        
    } catch (error) {
        console.error('AI generation error:', error);
        const statusDiv = document.getElementById('ai-status');
        if (statusDiv) {
            statusDiv.innerHTML = `<div class="bg-red-100 border-2 border-red-300 rounded-lg p-3"><p class="text-red-700">❌ Error: ${error.message}. Please try again or create cards manually.</p></div>`;
        }
    }
}

// Fallback template-based card generation
function generateCardsTemplate(category, count, ageLevel) {
    const templates = {
        'Musical Instruments': [
            { title: 'Violin', hint: 'Smallest string instrument played with a bow', taboo: ['bow', 'strings', 'small', 'fiddle', 'orchestra'] },
            { title: 'Piano', hint: 'Keyboard instrument with black and white keys', taboo: ['keys', 'keyboard', 'black', 'white', 'grand'] },
            { title: 'Guitar', hint: 'Stringed instrument you strum or pluck', taboo: ['strings', 'strum', 'acoustic', 'electric', 'pick'] },
            { title: 'Drums', hint: 'Percussion instrument you hit with sticks', taboo: ['beat', 'sticks', 'percussion', 'rhythm', 'drum'] },
            { title: 'Flute', hint: 'Woodwind instrument you blow across', taboo: ['blow', 'woodwind', 'breath', 'pipe', 'air'] },
            { title: 'Trumpet', hint: 'Brass instrument with three valves', taboo: ['brass', 'valves', 'horn', 'loud', 'blow'] },
            { title: 'Cello', hint: 'Large string instrument you sit to play', taboo: ['strings', 'large', 'bow', 'bass', 'sit'] },
            { title: 'Saxophone', hint: 'Brass instrument with a reed mouthpiece', taboo: ['reed', 'brass', 'jazz', 'blow', 'sax'] }
        ],
        'Tempo': [
            { title: 'Allegro', hint: 'A fast tempo marking in music', taboo: ['fast', 'quick', 'speed', 'tempo', 'brisk'] },
            { title: 'Adagio', hint: 'A slow, calm tempo marking', taboo: ['slow', 'calm', 'peaceful', 'tempo', 'gentle'] },
            { title: 'Presto', hint: 'A very fast tempo marking', taboo: ['very', 'fast', 'quick', 'speed', 'rapid'] },
            { title: 'Largo', hint: 'A slow, broad tempo marking', taboo: ['slow', 'broad', 'wide', 'tempo', 'stately'] },
            { title: 'Andante', hint: 'A walking pace tempo', taboo: ['walking', 'moderate', 'tempo', 'pace', 'steady'] },
            { title: 'Moderato', hint: 'A moderate tempo marking', taboo: ['moderate', 'medium', 'tempo', 'pace', 'normal'] },
            { title: 'Vivace', hint: 'A lively, fast tempo marking', taboo: ['lively', 'fast', 'quick', 'tempo', 'energetic'] }
        ],
        'Dynamics': [
            { title: 'Forte', hint: 'Play loudly', taboo: ['loud', 'strong', 'powerful', 'volume', 'f'] },
            { title: 'Piano', hint: 'Play softly', taboo: ['soft', 'quiet', 'gentle', 'volume', 'p'] },
            { title: 'Crescendo', hint: 'Gradually get louder', taboo: ['louder', 'increase', 'grow', 'volume', 'rise'] },
            { title: 'Diminuendo', hint: 'Gradually get softer', taboo: ['softer', 'decrease', 'fade', 'volume', 'dim'] },
            { title: 'Mezzo', hint: 'Moderately (medium)', taboo: ['medium', 'half', 'moderate', 'volume', 'middle'] },
            { title: 'Sforzando', hint: 'Sudden strong accent', taboo: ['sudden', 'accent', 'strong', 'emphasis', 'sfz'] }
        ],
        'Chords': [
            { title: 'C Major', hint: 'A major chord starting on C', taboo: ['c', 'major', 'chord', 'white', 'key'] },
            { title: 'G Major', hint: 'A major chord starting on G', taboo: ['g', 'major', 'chord', 'sharp', 'key'] },
            { title: 'F Major', hint: 'A major chord starting on F', taboo: ['f', 'major', 'chord', 'flat', 'key'] },
            { title: 'A Minor', hint: 'A minor chord starting on A', taboo: ['a', 'minor', 'chord', 'sad', 'key'] },
            { title: 'E Minor', hint: 'A minor chord starting on E', taboo: ['e', 'minor', 'chord', 'sad', 'key'] },
            { title: 'D Major', hint: 'A major chord starting on D', taboo: ['d', 'major', 'chord', 'sharp', 'key'] }
        ],
        'Rhythm': [
            { title: 'Quarter Note', hint: 'A note worth one beat', taboo: ['one', 'beat', 'note', 'rhythm', 'count'] },
            { title: 'Half Note', hint: 'A note worth two beats', taboo: ['two', 'beats', 'note', 'rhythm', 'long'] },
            { title: 'Whole Note', hint: 'A note worth four beats', taboo: ['four', 'beats', 'note', 'rhythm', 'longest'] },
            { title: 'Eighth Note', hint: 'A note worth half a beat', taboo: ['half', 'beat', 'note', 'rhythm', 'short'] },
            { title: 'Rest', hint: 'A silence in music', taboo: ['silence', 'pause', 'stop', 'no', 'sound'] },
            { title: 'Beat', hint: 'The pulse of the music', taboo: ['pulse', 'rhythm', 'time', 'count', 'tempo'] }
        ],
        'Brass Band': [
            { title: 'Cornet', hint: 'A brass instrument similar to a trumpet', taboo: ['brass', 'trumpet', 'valves', 'horn', 'band'] },
            { title: 'Euphonium', hint: 'A medium-sized brass instrument', taboo: ['brass', 'valves', 'medium', 'horn', 'band'] },
            { title: 'Trombone', hint: 'A brass instrument with a slide', taboo: ['brass', 'slide', 'horn', 'band', 'long'] },
            { title: 'Tuba', hint: 'The largest and lowest brass instrument', taboo: ['brass', 'large', 'low', 'horn', 'band'] },
            { title: 'Baritone', hint: 'A smaller brass instrument', taboo: ['brass', 'small', 'valves', 'horn', 'band'] }
        ]
    };
    
    // Try to find matching template (case-insensitive)
    const categoryLower = category.toLowerCase();
    let template = null;
    for (const [key, value] of Object.entries(templates)) {
        if (key.toLowerCase() === categoryLower) {
            template = value;
            break;
        }
    }
    
    let items = [];
    
    if (template) {
        items = template.slice(0, count);
    } else {
        // For unknown categories, we can't generate meaningful cards automatically
        // Show a message and return empty array so user knows to use manual editor
        alert(`Sorry, I don't have templates for "${category}".\n\nPlease use the manual card editor to create cards for this category, or try a category like:\n- Musical Instruments\n- Tempo\n- Dynamics\n- Chords\n- Rhythm\n- Brass Band`);
        return [];
    }
    
    return items.map((item) => ({
        title: item.title,
        family: category,
        hint: item.hint || `A ${category.toLowerCase()} term - describe it without using the taboo words`,
        taboo: Array.isArray(item.taboo) ? item.taboo : [item.title.toLowerCase(), category.toLowerCase(), 'term'],
        soundMethod: '',
        size: '',
        sound: '',
        position: ''
    }));
}

function deleteGameSetConfirm(setId) {
    if (confirm('Are you sure you want to delete this game set?')) {
        deleteGameSet(setId);
        // If we deleted the current game set, switch to first available
        if (state.currentGameSet === setId) {
            const gameSets = getGameSets();
            const firstSetId = Object.keys(gameSets)[0];
            if (firstSetId) {
                state.currentGameSet = firstSetId;
            }
        }
        render();
    }
}

// Team Management
function addTeam() {
    if (state.teams.length < 6) {
        const teamNum = state.teams.length + 1;
        const userData = getUserData(state.username);
        const teamName = `Team ${teamNum}`;
        const totalScore = userData.totalScore?.[teamName] || 0;
        state.teams.push({ 
            name: teamName, 
            score: 0, 
            skipped: 0,
            totalScore: totalScore
        });
        saveCurrentGame();
        render();
    }
}

function removeTeam(index) {
    if (state.teams.length > 2) {
        state.teams.splice(index, 1);
        saveCurrentGame();
        render();
    }
}

function updateTeamName(index, newName) {
    const oldName = state.teams[index].name;
    const newTeamName = newName || `Team ${index + 1}`;
    
    if (oldName !== newTeamName) {
        // Update totalScore key if name changed
        const userData = getUserData(state.username);
        if (userData.totalScore && userData.totalScore[oldName] !== undefined) {
            userData.totalScore[newTeamName] = userData.totalScore[oldName];
            delete userData.totalScore[oldName];
            saveUserData(state.username, userData);
        }
        state.teams[index].name = newTeamName;
        state.teams[index].totalScore = userData.totalScore?.[newTeamName] || state.teams[index].totalScore || 0;
    }
    saveCurrentGame();
}

// Game Logic
function selectGameSet(setId) {
    state.currentGameSet = setId;
    const userData = getUserData(state.username);
    userData.currentGameSet = setId;
    saveUserData(state.username, userData);
    state.phase = 'setup';
    render();
}

function startGame() {
    try {
        const inputs = document.querySelectorAll('.team-input');
        inputs.forEach((input, index) => {
            if (index < state.teams.length) {
                const name = input.value.trim() || `Team ${index + 1}`;
                updateTeamName(index, name);
            }
        });

        const gameSets = getGameSets();
        const currentSet = gameSets[state.currentGameSet];
        
        if (!currentSet) {
            alert(`Game set not found! Please select a game set from the menu.`);
            state.phase = 'menu';
            render();
            return;
        }
        
        if (!currentSet.cards || currentSet.cards.length === 0) {
            alert(`No cards available in "${currentSet.name}"! This game set has ${currentSet.cards?.length || 0} cards.`);
            return;
        }

        // Reset current game scores to 0 (but keep totalScore)
        state.teams.forEach(team => {
            team.score = 0;
            team.skipped = 0;
        });
        state.history = [];
        state.currentTeam = 0;
        state.currentCard = null;
        state.showOrchestraInfo = false;

        state.phase = 'playing';
        
        // Ensure shuffle function is available
        if (typeof shuffle !== 'function') {
            console.error('Shuffle function not found');
            alert('Error: Shuffle function not available. Please refresh the page.');
            return;
        }
        
        state.remaining = shuffle([...currentSet.cards]);
        
        if (state.remaining.length === 0) {
            alert('Error: No cards were shuffled. Please check the game set.');
            return;
        }
        
        saveCurrentGame();
        drawCard();
        render();
    } catch (error) {
        console.error('Error starting game:', error);
        alert('Error starting game: ' + error.message);
    }
}

function finishGame() {
    const userData = getUserData(state.username);
    if (!userData.totalScore) userData.totalScore = {};
    state.teams.forEach(team => {
        userData.totalScore[team.name] = (userData.totalScore[team.name] || 0) + team.score;
        team.totalScore = userData.totalScore[team.name];
    });
    
    // Save game to history
    const gameSets = getGameSets();
    const gameSetName = gameSets[state.currentGameSet]?.name || 'Unknown';
    const gameRecord = {
        date: new Date().toISOString(),
        gameSet: state.currentGameSet,
        gameSetName: gameSetName,
        username: state.username,
        teams: state.teams.map(team => ({
            name: team.name,
            score: team.score,
            skipped: team.skipped
        })),
        totalCards: state.history.length,
        correct: state.history.filter(h => h.result === 'correct').length,
        skipped: state.history.filter(h => h.result === 'skip').length
    };
    
    if (!userData.gameHistory) userData.gameHistory = [];
    userData.gameHistory.unshift(gameRecord); // Add to beginning (most recent first)
    // Keep only last 50 games
    if (userData.gameHistory.length > 50) {
        userData.gameHistory = userData.gameHistory.slice(0, 50);
    }
    
    saveUserData(state.username, userData);
    saveCurrentGame();
    
    // Data is automatically saved to server via saveAllData
    
    state.phase = 'detailed-scores';
    render();
}

function drawCard() {
    if (state.remaining.length === 0) {
        state.phase = 'over';
        const userData = getUserData(state.username);
        if (!userData.totalScore) userData.totalScore = {};
        state.teams.forEach(team => {
            userData.totalScore[team.name] = (userData.totalScore[team.name] || 0) + team.score;
            team.totalScore = userData.totalScore[team.name];
        });
        saveUserData(state.username, userData);
        saveCurrentGame();
        render();
        return;
    }
    state.currentCard = state.remaining.shift();
    state.showOrchestraInfo = false;
    render();
}

function correct() {
    const team = state.teams[state.currentTeam];
    team.score++;
    state.history.push({
        team: state.currentTeam,
        card: state.currentCard,
        result: 'correct'
    });
    makeConfetti();
    state.showOrchestraInfo = false;
    setTimeout(() => {
        state.currentTeam = (state.currentTeam + 1) % state.teams.length;
        drawCard();
    }, 600);
}

function skip() {
    const team = state.teams[state.currentTeam];
    team.skipped++;
    state.history.push({
        team: state.currentTeam,
        card: state.currentCard,
        result: 'skip'
    });
    state.currentTeam = (state.currentTeam + 1) % state.teams.length;
    state.showOrchestraInfo = false;
    drawCard();
}

function toggleOrchestraInfo() {
    if (!state.currentCard) return; // Don't toggle if no card
    state.showOrchestraInfo = !state.showOrchestraInfo;
    render();
}

// Make function globally accessible
window.toggleOrchestraInfo = toggleOrchestraInfo;
window.skip = skip;
window.correct = correct;
window.drawCard = drawCard;
window.finishGame = finishGame;

function updateCardPreview() {
    // Update preview in real-time
    const title = document.getElementById('card-title')?.value || '';
    const family = document.getElementById('card-family')?.value || '';
    const hint = document.getElementById('card-hint')?.value || '';
    const tabooInput = document.getElementById('card-taboo')?.value || '';
    const tabooWords = tabooInput ? tabooInput.split(/[,\n]/).map(w => w.trim()).filter(w => w) : [];
    
    // Update preview elements
    const previewTitle = document.getElementById('preview-title');
    const previewTitleBack = document.getElementById('preview-title-back');
    const previewFamily = document.getElementById('preview-family');
    const previewFamilyBack = document.getElementById('preview-family-back');
    const previewHint = document.getElementById('preview-hint');
    const previewTaboo = document.getElementById('preview-taboo');
    
    if (previewTitle) previewTitle.textContent = title || 'Card Title';
    if (previewTitleBack) previewTitleBack.textContent = title || 'Card Title';
    if (previewFamily) previewFamily.textContent = family || 'Family';
    if (previewFamilyBack) previewFamilyBack.textContent = family || 'Family';
    if (previewHint) previewHint.textContent = hint || 'Hint text here';
    
    if (previewTaboo) {
        previewTaboo.innerHTML = tabooWords.length > 0 
            ? tabooWords.map(w => `<span class="bg-red-200 text-red-700 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold">${w}</span>`).join('')
            : '<span class="text-red-600 text-xs">No taboo words</span>';
    }
    
    // Re-render to update back of card
    if (state.phase === 'visual-card-editor') {
        render();
    }
}

// Make functions globally accessible
window.nextCard = nextCard;
window.previousCard = previousCard;
window.finishEditingCards = finishEditingCards;
window.updateCardPreview = updateCardPreview;
window.showAIGenerator = showAIGenerator;
window.generateAICards = generateAICards;
window.saveApiKeys = saveApiKeys;
window.login = login;
window.createNewSchool = createNewSchool;
window.loginAsSchoolAdmin = loginAsSchoolAdmin;
window.loginAsSuperAdmin = loginAsSuperAdmin;
window.openResetPasswordModal = openResetPasswordModal;
window.confirmResetPassword = confirmResetPassword;
window.checkIfUserExists = checkIfUserExists;

function checkIfUserExists() {
    const schoolCode = document.getElementById('school-code-input')?.value.trim().toUpperCase();
    const username = document.getElementById('username-input')?.value.trim();
    const passwordContainer = document.getElementById('password-field-container');
    
    if (schoolCode && username && passwordContainer) {
        const school = getSchool(schoolCode);
        if (school && school.users[username] && school.users[username].password) {
            passwordContainer.style.display = 'block';
        } else {
            passwordContainer.style.display = 'none';
        }
    }
}

function saveApiKeys() {
    const geminiKey = document.getElementById('gemini-api-key').value.trim();
    const openaiKey = document.getElementById('openai-api-key').value.trim();
    
    if (geminiKey) {
        localStorage.setItem('geminiApiKey', geminiKey);
    } else {
        localStorage.removeItem('geminiApiKey');
    }
    
    if (openaiKey) {
        localStorage.setItem('openaiApiKey', openaiKey);
    } else {
        localStorage.removeItem('openaiApiKey');
    }
    
    alert('API keys saved! They will be used for future card generation.');
}

function deleteScoreEntry(username, date) {
    if (!confirm(`Are you sure you want to delete this score entry for ${username}?`)) {
        return;
    }
    
    const allData = getAllData();
    if (allData.users[username] && allData.users[username].gameHistory) {
        // Remove the entry with matching date
        allData.users[username].gameHistory = allData.users[username].gameHistory.filter(
            game => game.date !== date
        );
        saveAllData(allData);
        render(); // Re-render to show updated list
    }
}

// Backup functionality removed - all data saves directly to server

function getOrchestraPosition(instrument) {
    const position = instrument.position || '';
    if (!position) return null;
    
    // Map positions to orchestra sections
    const positionMap = {
        'Front of orchestra': { section: 'Strings', row: 1, description: 'Front row - closest to conductor' },
        'Front-middle of orchestra': { section: 'Strings', row: 2, description: 'Second row from front' },
        'Middle of orchestra': { section: 'Woodwinds', row: 3, description: 'Middle section' },
        'Middle-back of orchestra': { section: 'Strings/Woodwinds', row: 4, description: 'Behind middle section' },
        'Back of string section': { section: 'Strings', row: 2, description: 'Back of string section' },
        'Back of orchestra': { section: 'Brass/Percussion', row: 5, description: 'Back row - furthest from conductor' }
    };
    
    for (const [key, value] of Object.entries(positionMap)) {
        if (position.includes(key) || position.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }
    
    // Default based on family
    if (instrument.family === 'Strings') {
        return { section: 'Strings', row: 1, description: 'Front section of orchestra' };
    } else if (instrument.family === 'Woodwind') {
        return { section: 'Woodwinds', row: 3, description: 'Middle section of orchestra' };
    } else if (instrument.family === 'Brass') {
        return { section: 'Brass', row: 5, description: 'Back section of orchestra' };
    } else if (instrument.family === 'Percussion') {
        return { section: 'Percussion', row: 5, description: 'Back section of orchestra' };
    }
    
    return { section: 'Orchestra', row: 3, description: position };
}

function reset() {
    const userData = getUserData(state.username);
    if (!userData.totalScore) userData.totalScore = {};
    state.teams.forEach(team => {
        userData.totalScore[team.name] = (userData.totalScore[team.name] || 0) + team.score;
        team.totalScore = userData.totalScore[team.name];
    });
    saveUserData(state.username, userData);

    state.teams.forEach(team => {
        team.score = 0;
        team.skipped = 0;
    });
    state.phase = 'setup';
    state.currentTeam = 0;
    state.currentCard = null;
    state.remaining = [];
    state.history = [];
    saveCurrentGame();
    render();
}

function clearAllScores() {
    if (confirm('Are you sure you want to clear all saved scores? This cannot be undone.')) {
        const userData = getUserData(state.username);
        userData.totalScore = {};
        state.teams.forEach(team => {
            team.totalScore = 0;
        });
        saveUserData(state.username, userData);
        render();
    }
}

// Render function with 3D cards and improved layout
function render() {
    const app = document.getElementById('app');
    const teamColors = ['team-colors-1', 'team-colors-2', 'team-colors-3', 'team-colors-4', 'team-colors-5', 'team-colors-6'];
    const gameSets = getGameSets();

    if (state.phase === 'login') {
        app.innerHTML = `
            <div class="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-indigo-600 to-purple-700">
                <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                    <h1 class="text-5xl font-bold text-gray-800 mb-2 text-center">🎵 Music Taboo</h1>
                    <p class="text-gray-600 mb-2 text-center font-semibold">Sign in to play or create a new school account</p>
                    
                    <div class="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <p class="text-xs text-blue-800 font-semibold mb-1">👨‍🏫 For Teachers/Admins:</p>
                        <p class="text-xs text-blue-700">Create a school account to manage your class. You'll need an email address.</p>
                        <p class="text-xs text-blue-800 font-semibold mt-2 mb-1">👦👧 For Students:</p>
                        <p class="text-xs text-blue-700">Just enter your school code and a nickname. <strong>Never use your full name!</strong></p>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-bold mb-2 text-gray-700">School Code *</label>
                        <input 
                            id="school-code-input" 
                            type="text" 
                            placeholder="Enter school code (e.g., ABC123)" 
                            class="w-full px-4 py-3 border-2 border-indigo-400 rounded-lg focus:outline-none text-center text-lg uppercase"
                            onkeypress="if(event.key==='Enter') document.getElementById('username-input').focus()"
                            autofocus
                        >
                        <p class="text-xs text-gray-500 mt-1">Don't have a code? <button onclick="state.phase = 'create-school'; render();" class="text-indigo-600 hover:underline font-semibold">Create New School Account</button></p>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-bold mb-2 text-gray-700">Username (Use a nickname!) *</label>
                        <input 
                            id="username-input" 
                            type="text" 
                            placeholder="Enter a nickname (not your full name)" 
                            class="w-full px-4 py-3 border-2 border-indigo-400 rounded-lg focus:outline-none text-center text-lg"
                            onkeypress="if(event.key==='Enter') { const emailInput = document.getElementById('email-input'); if (emailInput && emailInput.style.display !== 'none') { emailInput.focus(); } else { login(); } }"
                        >
                        <p class="text-xs text-amber-600 mt-1 font-semibold">⚠️ Use a nickname only - never your full name!</p>
                    </div>
                    
                    <div class="mb-4" id="email-field-container">
                        <label class="block text-sm font-bold mb-2 text-gray-700">Email Address <span class="text-xs text-gray-500">(Optional - for teachers/admins only)</span></label>
                        <input 
                            id="email-input" 
                            type="email" 
                            placeholder="Enter your email (optional)" 
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none text-center text-lg"
                            onkeypress="if(event.key==='Enter') { const passwordInput = document.getElementById('password-input'); if (passwordInput && passwordInput.style.display !== 'none') { passwordInput.focus(); } else { login(); } }"
                        >
                        <p class="text-xs text-gray-500 mt-1">Students don't need to enter email. Only teachers/admins need this for password resets.</p>
                    </div>
                    
                    <div class="mb-4" id="password-field-container" style="display: none;">
                        <label class="block text-sm font-bold mb-2 text-gray-700">Password</label>
                        <input 
                            id="password-input" 
                            type="password" 
                            placeholder="Enter password (if set)" 
                            class="w-full px-4 py-3 border-2 border-indigo-400 rounded-lg focus:outline-none text-center text-lg"
                            onkeypress="if(event.key==='Enter') login()"
                        >
                    </div>
                    
                    <div class="mb-4 grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold mb-1 text-gray-700">Subject (optional)</label>
                            <input 
                                id="subject-input" 
                                type="text" 
                                placeholder="e.g., Music" 
                                class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none text-sm"
                            >
                        </div>
                        <div>
                            <label class="block text-xs font-bold mb-1 text-gray-700">Year Group (optional)</label>
                            <input 
                                id="year-group-input" 
                                type="text" 
                                placeholder="e.g., Year 6" 
                                class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none text-sm"
                            >
                        </div>
                    </div>
                    
                    <div class="mb-4 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                        <p class="font-semibold">🛡️ Safety Reminder:</p>
                        <p>Always use a nickname, never your full name. Keep your personal information safe!</p>
                    </div>

                    <div id="login-error-container"></div>
                    
                    <button onclick="login()" class="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 text-lg mb-3">
                        Sign In
                    </button>
                    
                    <div class="flex gap-2">
                        <button onclick="state.phase = 'school-admin-login'; render();" class="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 text-sm">
                            School Admin
                        </button>
                        <button onclick="state.phase = 'super-admin-login'; render();" class="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 text-sm">
                            Super Admin
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else if (state.phase === 'create-school') {
        app.innerHTML = `
            <div class="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-indigo-600 to-purple-700">
                <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                    <h2 class="text-3xl font-bold text-gray-800 mb-4 text-center">Create New School</h2>
                    
                    <div class="mb-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                        <p class="text-sm text-green-800 font-semibold mb-1">👨‍🏫 Creating a School Account</p>
                        <p class="text-xs text-green-700">This is for teachers and administrators. You'll need an email address to create and manage your school account.</p>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-bold mb-2 text-gray-700">School Name *</label>
                        <input 
                            id="school-name-input" 
                            type="text" 
                            placeholder="e.g., St. Mary's Primary" 
                            class="w-full px-4 py-3 border-2 border-indigo-400 rounded-lg focus:outline-none"
                            oninput="autoGenerateSchoolCode()"
                            autofocus
                        >
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-bold mb-2 text-gray-700">School Code *</label>
                        <div class="flex gap-2">
                            <input 
                                id="new-school-code-input" 
                                type="text" 
                                placeholder="Auto-generated from school name" 
                                class="flex-1 px-4 py-3 border-2 border-indigo-400 rounded-lg focus:outline-none uppercase bg-gray-50"
                                maxlength="20"
                                readonly
                            >
                            <button onclick="autoGenerateSchoolCode()" class="px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-semibold" title="Regenerate code">
                                🔄
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Code is auto-generated from school name. Share this code with your students so they can join.</p>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-bold mb-2 text-gray-700">Your Email Address *</label>
                        <input 
                            id="admin-email-input" 
                            type="email" 
                            placeholder="your.email@school.com" 
                            class="w-full px-4 py-3 border-2 border-indigo-400 rounded-lg focus:outline-none"
                        >
                        <p class="text-xs text-gray-500 mt-1">Required for account recovery and password resets</p>
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-bold mb-2 text-gray-700">Admin Password *</label>
                        <input 
                            id="admin-password-input" 
                            type="password" 
                            placeholder="Create admin password" 
                            class="w-full px-4 py-3 border-2 border-indigo-400 rounded-lg focus:outline-none"
                        >
                        <p class="text-xs text-gray-500 mt-1">Used to access school admin dashboard</p>
                    </div>

                    <button onclick="createNewSchool()" class="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 text-lg mb-3">
                        Create School
                    </button>
                    
                    <button onclick="state.phase = 'login'; render();" class="w-full bg-gray-500 text-white font-bold py-3 rounded-xl hover:bg-gray-600 text-sm">
                        Back to Login
                    </button>
                </div>
            </div>
        `;
    } else if (state.phase === 'school-admin-login') {
        app.innerHTML = `
            <div class="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-indigo-600 to-purple-700">
                <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                    <h2 class="text-3xl font-bold text-gray-800 mb-4 text-center">School Admin Login</h2>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-bold mb-2 text-gray-700">School Code *</label>
                        <input 
                            id="admin-school-code-input" 
                            type="text" 
                            placeholder="Enter school code" 
                            class="w-full px-4 py-3 border-2 border-indigo-400 rounded-lg focus:outline-none text-center text-lg uppercase"
                        >
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-bold mb-2 text-gray-700">Admin Password *</label>
                        <input 
                            id="admin-password-login-input" 
                            type="password" 
                            placeholder="Enter admin password" 
                            class="w-full px-4 py-3 border-2 border-indigo-400 rounded-lg focus:outline-none"
                        >
                    </div>

                    <button onclick="loginAsSchoolAdmin()" class="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 text-lg mb-3">
                        Login as Admin
                    </button>
                    
                    <button onclick="state.phase = 'login'; render();" class="w-full bg-gray-500 text-white font-bold py-3 rounded-xl hover:bg-gray-600 text-sm">
                        Back to Login
                    </button>
                </div>
            </div>
        `;
    } else if (state.phase === 'super-admin-login') {
        app.innerHTML = `
            <div class="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-red-600 to-orange-700">
                <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                    <h2 class="text-3xl font-bold text-gray-800 mb-4 text-center">🔐 Super Admin Login</h2>
                    <p class="text-gray-600 mb-6 text-center text-sm">Access all schools and usage statistics</p>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-bold mb-2 text-gray-700">Email *</label>
                        <input 
                            id="super-admin-email-input" 
                            type="email" 
                            placeholder="Enter admin email" 
                            class="w-full px-4 py-3 border-2 border-red-400 rounded-lg focus:outline-none"
                            onkeypress="if(event.key==='Enter') document.getElementById('super-admin-password-input').focus()"
                            autofocus
                        >
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-bold mb-2 text-gray-700">Password *</label>
                        <input 
                            id="super-admin-password-input" 
                            type="password" 
                            placeholder="Enter admin password" 
                            class="w-full px-4 py-3 border-2 border-red-400 rounded-lg focus:outline-none"
                            onkeypress="if(event.key==='Enter') loginAsSuperAdmin()"
                        >
                    </div>

                    <button onclick="loginAsSuperAdmin()" class="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 text-lg mb-3">
                        Login as Super Admin
                    </button>
                    
                    <button onclick="state.phase = 'login'; render();" class="w-full bg-gray-500 text-white font-bold py-3 rounded-xl hover:bg-gray-600 text-sm">
                        Back to Login
                    </button>
                </div>
            </div>
        `;
    } else if (state.phase === 'super-admin-dashboard') {
        const stats = getAllSchoolsStats();
        app.innerHTML = `
            <div class="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <div class="max-w-7xl mx-auto">
                    <div class="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6">
                        <div class="flex justify-between items-center mb-6">
                            <div>
                                <h1 class="text-4xl font-bold text-gray-800 mb-2">🔐 Super Admin Dashboard</h1>
                                <p class="text-gray-600">Overview of all schools and usage statistics</p>
                            </div>
                            <button onclick="logout()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">
                                Logout
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                                <div class="text-3xl font-bold mb-1">${stats.totalSchools}</div>
                                <div class="text-blue-100">Total Schools</div>
                            </div>
                            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                                <div class="text-3xl font-bold mb-1">${stats.totalUsers}</div>
                                <div class="text-green-100">Total Users</div>
                            </div>
                            <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                                <div class="text-3xl font-bold mb-1">${stats.totalGames}</div>
                                <div class="text-purple-100">Total Games Played</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">📊 All Schools</h2>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="px-4 py-3 font-bold text-gray-700">School Name</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Code</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Users</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Games</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Created</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Last Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${stats.schools.map(school => `
                                        <tr class="border-b hover:bg-gray-50">
                                            <td class="px-4 py-3 font-semibold">${school.name}</td>
                                            <td class="px-4 py-3 text-gray-600 font-mono text-sm">${school.code}</td>
                                            <td class="px-4 py-3">${school.userCount}</td>
                                            <td class="px-4 py-3">${school.gameCount}</td>
                                            <td class="px-4 py-3 text-sm text-gray-600">${new Date(school.createdAt).toLocaleDateString()}</td>
                                            <td class="px-4 py-3 text-sm text-gray-600">${school.lastActivity ? new Date(school.lastActivity).toLocaleDateString() : 'Never'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">👥 All Users</h2>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="px-4 py-3 font-bold text-gray-700">Username</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Email</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">School</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Subject</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Year Group</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Games</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Joined</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${stats.allUsers.length > 0 ? stats.allUsers.map(user => `
                                        <tr class="border-b hover:bg-gray-50">
                                            <td class="px-4 py-3 font-semibold">${user.username}</td>
                                            <td class="px-4 py-3 text-gray-600">${user.email || '<span class="text-gray-400 italic">No email</span>'}</td>
                                            <td class="px-4 py-3">
                                                <div class="text-sm">
                                                    <div class="font-semibold">${user.schoolName}</div>
                                                    <div class="text-gray-500 text-xs font-mono">${user.schoolCode}</div>
                                                </div>
                                            </td>
                                            <td class="px-4 py-3">${user.subject || '-'}</td>
                                            <td class="px-4 py-3">${user.yearGroup || '-'}</td>
                                            <td class="px-4 py-3">${user.gamesPlayed}</td>
                                            <td class="px-4 py-3 text-sm text-gray-600">${user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '-'}</td>
                                            <td class="px-4 py-3">
                                                <button onclick="openSuperAdminResetPasswordModal('${user.username}', '${user.schoolCode}', '${(user.email || '').replace(/'/g, "\\'")}', '${user.schoolName}')" 
                                                        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                                                    Reset Password
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('') : '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-500">No users found</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">🕒 Recent Activity</h2>
                        <div class="space-y-3">
                            ${stats.recentActivity.length > 0 ? stats.recentActivity.map(activity => `
                                <div class="border-l-4 border-indigo-500 pl-4 py-2 bg-gray-50 rounded">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <div class="font-semibold text-gray-800">${activity.schoolName} (${activity.schoolCode})</div>
                                            <div class="text-sm text-gray-600">${activity.username} played "${activity.gameSet}"</div>
                                        </div>
                                        <div class="text-xs text-gray-500">${new Date(activity.date).toLocaleString()}</div>
                                    </div>
                                </div>
                            `).join('') : '<p class="text-gray-500">No recent activity</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (state.phase === 'menu') {
        // Get all users' game history and calculate high scores
        const allData = getAllData();
        const allGameHistory = [];
        
        // Collect all games from all users
        Object.keys(allData.users || {}).forEach(username => {
            const userHistory = allData.users[username].gameHistory || [];
            userHistory.forEach(game => {
                allGameHistory.push({
                    ...game,
                    username: username
                });
            });
        });
        
        // Calculate best scores per game set (across all users)
        const bestScores = {};
        allGameHistory.forEach(game => {
            const gameSetName = game.gameSetName || 'Unknown';
            if (!bestScores[gameSetName]) {
                bestScores[gameSetName] = {
                    bestScore: 0,
                    bestTeam: '',
                    bestUsername: '',
                    totalGames: 0,
                    lastPlayed: null
                };
            }
            bestScores[gameSetName].totalGames++;
            const maxScore = Math.max(...game.teams.map(t => t.score));
            if (maxScore > bestScores[gameSetName].bestScore) {
                bestScores[gameSetName].bestScore = maxScore;
                bestScores[gameSetName].bestTeam = game.teams.find(t => t.score === maxScore)?.name || '';
                bestScores[gameSetName].bestUsername = game.username || 'Unknown';
            }
            const gameDate = new Date(game.date);
            if (!bestScores[gameSetName].lastPlayed || gameDate > new Date(bestScores[gameSetName].lastPlayed)) {
                bestScores[gameSetName].lastPlayed = game.date;
            }
        });
        
        // Sort by last played (most recent first)
        const sortedBestScores = Object.entries(bestScores).sort((a, b) => {
            if (!a[1].lastPlayed && !b[1].lastPlayed) return 0;
            if (!a[1].lastPlayed) return 1;
            if (!b[1].lastPlayed) return -1;
            return new Date(b[1].lastPlayed) - new Date(a[1].lastPlayed);
        });
        
        app.innerHTML = `
            <div class="min-h-screen p-2 sm:p-4 md:p-8">
                <div class="max-w-4xl mx-auto">
                    <div class="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 mb-4 md:mb-6">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
                            <div>
                                <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">Welcome, ${state.username}!</h1>
                                <p class="text-sm md:text-base text-gray-600">Select a game set to play</p>
                            </div>
                            <button onclick="logout()" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm md:text-base font-semibold w-full sm:w-auto shadow-lg">
                                Logout
                            </button>
                        </div>

                        ${sortedBestScores.length > 0 ? `
                            <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 md:p-4 mb-4 md:mb-6 border-2 border-indigo-200">
                                <h2 class="text-lg md:text-xl font-bold text-gray-800 mb-3 text-center">🏆 High Scores (All Year Groups)</h2>
                                <div class="space-y-2">
                                    ${sortedBestScores.slice(0, 5).map(([gameSetName, data]) => {
                                        const maxBestScore = Math.max(...Object.values(bestScores).map(d => d.bestScore), 1);
                                        const barWidth = (data.bestScore / maxBestScore) * 100;
                                        const lastPlayedDate = data.lastPlayed ? new Date(data.lastPlayed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
                                        return `
                                            <div class="bg-white rounded-lg p-2 md:p-3 border border-indigo-200">
                                                <div class="flex justify-between items-center mb-1.5">
                                                    <div class="flex-1">
                                                        <div class="flex items-center gap-2 mb-1">
                                                            <h3 class="text-sm md:text-base font-bold text-gray-800">${gameSetName}</h3>
                                                            <span class="text-xs text-indigo-600 font-semibold bg-indigo-100 px-2 py-0.5 rounded-full">${data.bestUsername || 'Unknown'}</span>
                                                        </div>
                                                        <p class="text-xs text-gray-600">Best: ${data.bestTeam} - ${data.bestScore} pts • ${data.totalGames} game${data.totalGames !== 1 ? 's' : ''}${lastPlayedDate ? ` • ${lastPlayedDate}` : ''}</p>
                                                    </div>
                                                    <div class="text-right ml-2">
                                                        <p class="text-lg md:text-xl font-bold text-indigo-600">${data.bestScore}</p>
                                                    </div>
                                                </div>
                                                <div class="w-full bg-gray-200 rounded-full h-2 md:h-3 overflow-hidden">
                                                    <div class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-purple-500" 
                                                         style="width: ${barWidth}%;">
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            ${Object.entries(gameSets).map(([setId, set]) => `
                                <div class="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-400 cursor-pointer transition" onclick="selectGameSet('${setId}')">
                                    <h3 class="text-xl font-bold text-gray-800 mb-2">${set.name}</h3>
                                    <p class="text-sm text-gray-600 mb-2">${set.description || 'No description'}</p>
                                    <p class="text-xs text-gray-500">${set.cards?.length || 0} cards</p>
                                    <div class="mt-2 flex gap-2">
                                        <button onclick="event.stopPropagation(); editGameSet('${setId}')" class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                            Edit
                                        </button>
                                        <button onclick="event.stopPropagation(); deleteGameSetConfirm('${setId}')" class="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="flex flex-col sm:flex-row gap-2 mb-4">
                            <button onclick="state.phase = 'score-history'; render();" class="flex-1 bg-yellow-600 text-white font-bold py-2 md:py-3 rounded-lg hover:bg-yellow-700 text-sm md:text-base">
                                📊 Previous Scores
                            </button>
                            <button onclick="openSettings()" class="flex-1 bg-gray-600 text-white font-bold py-2 md:py-3 rounded-lg hover:bg-gray-700 text-sm md:text-base">
                                ⚙️ Settings
                            </button>
                            <button onclick="createGameSet()" class="flex-1 bg-green-600 text-white font-bold py-2 md:py-3 rounded-lg hover:bg-green-700 text-sm md:text-base">
                                + Create New Game Set
                            </button>
                            <button onclick="exportData()" class="px-3 md:px-4 py-2 md:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-sm md:text-base">
                                Export
                            </button>
                            <label class="px-3 md:px-4 py-2 md:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold cursor-pointer text-sm md:text-base text-center">
                                Import
                                <input type="file" accept=".json" onchange="importData(event)" style="display: none;">
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (state.phase === 'visual-card-editor') {
        const gameSets = getGameSets();
        const gameSet = gameSets[state.editingGameSet] || { name: '', description: '', cards: [] };
        const currentCard = state.editingCards[state.editingCardIndex] || {
            id: state.editingCardIndex + 1,
            title: '',
            family: '',
            hint: '',
            taboo: [],
            soundMethod: '',
            size: '',
            sound: '',
            position: ''
        };
        
        app.innerHTML = `
            <div class="min-h-screen p-4 md:p-8 bg-gradient-to-br from-indigo-600 to-purple-700">
                <div class="max-w-5xl mx-auto">
                    <div class="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6">
                        <div class="flex justify-between items-center mb-6">
                            <div>
                                <h2 class="text-2xl md:text-3xl font-bold text-gray-800">Create/Edit Cards</h2>
                                <p class="text-sm text-gray-600 mt-1">Card ${state.editingCardIndex + 1} of ${state.editingCards.length}</p>
                            </div>
                            <div class="flex gap-3">
                                <button onclick="finishEditingCards()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                                    Finish & Save
                                </button>
                                <button onclick="state.phase = 'menu'; render();" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold">
                                    Cancel
                                </button>
                            </div>
                        </div>
                        
                        <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-bold mb-2">Game Set Name *</label>
                                <input id="set-name" type="text" value="${gameSet.name}" class="w-full px-4 py-2 border-2 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-bold mb-2">Description</label>
                                <input id="set-description" type="text" value="${gameSet.description || ''}" placeholder="Brief description of this game set" class="w-full px-4 py-2 border-2 rounded-lg">
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
                        <h3 class="text-xl font-bold text-gray-800 mb-6">Card Information</h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Left Column -->
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-bold mb-2 text-gray-700">Title *</label>
                                    <input id="card-title" type="text" value="${currentCard.title}" placeholder="e.g., Violin" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-bold mb-2 text-gray-700">Family/Category *</label>
                                    <input id="card-family" type="text" value="${currentCard.family}" placeholder="e.g., Strings, Tempo, Chords" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-bold mb-2 text-gray-700">Hint *</label>
                                    <textarea id="card-hint" rows="3" placeholder="e.g., Smallest string instrument, played with a bow" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">${currentCard.hint}</textarea>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-bold mb-2 text-gray-700">Taboo Words (one per line or comma separated)</label>
                                    <textarea id="card-taboo" rows="5" placeholder="bow&#10;small&#10;strings&#10;high&#10;fiddle" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-indigo-500 focus:outline-none">${currentCard.taboo.join('\n')}</textarea>
                                    <p class="text-xs text-gray-500 mt-1">Enter one word per line, or separate with commas</p>
                                </div>
                            </div>
                            
                            <!-- Right Column -->
                            <div class="space-y-4">
                                <div class="border-t-2 border-gray-200 pt-4">
                                    <h4 class="font-bold text-gray-700 mb-4 text-sm">Extra Information (Optional - shown when "i" button is pressed)</h4>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-bold mb-2 text-gray-700">How it works (SoundMethod)</label>
                                    <input id="card-soundMethod" type="text" value="${currentCard.soundMethod}" placeholder="e.g., Bowed strings vibrate" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-bold mb-2 text-gray-700">Details (Size)</label>
                                    <input id="card-size" type="text" value="${currentCard.size}" placeholder="e.g., Smallest (about 60cm)" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-bold mb-2 text-gray-700">Characteristics (Sound)</label>
                                    <input id="card-sound" type="text" value="${currentCard.sound}" placeholder="e.g., High and bright" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-bold mb-2 text-gray-700">Context (Position)</label>
                                    <input id="card-position" type="text" value="${currentCard.position}" placeholder="e.g., Front of orchestra" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">
                                </div>
                                
                                <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mt-4">
                                    <p class="text-xs text-blue-700">
                                        <strong>💡 Tip:</strong> The extra information fields are optional. They appear on the back of the card when the "i" button is pressed during gameplay.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-6 mb-4">
                            <button onclick="showAIGenerator()" class="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center justify-center gap-2">
                                🤖 Generate Cards with AI
                            </button>
                        </div>
                        
                        <div class="flex gap-3 mt-4 pt-6 border-t-2 border-gray-200">
                            <button onclick="previousCard()" class="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed" ${state.editingCardIndex === 0 ? 'disabled' : ''}>
                                ← Previous Card
                            </button>
                            <button onclick="nextCard()" class="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
                                Next Card →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (state.phase === 'settings') {
        const gameSets = getGameSets();
        app.innerHTML = `
            <div class="min-h-screen p-4 md:p-8">
                <div class="max-w-4xl mx-auto">
                    <div class="bg-white rounded-3xl shadow-2xl p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-3xl font-bold text-gray-800">Settings</h2>
                            <button onclick="closeSettings()" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                                Back to Menu
                            </button>
                        </div>

                        <div class="space-y-6">
                            <div>
                                <h3 class="text-xl font-bold text-gray-800 mb-4">Game Sets</h3>
                                <div class="space-y-3 mb-4">
                                    ${Object.entries(gameSets).map(([setId, set]) => `
                                        <div class="border-2 border-gray-200 rounded-lg p-4 flex justify-between items-center">
                                            <div>
                                                <h4 class="font-bold text-gray-800">${set.name}</h4>
                                                <p class="text-sm text-gray-600">${set.description || 'No description'}</p>
                                                <p class="text-xs text-gray-500">${set.cards?.length || 0} cards</p>
                                            </div>
                                            <div class="flex gap-2">
                                                <button onclick="editGameSet('${setId}')" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                                                    Edit
                                                </button>
                                                <button onclick="deleteGameSetConfirm('${setId}')" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                <button onclick="createGameSet()" class="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">
                                    + Create New Game Set
                                </button>
                            </div>

                            <div class="border-t pt-6">
                                <h3 class="text-xl font-bold text-gray-800 mb-4">Data Management</h3>
                                <div class="flex flex-col gap-2">
                                    <div class="flex gap-2">
                                        <button onclick="exportData()" class="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">
                                            Export All Data
                                        </button>
                                        <label class="flex-1 bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 cursor-pointer text-center">
                                            Import Data
                                            <input type="file" accept=".json" onchange="importData(event)" style="display: none;">
                                        </label>
                                    </div>
                                    <p class="text-xs text-gray-600 mt-2">
                                        All data is automatically saved to the server. No local backups needed.
                                    </p>
                                </div>
                            </div>

                            <div class="border-t pt-6">
                                <h3 class="text-xl font-bold text-gray-800 mb-4">User Management</h3>
                                <p class="text-gray-600 mb-4">Currently logged in as: <strong>${state.username}</strong></p>
                                <button onclick="logout()" class="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg font-semibold">
                                    Logout (Scores Auto-Saved)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (state.phase === 'edit-game-set') {
        const gameSet = gameSets[state.editingGameSet] || { name: '', description: '', cards: [] };
        const cardsText = gameSet.cards.map(c => {
            const parts = [
                c.title,
                c.family,
                c.hint,
                ...(c.taboo || []),
                c.soundMethod || '',
                c.size || '',
                c.sound || '',
                c.position || ''
            ];
            return parts.join('|');
        }).join('\n');
        
        app.innerHTML = `
            <div class="min-h-screen p-4 md:p-8">
                <div class="max-w-4xl mx-auto">
                    <div class="bg-white rounded-3xl shadow-2xl p-8">
                        <h2 class="text-3xl font-bold text-gray-800 mb-6">Edit Game Set</h2>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-bold mb-2">Name</label>
                            <input id="set-name" type="text" value="${gameSet.name}" class="w-full px-4 py-2 border-2 rounded-lg">
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-bold mb-2">Description</label>
                            <input id="set-description" type="text" value="${gameSet.description || ''}" class="w-full px-4 py-2 border-2 rounded-lg">
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-bold mb-2">Cards</label>
                            <textarea id="set-cards" rows="20" class="w-full px-4 py-2 border-2 rounded-lg font-mono text-sm">${cardsText}</textarea>
                            <div class="mt-3 bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-xs">
                                <p class="font-bold text-blue-800 mb-2">📝 Format (one card per line, use | to separate fields):</p>
                                <p class="text-blue-700 mb-2"><strong>Title|Family|Hint|Taboo1|Taboo2|Taboo3|Taboo4|Taboo5|SoundMethod|Size|Sound|Position</strong></p>
                                
                                <p class="font-bold text-blue-800 mt-3 mb-1">Required fields (first 3):</p>
                                <ul class="list-disc list-inside text-blue-700 mb-2 space-y-0.5">
                                    <li><strong>Title:</strong> The main word/phrase (e.g., "Violin")</li>
                                    <li><strong>Family:</strong> Category (e.g., "Strings", "Tempo", "Chords")</li>
                                    <li><strong>Hint:</strong> Clue shown on front of card</li>
                                </ul>
                                
                                <p class="font-bold text-blue-800 mt-3 mb-1">Taboo words (next 3-5 fields):</p>
                                <p class="text-blue-700 mb-2">Words that cannot be used (e.g., "bow", "small", "strings")</p>
                                
                                <p class="font-bold text-blue-800 mt-3 mb-1">Back of card information (optional, shown when "i" button is pressed):</p>
                                <ul class="list-disc list-inside text-blue-700 mb-2 space-y-0.5">
                                    <li><strong>SoundMethod:</strong> "How it works" - How the item works or functions</li>
                                    <li><strong>Size:</strong> "Details" - Size, dimensions, or other details</li>
                                    <li><strong>Sound:</strong> "Characteristics" - Sound qualities or characteristics</li>
                                    <li><strong>Position:</strong> "Context" - Position, location, or context</li>
                                </ul>
                                
                                <p class="font-bold text-blue-800 mt-3 mb-1">Example:</p>
                                <p class="text-blue-700 font-mono bg-white p-2 rounded border border-blue-300">
                                    Violin|Strings|Smallest string instrument|bow|small|strings|high|fiddle|Bowed strings vibrate|Smallest (60cm)|High and bright|Front of orchestra
                                </p>
                                <p class="text-blue-600 mt-2 italic">💡 Tip: You can leave the back-of-card fields empty if you don't need them. Just include the taboo words.</p>
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <button onclick="saveGameSetEdit()" class="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">
                                Save
                            </button>
                            <button onclick="state.editingGameSet = null; state.phase = 'menu'; render();" class="flex-1 bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (state.phase === 'setup') {
        const currentGameSet = gameSets[state.currentGameSet];
        const gameSetName = currentGameSet?.name || 'Unknown Game Set';
        const gameSetDescription = currentGameSet?.description || '';
        const cardCount = currentGameSet?.cards?.length || 0;
        
        app.innerHTML = `
            <div class="flex items-center justify-center min-h-screen px-4 py-8">
                <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
                    <div class="flex justify-between items-center mb-4">
                        <h1 class="text-4xl font-bold text-gray-800">🎵 Music Taboo</h1>
                        <div class="flex gap-2">
                            <button onclick="state.phase = 'menu'; render();" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm">
                                Back to Menu
                            </button>
                            <button onclick="logout()" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold">
                                Logout
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-indigo-50 rounded-lg p-4 mb-6 border-2 border-indigo-200">
                        <h2 class="text-2xl font-bold text-indigo-800 mb-2 text-center">${gameSetName}</h2>
                        ${gameSetDescription ? `<p class="text-sm text-indigo-600 text-center mb-2">${gameSetDescription}</p>` : ''}
                        <p class="text-xs text-indigo-500 text-center">${cardCount} cards available</p>
                    </div>
                    
                    <p class="text-gray-600 mb-6 text-center">Enter team names to begin (2-6 teams)</p>
                    
                    <div id="teams-container" class="space-y-4 mb-6">
                        ${state.teams.map((team, index) => `
                            <div class="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    class="team-input w-full px-4 py-3 border-2 rounded-lg focus:outline-none" 
                                    style="border-color: ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][index]};"
                                    value="${team.name}" 
                                    placeholder="Team ${index + 1}"
                                    onchange="updateTeamName(${index}, this.value)"
                                >
                                ${state.teams.length > 2 ? `
                                    <button onclick="removeTeam(${index})" class="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">
                                        ×
                                    </button>
                                ` : ''}
                                ${team.totalScore > 0 ? `
                                    <span class="text-sm text-gray-600 whitespace-nowrap">Total: ${team.totalScore}</span>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex gap-2 mb-6">
                        ${state.teams.length < 6 ? `
                            <button onclick="addTeam()" class="flex-1 bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600">
                                + Add Team
                            </button>
                        ` : ''}
                        ${Object.keys(getUserData(state.username).totalScore || {}).length > 0 ? `
                            <button onclick="clearAllScores()" class="flex-1 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600">
                                Clear Scores
                            </button>
                        ` : ''}
                    </div>

                    <button onclick="startGame(); return false;" class="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 text-lg">
                        Start Game
                    </button>
                </div>
            </div>
        `;
    } else if (state.phase === 'over') {
        const maxScore = Math.max(...state.teams.map(t => t.score));
        const winners = state.teams.filter(t => t.score === maxScore);
        const winnerText = winners.length === 1 ? `${winners[0].name} Wins!` : 'Tie Game!';
        const cols = state.teams.length <= 2 ? 2 : state.teams.length <= 4 ? 2 : 3;
        
        app.innerHTML = `
            <div class="flex items-center justify-center min-h-screen px-4 py-8">
                <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
                    <h1 class="text-5xl font-bold text-gray-800 mb-4 text-center">Game Over</h1>
                    <p class="text-3xl font-bold text-indigo-600 mb-8 text-center">${winnerText}</p>

                    <div class="grid grid-cols-${cols} gap-4 mb-8">
                        ${state.teams.map((team, index) => `
                            <div class="rounded-lg p-4 ${team.score === maxScore ? 'ring-4 ring-yellow-400' : ''}" style="background: linear-gradient(135deg, ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][index]}40, ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][index]}60);">
                                <p class="text-gray-700 font-bold">${team.name}</p>
                                <p class="text-4xl font-bold" style="color: ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][index]};">
                                    ${team.score}
                                </p>
                                <p class="text-xs text-gray-600">Skip: ${team.skipped}</p>
                                <p class="text-xs text-gray-500 mt-1">Total: ${team.totalScore || 0}</p>
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex gap-2">
                        <button onclick="reset()" class="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 text-lg">
                            Play Again
                        </button>
                        <button onclick="state.phase = 'detailed-scores'; render();" class="flex-1 bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 text-lg">
                            View Detailed Scores
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else if (state.phase === 'detailed-scores') {
        const maxScore = Math.max(...state.teams.map(t => t.score), 1);
        const maxTotalScore = Math.max(...state.teams.map(t => t.totalScore || 0), 1);
        const winners = state.teams.filter(t => t.score === Math.max(...state.teams.map(team => team.score)));
        const winnerText = winners.length === 1 ? `${winners[0].name} Wins!` : 'Tie Game!';
        
        // Calculate statistics
        const totalCardsPlayed = state.history.length;
        const totalCorrect = state.history.filter(h => h.result === 'correct').length;
        const totalSkipped = state.history.filter(h => h.result === 'skip').length;
        const accuracy = totalCardsPlayed > 0 ? ((totalCorrect / totalCardsPlayed) * 100).toFixed(1) : 0;
        
        app.innerHTML = `
            <div class="h-screen flex flex-col overflow-hidden p-1 sm:p-2 md:p-4">
                <div class="max-w-5xl mx-auto w-full flex flex-col h-full">
                    <div class="bg-white rounded-xl md:rounded-2xl shadow-2xl p-2 md:p-4 flex flex-col h-full overflow-hidden">
                        <div class="flex justify-between items-center mb-2 md:mb-3 flex-shrink-0">
                            <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Detailed Scores</h1>
                            <div class="flex gap-1 md:gap-2">
                                <button onclick="state.phase = 'menu'; render();" class="px-2 md:px-3 py-1 md:py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-xs md:text-sm">
                                    Menu
                                </button>
                                <button onclick="logout()" class="px-2 md:px-3 py-1 md:py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs md:text-sm font-semibold">
                                    Logout
                                </button>
                            </div>
                        </div>

                        <div class="overflow-y-auto flex-1 pr-1">
                            <div class="mb-3 md:mb-4">
                                <h2 class="text-base md:text-lg font-bold text-indigo-600 mb-2 text-center">${winnerText}</h2>
                                
                                <div class="bg-indigo-50 rounded-lg p-2 md:p-3 mb-3">
                                    <h3 class="font-bold text-gray-800 mb-2 text-center text-xs md:text-sm">Game Statistics</h3>
                                    <div class="grid grid-cols-4 gap-2 text-center mb-3">
                                        <div>
                                            <p class="text-lg md:text-xl font-bold text-indigo-600">${totalCardsPlayed}</p>
                                            <p class="text-xs text-gray-600">Cards</p>
                                        </div>
                                        <div>
                                            <p class="text-lg md:text-xl font-bold text-green-600">${totalCorrect}</p>
                                            <p class="text-xs text-gray-600">Correct</p>
                                        </div>
                                        <div>
                                            <p class="text-lg md:text-xl font-bold text-red-600">${totalSkipped}</p>
                                            <p class="text-xs text-gray-600">Skipped</p>
                                        </div>
                                        <div>
                                            <p class="text-lg md:text-xl font-bold text-purple-600">${accuracy}%</p>
                                            <p class="text-xs text-gray-600">Accuracy</p>
                                        </div>
                                    </div>
                                    
                                    <!-- Pie Chart for Correct vs Skipped -->
                                    <div class="mb-3">
                                        <h4 class="text-xs font-semibold text-gray-700 mb-2 text-center">Correct vs Skipped</h4>
                                        <div class="flex items-center justify-center">
                                            <div class="relative w-24 h-24 md:w-32 md:h-32">
                                                <svg class="w-24 h-24 md:w-32 md:h-32 transform -rotate-90" viewBox="0 0 100 100">
                                                    ${totalCardsPlayed > 0 ? `
                                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="10"/>
                                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" stroke-width="10"
                                                            stroke-dasharray="${(totalCorrect / totalCardsPlayed) * 282.6} 282.6"
                                                            stroke-linecap="round"/>
                                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#ef4444" stroke-width="10"
                                                            stroke-dasharray="${(totalSkipped / totalCardsPlayed) * 282.6} 282.6"
                                                            stroke-dashoffset="${-(totalCorrect / totalCardsPlayed) * 282.6}"
                                                            stroke-linecap="round"/>
                                                    ` : `
                                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="10"/>
                                                    `}
                                                </svg>
                                                <div class="absolute inset-0 flex items-center justify-center">
                                                    <span class="text-xs md:text-sm font-bold text-gray-700">${totalCardsPlayed}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex justify-center gap-4 mt-2 text-xs">
                                            <div class="flex items-center gap-1">
                                                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                                                <span>Correct</span>
                                            </div>
                                            <div class="flex items-center gap-1">
                                                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                                                <span>Skipped</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    ${totalSkipped > 0 ? `
                                        <!-- Questions They Got Wrong -->
                                        <div class="mb-3">
                                            <h4 class="text-xs font-semibold text-gray-700 mb-2 text-center">Questions They Got Wrong</h4>
                                            <div class="bg-red-50 rounded-lg p-2 md:p-3 border-2 border-red-200 max-h-40 md:max-h-48 overflow-y-auto">
                                                <div class="space-y-1.5">
                                                    ${state.history.filter(h => h.result === 'skip').map(entry => {
                                                        const teamName = state.teams[entry.team]?.name || `Team ${entry.team + 1}`;
                                                        const teamColor = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][entry.team];
                                                        const cardTitle = entry.card?.title || 'Unknown Card';
                                                        return `
                                                            <div class="flex items-center gap-2 text-xs">
                                                                <span class="font-semibold px-2 py-0.5 rounded text-white" style="background-color: ${teamColor}; min-width: 60px; text-align: center;">${teamName}</span>
                                                                <span class="text-gray-700 flex-1">${cardTitle}</span>
                                                            </div>
                                                        `;
                                                    }).join('')}
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    <!-- Bar Graph for Team Scores -->
                                    <div>
                                        <h4 class="text-xs font-semibold text-gray-700 mb-2 text-center">Team Scores Comparison</h4>
                                        <div class="space-y-1.5">
                                            ${state.teams.map((team, index) => {
                                                const barWidth = maxScore > 0 ? (team.score / maxScore) * 100 : 0;
                                                return `
                                                    <div class="flex items-center gap-2">
                                                        <span class="text-xs font-semibold w-16 md:w-20 text-right" style="color: ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][index]};">${team.name}</span>
                                                        <div class="flex-1 bg-gray-200 rounded-full h-4 md:h-5 overflow-hidden">
                                                            <div class="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-1" 
                                                                 style="width: ${barWidth}%; background: ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][index]};">
                                                                ${team.score > 0 ? `<span class="text-xs font-bold text-white">${team.score}</span>` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-2 md:space-y-3">
                                ${state.teams.map((team, index) => {
                                    const scorePercentage = (team.score / maxScore) * 100;
                                    const totalPercentage = maxTotalScore > 0 ? ((team.totalScore || 0) / maxTotalScore) * 100 : 0;
                                    const teamCorrect = state.history.filter(h => h.team === index && h.result === 'correct').length;
                                    const teamSkipped = state.history.filter(h => h.team === index && h.result === 'skip').length;
                                    
                                    return `
                                        <div class="border-2 ${team.score === Math.max(...state.teams.map(t => t.score)) ? 'border-yellow-400 ring-1 ring-yellow-300' : 'border-gray-200'} rounded-lg p-2 md:p-3" style="background: linear-gradient(135deg, ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][index]}10, ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][index]}20);">
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 class="text-base md:text-lg font-bold" style="color: ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][index]};">
                                                        ${team.name}
                                                        ${team.score === Math.max(...state.teams.map(t => t.score)) ? ' 👑' : ''}
                                                    </h3>
                                                    <p class="text-xs text-gray-600">Current Game</p>
                                                </div>
                                                <div class="text-right">
                                                    <p class="text-xl md:text-2xl font-bold" style="color: ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][index]};">
                                                        ${team.score}
                                                    </p>
                                                    <p class="text-xs text-gray-500">pts</p>
                                                </div>
                                            </div>

                                            <div class="space-y-2">
                                                <div>
                                                    <div class="flex justify-between text-xs mb-0.5">
                                                        <span class="text-gray-700">Current Score</span>
                                                        <span class="font-semibold">${team.score}</span>
                                                    </div>
                                                    <div class="w-full bg-gray-200 rounded-full h-2 md:h-2.5 overflow-hidden">
                                                        <div class="h-full rounded-full transition-all duration-500" 
                                                             style="width: ${scorePercentage}%; background: ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][index]};">
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div class="flex justify-between text-xs mb-0.5">
                                                        <span class="text-gray-700">Total Score</span>
                                                        <span class="font-semibold">${team.totalScore || 0}</span>
                                                    </div>
                                                    <div class="w-full bg-gray-200 rounded-full h-2 md:h-2.5 overflow-hidden">
                                                        <div class="h-full rounded-full transition-all duration-500" 
                                                             style="width: ${totalPercentage}%; background: ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][index]};">
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="grid grid-cols-3 gap-2 pt-1.5 border-t border-gray-200">
                                                    <div class="text-center">
                                                        <p class="text-sm md:text-base font-bold text-gray-800">${teamCorrect}</p>
                                                        <p class="text-xs text-gray-600">Correct</p>
                                                    </div>
                                                    <div class="text-center">
                                                        <p class="text-sm md:text-base font-bold text-gray-800">${teamSkipped}</p>
                                                        <p class="text-xs text-gray-600">Skipped</p>
                                                    </div>
                                                    <div class="text-center">
                                                        <p class="text-sm md:text-base font-bold text-gray-800">${teamCorrect + teamSkipped}</p>
                                                        <p class="text-xs text-gray-600">Total</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <div class="flex gap-2 mt-2 md:mt-3 flex-shrink-0">
                            <button onclick="reset()" class="flex-1 bg-indigo-600 text-white font-bold py-2 md:py-2.5 rounded-lg hover:bg-indigo-700 text-sm md:text-base">
                                Play Again
                            </button>
                            <button onclick="state.phase = 'menu'; render();" class="flex-1 bg-gray-600 text-white font-bold py-2 md:py-2.5 rounded-lg hover:bg-gray-700 text-sm md:text-base">
                                Back to Menu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (state.phase === 'score-history') {
        // Get all users' game histories
        const allData = getAllData();
        const allGameHistory = [];
        
        // Collect all games from all users
        Object.keys(allData.users || {}).forEach(username => {
            const userHistory = allData.users[username].gameHistory || [];
            userHistory.forEach(game => {
                allGameHistory.push({
                    ...game,
                    username: username
                });
            });
        });
        
        // Sort by date (most recent first)
        allGameHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        app.innerHTML = `
            <div class="h-screen flex flex-col overflow-hidden p-1 sm:p-2 md:p-4">
                <div class="max-w-5xl mx-auto w-full flex flex-col h-full">
                    <div class="bg-white rounded-xl md:rounded-2xl shadow-2xl p-2 md:p-4 flex flex-col h-full overflow-hidden">
                        <div class="flex justify-between items-center mb-2 md:mb-3 flex-shrink-0">
                            <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">All Previous Scores</h1>
                            <div class="flex gap-1 md:gap-2">
                                <button onclick="state.phase = 'menu'; render();" class="px-2 md:px-3 py-1 md:py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-xs md:text-sm">
                                    Back to Menu
                                </button>
                                <button onclick="logout()" class="px-2 md:px-3 py-1 md:py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs md:text-sm font-semibold">
                                    Logout
                                </button>
                            </div>
                        </div>

                        <div class="overflow-y-auto flex-1 pr-1">
                            ${allGameHistory.length === 0 ? `
                                <div class="text-center py-8">
                                    <p class="text-gray-600 text-lg mb-2">No previous games yet</p>
                                    <p class="text-gray-500 text-sm">Play a game to see scores here!</p>
                                </div>
                            ` : `
                                <div class="space-y-2 md:space-y-3">
                                    ${allGameHistory.map((game, index) => {
                                        const gameDate = new Date(game.date);
                                        const dateStr = gameDate.toLocaleDateString('en-GB', { 
                                            day: 'numeric', 
                                            month: 'short', 
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                        const maxScore = Math.max(...game.teams.map(t => t.score), 1);
                                        
                                        return `
                                            <div class="border-2 border-gray-200 rounded-lg p-2 md:p-3 bg-gray-50">
                                                <div class="flex justify-between items-start mb-2">
                                                    <div class="flex-1">
                                                        <h3 class="text-sm md:text-base font-bold text-gray-800">${game.gameSetName}</h3>
                                                        <p class="text-xs text-gray-600">${dateStr} • ${game.username || 'Unknown'}</p>
                                                    </div>
                                                    <div class="flex items-start gap-2">
                                                        <div class="text-right">
                                                            <p class="text-xs text-gray-500">${game.totalCards} cards</p>
                                                            <p class="text-xs text-gray-500">${game.correct} correct, ${game.skipped} skipped</p>
                                                        </div>
                                                        <button onclick="deleteScoreEntry('${game.username}', '${game.date}')" 
                                                                class="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-base font-bold flex-shrink-0 shadow-md border-2 border-gray-400 hover:border-red-500 hover:text-red-600"
                                                                title="Delete this score">
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div class="grid grid-cols-${Math.min(game.teams.length, 6)} gap-2">
                                                    ${game.teams.map((team, teamIndex) => {
                                                        const scorePercentage = (team.score / maxScore) * 100;
                                                        const isWinner = team.score === maxScore;
                                                        return `
                                                            <div class="border ${isWinner ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'} rounded p-1.5 md:p-2">
                                                                <div class="flex justify-between items-center mb-1">
                                                                    <span class="text-xs md:text-sm font-semibold ${isWinner ? 'text-yellow-800' : 'text-gray-700'}">
                                                                        ${team.name}${isWinner ? ' 👑' : ''}
                                                                    </span>
                                                                    <span class="text-xs md:text-sm font-bold" style="color: ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][teamIndex]};">
                                                                        ${team.score}
                                                                    </span>
                                                                </div>
                                                                <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                                    <div class="h-full rounded-full transition-all duration-500" 
                                                                         style="width: ${scorePercentage}%; background: ${['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][teamIndex]};">
                                                                    </div>
                                                                </div>
                                                                <p class="text-xs text-gray-500 mt-0.5">Skipped: ${team.skipped}</p>
                                                            </div>
                                                        `;
                                                    }).join('')}
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (state.phase === 'playing') {
        const team = state.teams[state.currentTeam];
        const remainingCount = state.remaining.length;
        const stackCount = Math.min(remainingCount, 3);
        
        app.innerHTML = `
            <div class="min-h-screen p-2 sm:p-4 md:p-8">
                <div class="max-w-6xl mx-auto">
                    <div class="flex justify-between items-center mb-3 md:mb-4">
                        <div class="text-center flex-1">
                            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-white">Music Taboo</h1>
                        </div>
                        <button onclick="logout()" class="px-3 md:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm md:text-base font-semibold shadow-lg">
                            Logout
                        </button>
                    </div>

                    <div class="flex justify-center mb-3 md:mb-4">
                        <div class="grid grid-cols-${state.teams.length} gap-2 md:gap-3 max-w-3xl w-full">
                            ${state.teams.map((t, index) => `
                                <div class="${teamColors[index]} rounded-lg p-2 md:p-3 text-white transform transition ${state.currentTeam === index ? 'ring-2 md:ring-3 ring-yellow-300 shadow-lg' : 'opacity-70'}">
                                    <p class="text-xs md:text-sm opacity-90 font-semibold">${t.name}</p>
                                    <p class="text-xl md:text-2xl font-bold mt-0.5">${t.score}</p>
                                    <p class="text-xs opacity-80 mt-0.5">Skip: ${t.skipped}</p>
                                    <p class="text-xs opacity-60 mt-0.5">Total: ${t.totalScore || 0}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="card-container mb-20 md:mb-24 px-2">
                        <div class="card-deck">
                            ${state.currentCard ? `
                                ${Array.from({ length: stackCount + 1 }).map((_, i) => {
                                    if (i === 0) {
                                        return `
                                            <div class="card-3d active">
                                                <!-- Front of Card -->
                                                <div class="card-front p-4 md:p-6 text-center relative">
                                                    <button onclick="event.stopPropagation(); event.preventDefault(); toggleOrchestraInfo(); return false;" class="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-sm md:text-base font-bold shadow-lg cursor-pointer z-50" type="button" title="Show extra information">
                                                        i
                                                    </button>
                                                    
                                                    <div class="mb-3 flex-shrink-0">
                                                        <span class="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs md:text-sm font-bold mb-3">${state.currentCard.family}</span>
                                                        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3 leading-tight">${state.currentCard.title}</h2>
                                                    </div>

                                                    <div class="bg-red-50 rounded-lg p-3 md:p-4 mb-3 border-2 border-red-300 flex-shrink-0">
                                                        <p class="text-red-700 font-bold mb-2 text-sm md:text-base">TABOO WORDS</p>
                                                        <div class="flex flex-wrap gap-1.5 md:gap-2 justify-center">
                                                            ${state.currentCard.taboo && state.currentCard.taboo.length > 0 ? 
                                                                state.currentCard.taboo.map(w => `<span class="bg-red-200 text-red-700 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold">${w}</span>`).join('') 
                                                                : '<span class="text-red-600 text-xs">No taboo words</span>'
                                                            }
                                                        </div>
                                                    </div>

                                                    <div class="bg-blue-50 rounded-lg p-3 md:p-4 mb-3 border-2 border-blue-300 flex-shrink-0">
                                                        <p class="text-blue-800 font-bold text-xs md:text-sm mb-1">HINT</p>
                                                        <p class="text-blue-700 text-sm md:text-base font-semibold leading-tight">${state.currentCard.hint}</p>
                                                    </div>

                                                    ${state.showOrchestraInfo && (state.currentCard.soundMethod || state.currentCard.size || state.currentCard.sound || state.currentCard.position) ? `
                                                        <div class="bg-green-50 rounded-lg p-2.5 md:p-3 mb-2 border-2 border-green-300 flex-shrink-0">
                                                            <p class="text-green-800 font-bold text-xs mb-1">LEARN MORE</p>
                                                            ${state.currentCard.soundMethod ? `<p class="text-green-700 text-xs mb-0.5 leading-tight"><strong>How it works:</strong> ${state.currentCard.soundMethod}</p>` : ''}
                                                            ${state.currentCard.size ? `<p class="text-green-700 text-xs mb-0.5 leading-tight"><strong>Details:</strong> ${state.currentCard.size}</p>` : ''}
                                                            ${state.currentCard.sound ? `<p class="text-green-700 text-xs mb-0.5 leading-tight"><strong>Characteristics:</strong> ${state.currentCard.sound}</p>` : ''}
                                                            ${state.currentCard.position ? `<p class="text-green-700 text-xs leading-tight"><strong>Context:</strong> ${state.currentCard.position}</p>` : ''}
                                                        </div>
                                                    ` : ''}
                                                </div>

                                                <!-- Back of Card (Additional Information) -->
                                                <div class="card-back p-4 md:p-6 text-center relative">
                                                    <button onclick="event.stopPropagation(); event.preventDefault(); toggleOrchestraInfo(); return false;" class="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-sm md:text-base font-bold shadow-lg cursor-pointer z-50" type="button" title="Hide extra information">
                                                        i
                                                    </button>
                                                    
                                                    <div class="mb-3 flex-shrink-0">
                                                        <span class="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs md:text-sm font-bold mb-3">${state.currentCard.family}</span>
                                                        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3 leading-tight">${state.currentCard.title}</h2>
                                                    </div>

                                                    ${(() => {
                                                        const pos = getOrchestraPosition(state.currentCard);
                                                        if (pos && pos.section) {
                                                            // Show orchestra position for instruments (extra info not on front)
                                                            return `
                                                                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 md:p-4 mb-3 border-2 border-blue-400 flex-shrink-0">
                                                                    <p class="text-blue-800 font-bold text-sm md:text-base mb-2">📍 Orchestra Position</p>
                                                                    <div class="text-left space-y-2 mb-3">
                                                                        <p class="text-blue-700 text-xs md:text-sm"><strong>Section:</strong> ${pos.section}</p>
                                                                        <p class="text-blue-700 text-xs md:text-sm"><strong>Description:</strong> ${pos.description}</p>
                                                                        ${state.currentCard.position ? `<p class="text-blue-700 text-xs md:text-sm"><strong>Position:</strong> ${state.currentCard.position}</p>` : ''}
                                                                    </div>
                                                                    <div class="bg-white rounded p-3 text-xs">
                                                                        <div class="flex justify-between items-center mb-2">
                                                                            <span class="text-gray-600 font-semibold">Conductor</span>
                                                                            <span class="text-gray-400">→</span>
                                                                        </div>
                                                                        ${Array.from({ length: 5 }).map((_, i) => {
                                                                            const rowNum = i + 1;
                                                                            const isActiveRow = rowNum === pos.row;
                                                                            return `
                                                                                <div class="flex items-center gap-2 mb-1.5 ${isActiveRow ? 'bg-yellow-200 rounded px-2 py-1' : ''}">
                                                                                    <span class="w-16 text-left text-gray-600 text-xs font-semibold">Row ${rowNum}</span>
                                                                                    <div class="flex-1 h-4 bg-gray-200 rounded ${isActiveRow ? 'bg-yellow-300' : ''}"></div>
                                                                                    ${isActiveRow ? `<span class="text-xs font-bold text-yellow-800">${state.currentCard.title}</span>` : ''}
                                                                                </div>
                                                                            `;
                                                                        }).join('')}
                                                                    </div>
                                                                </div>
                                                            `;
                                                        }
                                                        return '';
                                                    })()}

                                                    ${state.currentCard.soundMethod || state.currentCard.size || state.currentCard.sound || state.currentCard.position ? `
                                                        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 md:p-4 mb-3 border-2 border-blue-400 flex-shrink-0">
                                                            <p class="text-blue-800 font-bold text-sm md:text-base mb-2">📍 Extra Information</p>
                                                            <div class="text-left space-y-2">
                                                                ${state.currentCard.soundMethod ? `<p class="text-blue-700 text-xs md:text-sm"><strong>How it works:</strong> ${state.currentCard.soundMethod}</p>` : ''}
                                                                ${state.currentCard.size ? `<p class="text-blue-700 text-xs md:text-sm"><strong>Details:</strong> ${state.currentCard.size}</p>` : ''}
                                                                ${state.currentCard.sound ? `<p class="text-blue-700 text-xs md:text-sm"><strong>Characteristics:</strong> ${state.currentCard.sound}</p>` : ''}
                                                                ${state.currentCard.position ? `<p class="text-blue-700 text-xs md:text-sm"><strong>Context:</strong> ${state.currentCard.position}</p>` : ''}
                                                            </div>
                                                        </div>
                                                    ` : ''}
                                                    
                                                    ${!state.currentCard.soundMethod && !state.currentCard.size && !state.currentCard.sound && !state.currentCard.position && !getOrchestraPosition(state.currentCard) ? `
                                                        <div class="bg-amber-50 rounded-lg p-3 md:p-4 mb-2 border-2 border-amber-300 flex-shrink-0">
                                                            <p class="text-amber-800 font-bold text-xs md:text-sm mb-1">💡 Tip</p>
                                                            <p class="text-amber-700 text-xs md:text-sm leading-tight">Add extra information when creating this card to see educational details here!</p>
                                                        </div>
                                                    ` : ''}

                                                    <div class="bg-amber-50 rounded-lg p-3 md:p-4 mb-2 border-2 border-amber-300 flex-shrink-0">
                                                        <p class="text-amber-800 font-bold text-xs md:text-sm mb-1">📚 Remember</p>
                                                        <p class="text-amber-700 text-xs md:text-sm leading-tight">This information helps you understand ${state.currentCard.title} better. Use it to explain to your team!</p>
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    } else {
                                        // Show mockup of the top card to create stack effect
                                        return `
                                            <div class="card-3d stack${i > 1 ? '-' + i : ''} p-3 md:p-4 text-center" style="display: flex; flex-direction: column; overflow: visible;">
                                                <div class="mb-2">
                                                    <span class="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold mb-1 opacity-70">${state.currentCard.family}</span>
                                                    <h3 class="text-lg md:text-xl font-bold text-gray-700 mb-2 opacity-80">${state.currentCard.title}</h3>
                                                </div>
                                                <div class="bg-red-50 rounded-lg p-2 border border-red-200 opacity-60">
                                                    <p class="text-red-600 font-bold text-xs mb-1">TABOO WORDS</p>
                                                    <div class="flex flex-wrap gap-1 justify-center">
                                                        ${state.currentCard.taboo && state.currentCard.taboo.length > 0 ? 
                                                            state.currentCard.taboo.slice(0, 3).map(w => `<span class="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs">${w}</span>`).join('') + 
                                                            (state.currentCard.taboo.length > 3 ? '<span class="text-red-400 text-xs">...</span>' : '')
                                                            : '<span class="text-red-400 text-xs">No taboo words</span>'
                                                        }
                                                    </div>
                                                </div>
                                                <div class="bg-blue-50 rounded-lg p-2 border border-blue-200 opacity-50 mt-2">
                                                    <p class="text-blue-600 font-bold text-xs mb-1">HINT</p>
                                                    <p class="text-blue-500 text-xs opacity-70">${state.currentCard.hint}</p>
                                                </div>
                                            </div>
                                        `;
                                    }
                                }).join('')}
                            ` : `
                                <div class="card-3d active p-8 text-center" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%;">
                                    <p class="text-6xl mb-4">🎴</p>
                                    <p class="text-gray-600 font-semibold text-lg">Draw a card</p>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Action Buttons - Better Spacing and Design -->
                    <div class="fixed bottom-6 left-0 right-0 z-50 px-4">
                        <div class="max-w-2xl mx-auto flex gap-3 md:gap-4 justify-center">
                            ${!state.currentCard ? `
                                <button onclick="drawCard()" class="bg-indigo-600 text-white font-bold py-4 md:py-5 px-8 md:px-12 rounded-xl hover:bg-indigo-700 text-lg md:text-xl w-full sm:w-auto shadow-2xl transform hover:scale-105 transition">
                                    Draw Card
                                </button>
                            ` : `
                                <button onclick="correct()" class="bg-green-500 text-white font-bold py-4 md:py-5 px-8 md:px-10 rounded-xl hover:bg-green-600 text-lg md:text-xl flex-1 sm:flex-none min-w-[140px] shadow-2xl transform hover:scale-105 transition">
                                    ✓ Got It
                                </button>
                                <button onclick="skip()" class="bg-red-500 text-white font-bold py-4 md:py-5 px-8 md:px-10 rounded-xl hover:bg-red-600 text-lg md:text-xl flex-1 sm:flex-none min-w-[140px] shadow-2xl transform hover:scale-105 transition">
                                    ✗ Skip
                                </button>
                                <button onclick="finishGame()" class="bg-purple-500 text-white font-bold py-4 md:py-5 px-8 md:px-10 rounded-xl hover:bg-purple-600 text-lg md:text-xl flex-1 sm:flex-none min-w-[140px] shadow-2xl transform hover:scale-105 transition">
                                    Finish
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (state.phase === 'school-admin') {
        const school = getSchool(state.schoolCode);
        const progress = getSchoolProgress(state.schoolCode);
        const users = school ? Object.values(school.users || {}) : [];
        
        app.innerHTML = `
            <div class="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <div class="max-w-7xl mx-auto">
                    <div class="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6">
                        <div class="flex justify-between items-center mb-6">
                            <div>
                                <h1 class="text-4xl font-bold text-gray-800 mb-2">🏫 School Admin Dashboard</h1>
                                <p class="text-gray-600">${school ? school.schoolName : ''} (${state.schoolCode})</p>
                            </div>
                            <button onclick="logout()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">
                                Logout
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                                <div class="text-3xl font-bold mb-1">${progress ? progress.totalUsers : 0}</div>
                                <div class="text-blue-100">Total Users</div>
                            </div>
                            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                                <div class="text-3xl font-bold mb-1">${progress ? progress.totalGames : 0}</div>
                                <div class="text-green-100">Total Games</div>
                            </div>
                            <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                                <div class="text-3xl font-bold mb-1">${users.length}</div>
                                <div class="text-purple-100">Active Users</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">👥 All Users</h2>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="px-4 py-3 font-bold text-gray-700">Username</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Email</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Subject</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Year Group</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Games</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Joined</th>
                                        <th class="px-4 py-3 font-bold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${users.map(user => `
                                        <tr class="border-b hover:bg-gray-50">
                                            <td class="px-4 py-3 font-semibold">${user.username}</td>
                                            <td class="px-4 py-3 text-gray-600">${user.email || '<span class="text-gray-400">No email</span>'}</td>
                                            <td class="px-4 py-3">${user.subject || '-'}</td>
                                            <td class="px-4 py-3">${user.yearGroup || '-'}</td>
                                            <td class="px-4 py-3">${user.gameHistory ? user.gameHistory.length : 0}</td>
                                            <td class="px-4 py-3 text-sm text-gray-600">${user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '-'}</td>
                                            <td class="px-4 py-3">
                                                <button onclick="openResetPasswordModal('${user.username}', '${(user.email || '').replace(/'/g, "\\'")}')" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                                                    Reset Password
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function openResetPasswordModal(username, email) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.id = 'reset-password-modal';
    modal.innerHTML = `
        <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Reset Password for ${username}</h3>
            
            <div class="mb-4">
                <label class="block text-sm font-bold mb-2 text-gray-700">New Password *</label>
                <input 
                    id="new-password-input" 
                    type="password" 
                    placeholder="Enter new password" 
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none"
                    autofocus
                >
            </div>
            
            <div class="mb-6">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                        id="send-email-checkbox" 
                        type="checkbox" 
                        ${email ? 'checked' : 'disabled'}
                        class="w-5 h-5"
                    >
                    <span class="text-sm text-gray-700">Send password reset email to ${email || 'user (no email on file)'}</span>
                </label>
            </div>
            
            <div class="flex gap-3">
                <button onclick="confirmResetPassword('${username}')" class="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
                    Reset Password
                </button>
                <button onclick="document.getElementById('reset-password-modal').remove()" class="flex-1 bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600">
                    Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmResetPassword(username) {
    const newPassword = document.getElementById('new-password-input').value.trim();
    const sendEmail = document.getElementById('send-email-checkbox').checked;
    
    if (!newPassword) {
        alert('Please enter a new password');
        return;
    }
    
    if (newPassword.length < 4) {
        alert('Password must be at least 4 characters');
        return;
    }
    
    const result = resetUserPassword(state.schoolCode, username, newPassword, sendEmail);
    
    if (result.success) {
        alert(`Password reset successfully${sendEmail ? '. Email sent to user.' : '.'}`);
        document.getElementById('reset-password-modal').remove();
        render();
    } else {
        alert('Error: ' + (result.error || 'Failed to reset password'));
    }
}

function openSuperAdminResetPasswordModal(username, schoolCode, email, schoolName) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.id = 'super-admin-reset-password-modal';
    modal.innerHTML = `
        <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Reset Password for ${username}</h3>
            <p class="text-sm text-gray-600 mb-4">School: ${schoolName} (${schoolCode})</p>
            
            <div class="mb-4">
                <label class="block text-sm font-bold mb-2 text-gray-700">New Password *</label>
                <input 
                    id="super-admin-new-password-input" 
                    type="password" 
                    placeholder="Enter new password" 
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none"
                    autofocus
                >
                <p class="text-xs text-gray-500 mt-1">Minimum 4 characters</p>
            </div>
            
            <div class="mb-6">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                        id="super-admin-send-email-checkbox" 
                        type="checkbox" 
                        ${email ? 'checked' : 'disabled'}
                        class="w-5 h-5"
                    >
                    <span class="text-sm text-gray-700">Send password reset email to ${email || 'user (no email on file)'}</span>
                </label>
            </div>
            
            <div class="flex gap-3">
                <button onclick="confirmSuperAdminResetPassword('${username}', '${schoolCode}')" class="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
                    Reset Password
                </button>
                <button onclick="document.getElementById('super-admin-reset-password-modal').remove()" class="flex-1 bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600">
                    Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmSuperAdminResetPassword(username, schoolCode) {
    const newPassword = document.getElementById('super-admin-new-password-input').value.trim();
    const sendEmail = document.getElementById('super-admin-send-email-checkbox').checked;
    
    if (!newPassword) {
        alert('Please enter a new password');
        return;
    }
    
    if (newPassword.length < 4) {
        alert('Password must be at least 4 characters');
        return;
    }
    
    const result = resetUserPassword(schoolCode, username, newPassword, sendEmail);
    
    if (result.success) {
        alert(`Password reset successfully${sendEmail ? '. Email sent to user.' : '.'}`);
        document.getElementById('super-admin-reset-password-modal').remove();
        render();
    } else {
        alert('Error: ' + (result.error || 'Failed to reset password'));
    }
}

render();


// Data Storage Functions
// Save data to both localStorage (for browser) and JSON file (for persistence)
const DATA_FILE_NAME = 'taboo-game-data.json';

// Super Admin Configuration
const SUPER_ADMIN_ACCOUNTS = [
    {
        email: 'rob.reichstorer@gmail.com',
        password: 'sidwom-3xycje-wAsgoh'
    },
    {
        email: 'admin',
        password: 'admin2024' // Legacy admin password
    }
];

// School Management Functions
function getAllSchools() {
    const allData = getAllData();
    return allData.schools || {};
}

function getSchool(schoolCode) {
    const schools = getAllSchools();
    return schools[schoolCode] || null;
}

function createSchool(schoolName, schoolCode, adminPassword) {
    const allData = getAllData();
    if (!allData.schools) allData.schools = {};
    
    if (allData.schools[schoolCode]) {
        return { success: false, error: 'School code already exists' };
    }
    
    allData.schools[schoolCode] = {
        schoolCode: schoolCode,
        schoolName: schoolName,
        adminPassword: adminPassword, // In production, hash this
        createdAt: new Date().toISOString(),
        users: {},
        subjects: [],
        yearGroups: []
    };
    
    saveAllData(allData);
    return { success: true, school: allData.schools[schoolCode] };
}

function joinSchool(schoolCode, username, subject, yearGroup, email) {
    const allData = getAllData();
    const school = getSchool(schoolCode);
    
    if (!school) {
        return { success: false, error: 'School not found' };
    }
    
    // Add user to school
    if (!school.users[username]) {
        school.users[username] = {
            username: username,
            email: email || '',
            subject: subject || '',
            yearGroup: yearGroup || '',
            password: '', // Will be set by admin or user
            joinedAt: new Date().toISOString(),
            teams: [
                { name: 'Team 1', score: 0, skipped: 0, totalScore: 0 },
                { name: 'Team 2', score: 0, skipped: 0, totalScore: 0 }
            ],
            totalScore: {},
            currentGameSet: 'default',
            gameHistory: []
        };
        
        // Update school's subject and year group lists
        if (subject && !school.subjects.includes(subject)) {
            school.subjects.push(subject);
        }
        if (yearGroup && !school.yearGroups.includes(yearGroup)) {
            school.yearGroups.push(yearGroup);
        }
        
        saveAllData(allData);
    } else {
        // Update email if provided and different
        if (email && email !== school.users[username].email) {
            school.users[username].email = email;
            saveAllData(allData);
        }
    }
    
    return { success: true, user: school.users[username] };
}

function resetUserPassword(schoolCode, username, newPassword, sendEmail) {
    const allData = getAllData();
    const school = getSchool(schoolCode);
    
    if (!school) {
        return { success: false, error: 'School not found' };
    }
    
    if (!school.users[username]) {
        return { success: false, error: 'User not found' };
    }
    
    const user = school.users[username];
    const oldPassword = user.password || '';
    user.password = newPassword;
    user.passwordResetAt = new Date().toISOString();
    user.passwordResetBy = 'admin';
    
    saveAllData(allData);
    
    // Send email if requested and email exists
    if (sendEmail && user.email) {
        sendPasswordResetEmail(user.email, username, newPassword, school.schoolName).catch(err => {
            console.error('Failed to send password reset email:', err);
        });
    }
    
    return { success: true, user: user };
}

async function sendPasswordResetEmail(email, username, newPassword, schoolName) {
    try {
        // Try to send via Netlify Function or server endpoint
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: email,
                subject: 'Password Reset - Music Taboo Game',
                html: `
                    <h2>Password Reset</h2>
                    <p>Hello ${username},</p>
                    <p>Your password for ${schoolName} on Music Taboo Game has been reset by an administrator.</p>
                    <p><strong>Your new password is: ${newPassword}</strong></p>
                    <p>Please log in and change this password to something you'll remember.</p>
                    <p>If you did not request this password reset, please contact your administrator immediately.</p>
                `,
                text: `Hello ${username},\n\nYour password for ${schoolName} on Music Taboo Game has been reset by an administrator.\n\nYour new password is: ${newPassword}\n\nPlease log in and change this password to something you'll remember.\n\nIf you did not request this password reset, please contact your administrator immediately.`
            })
        });
        
        if (response.ok) {
            console.log('Password reset email sent successfully');
            return { success: true };
        } else {
            console.error('Failed to send email:', await response.text());
            return { success: false, error: 'Email service unavailable' };
        }
    } catch (error) {
        console.error('Error sending email:', error);
        // Fallback: try PHP endpoint if Netlify Function doesn't exist
        try {
            const response = await fetch('send-email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: email,
                    subject: 'Password Reset - Music Taboo Game',
                    message: `Hello ${username},\n\nYour password for ${schoolName} on Music Taboo Game has been reset by an administrator.\n\nYour new password is: ${newPassword}\n\nPlease log in and change this password to something you'll remember.`
                })
            });
            return { success: response.ok };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
}

function getSchoolProgress(schoolCode) {
    const school = getSchool(schoolCode);
    if (!school) return null;
    
    const progress = {
        totalUsers: Object.keys(school.users).length,
        totalGames: 0,
        subjects: {},
        yearGroups: {},
        topPerformers: [],
        recentGames: []
    };
    
    // Aggregate data from all users
    Object.values(school.users).forEach(user => {
        if (user.gameHistory) {
            progress.totalGames += user.gameHistory.length;
            
            // Group by subject
            if (user.subject) {
                if (!progress.subjects[user.subject]) {
                    progress.subjects[user.subject] = { users: 0, games: 0 };
                }
                progress.subjects[user.subject].users++;
                progress.subjects[user.subject].games += user.gameHistory.length;
            }
            
            // Group by year group
            if (user.yearGroup) {
                if (!progress.yearGroups[user.yearGroup]) {
                    progress.yearGroups[user.yearGroup] = { users: 0, games: 0 };
                }
                progress.yearGroups[user.yearGroup].users++;
                progress.yearGroups[user.yearGroup].games += user.gameHistory.length;
            }
            
            // Collect recent games
            user.gameHistory.slice(0, 10).forEach(game => {
                progress.recentGames.push({
                    username: user.username,
                    subject: user.subject,
                    yearGroup: user.yearGroup,
                    ...game
                });
            });
        }
        
        // Calculate total scores for top performers
        let userTotalScore = 0;
        if (user.totalScore) {
            userTotalScore = Object.values(user.totalScore).reduce((sum, score) => sum + score, 0);
        }
        progress.topPerformers.push({
            username: user.username,
            subject: user.subject,
            yearGroup: user.yearGroup,
            totalScore: userTotalScore,
            gamesPlayed: user.gameHistory ? user.gameHistory.length : 0
        });
    });
    
    // Sort top performers
    progress.topPerformers.sort((a, b) => b.totalScore - a.totalScore);
    progress.recentGames.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return progress;
}

// Super Admin Functions
function getAllSchoolsStats() {
    const schools = getAllSchools();
    const stats = {
        totalSchools: Object.keys(schools).length,
        totalUsers: 0,
        totalGames: 0,
        schools: [],
        recentActivity: []
    };
    
    Object.entries(schools).forEach(([code, school]) => {
        const userCount = Object.keys(school.users || {}).length;
        let gameCount = 0;
        let lastActivity = null;
        
        // Count games and find last activity
        Object.values(school.users || {}).forEach(user => {
            if (user.gameHistory && user.gameHistory.length > 0) {
                gameCount += user.gameHistory.length;
                const lastGame = user.gameHistory[user.gameHistory.length - 1];
                if (!lastActivity || new Date(lastGame.date) > new Date(lastActivity)) {
                    lastActivity = lastGame.date;
                }
            }
            if (user.joinedAt && (!lastActivity || new Date(user.joinedAt) > new Date(lastActivity))) {
                lastActivity = user.joinedAt;
            }
        });
        
        stats.totalUsers += userCount;
        stats.totalGames += gameCount;
        
        stats.schools.push({
            code: code,
            name: school.schoolName,
            createdAt: school.createdAt,
            userCount: userCount,
            gameCount: gameCount,
            lastActivity: lastActivity,
            subjects: school.subjects || [],
            yearGroups: school.yearGroups || []
        });
        
        // Collect recent activity
        Object.values(school.users || {}).forEach(user => {
            if (user.gameHistory) {
                user.gameHistory.slice(-3).forEach(game => {
                    stats.recentActivity.push({
                        schoolCode: code,
                        schoolName: school.schoolName,
                        username: user.username,
                        date: game.date,
                        gameSet: game.gameSetName || game.gameSet
                    });
                });
            }
        });
    });
    
    // Sort schools by activity
    stats.schools.sort((a, b) => {
        if (b.lastActivity && a.lastActivity) {
            return new Date(b.lastActivity) - new Date(a.lastActivity);
        }
        return b.gameCount - a.gameCount;
    });
    
    // Sort recent activity
    stats.recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    stats.recentActivity = stats.recentActivity.slice(0, 20);
    
    return stats;
}

function verifySuperAdmin(email, password) {
    if (!email || !password) return false;
    
    // Check if email/password combination exists
    return SUPER_ADMIN_ACCOUNTS.some(account => 
        account.email.toLowerCase() === email.toLowerCase() && 
        account.password === password
    );
}

// Initialize data loading on startup
let dataFileLoaded = false;

async function loadDataFromFile() {
    if (dataFileLoaded) return;
    
    // First try to load from file (if in Electron)
    if (window.electronAPI && window.electronAPI.readDataFile) {
        try {
            const fileData = await window.electronAPI.readDataFile(DATA_FILE_NAME);
            if (fileData) {
                const parsed = JSON.parse(fileData);
                // Sync to localStorage as cache
                localStorage.setItem('tabooAllData', fileData);
                dataFileLoaded = true;
                return parsed;
            }
        } catch (e) {
            console.log('Could not read from file, trying server:', e);
        }
    }
    
    // Try to load from server (PHP or Node.js backend)
    try {
        const response = await fetch('save-data.php');
        if (response.ok) {
            const fileData = await response.text();
            if (fileData) {
                const parsed = JSON.parse(fileData);
                // Sync to localStorage as cache
                localStorage.setItem('tabooAllData', fileData);
                dataFileLoaded = true;
                return parsed;
            }
        }
    } catch (e) {
        console.log('Could not load from server, using localStorage:', e);
    }
    
    dataFileLoaded = true;
    return null;
}

function getAllData() {
    // Try localStorage first (fastest)
    const data = localStorage.getItem('tabooAllData');
    if (data) {
        return JSON.parse(data);
    }
    
    // If no localStorage data, return empty structure
    return { users: {}, gameSets: {} };
}

async function saveAllData(data) {
    const dataStr = JSON.stringify(data, null, 2);
    
    // Save to localStorage as cache (always works, fast)
    localStorage.setItem('tabooAllData', dataStr);
    
    // ALWAYS save to server first (for Netlify/web hosting)
    try {
        const response = await fetch('save-data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: dataStr
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log('✅ Data saved to server: taboo-game-data.json');
                return; // Success - data saved to server
            }
        } else {
            console.warn('⚠️ Server save returned non-OK status:', response.status);
        }
    } catch (e) {
        console.error('❌ Server save failed:', e);
        // Continue to fallback options
    }
    
    // Fallback: Save to file if in Electron (for desktop app only)
    if (window.electronAPI && window.electronAPI.writeDataFile) {
        try {
            const result = await window.electronAPI.writeDataFile(DATA_FILE_NAME, dataStr);
            if (result && result.success) {
                console.log('✅ Data saved to Electron file:', result.path || DATA_FILE_NAME);
                return;
            }
        } catch (e) {
            console.error('❌ Electron file save failed:', e);
        }
    }
    
    // Final fallback: localStorage only (will sync to server on next save)
    console.log('💾 Data saved to localStorage (will sync to server on next connection)');
}

// Load data from file on startup
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        loadDataFromFile().then(fileData => {
            if (fileData) {
                // Merge file data with localStorage (file takes precedence)
                const currentData = getAllData();
                const mergedData = {
                    users: { ...currentData.users, ...fileData.users },
                    gameSets: { ...currentData.gameSets, ...fileData.gameSets }
                };
                saveAllData(mergedData);
            }
        });
    });
}

function getUserData(username) {
    const allData = getAllData();
    if (!allData.users[username]) {
        allData.users[username] = {
            username: username,
            teams: [
                { name: 'Team 1', score: 0, skipped: 0, totalScore: 0 },
                { name: 'Team 2', score: 0, skipped: 0, totalScore: 0 }
            ],
            totalScore: {},
            currentGameSet: 'default',
            gameHistory: [],
            createdAt: new Date().toISOString()
        };
        saveAllData(allData);
    }
    // Ensure gameHistory exists for existing users
    if (!allData.users[username].gameHistory) {
        allData.users[username].gameHistory = [];
        saveAllData(allData);
    }
    return allData.users[username];
}

function saveUserData(username, userData) {
    const allData = getAllData();
    allData.users[username] = userData;
    saveAllData(allData);
}

function getGameSets() {
    const allData = getAllData();
    
    // Track if defaults have been initialized
    if (!allData.defaultsInitialized) {
        // First time - initialize all defaults
        if (!allData.gameSets) {
            allData.gameSets = {};
        }
        
        // Add default game sets only if they don't exist
        if (!allData.gameSets.default) {
            allData.gameSets.default = {
                name: 'Instruments in an Orchestra',
                description: 'Learn about orchestra instruments - how they make sound, their size, and position',
                cards: DEFAULT_INSTRUMENTS,
                createdAt: new Date().toISOString()
            };
        }
        if (!allData.gameSets.musicalVocab) {
            allData.gameSets.musicalVocab = {
                name: 'Musical Vocabulary',
                description: 'Learn musical terms - tempo, dynamics, expression, and musical elements',
                cards: DEFAULT_MUSICAL_VOCAB,
                createdAt: new Date().toISOString()
            };
        }
        if (!allData.gameSets.ukuleleChords) {
            allData.gameSets.ukuleleChords = {
                name: 'Ukulele Chords',
                description: 'Learn beginner ukulele chords - C, G, F, Am, Em',
                cards: DEFAULT_UKULELE_CHORDS,
                createdAt: new Date().toISOString()
            };
        }
        if (!allData.gameSets.ukuleleTab) {
            allData.gameSets.ukuleleTab = {
                name: 'Ukulele Tab Notation',
                description: 'Learn how to read ukulele tablature notation',
                cards: DEFAULT_UKULELE_TAB,
                createdAt: new Date().toISOString()
            };
        }
        if (!allData.gameSets.recorder) {
            allData.gameSets.recorder = {
                name: 'Recorder Playing',
                description: 'Learn how to make a good sound on the recorder and play notes B, A, G, and more',
                cards: DEFAULT_RECORDER,
                createdAt: new Date().toISOString()
            };
        }
        
        // Add additional default game sets that were added in later updates
        // Only add if they don't exist (but don't re-add if user deleted them)
        const additionalDefaults = [
            { id: 'musicNotes', name: 'Music Notes on Staff', desc: 'Learn the notes C, D, E, F, G, A, B on the staff', cards: DEFAULT_MUSIC_NOTES },
            { id: 'rhythmPatterns', name: 'Rhythm Patterns', desc: 'Learn rhythm patterns - Ta, Ta-ah, Ti-ti, and rests', cards: DEFAULT_RHYTHM_PATTERNS },
            { id: 'singing', name: 'Singing Techniques', desc: 'Learn how to sing well - breathing, posture, and warm-ups', cards: DEFAULT_SINGING },
            { id: 'bodyPercussion', name: 'Body Percussion', desc: 'Learn body percussion - clap, stamp, tap, pat, click', cards: DEFAULT_BODY_PERCUSSION },
            { id: 'musicSymbols', name: 'Music Symbols', desc: 'Learn music symbols - clefs, sharps, flats, naturals, fermatas', cards: DEFAULT_MUSIC_SYMBOLS },
            { id: 'worldMusic', name: 'Music from Around the World', desc: 'Learn about different music styles from around the world', cards: DEFAULT_WORLD_MUSIC },
            { id: 'musicEmotions', name: 'Music and Emotions', desc: 'Learn how music can express different emotions', cards: DEFAULT_MUSIC_EMOTIONS },
            { id: 'musicMovement', name: 'Music and Movement', desc: 'Learn movements to music - march, skip, gallop, sway, freeze', cards: DEFAULT_MUSIC_MOVEMENT },
            { id: 'simpleSongs', name: 'Simple Songs', desc: 'Learn about well-known simple songs', cards: DEFAULT_SIMPLE_SONGS },
            { id: 'instrumentSounds', name: 'Instrument Sounds', desc: 'Learn about different types of sounds instruments make', cards: DEFAULT_INSTRUMENT_SOUNDS },
            { id: 'musicStories', name: 'Music in Stories', desc: 'Learn how music is used in films and stories', cards: DEFAULT_MUSIC_STORIES }
        ];
        
        // Track which additional defaults have been initialized
        if (!allData.additionalDefaultsInitialized) {
            additionalDefaults.forEach(def => {
                if (!allData.gameSets[def.id]) {
                    allData.gameSets[def.id] = {
                        name: def.name,
                        description: def.desc,
                        cards: def.cards,
                        createdAt: new Date().toISOString()
                    };
                }
            });
            allData.additionalDefaultsInitialized = true;
            saveAllData(allData);
        }
        
        // Mark defaults as initialized
        allData.defaultsInitialized = true;
        saveAllData(allData);
    } else {
        // Defaults already initialized - don't re-add deleted sets
        // Only ensure gameSets object exists
        if (!allData.gameSets) {
            allData.gameSets = {};
        }
    }
    // Update existing default if it has old name
    if (allData.gameSets.default && allData.gameSets.default.name === 'Musical Instruments') {
        allData.gameSets.default.name = 'Instruments in an Orchestra';
        allData.gameSets.default.description = 'Learn about orchestra instruments - how they make sound, their size, and position';
        saveAllData(allData);
    }
    return allData.gameSets;
}

function saveGameSet(setId, gameSet) {
    const allData = getAllData();
    allData.gameSets[setId] = gameSet;
    saveAllData(allData);
}

function deleteGameSet(setId) {
    const allData = getAllData();
    delete allData.gameSets[setId];
    saveAllData(allData);
}

// Export/Import Functions
function exportData() {
    const allData = getAllData();
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taboo-game-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Auto-backup functionality removed - all data now saves directly to server

// Removed backup functions - data saves directly to server
async function requestBackupFolderPermission_DISABLED() {
    try {
        // Check if File System Access API is supported
        if (!('showDirectoryPicker' in window)) {
            console.warn('File System Access API not supported. Falling back to download.');
            return false;
        }
        
        // Request permission to access a directory
        backupDirectoryHandle = await window.showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'documents'
        });
        
        // Store the permission in localStorage (browser remembers it)
        localStorage.setItem('backupFolderPermission', 'granted');
        return true;
    } catch (error) {
        if (error.name === 'AbortError') {
            // User cancelled
            return false;
        }
        console.error('Error requesting folder permission:', error);
        return false;
    }
}

async function autoBackup_DISABLED() {
    try {
        const allData = getAllData();
        if (!allData || (Object.keys(allData.users || {}).length === 0 && Object.keys(allData.gameSets || {}).length === 0)) {
            return; // No data to backup
        }
        
        const dataStr = JSON.stringify(allData, null, 2);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `taboo-auto-backup-${timestamp}.json`;
        
        // Try Electron API first (if running as Electron app)
        if (window.electronAPI) {
            try {
                let backupDir = await window.electronAPI.getBackupDirectory();
                if (!backupDir) {
                    // Request folder selection
                    backupDir = await window.electronAPI.selectBackupFolder();
                    if (!backupDir) {
                        fallbackDownload(dataStr, filename);
                        return;
                    }
                }
                
                const result = await window.electronAPI.saveBackupFile(dataStr, filename);
                if (result.success) {
                    localStorage.setItem('lastAutoBackup', new Date().toISOString());
                    console.log('Auto-backup saved to:', result.path);
                    return;
                } else {
                    console.error('Error saving backup:', result.error);
                    fallbackDownload(dataStr, filename);
                    return;
                }
            } catch (error) {
                console.error('Electron backup failed:', error);
                fallbackDownload(dataStr, filename);
                return;
            }
        }
        
        // Try to use File System Access API to save to app folder
        if ('showDirectoryPicker' in window) {
            try {
                // Check if we have a saved directory handle
                const savedHandle = localStorage.getItem('backupDirectoryHandle');
                let directoryHandle = null;
                
                if (savedHandle) {
                    try {
                        // Try to restore the directory handle (this might not work across sessions)
                        // For now, we'll request permission each time or use a fallback
                    } catch (e) {
                        // Handle doesn't work, need to request again
                    }
                }
                
                // Request directory access (user will choose the app folder)
                if (!backupDirectoryHandle) {
                    const permission = await requestBackupFolderPermission();
                    if (!permission) {
                        // User cancelled or not supported, fall back to download
                        fallbackDownload(dataStr, filename);
                        return;
                    }
                }
                
                // Write file to the selected directory
                const fileHandle = await backupDirectoryHandle.getFileHandle(filename, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(dataStr);
                await writable.close();
                
                // Save last backup time
                localStorage.setItem('lastAutoBackup', new Date().toISOString());
                console.log('Auto-backup saved to folder:', filename);
                return;
            } catch (error) {
                console.error('Error saving to folder:', error);
                // Fall back to download
                fallbackDownload(dataStr, filename);
            }
        } else {
            // File System Access API not supported, use download fallback
            fallbackDownload(dataStr, filename);
        }
    } catch (error) {
        console.error('Auto-backup failed:', error);
        // Try fallback
        try {
            const allData = getAllData();
            const dataStr = JSON.stringify(allData, null, 2);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            fallbackDownload(dataStr, `taboo-auto-backup-${timestamp}.json`);
        } catch (e) {
            console.error('Fallback backup also failed:', e);
        }
    }
}

function fallbackDownload(dataStr, filename) {
    // Fallback: download to Downloads folder
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Save last backup time
    localStorage.setItem('lastAutoBackup', new Date().toISOString());
}

// Check if backup is needed and perform it
function checkAndBackup_DISABLED() {
    // Auto-backup disabled - all data saves directly to server
    return;
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!importedData || typeof importedData !== 'object') {
                alert('Invalid data format. The file must contain valid JSON data.');
                return;
            }
            
            // Ensure required structure exists
            if (!importedData.users) importedData.users = {};
            if (!importedData.gameSets) importedData.gameSets = {};
            
            // Preserve gameHistory for existing users if not in imported data
            const currentData = getAllData();
            if (currentData && currentData.users) {
                Object.keys(currentData.users).forEach(username => {
                    if (currentData.users[username].gameHistory && 
                        (!importedData.users[username] || !importedData.users[username].gameHistory)) {
                        if (!importedData.users[username]) {
                            importedData.users[username] = { ...currentData.users[username] };
                        } else {
                            importedData.users[username].gameHistory = currentData.users[username].gameHistory;
                        }
                    }
                });
            }
            
            if (confirm('This will replace all current data. Continue?')) {
                // Save to localStorage
                saveAllData(importedData);
                
                // Verify it was saved
                const verifyData = getAllData();
                if (verifyData && Object.keys(verifyData).length > 0) {
                    alert('Data imported and saved successfully!');
                    location.reload();
                } else {
                    alert('Error: Data was not saved properly. Please try again.');
                }
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
    
    // Reset the file input so the same file can be imported again if needed
    event.target.value = '';
}

// Utility Functions
function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function makeConfetti() {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    for (let i = 0; i < 25; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.left = Math.random() * 100 + '%';
        el.style.top = '-10px';
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.animationDelay = (Math.random() * 0.2) + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1300);
    }
}


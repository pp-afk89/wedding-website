/* ============================================
   WEDDING ADMIN PANEL - COMPLETE JAVASCRIPT
   - Admin login
   - Guest management
   - Dietary requirements display
   - PDF and Excel export
   ============================================ */

let guests = [];
let autoSaveTimeout = null;

// ============================================
// ADMIN LOGIN
// ============================================

document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('admin-password').value;
    const errorMessage = document.getElementById('login-error');
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        if (response.ok) {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
            loadGuests();
        } else {
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        alert('Connection error. Please try again.');
    }
});

// ============================================
// LOAD AND DISPLAY GUESTS
// ============================================

async function loadGuests() {
    try {
        const response = await fetch('/api/guests');
        guests = await response.json();
        
        updateDashboard();
        renderGuestTable();
    } catch (error) {
        console.error('Error loading guests:', error);
        alert('Failed to load guest data');
    }
}

function updateDashboard() {
    // Count totals
    const totalGuests = guests.length;
    const ceremonyCount = guests.filter(g => g.events.ceremony).length;
    const receptionCount = guests.filter(g => g.events.reception).length;
    const celebrationCount = guests.filter(g => g.events.celebration).length;
    
    // Update dashboard
    document.getElementById('total-guests').textContent = totalGuests;
    document.getElementById('ceremony-count').textContent = ceremonyCount;
    document.getElementById('reception-count').textContent = receptionCount;
    document.getElementById('celebration-count').textContent = celebrationCount;
}

function renderGuestTable() {
    const tbody = document.getElementById('guest-table-body');
    tbody.innerHTML = '';
    
    guests.forEach(guest => {
        const row = document.createElement('tr');
        
        // Display Name
        const nameCell = document.createElement('td');
        nameCell.textContent = guest.displayName;
        row.appendChild(nameCell);
        
        // Username
        const usernameCell = document.createElement('td');
        usernameCell.textContent = guest.username;
        row.appendChild(usernameCell);
        
        // Ceremony Checkbox
        const ceremonyCell = document.createElement('td');
        const ceremonyCheckbox = createCheckbox(guest.username, 'ceremony', guest.events.ceremony);
        ceremonyCell.appendChild(ceremonyCheckbox);
        row.appendChild(ceremonyCell);
        
        // Reception Checkbox
        const receptionCell = document.createElement('td');
        const receptionCheckbox = createCheckbox(guest.username, 'reception', guest.events.reception);
        receptionCell.appendChild(receptionCheckbox);
        row.appendChild(receptionCell);
        
        // Celebration Checkbox
        const celebrationCell = document.createElement('td');
        const celebrationCheckbox = createCheckbox(guest.username, 'celebration', guest.events.celebration);
        celebrationCell.appendChild(celebrationCheckbox);
        row.appendChild(celebrationCell);
        
        // Dietary Requirements
        const dietaryCell = document.createElement('td');
        if (guest.dietaryRequirements && guest.dietaryRequirements.trim() !== '') {
            const indicator = document.createElement('span');
            indicator.className = 'dietary-indicator';
            indicator.innerHTML = '⚠️';
            indicator.title = 'Click to view dietary requirements';
            indicator.onclick = () => showDietaryModal(guest.displayName, guest.dietaryRequirements);
            dietaryCell.appendChild(indicator);
        } else {
            const noIndicator = document.createElement('span');
            noIndicator.className = 'no-dietary';
            noIndicator.textContent = '-';
            dietaryCell.appendChild(noIndicator);
        }
        row.appendChild(dietaryCell);
        
        // Gift Selection
        const giftCell = document.createElement('td');
        giftCell.textContent = guest.giftSelection || '-';
        row.appendChild(giftCell);
        
        tbody.appendChild(row);
    });
}

function createCheckbox(username, eventType, checked) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;
    checkbox.onchange = () => updateGuestEvent(username, eventType, checkbox.checked);
    return checkbox;
}

// ============================================
// UPDATE GUEST DATA
// ============================================

async function updateGuestEvent(username, eventType, value) {
    // Find guest in local array
    const guest = guests.find(g => g.username === username);
    if (!guest) return;
    
    // Update local data
    guest.events[eventType] = value;
    
    // Debounce auto-save (wait 1 second after last change)
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => saveGuest(guest), 1000);
}

async function saveGuest(guest) {
    try {
        const response = await fetch(`/api/guests/${guest.username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(guest)
        });
        
        if (response.ok) {
            showSaveIndicator();
            updateDashboard();
        } else {
            alert('Failed to save changes');
        }
    } catch (error) {
        console.error('Error saving guest:', error);
        alert('Connection error. Please try again.');
    }
}

function showSaveIndicator() {
    const indicator = document.getElementById('save-indicator');
    indicator.classList.add('show');
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 2000);
}

// ============================================
// DIETARY REQUIREMENTS MODAL
// ============================================

function showDietaryModal(guestName, requirements) {
    const modal = document.getElementById('dietary-modal');
    const title = document.getElementById('dietary-modal-title');
    const content = document.getElementById('dietary-modal-content');
    
    title.textContent = `${guestName} - Dietary Requirements`;
    content.textContent = requirements;
    
    modal.style.display = 'block';
}

function closeDietaryModal() {
    document.getElementById('dietary-modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('dietary-modal');
    if (event.target === modal) {
        closeDietaryModal();
    }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

function downloadExcel() {
    window.location.href = '/api/guests/export-excel';
}

function downloadDietaryPDF() {
    // Check if any guests have dietary requirements
    const hasDietary = guests.some(g => g.dietaryRequirements && g.dietaryRequirements.trim() !== '');
    
    if (!hasDietary) {
        alert('No guests have submitted dietary requirements yet.');
        return;
    }
    
    window.location.href = '/api/dietary/export-pdf';
}

function refreshData() {
    loadGuests();
    showSaveIndicator();
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R to refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshData();
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        closeDietaryModal();
    }
});

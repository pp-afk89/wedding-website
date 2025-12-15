// Admin Panel JavaScript
const ADMIN_PASSWORD = 'ar0y092';
let guests = [];
let editingIndex = -1;

// ============================================
// LOGIN FUNCTIONALITY
// ============================================

document.getElementById('admin-login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const password = document.getElementById('admin-password').value;
    const errorMsg = document.getElementById('login-error');
    
    if (password === ADMIN_PASSWORD) {
        // Store login in session
        sessionStorage.setItem('adminLoggedIn', 'true');
        
        // Hide login, show panel
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        
        // Load guests
        loadGuests();
    } else {
        errorMsg.textContent = 'Incorrect password';
        errorMsg.classList.add('show');
    }
});

// Check if already logged in
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadGuests();
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    location.reload();
}

// ============================================
// LOAD GUESTS
// ============================================

async function loadGuests() {
    try {
        const response = await fetch('/api/admin/guests');
        guests = await response.json();
        renderGuestList();
        updateGuestCount();
    } catch (error) {
        console.error('Error loading guests:', error);
        showMessage('Error loading guests', 'error');
    }
}

// ============================================
// RENDER GUEST LIST
// ============================================

function renderGuestList(searchTerm = '') {
    const tbody = document.getElementById('guest-list');
    
    // Filter guests by search term
    const filteredGuests = guests.filter(guest => {
        const searchLower = searchTerm.toLowerCase();
        return guest.username.toLowerCase().includes(searchLower) ||
               guest.displayName.toLowerCase().includes(searchLower);
    });
    
    if (filteredGuests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">No guests found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredGuests.map((guest, index) => {
        // Find original index
        const originalIndex = guests.indexOf(guest);
        
        // Event badges
        const events = [];
        if (guest.events.ceremony) events.push('<span class="event-badge">Ceremony</span>');
        if (guest.events.familyReception) events.push('<span class="event-badge">Family Reception</span>');
        if (guest.events.weddingCelebration) events.push('<span class="event-badge">Wedding Celebration</span>');
        
        // Dietary requirements indicator
        const hasDietary = guest.dietaryRequirements && guest.dietaryRequirements.trim() !== '';
        const dietaryIndicator = hasDietary 
            ? `<span class="dietary-warning" onclick="showDietaryModal('${guest.displayName.replace(/'/g, "\\'")}', '${guest.dietaryRequirements.replace(/'/g, "\\'").replace(/\n/g, '\\n')}')">⚠️</span>`
            : '<span style="color: #ccc;">—</span>';
        
        // Gift info
        const giftInfo = guest.giftChoice 
            ? `<div class="gift-info">
                 <span class="gift-choice">${guest.giftChoice}</span>
                 ${guest.paymentStatus ? `<span class="payment-status clicked">${guest.paymentStatus}</span>` : ''}
               </div>`
            : '<span style="color: #999;">Not selected</span>';
        
        return `
            <tr>
                <td><code>${guest.username}</code></td>
                <td><strong>${guest.displayName}</strong></td>
                <td><div class="event-badges">${events.join('') || '<span style="color: #999;">None</span>'}</div></td>
                <td style="text-align: center;">${dietaryIndicator}</td>
                <td>${giftInfo}</td>
                <td>${guest.paymentStatus ? '<span class="payment-status clicked">✓ Clicked</span>' : '<span style="color: #999;">—</span>'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editGuest(${originalIndex})">Edit</button>
                        <button class="btn-delete" onclick="deleteGuest(${originalIndex})">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateGuestCount() {
    document.getElementById('guest-count').textContent = guests.length;
    updateDashboardStats();
}

// Update dashboard statistics
function updateDashboardStats() {
    document.getElementById('total-guests').textContent = guests.length;
    
    const ceremonyCount = guests.filter(g => g.events.ceremony).length;
    const receptionCount = guests.filter(g => g.events.familyReception).length;
    const celebrationCount = guests.filter(g => g.events.weddingCelebration).length;
    
    document.getElementById('ceremony-count').textContent = ceremonyCount;
    document.getElementById('reception-count').textContent = receptionCount;
    document.getElementById('celebration-count').textContent = celebrationCount;
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

document.getElementById('search-guests').addEventListener('input', function(e) {
    renderGuestList(e.target.value);
});

// ============================================
// ADD/EDIT GUEST FORM
// ============================================

document.getElementById('guest-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const guestData = {
        username: document.getElementById('username').value.trim(),
        displayName: document.getElementById('displayName').value.trim(),
        events: {
            ceremony: document.getElementById('ceremony').checked,
            familyReception: document.getElementById('familyReception').checked,
            weddingCelebration: document.getElementById('weddingCelebration').checked
        },
        giftChoice: null,
        paymentStatus: null
    };
    
    // Validate at least one event is selected
    const hasEvent = guestData.events.ceremony || guestData.events.familyReception || guestData.events.weddingCelebration;
    if (!hasEvent) {
        showMessage('Please select at least one event', 'error');
        return;
    }
    
    // Check for duplicate username (when adding new)
    if (editingIndex === -1) {
        const duplicate = guests.find(g => g.username === guestData.username);
        if (duplicate) {
            showMessage('Username already exists', 'error');
            return;
        }
    }
    
    try {
        if (editingIndex === -1) {
            // Add new guest
            const response = await fetch('/api/admin/guests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(guestData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                guests.push(guestData);
                showMessage('Guest added successfully ✓', 'success');
                clearForm();
                renderGuestList();
                updateGuestCount();
            }
        } else {
            // Update existing guest
            // Preserve gift data if it exists
            if (guests[editingIndex].giftChoice) {
                guestData.giftChoice = guests[editingIndex].giftChoice;
                guestData.paymentStatus = guests[editingIndex].paymentStatus;
            }
            
            const response = await fetch(`/api/admin/guests/${guests[editingIndex].username}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(guestData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                guests[editingIndex] = guestData;
                showMessage('Guest updated successfully ✓', 'success');
                cancelEdit();
                renderGuestList();
            }
        }
    } catch (error) {
        console.error('Error saving guest:', error);
        showMessage('Error saving guest', 'error');
    }
});

function clearForm() {
    document.getElementById('username').value = '';
    document.getElementById('displayName').value = '';
    document.getElementById('ceremony').checked = false;
    document.getElementById('familyReception').checked = false;
    document.getElementById('weddingCelebration').checked = false;
}

function showMessage(text, type) {
    const messageEl = document.getElementById('form-message');
    messageEl.textContent = text;
    messageEl.className = `form-message ${type}`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
}

// ============================================
// EDIT GUEST
// ============================================

function editGuest(index) {
    editingIndex = index;
    const guest = guests[index];
    
    // Populate form
    document.getElementById('username').value = guest.username;
    document.getElementById('displayName').value = guest.displayName;
    document.getElementById('ceremony').checked = guest.events.ceremony;
    document.getElementById('familyReception').checked = guest.events.familyReception;
    document.getElementById('weddingCelebration').checked = guest.events.weddingCelebration;
    
    // Update UI
    document.getElementById('form-title').textContent = 'Edit Guest';
    document.getElementById('save-btn').textContent = 'Update Guest';
    document.getElementById('cancel-btn').style.display = 'inline-block';
    
    // Scroll to form
    document.getElementById('guest-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelEdit() {
    editingIndex = -1;
    clearForm();
    document.getElementById('form-title').textContent = 'Add New Guest';
    document.getElementById('save-btn').textContent = 'Add Guest';
    document.getElementById('cancel-btn').style.display = 'none';
    document.getElementById('form-message').style.display = 'none';
}

// ============================================
// DELETE GUEST
// ============================================

async function deleteGuest(index) {
    const guest = guests[index];
    
    if (!confirm(`Are you sure you want to delete "${guest.displayName}" (${guest.username})?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/guests/${guest.username}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            guests.splice(index, 1);
            renderGuestList();
            updateGuestCount();
            showMessage('Guest deleted successfully', 'success');
            
            // If we were editing this guest, cancel edit
            if (editingIndex === index) {
                cancelEdit();
            }
        }
    } catch (error) {
        console.error('Error deleting guest:', error);
        showMessage('Error deleting guest', 'error');
    }
}

// ============================================
// EXPORT TO EXCEL
// ============================================

async function exportToExcel() {
    try {
        const response = await fetch('/api/admin/export-excel');
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Wedding_Guests_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showMessage('Excel file downloaded ✓', 'success');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        showMessage('Error exporting to Excel', 'error');
    }
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
    
    modal.style.display = 'flex';
}

function closeDietaryModal() {
    const modal = document.getElementById('dietary-modal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('dietary-modal');
    if (e.target === modal) {
        closeDietaryModal();
    }
});

// ============================================
// DIETARY REQUIREMENTS PDF EXPORT
// ============================================

async function downloadDietaryPDF() {
    // Check if any guests have dietary requirements
    const hasDietary = guests.some(g => g.dietaryRequirements && g.dietaryRequirements.trim() !== '');
    
    if (!hasDietary) {
        showMessage('No guests have submitted dietary requirements yet', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/dietary/export-pdf');
        
        if (!response.ok) {
            throw new Error('PDF generation failed');
        }
        
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Dietary_Requirements_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showMessage('Dietary requirements PDF downloaded ✓', 'success');
    } catch (error) {
        console.error('Error downloading dietary PDF:', error);
        showMessage('Error downloading dietary PDF', 'error');
    }
}


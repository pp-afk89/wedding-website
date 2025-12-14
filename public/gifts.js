// Check authentication
function checkAuth() {
    const guestData = sessionStorage.getItem('guestData');
    if (!guestData) {
        window.location.href = '/login';
        return null;
    }
    return JSON.parse(guestData);
}

// Check auth on page load
document.addEventListener('DOMContentLoaded', function() {
    const guest = checkAuth();
    if (!guest) return;

    // Check if guest has already made a selection
    const selectedGift = sessionStorage.getItem('selectedGift');
    if (selectedGift) {
        highlightSelection(selectedGift);
        document.getElementById('giftMessage').style.display = 'block';
    }
});

function selectGift(giftType) {
    const guest = checkAuth();
    if (!guest) return;

    // Store selection
    sessionStorage.setItem('selectedGift', giftType);

    // In production, send this to the server
    console.log('Gift selection:', {
        guest: guest.displayName,
        gift: giftType
    });

    // Update UI
    highlightSelection(giftType);
    
    // Show thank you message
    document.getElementById('giftMessage').style.display = 'block';
    document.getElementById('giftMessage').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function highlightSelection(giftType) {
    // Remove selected class from all options
    document.querySelectorAll('.gift-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Add selected class to chosen option
    const selectedOption = document.querySelector(`[data-gift="${giftType}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
}

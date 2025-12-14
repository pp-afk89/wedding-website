// Wedding Website Frontend - JSON Backend Integration

// Event Details
const eventDetails = {
    ceremony: {
        title: 'The Ceremony at Hackney Town Hall',
        date: 'Friday, 17th April 2026',
        arrival: '2:15 PM, the ceremony will begin at 2:30 PM',
        location: 'Hackney Town Hall, Mare Street, London E8 1EA',
        dressCode: 'Semi-formal: suit/tie or a nice dress!'
    },
    familyReception: {
        title: 'The Family Reception at Morito',
        date: 'Friday, 17th April 2026',
        arrival: '5 PM for cocktail hour, followed by a short inter-faith ceremony',
        extra: 'Wedding Breakfast: 7 PM, followed by a little dance!',
        location: 'Morito (restaurant), 195 Hackney Rd, London E2 8JL',
        dressCode: 'Semi-formal: suit/tie or a nice dress!'
    },
    weddingCelebration: {
        title: 'Wedding Celebration at Dükkan',
        date: 'Saturday, 18th April 2026',
        arrival: 'Rakel says 6:30 PM prompt, Piers says "Come whenever!"',
        location: 'Dükkan, 227-229 Hoxton St, London N1 5LG',
        dressCode: 'Chic Party Attire - Bold colours, sparkles and suits, please!'
    }
};

// Current guest data
let currentGuest = null;
let selectedGiftChoice = '';

// ============================================
// LOGIN FUNCTIONALITY
// ============================================

const loginForm = document.getElementById('login-form');
const loginPage = document.getElementById('login-page');
const mainSite = document.getElementById('main-site');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const guestName = document.getElementById('guest-name').value.trim();
    
    // Convert name to username format (First Last, keep spaces)
    const username = guestName
        .replace(/\s+and\s+.*/i, '')  // Remove "and ..." for couples
        .replace(/\s+&\s+.*/i, '')     // Remove "& ..." for couples
        .trim();
    
    try {
        // Fetch guest from server
        const response = await fetch('/api/guest-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentGuest = result.guest;
            
            // Store in session
            sessionStorage.setItem('currentGuest', JSON.stringify(currentGuest));
            
            // Hide login, show site
            loginPage.style.display = 'none';
            mainSite.style.display = 'block';
            
            // Populate content
            populateGuestContent(currentGuest);
            
            window.scrollTo(0, 0);
        } else {
            loginError.textContent = 'We couldn\'t find your name on the guest list. Please check spelling or contact us.';
            loginError.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'Error connecting to server. Please try again.';
        loginError.style.display = 'block';
    }
});

// Check if already logged in
const storedGuest = sessionStorage.getItem('currentGuest');
if (storedGuest) {
    currentGuest = JSON.parse(storedGuest);
    loginPage.style.display = 'none';
    mainSite.style.display = 'block';
    populateGuestContent(currentGuest);
}

// ============================================
// POPULATE GUEST CONTENT
// ============================================

function populateGuestContent(guest) {
    // Update welcome message
    const welcomeMessage = document.getElementById('welcome-message');
    welcomeMessage.textContent = `Welcome, ${guest.displayName}!`;
    
    // Create event invitations
    const eventInvitations = document.getElementById('event-invitations');
    eventInvitations.innerHTML = '';
    
    let hasEvents = false;
    
    if (guest.events.ceremony) {
        hasEvents = true;
        eventInvitations.innerHTML += createEventCard('ceremony');
    }
    
    if (guest.events.familyReception) {
        hasEvents = true;
        eventInvitations.innerHTML += createEventCard('familyReception');
    }
    
    if (guest.events.weddingCelebration) {
        hasEvents = true;
        eventInvitations.innerHTML += createEventCard('weddingCelebration');
    }
    
    if (!hasEvents) {
        eventInvitations.innerHTML = '<p style="text-align: center;">No events found for your invitation.</p>';
    }
}

function createEventCard(eventType) {
    const event = eventDetails[eventType];
    let cardHTML = `
        <div class="event-card">
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Arrival:</strong> ${event.arrival}</p>`;
    
    if (event.extra) {
        cardHTML += `<p><strong>Wedding Breakfast:</strong> 7 PM, followed by a little dance!</p>`;
    }
    
    cardHTML += `
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Dress Code:</strong> ${event.dressCode}</p>
        </div>
    `;
    
    return cardHTML;
}

// ============================================
// NAVIGATION
// ============================================

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const navHeight = document.querySelector('#navbar').offsetHeight;
            const targetPosition = targetSection.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// GIFT SELECTION
// ============================================

async function selectGift(giftType) {
    document.querySelectorAll('.gift-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`[data-gift="${giftType}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    selectedGiftChoice = giftType;
    
    // Send to server
    try {
        await fetch('/api/gift-selection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentGuest.username,
                giftChoice: giftType,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Error recording gift selection:', error);
    }
    
    // Show payment link
    const paymentLink = document.getElementById('payment-link');
    paymentLink.style.display = 'block';
    
    setTimeout(() => {
        paymentLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    
    const giftMessage = document.getElementById('gift-message');
    giftMessage.textContent = 'Thank you for your generosity!';
    giftMessage.style.display = 'block';
}

async function recordPaymentClick() {
    try {
        await fetch('/api/payment-clicked', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentGuest.username,
                giftChoice: selectedGiftChoice,
                paymentClicked: true,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Error recording payment click:', error);
    }
}

// ============================================
// LIGHTBOX GALLERY
// ============================================

let currentPhotoIndex = 0;
const totalPhotos = 9;

function openLightbox(index) {
    currentPhotoIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    
    lightboxImage.src = `/images/gallery/photo${index + 1}.jpg`;
    updateCounter();
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function changePhoto(direction) {
    currentPhotoIndex += direction;
    
    if (currentPhotoIndex >= totalPhotos) {
        currentPhotoIndex = 0;
    } else if (currentPhotoIndex < 0) {
        currentPhotoIndex = totalPhotos - 1;
    }
    
    const lightboxImage = document.getElementById('lightbox-image');
    lightboxImage.src = `/images/gallery/photo${currentPhotoIndex + 1}.jpg`;
    updateCounter();
}

function updateCounter() {
    document.getElementById('lightbox-current').textContent = currentPhotoIndex + 1;
    document.getElementById('lightbox-total').textContent = totalPhotos;
}

document.addEventListener('keydown', function(e) {
    const lightbox = document.getElementById('lightbox');
    
    if (lightbox.style.display === 'flex') {
        if (e.key === 'ArrowRight') {
            changePhoto(1);
        } else if (e.key === 'ArrowLeft') {
            changePhoto(-1);
        } else if (e.key === 'Escape') {
            closeLightbox();
        }
    }
});

document.getElementById('lightbox').addEventListener('click', function(e) {
    if (e.target === this) {
        closeLightbox();
    }
});

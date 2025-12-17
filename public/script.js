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
            <p><strong>Dress Code:</strong> ${event.dressCode}</p>`;
    
    // Add dietary button for Family Reception
    if (eventType === 'familyReception') {
        cardHTML += `
            <button class="dietary-btn" onclick="openDietaryModal()">🍽️ Dietary Requirements</button>`;
    }
    
    cardHTML += `
        </div>
    `;
    
    return cardHTML;
}

// ============================================
// NAVIGATION
// ============================================

// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const navContainer = document.getElementById('nav-container');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navContainer.classList.toggle('active');
    });
}

// Navigation links - smooth scroll and close menu
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Close mobile menu
        if (hamburger) {
            hamburger.classList.remove('active');
            navContainer.classList.remove('active');
        }
        
        // Smooth scroll to section
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

// Hide/show navbar on scroll (mobile only)
let lastScrollTop = 0;
const navbar = document.getElementById('navbar');
const scrollThreshold = 100;

window.addEventListener('scroll', () => {
    // Only apply scroll behavior on mobile
    if (window.innerWidth <= 768) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Don't hide at very top
        if (scrollTop < scrollThreshold) {
            navbar.classList.remove('nav-hidden');
            return;
        }
        
        // Scrolling down - hide
        if (scrollTop > lastScrollTop) {
            navbar.classList.add('nav-hidden');
            // Close menu if open
            if (hamburger) {
                hamburger.classList.remove('active');
                navContainer.classList.remove('active');
            }
        } 
        // Scrolling up - show
        else {
            navbar.classList.remove('nav-hidden');
        }
        
        lastScrollTop = scrollTop;
    }
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
// PHOTO CAROUSEL
// ============================================

let currentPhotoIndex = 0;
let currentLightboxIndex = 0;
const totalPhotos = 10;
const photoUrls = [
    '/images/gallery/photo1.jpg',
    '/images/gallery/photo2.jpg',
    '/images/gallery/photo3.jpg',
    '/images/gallery/photo4.jpg',
    '/images/gallery/photo5.jpg',
    '/images/gallery/photo6.jpg',
    '/images/gallery/photo7.jpg',
    '/images/gallery/photo8.jpg',
    '/images/gallery/photo9.jpg',
    '/images/gallery/photo10.jpg'
];

function initCarousel() {
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const track = document.getElementById('carousel-track');
    
    prevBtn.addEventListener('click', () => changeSlide(-1));
    nextBtn.addEventListener('click', () => changeSlide(1));
    
    // Keyboard navigation for carousel
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        if (lightbox.style.display === 'block') {
            if (e.key === 'ArrowLeft') changeLightboxImage(-1);
            if (e.key === 'ArrowRight') changeLightboxImage(1);
            if (e.key === 'Escape') closeLightbox();
        } else {
            if (e.key === 'ArrowLeft') changeSlide(-1);
            if (e.key === 'ArrowRight') changeSlide(1);
        }
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchStartX - touchEndX > 50) {
            changeSlide(1);
        } else if (touchEndX - touchStartX > 50) {
            changeSlide(-1);
        }
    }
    
    updateCarousel();
}

function changeSlide(direction) {
    currentPhotoIndex += direction;
    
    if (currentPhotoIndex >= totalPhotos) {
        currentPhotoIndex = 0;
    } else if (currentPhotoIndex < 0) {
        currentPhotoIndex = totalPhotos - 1;
    }
    
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('carousel-track');
    const counter = document.getElementById('carousel-counter');
    
    const offset = -currentPhotoIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
    counter.textContent = `${currentPhotoIndex + 1} / ${totalPhotos}`;
}

// Initialize carousel when page loads
if (document.getElementById('carousel-track')) {
    initCarousel();
}

// ============================================
// HAMBURGER MENU
// ============================================

const hamburger = document.getElementById('hamburger');
const navContainer = document.getElementById('nav-container');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navContainer.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navContainer.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#navbar')) {
            navContainer.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// ============================================
// DIETARY REQUIREMENTS MODAL
// ============================================

function openDietaryModal() {
    const modal = document.getElementById('dietary-modal');
    const textarea = document.getElementById('dietary-requirements');
    
    // Pre-fill with existing dietary requirements if any
    if (currentGuest && currentGuest.dietaryRequirements) {
        textarea.value = currentGuest.dietaryRequirements;
    } else {
        textarea.value = '';
    }
    
    modal.style.display = 'flex';
    textarea.focus();
}

function closeDietaryModal() {
    const modal = document.getElementById('dietary-modal');
    modal.style.display = 'none';
}

async function saveDietaryRequirements() {
    const textarea = document.getElementById('dietary-requirements');
    const requirements = textarea.value.trim();
    
    if (!currentGuest) {
        alert('Error: Not logged in');
        return;
    }
    
    try {
        const response = await fetch('/api/dietary-requirements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentGuest.username,
                dietaryRequirements: requirements
            })
        });
        
        if (response.ok) {
            currentGuest.dietaryRequirements = requirements;
            sessionStorage.setItem('currentGuest', JSON.stringify(currentGuest));
            alert(requirements ? 'Dietary requirements saved!' : 'Dietary requirements cleared!');
            closeDietaryModal();
        } else {
            alert('Error saving dietary requirements. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error. Please try again.');
    }
}

// Dietary modal event listeners
document.getElementById('cancel-dietary').addEventListener('click', closeDietaryModal);
document.getElementById('save-dietary').addEventListener('click', saveDietaryRequirements);

// Close modal when clicking outside
document.getElementById('dietary-modal').addEventListener('click', (e) => {
    if (e.target.id === 'dietary-modal') {
        closeDietaryModal();
    }
});

document.getElementById('lightbox').addEventListener('click', function(e) {
    if (e.target === this) {
        closeLightbox();
    }
});

// ============================================
// DOWNLOAD EVENT DETAILS PDF
// ============================================

async function downloadEventPDF() {
    if (!currentGuest) {
        alert('Error: Not logged in');
        return;
    }
    
    try {
        const response = await fetch('/api/guest-event-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: currentGuest.username
            })
        });
        
        if (!response.ok) {
            throw new Error('PDF generation failed');
        }
        
        // Get the PDF blob
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Wedding_Details_${currentGuest.displayName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
    } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Error downloading event details. Please try again.');
    }
}


// ============================================
// LIGHTBOX FUNCTIONS
// ============================================

function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    lightboxImg.src = photoUrls[index];
    lightbox.style.display = 'block';
    updateLightboxCounter();
    
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function changeLightboxImage(direction) {
    currentLightboxIndex += direction;
    
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = totalPhotos - 1;
    } else if (currentLightboxIndex >= totalPhotos) {
        currentLightboxIndex = 0;
    }
    
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = photoUrls[currentLightboxIndex];
    updateLightboxCounter();
}

function updateLightboxCounter() {
    const counter = document.getElementById('lightbox-counter');
    counter.textContent = `${currentLightboxIndex + 1} / ${totalPhotos}`;
}

/* ============================================
   WEDDING WEBSITE V7 - COMPLETE JAVASCRIPT
   - Login system
   - Hamburger navigation
   - Photo carousel with swipe
   - Dietary requirements modal
   - Gift selection
   ============================================ */

let currentGuest = null;

// ============================================
// LOGIN FUNCTIONALITY
// ============================================

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim().toLowerCase();
    const errorMessage = document.getElementById('error-message');
    
    try {
        const response = await fetch(`/api/guest/${encodeURIComponent(username)}`);
        
        if (response.ok) {
            const guest = await response.json();
            currentGuest = guest;
            
            // Hide login, show main content
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            
            // Set welcome message
            document.getElementById('guest-name').textContent = guest.displayName;
            
            // Show/hide events based on permissions
            document.getElementById('event-ceremony').style.display = guest.events.ceremony ? 'block' : 'none';
            document.getElementById('event-reception').style.display = guest.events.reception ? 'block' : 'none';
            document.getElementById('event-celebration').style.display = guest.events.celebration ? 'block' : 'none';
            
            errorMessage.style.display = 'none';
        } else {
            errorMessage.textContent = 'Name not found. Please check spelling.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        errorMessage.textContent = 'Connection error. Please try again.';
        errorMessage.style.display = 'block';
    }
});

// ============================================
// HAMBURGER MENU FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('nav ul');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    // Toggle menu on hamburger click
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('nav') && !e.target.closest('.hamburger-menu')) {
            navMenu.classList.remove('active');
        }
    });
});

// ============================================
// SMOOTH SCROLLING FOR NAVIGATION
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// PHOTO CAROUSEL FUNCTIONALITY
// ============================================

class Carousel {
    constructor() {
        this.track = document.querySelector('.carousel-track');
        this.slides = Array.from(document.querySelectorAll('.carousel-slide'));
        this.prevBtn = document.querySelector('.carousel-btn.prev');
        this.nextBtn = document.querySelector('.carousel-btn.next');
        this.counter = document.querySelector('.carousel-counter');
        
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        
        // Touch/swipe support
        this.startX = 0;
        this.endX = 0;
        
        this.init();
    }
    
    init() {
        this.updateCarousel();
        this.attachEventListeners();
    }
    
    attachEventListeners() {
        // Button clicks
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
        
        // Touch/swipe support
        this.track.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
        });
        
        this.track.addEventListener('touchmove', (e) => {
            this.endX = e.touches[0].clientX;
        });
        
        this.track.addEventListener('touchend', () => {
            this.handleSwipe();
        });
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.startX - this.endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.next(); // Swipe left
            } else {
                this.prev(); // Swipe right
            }
        }
    }
    
    updateCarousel() {
        // Move track
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;
        
        // Update counter
        this.counter.textContent = `${this.currentIndex + 1} / ${this.totalSlides}`;
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.updateCarousel();
    }
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
    }
}

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const carousel = new Carousel();
});

// ============================================
// DIETARY REQUIREMENTS MODAL
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const dietaryBtn = document.getElementById('dietary-btn');
    const dietaryModal = document.getElementById('dietary-modal');
    const dietaryTextarea = document.getElementById('dietary-requirements');
    const saveDietaryBtn = document.getElementById('save-dietary');
    const cancelDietaryBtn = document.getElementById('cancel-dietary');
    
    // Open modal
    dietaryBtn.addEventListener('click', () => {
        dietaryModal.style.display = 'block';
        
        // Pre-fill with existing dietary requirements if any
        if (currentGuest && currentGuest.dietaryRequirements) {
            dietaryTextarea.value = currentGuest.dietaryRequirements;
        } else {
            dietaryTextarea.value = '';
        }
        
        dietaryTextarea.focus();
    });
    
    // Close modal on cancel
    cancelDietaryBtn.addEventListener('click', () => {
        dietaryModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === dietaryModal) {
            dietaryModal.style.display = 'none';
        }
    });
    
    // Save dietary requirements
    saveDietaryBtn.addEventListener('click', async () => {
        const requirements = dietaryTextarea.value.trim();
        
        if (!currentGuest) {
            alert('Error: Not logged in');
            return;
        }
        
        try {
            const response = await fetch('/api/dietary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: currentGuest.username,
                    dietaryRequirements: requirements
                })
            });
            
            if (response.ok) {
                // Update current guest object
                currentGuest.dietaryRequirements = requirements;
                
                // Show success message
                alert(requirements ? 'Dietary requirements saved!' : 'Dietary requirements cleared!');
                
                // Close modal
                dietaryModal.style.display = 'none';
            } else {
                alert('Error saving dietary requirements. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Connection error. Please try again.');
        }
    });
});

// ============================================
// GIFT SELECTION FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const giftCards = document.querySelectorAll('.gift-card');
    
    giftCards.forEach(card => {
        card.addEventListener('click', async () => {
            // Remove selection from all cards
            giftCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to clicked card
            card.classList.add('selected');
            
            // Get gift type
            const giftType = card.dataset.gift;
            
            // Save selection to backend
            if (currentGuest) {
                try {
                    await fetch('/api/gift-selection', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: currentGuest.username,
                            giftSelection: giftType
                        })
                    });
                } catch (error) {
                    console.error('Error saving gift selection:', error);
                }
            }
        });
    });
});

// ============================================
// RSVP FORM SUBMISSION
// ============================================

document.getElementById('rsvp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('rsvp-name').value,
        email: document.getElementById('rsvp-email').value,
        attending: document.getElementById('rsvp-attending').value,
        guests: document.getElementById('rsvp-guests').value,
        dietary: document.getElementById('rsvp-dietary').value,
        message: document.getElementById('rsvp-message').value
    };
    
    try {
        const response = await fetch('/api/rsvp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Thank you for your RSVP! We\'ve received your response.');
            document.getElementById('rsvp-form').reset();
        } else {
            alert('Error submitting RSVP. Please try again.');
        }
    } catch (error) {
        alert('Connection error. Please try again later.');
        console.error('RSVP Error:', error);
    }
});

// Guest database - in production, this would be fetched from a server
const guestDatabase = {
    'john.smith': {
        displayName: 'John Smith',
        ceremony: true,
        reception: false,
        celebration: true
    },
    'jane.doe': {
        displayName: 'Jane Doe',
        ceremony: true,
        reception: true,
        celebration: true
    },
    'sarah.johnson': {
        displayName: 'Sarah & Mike Johnson',
        ceremony: false,
        reception: false,
        celebration: true
    }
    // Add more guests here following the format:
    // 'firstname.lastname': {
    //     displayName: 'Display Name',
    //     ceremony: true/false,
    //     reception: true/false,
    //     celebration: true/false
    // }
};

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const guestName = document.getElementById('guestName').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    
    // Convert name to username format (firstname.lastname)
    const username = guestName.toLowerCase()
        .replace(/\s+&\s+.*/, '') // Remove "& Partner" part for couples
        .replace(/\s+/g, '.');
    
    // Check if guest exists in database
    if (guestDatabase[username]) {
        // Store guest data in session
        sessionStorage.setItem('guestData', JSON.stringify(guestDatabase[username]));
        
        // Redirect to home page
        window.location.href = '/';
    } else {
        // Show error message
        errorMessage.textContent = 'We couldn\'t find your name in our guest list. Please check your spelling or contact us if you believe this is an error.';
        errorMessage.style.display = 'block';
    }
});

// Clear error message when user starts typing
document.getElementById('guestName').addEventListener('input', function() {
    document.getElementById('errorMessage').style.display = 'none';
});

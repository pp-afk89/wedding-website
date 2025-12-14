// Check authentication and load guest data
function checkAuth() {
    const guestData = sessionStorage.getItem('guestData');
    if (!guestData) {
        window.location.href = '/login';
        return null;
    }
    return JSON.parse(guestData);
}

document.addEventListener('DOMContentLoaded', function() {
    const guest = checkAuth();
    if (!guest) return;

    // Pre-fill the name field
    document.getElementById('name').value = guest.displayName;

    // Populate event checkboxes based on guest's invitations
    const eventCheckboxes = document.getElementById('eventCheckboxes');
    let checkboxHTML = '';

    if (guest.ceremony) {
        checkboxHTML += `
            <label>
                <input type="checkbox" name="ceremonyAttending" value="ceremony" checked>
                Ceremony at Hackney Town Hall (April 17)
            </label>
        `;
    }
    if (guest.reception) {
        checkboxHTML += `
            <label>
                <input type="checkbox" name="receptionAttending" value="reception" checked>
                Family Reception at Morito (April 17)
            </label>
        `;
    }
    if (guest.celebration) {
        checkboxHTML += `
            <label>
                <input type="checkbox" name="celebrationAttending" value="celebration" checked>
                Wedding Celebration at Dukkan (April 18)
            </label>
        `;
    }

    if (checkboxHTML === '') {
        checkboxHTML = '<p style="color: #666;">No events found for your invitation.</p>';
    }

    eventCheckboxes.innerHTML = checkboxHTML;

    // Show/hide guest count based on attendance
    const attendingSelect = document.getElementById('attending');
    const guestCountGroup = document.getElementById('guestCountGroup');

    attendingSelect.addEventListener('change', function() {
        if (this.value === 'yes') {
            guestCountGroup.style.display = 'block';
        } else {
            guestCountGroup.style.display = 'none';
        }
    });

    // Handle form submission
    document.getElementById('rsvpForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            attending: document.getElementById('attending').value,
            guestCount: document.getElementById('guestCount').value,
            dietary: document.getElementById('dietary').value,
            message: document.getElementById('message').value,
            events: {
                ceremony: document.querySelector('input[value="ceremony"]')?.checked || false,
                reception: document.querySelector('input[value="reception"]')?.checked || false,
                celebration: document.querySelector('input[value="celebration"]')?.checked || false
            }
        };

        // In production, send this data to the server
        console.log('RSVP Data:', formData);

        // Show success message
        document.getElementById('successMessage').style.display = 'block';

        // Scroll to success message
        document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Disable form after submission
        const formElements = this.elements;
        for (let i = 0; i < formElements.length; i++) {
            formElements[i].disabled = true;
        }
    });
});

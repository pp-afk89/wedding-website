const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Path to guests database
const GUESTS_FILE = path.join(__dirname, 'guests.json');

// ============================================
// HELPER FUNCTIONS
// ============================================

async function readGuests() {
    try {
        const data = await fs.readFile(GUESTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading guests.json:', error);
        return [];
    }
}

async function writeGuests(guests) {
    try {
        await fs.writeFile(GUESTS_FILE, JSON.stringify(guests, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing guests.json:', error);
        return false;
    }
}

// ============================================
// GUEST ROUTES
// ============================================

// Get guest by username
app.get('/api/guest/:username', async (req, res) => {
    const username = req.params.username.toLowerCase();
    const guests = await readGuests();
    
    const guest = guests.find(g => g.username.toLowerCase() === username);
    
    if (guest) {
        res.json(guest);
    } else {
        res.status(404).json({ error: 'Guest not found' });
    }
});

// Get all guests (for admin)
app.get('/api/guests', async (req, res) => {
    const guests = await readGuests();
    res.json(guests);
});

// Update guest (for admin)
app.put('/api/guests/:username', async (req, res) => {
    const username = req.params.username;
    const updates = req.body;
    
    const guests = await readGuests();
    const guestIndex = guests.findIndex(g => g.username === username);
    
    if (guestIndex === -1) {
        return res.status(404).json({ error: 'Guest not found' });
    }
    
    // Update guest with new data
    guests[guestIndex] = { ...guests[guestIndex], ...updates };
    
    const success = await writeGuests(guests);
    
    if (success) {
        res.json(guests[guestIndex]);
    } else {
        res.status(500).json({ error: 'Failed to update guest' });
    }
});

// ============================================
// DIETARY REQUIREMENTS ROUTES
// ============================================

// Save dietary requirements
app.post('/api/dietary', async (req, res) => {
    const { username, dietaryRequirements } = req.body;
    
    if (!username) {
        return res.status(400).json({ error: 'Username required' });
    }
    
    const guests = await readGuests();
    const guestIndex = guests.findIndex(g => g.username === username);
    
    if (guestIndex === -1) {
        return res.status(404).json({ error: 'Guest not found' });
    }
    
    // Update dietary requirements
    guests[guestIndex].dietaryRequirements = dietaryRequirements || '';
    
    const success = await writeGuests(guests);
    
    if (success) {
        res.json({ success: true, message: 'Dietary requirements saved' });
    } else {
        res.status(500).json({ error: 'Failed to save dietary requirements' });
    }
});

// Export dietary requirements as PDF
app.get('/api/dietary/export-pdf', async (req, res) => {
    try {
        const guests = await readGuests();
        
        // Filter guests with dietary requirements
        const guestsWithDietary = guests.filter(g => g.dietaryRequirements && g.dietaryRequirements.trim() !== '');
        
        // Create PDF
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="dietary-requirements.pdf"');
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Add title
        doc.fontSize(20)
           .fillColor('#5a7360')
           .text('Wedding Dietary Requirements', { align: 'center' })
           .moveDown();
        
        doc.fontSize(12)
           .fillColor('#666')
           .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' })
           .moveDown(2);
        
        if (guestsWithDietary.length === 0) {
            doc.fontSize(14)
               .fillColor('#333')
               .text('No dietary requirements have been submitted yet.', { align: 'center' });
        } else {
            // Add table header
            doc.fontSize(12)
               .fillColor('#5a7360')
               .text('Guest Name', 50, doc.y, { continued: true, width: 200 })
               .text('Dietary Requirements', 270, doc.y, { width: 270 });
            
            doc.moveDown(0.5);
            
            // Add separator line
            doc.strokeColor('#5a7360')
               .lineWidth(1)
               .moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke();
            
            doc.moveDown(0.5);
            
            // Add each guest's dietary requirements
            doc.fontSize(11).fillColor('#333');
            
            guestsWithDietary.forEach((guest, index) => {
                const yPosition = doc.y;
                
                // Alternate row colors for readability
                if (index % 2 === 0) {
                    doc.rect(50, yPosition - 5, 500, 30)
                       .fill('#f9f9f9');
                }
                
                // Guest name
                doc.fillColor('#333')
                   .text(guest.displayName, 50, yPosition, { width: 200 });
                
                // Dietary requirements (with word wrap)
                doc.text(guest.dietaryRequirements, 270, yPosition, { 
                    width: 270,
                    align: 'left'
                });
                
                doc.moveDown(1);
                
                // Add page break if needed
                if (doc.y > 700) {
                    doc.addPage();
                }
            });
        }
        
        // Add footer
        doc.fontSize(10)
           .fillColor('#999')
           .text('Piers & Rakel Wedding - April 17-18, 2026', 50, 750, { align: 'center' });
        
        // Finalize PDF
        doc.end();
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

// ============================================
// GIFT SELECTION ROUTE
// ============================================

app.post('/api/gift-selection', async (req, res) => {
    const { username, giftSelection } = req.body;
    
    if (!username || !giftSelection) {
        return res.status(400).json({ error: 'Username and gift selection required' });
    }
    
    const guests = await readGuests();
    const guestIndex = guests.findIndex(g => g.username === username);
    
    if (guestIndex === -1) {
        return res.status(404).json({ error: 'Guest not found' });
    }
    
    // Update gift selection
    guests[guestIndex].giftSelection = giftSelection;
    
    const success = await writeGuests(guests);
    
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to save gift selection' });
    }
});

// ============================================
// RSVP ROUTE
// ============================================

app.post('/api/rsvp', async (req, res) => {
    const rsvpData = req.body;
    
    // In a production app, you'd save this to a database
    // For now, we'll just log it and send a success response
    console.log('RSVP Received:', rsvpData);
    
    // You could append to a file or database here
    // For example:
    // await fs.appendFile('rsvps.json', JSON.stringify(rsvpData) + '\n');
    
    res.json({ success: true, message: 'RSVP received' });
});

// ============================================
// EXCEL EXPORT ROUTE (for admin)
// ============================================

app.get('/api/guests/export-excel', async (req, res) => {
    try {
        const guests = await readGuests();
        
        // Create CSV content (Excel-compatible)
        let csv = 'Display Name,Username,Ceremony,Reception,Celebration,Gift Selection,Dietary Requirements\n';
        
        guests.forEach(guest => {
            const ceremony = guest.events.ceremony ? 'Yes' : 'No';
            const reception = guest.events.reception ? 'Yes' : 'No';
            const celebration = guest.events.celebration ? 'Yes' : 'No';
            const gift = guest.giftSelection || '';
            const dietary = guest.dietaryRequirements ? `"${guest.dietaryRequirements.replace(/"/g, '""')}"` : '';
            
            csv += `"${guest.displayName}","${guest.username}",${ceremony},${reception},${celebration},${gift},${dietary}\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="wedding-guests.csv"');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting Excel:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// ============================================
// ADMIN AUTHENTICATION
// ============================================

const ADMIN_PASSWORD = 'ar0y092';

app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Incorrect password' });
    }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Wedding website server running on port ${PORT}`);
    console.log(`🌐 Main site: http://localhost:${PORT}`);
    console.log(`👑 Admin panel: http://localhost:${PORT}/wedding-admin-2026`);
});

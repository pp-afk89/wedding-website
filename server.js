const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const ExcelJS = require('exceljs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Path to JSON database
const GUESTS_FILE = path.join(__dirname, 'guests.json');

// ============================================
// HELPER FUNCTIONS
// ============================================

// Read guests from JSON file
async function readGuests() {
    try {
        const data = await fs.readFile(GUESTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading guests:', error);
        return [];
    }
}

// Write guests to JSON file
async function writeGuests(guests) {
    try {
        await fs.writeFile(GUESTS_FILE, JSON.stringify(guests, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing guests:', error);
        return false;
    }
}

// ============================================
// MAIN ROUTES
// ============================================

// Main wedding website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin panel
app.get('/wedding-admin-2026', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// ============================================
// GUEST LOGIN API (for website)
// ============================================

app.post('/api/guest-login', async (req, res) => {
    const { username } = req.body;
    const guests = await readGuests();
    
    const guest = guests.find(g => g.username === username);
    
    if (guest) {
        res.json({
            success: true,
            guest: {
                username: guest.username,
                displayName: guest.displayName,
                events: guest.events
            }
        });
    } else {
        res.json({ success: false });
    }
});

// ============================================
// GIFT SELECTION API
// ============================================

app.post('/api/gift-selection', async (req, res) => {
    const { username, giftChoice } = req.body;
    
    console.log(`Gift selection: ${username} selected ${giftChoice}`);
    
    const guests = await readGuests();
    const guestIndex = guests.findIndex(g => g.username === username);
    
    if (guestIndex !== -1) {
        const giftText = giftChoice === 'honeymoon' ? 'Our Honeymoon' : 'Our New Boston Home';
        guests[guestIndex].giftChoice = giftText;
        
        await writeGuests(guests);
        
        res.json({ success: true, username, giftChoice: giftText });
    } else {
        res.json({ success: false, error: 'Guest not found' });
    }
});

app.post('/api/payment-clicked', async (req, res) => {
    const { username } = req.body;
    
    console.log(`Payment link clicked: ${username}`);
    
    const guests = await readGuests();
    const guestIndex = guests.findIndex(g => g.username === username);
    
    if (guestIndex !== -1) {
        guests[guestIndex].paymentStatus = 'Payment Link Clicked';
        
        await writeGuests(guests);
        
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'Guest not found' });
    }
});

// ============================================
// ADMIN API ENDPOINTS
// ============================================

// Get all guests (admin)
app.get('/api/admin/guests', async (req, res) => {
    const guests = await readGuests();
    res.json(guests);
});

// Add new guest (admin)
app.post('/api/admin/guests', async (req, res) => {
    const newGuest = req.body;
    const guests = await readGuests();
    
    // Check for duplicate
    const exists = guests.find(g => g.username === newGuest.username);
    if (exists) {
        return res.json({ success: false, error: 'Username already exists' });
    }
    
    guests.push(newGuest);
    const saved = await writeGuests(guests);
    
    res.json({ success: saved, guest: newGuest });
});

// Update guest (admin)
app.put('/api/admin/guests/:username', async (req, res) => {
    const { username } = req.params;
    const updatedGuest = req.body;
    const guests = await readGuests();
    
    const index = guests.findIndex(g => g.username === username);
    
    if (index !== -1) {
        guests[index] = updatedGuest;
        const saved = await writeGuests(guests);
        res.json({ success: saved, guest: updatedGuest });
    } else {
        res.json({ success: false, error: 'Guest not found' });
    }
});

// Delete guest (admin)
app.delete('/api/admin/guests/:username', async (req, res) => {
    const { username } = req.params;
    const guests = await readGuests();
    
    const index = guests.findIndex(g => g.username === username);
    
    if (index !== -1) {
        guests.splice(index, 1);
        const saved = await writeGuests(guests);
        res.json({ success: saved });
    } else {
        res.json({ success: false, error: 'Guest not found' });
    }
});

// Export to Excel (admin)
app.get('/api/admin/export-excel', async (req, res) => {
    try {
        const guests = await readGuests();
        
        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Guest List');
        
        // Style header
        worksheet.columns = [
            { header: 'Username', key: 'username', width: 25 },
            { header: 'Display Name', key: 'displayName', width: 30 },
            { header: 'Ceremony', key: 'ceremony', width: 12 },
            { header: 'Family Reception', key: 'familyReception', width: 18 },
            { header: 'Wedding Celebration', key: 'weddingCelebration', width: 22 },
            { header: 'Gift Choice', key: 'giftChoice', width: 25 },
            { header: 'Payment Status', key: 'paymentStatus', width: 25 }
        ];
        
        // Style header row
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF5a7360' }
        };
        worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
        
        // Add data
        guests.forEach(guest => {
            worksheet.addRow({
                username: guest.username,
                displayName: guest.displayName,
                ceremony: guest.events.ceremony ? 'X' : '',
                familyReception: guest.events.familyReception ? 'X' : '',
                weddingCelebration: guest.events.weddingCelebration ? 'X' : '',
                giftChoice: guest.giftChoice || '',
                paymentStatus: guest.paymentStatus || ''
            });
        });
        
        // Center align event columns
        for (let i = 2; i <= worksheet.rowCount; i++) {
            worksheet.getCell(`C${i}`).alignment = { horizontal: 'center' };
            worksheet.getCell(`D${i}`).alignment = { horizontal: 'center' };
            worksheet.getCell(`E${i}`).alignment = { horizontal: 'center' };
        }
        
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Wedding_Guests.xlsx');
        
        // Write to response
        await workbook.xlsx.write(res);
        res.end();
        
        console.log('Excel exported successfully');
    } catch (error) {
        console.error('Error exporting Excel:', error);
        res.status(500).json({ error: 'Failed to export Excel' });
    }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`\n✓ Wedding website running on http://localhost:${PORT}`);
    console.log(`✓ Admin panel available at http://localhost:${PORT}/wedding-admin-2026`);
    console.log(`✓ Admin password: ar0y092`);
    console.log(`✓ Using JSON database: ${GUESTS_FILE}`);
    
    // Check if guests file exists
    if (!fsSync.existsSync(GUESTS_FILE)) {
        console.log('\n⚠ Warning: guests.json not found. Creating empty database...');
        fsSync.writeFileSync(GUESTS_FILE, '[]');
    }
});

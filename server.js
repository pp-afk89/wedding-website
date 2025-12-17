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
// DIETARY REQUIREMENTS API
// ============================================

app.post('/api/dietary-requirements', async (req, res) => {
    const { username, dietaryRequirements } = req.body;
    
    console.log(`Dietary requirements update: ${username}`);
    
    const guests = await readGuests();
    const guestIndex = guests.findIndex(g => g.username === username);
    
    if (guestIndex !== -1) {
        guests[guestIndex].dietaryRequirements = dietaryRequirements || '';
        
        await writeGuests(guests);
        
        res.json({ success: true, username, dietaryRequirements });
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

// Export dietary requirements to PDF
app.get('/api/dietary/export-pdf', async (req, res) => {
    try {
        const PDFDocument = require('pdfkit');
        const guests = await readGuests();
        
        // Filter guests with dietary requirements
        const guestsWithDietary = guests.filter(g => g.dietaryRequirements && g.dietaryRequirements.trim() !== '');
        
        // Create PDF
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Dietary_Requirements.pdf"');
        
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
               .text('Dietary Requirements', 270, doc.y);
            
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
                
                // Check if we need a new page
                if (yPosition > 700) {
                    doc.addPage();
                }
                
                // Alternate row colors
                if (index % 2 === 0) {
                    doc.rect(50, yPosition - 5, 500, Math.min(60, 15 + guest.dietaryRequirements.length / 5))
                       .fillColor('#f9f9f9')
                       .fill();
                }
                
                // Guest name
                doc.fillColor('#333')
                   .text(guest.displayName, 50, yPosition, { width: 200, continued: false });
                
                // Dietary requirements (with word wrap)
                doc.text(guest.dietaryRequirements, 270, yPosition, { 
                    width: 270,
                    align: 'left'
                });
                
                doc.moveDown(1.5);
            });
        }
        
        // Add footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(10)
               .fillColor('#999')
               .text('Rakel & Piers Wedding - April 2026', 50, 750, { align: 'center' });
        }
        
        // Finalize PDF
        doc.end();
        
        console.log('Dietary requirements PDF exported successfully');
    } catch (error) {
        console.error('Error exporting dietary PDF:', error);
        res.status(500).json({ error: 'Failed to export PDF' });
    }
});

// Export guest event details as PDF
app.post('/api/guest-event-pdf', async (req, res) => {
    try {
        const PDFDocument = require('pdfkit');
        const { username } = req.body;
        
        const guests = await readGuests();
        const guest = guests.find(g => g.username === username);
        
        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }
        
        // Event details
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
        
        // Create PDF
        const doc = new PDFDocument({ 
            size: 'A4',
            margin: 50
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Wedding_Details_${guest.displayName.replace(/\s+/g, '_')}.pdf"`);
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Add cream/beige background to entire page
        doc.rect(0, 0, doc.page.width, doc.page.height)
           .fill('#f5f3ef');
        
        // Add watermark graphic - FULL PAGE, edge to edge
        const watermarkPath = path.join(__dirname, 'public', 'images', 'wedding_graphic_watermark.png');
        if (fsSync.existsSync(watermarkPath)) {
            // Fill entire page - left edge to right edge, top to bottom
            doc.image(watermarkPath, 0, 0, {
                width: doc.page.width,
                height: doc.page.height
            });
        }
        
        // Add green hero banner at top (on top of watermark)
        doc.rect(0, 0, doc.page.width, 100)
           .fill('#5a7360');
        
        // Hero section text (on green banner)
        doc.fillColor('white')
           .fontSize(13)
           .text("Rakel & Piers' Wedding", 50, 25, { align: 'center' })
           .moveDown(0.3);
        
        doc.fontSize(22)
           .text(`Welcome, ${guest.displayName}!`, { align: 'center' })
           .moveDown(0.2);
        
        doc.fontSize(11)
           .text('April 2026', { align: 'center' });
        
        // Move below banner for content
        doc.y = 140;
        
        // "We look forward to seeing you at..."
        doc.fontSize(16)
           .fillColor('#5a7360')
           .text('We look forward to seeing you at...', { align: 'center' })
           .moveDown(1.5);
        
        // Add each event the guest is invited to
        const events = [];
        if (guest.events.ceremony) events.push({ key: 'ceremony', details: eventDetails.ceremony });
        if (guest.events.familyReception) events.push({ key: 'familyReception', details: eventDetails.familyReception });
        if (guest.events.weddingCelebration) events.push({ key: 'weddingCelebration', details: eventDetails.weddingCelebration });
        
        events.forEach((event, index) => {
            const details = event.details;
            const startY = doc.y;
            
            // Calculate box height based on content
            let boxHeight = 160;
            if (details.extra) boxHeight += 15;
            
            // Draw transparent white box
            doc.rect(50, startY, doc.page.width - 100, boxHeight)
               .fillOpacity(0.7)
               .fill('white')
               .fillOpacity(1);
            
            // Add padding and content
            const contentX = 70;
            doc.y = startY + 15;
            
            // Event title
            doc.fontSize(14)
               .fillColor('#5a7360')
               .font('Helvetica-Bold')
               .text(details.title, contentX, doc.y)
               .font('Helvetica')
               .moveDown(0.7);
            
            // Event details
            doc.fontSize(10)
               .fillColor('#2c2c2c');
            
            doc.font('Helvetica-Bold').text('Date: ', contentX, doc.y, { continued: true })
               .font('Helvetica').text(details.date)
               .moveDown(0.4);
            
            doc.font('Helvetica-Bold').text('Arrival: ', contentX, doc.y, { continued: true })
               .font('Helvetica').text(details.arrival)
               .moveDown(0.4);
            
            // Extra info for family reception
            if (details.extra) {
                doc.font('Helvetica-Bold').text('Wedding Breakfast: ', contentX, doc.y, { continued: true })
                   .font('Helvetica').text('7 PM, followed by a little dance!')
                   .moveDown(0.4);
            }
            
            doc.font('Helvetica-Bold').text('Location: ', contentX, doc.y, { continued: true })
               .font('Helvetica').text(details.location)
               .moveDown(0.4);
            
            doc.font('Helvetica-Bold').text('Dress Code: ', contentX, doc.y, { continued: true })
               .font('Helvetica').text(details.dressCode);
            
            // Move to next event position
            doc.y = startY + boxHeight + 20;
        });
        
        // Finalize PDF
        doc.end();
        
        console.log(`Event PDF generated for: ${guest.displayName}`);
        
    } catch (error) {
        console.error('Error generating guest event PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
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

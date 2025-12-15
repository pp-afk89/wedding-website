# Wedding Website V7 - Complete Package 🎉

## ✨ What's New in V7

### 1. 📱 Mobile Navigation (Hamburger Menu)
- Hamburger menu (☰) appears on mobile devices
- Clean, space-saving design
- Auto-closes after navigation
- Horizontal menu remains on desktop

### 2. 📸 Photo Carousel
- Gallery displays 1 photo at a time
- Left/right arrow navigation
- Swipe gestures on mobile devices
- Photo counter (1/10, 2/10, etc.)
- 10 photos total (includes your new photobooth image!)

### 3. 🍽️ Dietary Requirements System
- "Dietary Requirements" button on Family Reception card
- Professional popup modal for guest input
- Saves directly to database
- Admin panel shows red ⚠️ indicator for guests with requirements
- Click ⚠️ to view specific requirements
- "Download Dietary Requirements" button → exports PDF

---

## 📁 Files Included

```
wedding-website-v7/
├── server.js                      # Backend server with all APIs
├── package.json                   # Dependencies (Express + PDFKit)
├── guests.json                    # Guest database (YOU NEED TO ADD THIS)
├── public/
│   ├── index.html                 # Main website (YOU NEED TO ADD THIS)
│   ├── styles.css                 # ✅ Complete CSS with hamburger + carousel
│   ├── script.js                  # ✅ Complete JavaScript with all functionality
│   ├── images/
│   │   ├── save_the_date_graphic_only.png
│   │   └── gallery/
│   │       ├── photo1.jpg
│   │       ├── photo2.jpg
│   │       ├── ...
│   │       └── photo10.jpg        # Your new photobooth image
│   └── admin/
│       ├── index.html             # ✅ Admin panel with dietary column
│       └── admin-script.js        # ✅ Admin JS with PDF export
```

---

## 🚀 What You Still Need

### 1. **index.html** (Main Website)
I need to create this file with:
- Hamburger menu structure
- Carousel HTML structure
- Dietary requirements modal
- All your existing sections

### 2. **guests.json** 
Make sure this includes the `dietaryRequirements` field:
```json
[
  {
    "username": "john smith",
    "displayName": "John Smith",
    "events": {
      "ceremony": true,
      "reception": true,
      "celebration": true
    },
    "giftSelection": "",
    "dietaryRequirements": ""
  }
]
```

### 3. **Images**
- Your 10 gallery photos (photo1.jpg through photo10.jpg)
- save_the_date_graphic_only.png

---

## 📝 Key Changes Summary

### CSS (`styles.css`)
- Added hamburger menu styles (mobile only)
- Added carousel styles with navigation buttons
- Added dietary modal styles
- Improved mobile responsiveness

### JavaScript (`script.js`)
- Hamburger menu toggle functionality
- Full carousel implementation with:
  - Arrow navigation
  - Swipe gestures
  - Keyboard controls
  - Photo counter
- Dietary requirements modal
- API integration for saving dietary data

### Server (`server.js`)
- `/api/dietary` - POST endpoint to save dietary requirements
- `/api/dietary/export-pdf` - GET endpoint for PDF download
- PDFKit integration for professional PDF generation

### Admin Panel
- New "Dietary" column with ⚠️ indicators
- Click indicator to view requirements in popup
- "Download Dietary Requirements" button
- Exports PDF with Name | Requirements table

---

## 🔧 How to Deploy

### Option 1: Local Testing
```bash
cd wedding-website-v7
npm install
npm start
# Visit http://localhost:3000
# Admin: http://localhost:3000/wedding-admin-2026
```

### Option 2: Railway Deployment
1. Push all files to GitHub
2. Railway will auto-detect and deploy
3. Make sure Railway uses: `npm start`

---

## ✅ Testing Checklist

- [ ] Mobile hamburger menu opens/closes
- [ ] Photo carousel arrows work
- [ ] Photo carousel swipe works on mobile
- [ ] Dietary requirements button appears on Reception card
- [ ] Dietary modal opens, saves, and closes
- [ ] Admin panel shows ⚠️ for dietary requirements
- [ ] Clicking ⚠️ shows dietary details
- [ ] PDF download includes all dietary requirements
- [ ] Excel export includes dietary column

---

## 🎨 Design Notes

- Green color scheme maintained (#5a7360)
- Professional modal styling
- Mobile-first responsive design
- Smooth animations and transitions
- Watermark backgrounds preserved

---

## 🔐 Admin Access

**URL:** `https://your-site.com/wedding-admin-2026`  
**Password:** `ar0y092`

---

## 📞 Support

If anything doesn't work as expected, just let me know and I'll fix it immediately!

**Next Step:** I need to create your `index.html` file with all the structural changes.

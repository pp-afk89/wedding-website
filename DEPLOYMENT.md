# 🚀 Wedding Website V7 - Deployment Guide

## ✅ Files You Have (Ready to Deploy)

All the core files are complete:

1. ✅ **server.js** - Backend with dietary API + PDF export
2. ✅ **package.json** - Dependencies (Express + PDFKit)
3. ✅ **public/index.html** - Complete HTML with hamburger + carousel + dietary modal
4. ✅ **public/styles.css** - Complete CSS with all new styles
5. ✅ **public/script.js** - Complete JavaScript with all functionality
6. ✅ **public/admin/index.html** - Admin panel with dietary column
7. ✅ **public/admin/admin-script.js** - Admin JS with PDF export

---

## 📋 What You Need to Add

### 1. Your guests.json File
Create `guests.json` in the root directory with:

```json
[
  {
    "username": "john smith",
    "displayName": "John Smith",
    "events": {
      "ceremony": true,
      "reception": true,
      "celebration": false
    },
    "giftSelection": "",
    "dietaryRequirements": ""
  }
]
```

**Important:** Make sure every guest object has the `dietaryRequirements` field (even if empty string).

### 2. Your Images

Place these files in the correct locations:

```
public/images/
├── save_the_date_graphic_only.png
└── gallery/
    ├── photo1.jpg
    ├── photo2.jpg
    ├── photo3.jpg
    ├── photo4.jpg
    ├── photo5.jpg
    ├── photo6.jpg
    ├── photo7.jpg
    ├── photo8.jpg
    ├── photo9.jpg
    └── photo10.jpg  ← Your new photobooth image
```

---

## 🔧 Local Testing

```bash
# 1. Navigate to project folder
cd wedding-website-v7

# 2. Install dependencies
npm install

# 3. Start server
npm start

# 4. Open in browser
# Main site: http://localhost:3000
# Admin panel: http://localhost:3000/wedding-admin-2026
```

---

## ☁️ Deploy to Railway

### Method 1: GitHub (Recommended)

```bash
# 1. Initialize git (if not already)
git init
git add .
git commit -m "Wedding website v7 - mobile optimization + dietary requirements"

# 2. Push to GitHub
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main

# 3. In Railway:
# - Connect your GitHub repo
# - Railway will auto-detect Node.js
# - Click "Deploy"
```

### Method 2: Railway CLI

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
railway login
railway init
railway up
```

---

## ✅ Testing Your Deployment

### Main Website Tests:
1. **Mobile Navigation**
   - Resize browser to mobile width
   - Click hamburger menu (☰)
   - Menu should slide open/closed smoothly
   - Click a link → menu should auto-close

2. **Photo Carousel**
   - Click left/right arrows
   - Counter should update (1/10, 2/10, etc.)
   - On mobile: swipe left/right
   - Keyboard: press ← and → arrows

3. **Dietary Requirements**
   - Login as a guest with reception access
   - Click "Dietary Requirements" button
   - Modal should open with text area
   - Type requirements and click "Save"
   - Should show "Dietary requirements saved!" alert

### Admin Panel Tests:
1. **Login**
   - Go to: your-site.com/wedding-admin-2026
   - Password: `ar0y092`

2. **View Dietary Requirements**
   - Look for red ⚠️ in Dietary column
   - Click ⚠️ → modal shows requirements

3. **Download PDF**
   - Click "Download Dietary Requirements"
   - PDF should download with guest names + requirements

4. **Download Excel**
   - Click "Download Excel"
   - CSV should include dietary column

---

## 🐛 Troubleshooting

### Issue: Hamburger menu not showing
**Solution:** Resize browser window below 768px width

### Issue: Carousel not working
**Solution:** Check browser console for errors. Make sure all 10 images exist.

### Issue: Dietary modal won't save
**Solution:** 
1. Check that guest is logged in
2. Verify server.js has `/api/dietary` endpoint
3. Check browser console for errors

### Issue: PDF download fails
**Solution:** 
1. Verify `pdfkit` is in package.json
2. Run `npm install` to ensure it's installed
3. Check server logs for errors

### Issue: Admin panel shows no dietary requirements
**Solution:** Make sure guests have actually submitted requirements via the main site first

---

## 📱 Mobile Optimization Tips

1. **Test on real devices** - Simulators don't always show true mobile behavior
2. **Check swipe gestures** - Should work smoothly on iOS and Android
3. **Verify hamburger menu** - Should be visible and clickable on phones
4. **Test dietary modal** - Should fit on small screens without scrolling

---

## 🎨 Customization Notes

### Colors
Main green: `#5a7360`
Hover green: `#4a6350`

### Fonts
Primary: `'Georgia', serif`

### Breakpoints
Mobile: `max-width: 768px`
Small mobile: `max-width: 480px`

---

## 📞 Need Help?

If anything doesn't work:
1. Check the browser console for errors
2. Check Railway logs for server errors
3. Let me know and I'll help debug!

---

## 🎉 You're All Set!

Once you've:
1. ✅ Added guests.json
2. ✅ Added all images
3. ✅ Tested locally
4. ✅ Deployed to Railway

Your wedding website v7 will be live with:
- Mobile hamburger navigation
- Photo carousel with swipe
- Dietary requirements system
- PDF export for admin

**Congratulations! 🎊**

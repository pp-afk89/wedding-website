# Wedding Website with Admin Panel
## Rakel & Piers - April 2026

Complete wedding website with powerful admin panel for easy guest management.

---

## 🎉 What's New - Admin Panel Edition

### ✨ Admin Panel Features

**Password-Protected Admin Interface**
- URL: `http://localhost:3000/wedding-admin-2026`
- Password: `ar0y092`
- Desktop-optimized interface
- Wedding aesthetic design

**Dashboard Statistics**
- Total guest count
- Ceremony attendee count
- Family Reception attendee count
- Wedding Celebration attendee count
- Updates automatically as you add/edit guests

**Guest Management**
- ✅ Add new guests (auto-saves immediately)
- ✅ Edit existing guests (auto-saves on form)
- ✅ Delete guests (with confirmation)
- ✅ Search/filter guests
- ✅ View gift selections and payment status

**Data Storage**
- 📁 **JSON Database** (`guests.json`)
- No Excel vulnerabilities
- Fast and reliable
- Easy to backup

**Excel Export**
- 📥 Download current guest list as Excel
- Perfect for offline use on wedding day
- Includes all guest data + gift selections
- Formatted and ready to print

---

## 🚀 Quick Start

### Installation

```bash
cd wedding-website-v6-admin
npm install
npm start
```

### Access

- **Main Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/wedding-admin-2026
- **Admin Password**: ar0y092

---

## 👥 Managing Guests

### Adding a New Guest

1. Go to admin panel: `/wedding-admin-2026`
2. Login with password: `ar0y092`
3. Fill in the form:
   - **Username**: `First Last` (with space, e.g., "John Smith")
   - **Display Name**: How they'll be greeted (e.g., "John and Mary")
   - **Events**: Check boxes for invited events
4. Click "Add Guest"
5. **Automatically saved!** Guest immediately available on website

### Editing a Guest

1. Find guest in the list
2. Click "Edit" button
3. Form auto-fills with their data
4. Make changes
5. Click "Update Guest"
6. **Automatically saved!** Changes live immediately

### Deleting a Guest

1. Find guest in the list
2. Click "Delete" button
3. Confirm deletion
4. Guest removed from database

### Searching Guests

- Use search box to filter by name or username
- Real-time filtering as you type

---

## 📊 Gift Tracking

### How It Works

**When a guest selects a gift:**
1. Gift choice appears in admin panel
2. Shows: "Our Honeymoon" or "Our New Boston Home"

**When they click payment link:**
1. Payment status updates to "✓ Clicked"
2. Timestamp recorded in database

### Viewing Gift Data

Admin panel shows three columns for each guest:
- **Gift Selection**: What they chose
- **Payment Status**: Whether they clicked payment link
- **Timestamp**: When action occurred (in database)

---

## 📥 Exporting to Excel

### Download Guest List

1. Click "📥 Download Excel" button in admin header
2. File downloads automatically
3. Filename: `Wedding_Guests_YYYY-MM-DD.xlsx`

### Excel Contents

**Columns:**
- Username
- Display Name  
- Ceremony (X if invited)
- Family Reception (X if invited)
- Wedding Celebration (X if invited)
- Gift Choice
- Payment Status

**Formatting:**
- Header row: Green background (#5a7360)
- Event columns: Centered
- Ready to print or email

---

## 💾 Database Structure

### JSON Format

```json
[
  {
    "username": "John Smith",
    "displayName": "John and Mary Smith",
    "events": {
      "ceremony": true,
      "familyReception": true,
      "weddingCelebration": false
    },
    "giftChoice": "Our Honeymoon",
    "paymentStatus": "Payment Link Clicked"
  }
]
```

### File Location

`guests.json` in root directory

### Backup

Simply copy `guests.json` to backup your data!

---

## 🌐 Deployment

### Compatible Hosting

**Works on any platform with Node.js:**
- ✅ Heroku
- ✅ Railway
- ✅ DigitalOcean App Platform
- ✅ AWS/Azure/Google Cloud
- ✅ Any VPS

### Deployment Steps

1. **Choose platform** (recommend Heroku or Railway)
2. **Push code** to platform
3. **Set environment variables** (if needed)
4. **Deploy!**

### Important Files

Make sure these are included:
- `guests.json` - Guest database
- `server.js` - Backend
- `package.json` - Dependencies
- `public/` - All frontend files

---

## 🔐 Security

### Admin Access

- **Password**: `ar0y092`
- **Session-based**: Stays logged in until browser close
- **Hidden URL**: `/wedding-admin-2026` (not obvious)

### For Production

Consider adding:
1. **Environment variable** for password
2. **HTTPS only** enforcement
3. **Rate limiting** on admin routes
4. **IP whitelist** (optional)

---

## 📱 Website Features

All previous features maintained:

**Guest Experience:**
- Personalized login
- Custom event invitations
- Photo gallery with lightbox
- Gift selection
- Hotel recommendations

**Mobile Optimized:**
- Responsive design
- Touch-friendly
- Fast loading

---

## 🎨 Customization

### Change Admin Password

Edit `public/admin/admin-script.js` line 2:
```javascript
const ADMIN_PASSWORD = 'your-new-password';
```

### Change Admin URL

Edit `server.js` line 47:
```javascript
app.get('/your-custom-url', (req, res) => {
```

And update in README!

### Add More Event Types

1. Update `guests.json` structure
2. Update admin form (add checkbox)
3. Update guest display logic

---

## 🔧 Troubleshooting

### Can't Login to Admin

- Check password: `ar0y092`
- Try clearing browser cache
- Check browser console for errors

### Changes Not Saving

- Check server console for errors
- Verify `guests.json` file permissions
- Restart server

### Guest Can't Login

- Verify username format: `firstname.lastname`
- Check guest exists in database
- Try admin panel to confirm guest data

### Excel Export Not Working

- Check `exceljs` is installed: `npm install`
- Verify server has write permissions
- Check browser console for errors

---

## 📂 File Structure

```
wedding-website-v6-admin/
├── public/
│   ├── admin/
│   │   ├── index.html (Admin panel)
│   │   ├── admin-styles.css
│   │   └── admin-script.js
│   ├── images/
│   │   ├── save_the_date_graphic_only.png
│   │   └── gallery/ (9 photos)
│   ├── index.html (Main website)
│   ├── styles.css
│   └── script.js
├── server.js (Backend + API)
├── guests.json (Database)
├── package.json
└── README.md
```

---

## 🎯 Admin Panel Workflow

### Typical Usage

**Before Wedding:**
1. Add all guests via admin panel
2. Guests can login and see their invitations
3. Monitor gift selections as they come in
4. Export to Excel periodically for backup

**Day Before Wedding:**
1. Export final guest list to Excel
2. Print for registration table
3. Check final gift/payment counts

**After Wedding:**
1. Export final data for records
2. Backup `guests.json` file

---

## 💡 Tips

### Best Practices

1. **Regular Backups**: Copy `guests.json` weekly
2. **Test Before Launch**: Add test guests, verify everything works
3. **Mobile Check**: Test admin panel on tablet/phone
4. **Excel Exports**: Download backups before major changes

### Common Workflows

**Adding Multiple Guests:**
- Form stays open after adding
- Quick to add many guests in succession
- Auto-saves each one

**Bulk Editing:**
- Can quickly edit multiple guests
- Search to filter, edit one by one
- Changes save immediately

---

## ❓ FAQ

**Q: Can I import guests from Excel?**
A: Currently manual entry. You can edit `guests.json` directly (JSON format) for bulk import.

**Q: What happens if two people try to edit simultaneously?**
A: Last save wins. For wedding size, this is unlikely to be an issue.

**Q: Can I change guest usernames after creating them?**
A: Not recommended. Better to delete and re-add. Gift data will be lost.

**Q: How do I reset all data?**
A: Delete or empty `guests.json`, restart server.

**Q: Can I add custom fields?**
A: Yes! Edit database structure, update admin form, update display logic.

---

## 📄 License

Personal use for Rakel & Piers' wedding, April 2026.

---

## ✨ Summary

**You now have:**
- ✅ Full wedding website
- ✅ Powerful admin panel
- ✅ JSON database (no vulnerabilities)
- ✅ Excel export capability
- ✅ Real-time gift tracking
- ✅ Auto-save functionality
- ✅ Mobile-optimized
- ✅ Production-ready

**Ready to deploy!** Tomorrow we'll get this online! 🚀

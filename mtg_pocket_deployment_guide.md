# MTG Pocket - Safe Deployment Guide

## 🎯 Goal: Deploy Refactored Version WITHOUT Losing Data

This guide ensures you can safely upgrade from the single-file version to the refactored modular version.

---

## 📋 Pre-Deployment Checklist

### ✅ Before You Start

- [ ] You have the old single-file `index.html` working
- [ ] You have collection data you want to keep
- [ ] You have a backup tool ready (`backup.html`)
- [ ] You understand git branches (or file backups)

---

## 🛡️ Step-by-Step Safe Deployment

### Step 1: Backup Current Version (5 minutes)

**Option A: Using Git (Recommended)**
```bash
# Make sure you're on master with the old version
git checkout master
git status  # Should show clean working tree

# Create a safety branch
git branch old-version-backup
git push origin old-version-backup  # If using remote
```

**Option B: Manual File Backup**
```bash
# Copy the entire directory
cp -r mtg-pocket mtg-pocket-backup
# Or just the critical file
cp index.html index.html.backup
```

### Step 2: Backup Your Data (CRITICAL - 2 minutes)

1. **Open `backup.html` in your browser**
   ```
   http://localhost:8000/backup.html
   ```

2. **Check "Current Data" section**
   - Should show your points, sets, and card counts
   - If it says "No data found", your data is elsewhere!

3. **Click "📥 Download Backup"**
   - Saves file like: `mtg-pocket-backup-2024-12-27T10-30-00.json`
   - **KEEP THIS FILE SAFE!** (email it to yourself, store in cloud, etc.)

4. **Click "🔍 Verify Backup File"**
   - Select the file you just downloaded
   - Should say "✅ Backup file is valid!"
   - If not, don't proceed!

### Step 3: Test Migration (Safe Test - 5 minutes)

Still in `backup.html`:

1. **Click "🔬 Test Migration"**
   - Shows what changes will be made
   - Read-only test, doesn't modify your data
   - Should say either:
     - "✅ No migration needed!" (lucky you!)
     - "🔬 Migration would make X changes:" (normal)

2. **Review the changes**
   - Typical changes: "Added fullart=false", "Added backImg"
   - These are safe and expected

### Step 4: Deploy on a Test Branch First (10 minutes)

**Option A: Git Branch (Recommended)**
```bash
# Create feature branch
git checkout -b refactor-test

# Copy all refactored files
# (You should have these from the refactoring work)
cp /path/to/refactored/* .

# Make sure you have:
# - index.html (new version)
# - styles.css
# - js/ folder with all modules
# - backup.html
# - test.html

# Commit
git add .
git commit -m "Add refactored version for testing"
```

**Option B: Separate Directory**
```bash
# Create test directory
mkdir mtg-pocket-refactored
cd mtg-pocket-refactored

# Copy refactored files here
# Test in parallel with old version
```

### Step 5: Test Refactored Version (10 minutes)

1. **Start server in refactored directory**
   ```bash
   python3 -m http.server 8001  # Different port!
   ```

2. **Open in browser**
   ```
   http://localhost:8001/index.html
   ```

3. **Check console for migration logs**
   ```
   Loaded saved data: { points: ..., setCount: ..., totalCards: ... }
   Running data migration...
   Migration complete, saving changes
   ```

4. **Verify your data**
   - Check points counter
   - Open dev panel → Click "🔍 Diagnostic Info"
   - Check console shows your sets and cards
   - Switch to your last opened set in dropdown
   - Click "View Collection"
   - **Verify all your cards are there!**

5. **Test pack opening**
   - Open a pack (free mode if needed)
   - Check card reveal works
   - Check collection updates

6. **Run test suite**
   ```
   http://localhost:8001/test.html
   ```
   - Click "⚡ Quick Tests"
   - All should pass

### Step 6: If Something Goes Wrong (Recovery)

**Worst case: Your data looks wrong in refactored version**

1. **DON'T PANIC - Your backup is safe!**

2. **Go back to old version**
   ```bash
   # Git method
   git checkout master
   
   # Or manual method
   cd ../mtg-pocket-backup
   python3 -m http.server 8000
   ```

3. **Restore from backup** (if needed)
   - Open `backup.html`
   - Click "📂 Select Backup File"
   - Choose your backup JSON
   - Review preview
   - Click "♻️ Restore from Backup"
   - Confirm
   - Reload main app

4. **Report the issue**
   - What went wrong?
   - What did the diagnostic show?
   - Any console errors?

### Step 7: Deploy to Production (if tests pass)

**Option A: Git Merge**
```bash
# If everything works on refactor-test branch
git checkout master
git merge refactor-test
git push origin master

# Keep backup branch around for safety
# Don't delete old-version-backup branch yet!
```

**Option B: Replace Files**
```bash
# Copy refactored files over old version
cp -r mtg-pocket-refactored/* mtg-pocket/

# Keep the backup somewhere safe
```

### Step 8: Monitor for 24 Hours

After deploying:

1. **Check it works on your normal device**
2. **Open packs, verify they save**
3. **After 24 hours of normal use:**
   - If everything works: You're done! 🎉
   - If problems arise: You still have backups

---

## 🚨 Emergency Rollback Plan

If you need to rollback after deployment:

### Git Method
```bash
git checkout old-version-backup
# Or
git revert HEAD
```

### Manual Method
```bash
# Restore old index.html
cp index.html.backup index.html
```

### Restore Data
1. Open `backup.html`
2. Load your backup JSON
3. Click restore

---

## 📊 Deployment Decision Tree

```
Do you have collection data?
├─ NO → Just deploy, nothing to lose
└─ YES → Continue
    │
    Did you backup your data?
    ├─ NO → STOP! Go to Step 2
    └─ YES → Continue
        │
        Did you test on separate branch/directory?
        ├─ NO → STOP! Go to Step 4
        └─ YES → Continue
            │
            Does everything work in tests?
            ├─ NO → STOP! Debug first
            └─ YES → Safe to deploy!
```

---

## 🎓 What Makes This Safe?

1. **Non-destructive migration**: Adds fields, doesn't remove them
2. **Backward compatible**: Old version can still read the data
3. **Backup tool**: Easy restore if needed
4. **Test before deploy**: Verify on separate instance
5. **Git branches**: Easy rollback
6. **Diagnostic tools**: See exactly what's happening

---

## 💡 Pro Tips

### Tip 1: Keep Multiple Backups
```bash
# Backup before testing
cp mtg-pocket-backup-before-test.json ~/backups/

# Backup after confirming it works
cp mtg-pocket-backup-after-test.json ~/backups/
```

### Tip 2: Test in Private/Incognito Window
- Open old version in normal window
- Open new version in incognito
- Use same localStorage (they share it!)
- Easily compare side-by-side

### Tip 3: Export Data Regularly
Add this to your routine:
- Export backup weekly
- Store in cloud (Google Drive, Dropbox)
- Email yourself occasionally

### Tip 4: Browser Dev Tools
```javascript
// Check data anytime in console:
console.log(JSON.parse(localStorage.getItem('mtgPocket')));

// Quick backup in console:
copy(localStorage.getItem('mtgPocket'));
// Then paste into a text file
```

---

## ✅ Final Checklist Before Merging to Master

- [ ] Backup file downloaded and verified
- [ ] Test migration shows expected changes
- [ ] Refactored version tested on separate branch
- [ ] All data visible in new version
- [ ] Pack opening works
- [ ] Collection view works  
- [ ] Test suite passes
- [ ] Console shows no errors
- [ ] Diagnostic tool shows correct counts
- [ ] Old version still accessible (backup branch)
- [ ] Backup file stored safely
- [ ] Ready to monitor for 24 hours after deploy

---

## 🆘 Support Checklist

If you're unsure, answer these:

1. **Can you see this in backup.html?**
   - [ ] Current data info shows points and cards
   
2. **Did you download a backup file?**
   - [ ] Yes, and it's verified
   
3. **Can you access the old version?**
   - [ ] Yes, via git branch or backup folder
   
4. **Did the refactored version show your data?**
   - [ ] Yes, diagnostic showed correct counts
   
5. **Are you comfortable with git?**
   - [ ] Yes → Use git branches
   - [ ] No → Use file backups

If you answered YES to all, **you're ready to deploy safely!**

If any NO, **work on that step first.**

---

**Remember:** With proper backups, you can't lose data. Take your time! 🛡️
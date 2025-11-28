# 🚀 Update Your Existing Vercel Deployment

Your Hablas app is already deployed! We just added authentication, database, and security features. Here's how to update it:

---

## Step 1: Add PostgreSQL Database (2 minutes)

1. **Go to:** https://vercel.com/dashboard
2. **Click:** Your `hablas` project
3. **Click:** "Storage" tab at the top
4. **Click:** "Create Database" button
5. **Select:** "Postgres"
6. **Accept defaults** and click "Create"
7. **Wait** 30 seconds for it to provision
8. **Copy** the connection string that appears (starts with `postgres://`)

✅ **Done!** Vercel automatically adds the DATABASE_URL to your environment variables.

---

## Step 2: Add Other Environment Variables (3 minutes)

Still in your Vercel project:

1. **Click:** "Settings" tab
2. **Click:** "Environment Variables" in left sidebar
3. **Add these variables one by one:**

```
JWT_SECRET
Value: cdjEVXPiktvtNdd4kl01PJnmu/n6KTAxKeJI4m8KtzV7voBDrKIhVH2zA+wXr1F91ZEqmXba0eNsJEno6Cwd4w==
Environment: Production

REFRESH_TOKEN_SECRET
Value: PP9mAuEqWlPBMuJJQ3DhqWuATjrAkVSXNL+N6pjcEMw=
Environment: Production

ADMIN_EMAIL
Value: admin@hablas.co
Environment: Production

ADMIN_PASSWORD
Value: 7gx7gS^2*sMfGrQA$pRPRCgz
Environment: Production

DB_SSL
Value: true
Environment: Production

NEXT_PUBLIC_APP_URL
Value: https://hablas.vercel.app
(OR your custom domain if you have one)
Environment: Production

ALLOWED_ORIGIN_1
Value: https://hablas.vercel.app
(OR your custom domain)
Environment: Production

ALLOWED_ORIGIN_2
Value: https://www.hablas.co
(If you have a www domain)
Environment: Production
```

4. **Click "Save"** after each variable

---

## Step 3: Redeploy (1 minute)

Your GitHub repo already has all the new code (I pushed it). Now trigger a redeploy:

1. **Go to:** "Deployments" tab in Vercel
2. **Click:** "Redeploy" on the latest deployment

   **OR**

   Just wait - Vercel auto-deploys from GitHub (should start automatically)

---

## Step 4: Initialize Database (1 minute)

After deployment completes:

**Option A: Using Vercel CLI (if installed)**
```bash
# Install if needed
npm i -g vercel

# Initialize database
vercel env pull
npm run db:init
```

**Option B: Manually via Vercel dashboard**
1. Go to your deployment URL
2. Append `/api/db/init` to test database connection
3. Check Vercel logs to see if it connected successfully

---

## Step 5: Test & Login (2 minutes)

1. **Go to:** Your Hablas URL
2. **Navigate to:** `/admin`
3. **Login with:**
   - Email: `admin@hablas.co`
   - Password: `7gx7gS^2*sMfGrQA$pRPRCgz`

4. **Immediately change password** in account settings
5. **Save new password** in password manager

---

## ⚠️ Important Notes

**Your Custom Domain:**
- If you use `hablas.co` instead of `hablas.vercel.app`
- Update `NEXT_PUBLIC_APP_URL` and `ALLOWED_ORIGIN_1` to use `hablas.co`

**Database Connection:**
- Vercel Postgres automatically sets `DATABASE_URL` when you create the database
- It includes `?sslmode=require` automatically
- No additional configuration needed!

---

## 🆘 Troubleshooting

**Problem: "Database connection failed"**
- Check that Postgres database was created in Vercel
- Verify DATABASE_URL is set in environment variables
- Redeploy to pick up new variables

**Problem: "CORS error"**
- Make sure `ALLOWED_ORIGIN_1` matches your actual domain
- Include `https://` in the URL
- Redeploy after changing

**Problem: "Admin login doesn't work"**
- Database needs to be initialized first
- Run `npm run db:init` locally or via Vercel
- Check deployment logs for errors

---

## ✅ Success Checklist

- [ ] PostgreSQL database created in Vercel
- [ ] All environment variables added
- [ ] Deployment successful (check Deployments tab)
- [ ] Can access `/admin` route
- [ ] Can login with admin credentials
- [ ] Admin password changed
- [ ] New password saved in password manager

---

**Estimated Total Time: 10 minutes**

Good luck! 🚀

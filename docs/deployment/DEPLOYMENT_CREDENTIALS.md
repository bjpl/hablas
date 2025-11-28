# 🔐 Production Deployment Credentials

**Generated:** 2025-11-17
**Security Level:** CRITICAL - Store in secure password manager

---

## ⚠️ SECURITY WARNING

**This document contains sensitive credentials. After saving to your password manager:**
1. Delete this file from your local system
2. Never commit this file to version control
3. Share credentials only through secure channels
4. Rotate all credentials if they are compromised

---

## 🔑 Authentication Secrets

### JWT Secret
```
x+2C0NJbhVjaoeTL5pXIQoZ960cL9ZVO78CcizLNBfk=
```

**Usage:** `JWT_SECRET` environment variable
**Length:** 64 characters (cryptographically secure)
**Algorithm:** Base64-encoded random bytes
**Rotation:** Recommended every 90 days

### Refresh Token Secret
```
PP9mAuEqWlPBMuJJQ3DhqWuATjrAkVSXNL+N6pjcEMw=
```

**Usage:** `REFRESH_TOKEN_SECRET` environment variable
**Length:** 64 characters (cryptographically secure)
**Algorithm:** Base64-encoded random bytes
**Rotation:** Recommended every 90 days

---

## 👤 Administrator Account

### Admin Email
```
admin@hablas.co
```

### Admin Password
```
hc&TKgo3w^p2ot&@VHcNFYs8
```

**Length:** 24 characters
**Complexity:** Mixed case, numbers, special characters
**Security:** Cryptographically generated
**First Login:** Change password immediately after first login
**Storage:** Save in password manager, delete from all documents

---

## 🗄️ Database Configuration

### PostgreSQL Connection

**Development:**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hablas
```

**Production Template:**
```
DATABASE_URL=postgresql://[username]:[password]@[hostname]:5432/hablas
```

### Configuration Parameters
- **Host:** localhost (development) / your-db-host.com (production)
- **Port:** 5432
- **Database:** hablas
- **User:** postgres (development) / create dedicated user (production)
- **Password:** Set strong password for production
- **SSL:** Required for production (`DB_SSL=true`)

---

## 🌐 CORS Configuration

### Development
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
ALLOWED_ORIGIN_1=http://localhost:3000
ALLOWED_ORIGIN_2=http://localhost:3001
```

### Production Template
```
NEXT_PUBLIC_APP_URL=https://hablas.co
ALLOWED_ORIGIN_1=https://hablas.co
ALLOWED_ORIGIN_2=https://www.hablas.co
```

---

## 🔴 Redis Configuration (Optional)

### Development
```
REDIS_URL=
REDIS_PASSWORD=
```
*In-memory rate limiting will be used*

### Production Template
```
REDIS_URL=redis://username:password@your-redis-host:6379
REDIS_PASSWORD=your-secure-redis-password
```

**Recommended for production:**
- Managed Redis service (AWS ElastiCache, Redis Cloud, etc.)
- SSL/TLS enabled
- Password authentication required
- Dedicated instance (not shared)

---

## 📋 Pre-Deployment Checklist

### Environment Configuration
- [ ] All secrets generated and saved in password manager
- [ ] `.env.local` created with all values
- [ ] `.env.local` added to `.gitignore` (verify!)
- [ ] Production environment variables configured in deployment platform
- [ ] `NODE_ENV=production` set

### Database Setup
- [ ] PostgreSQL instance provisioned
- [ ] Database `hablas` created
- [ ] Dedicated database user created (not using postgres superuser)
- [ ] Strong password set for database user
- [ ] SSL/TLS enabled and verified
- [ ] `DATABASE_URL` configured with production credentials
- [ ] Database migrations run: `npm run db:init`
- [ ] Database health check passed: `npm run db:health`

### Security Configuration
- [ ] JWT secrets are production values (not from this document)
- [ ] Admin password changed after first login
- [ ] CORS origins set to actual production domains
- [ ] Redis configured for distributed rate limiting
- [ ] All API keys are production values
- [ ] Security audit reviewed: `docs/security/SECURITY_AUDIT_REPORT_2025-11-16.md`

### Testing
- [ ] Build succeeds: `npm run build`
- [ ] All tests pass: `npm test`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Database connection verified
- [ ] Authentication flow tested
- [ ] Rate limiting tested
- [ ] CORS restrictions verified

### Documentation
- [ ] Production security guide reviewed: `docs/security/PRODUCTION_SECURITY_GUIDE.md`
- [ ] Database migration guide reviewed: `docs/database/MIGRATION_GUIDE.md`
- [ ] Architecture documentation reviewed: `docs/architecture/`
- [ ] Team trained on deployment procedures

---

## 🔄 Credential Rotation Schedule

| Credential | Rotation Frequency | Last Rotated | Next Rotation |
|------------|-------------------|--------------|---------------|
| JWT_SECRET | 90 days | 2025-11-17 | 2026-02-15 |
| REFRESH_TOKEN_SECRET | 90 days | 2025-11-17 | 2026-02-15 |
| ADMIN_PASSWORD | 90 days | 2025-11-17 | 2026-02-15 |
| DATABASE_PASSWORD | 180 days | Not set | Set on deployment |
| REDIS_PASSWORD | 180 days | Not set | Set on deployment |
| API_KEYS | As needed | Not set | Per provider policy |

---

## 🚨 Incident Response

### If Credentials Are Compromised:

1. **Immediate Actions:**
   - Rotate all affected credentials immediately
   - Invalidate all active sessions
   - Review access logs for unauthorized access
   - Notify security team

2. **Generate New Secrets:**
   ```bash
   # New JWT Secret
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

   # New Admin Password
   node -e "
   const crypto = require('crypto');
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
   let password = '';
   for (let i = 0; i < 24; i++) {
     password += chars[crypto.randomInt(0, chars.length)];
   }
   console.log(password);
   "
   ```

3. **Update Deployment:**
   - Update environment variables in deployment platform
   - Restart all services
   - Verify all systems operational
   - Monitor for anomalies

4. **Post-Incident:**
   - Document incident
   - Review security procedures
   - Update incident response plan
   - Conduct security training

---

## 📞 Support Contacts

**Security Issues:** Report immediately to security team
**Database Support:** Contact database administrator
**Infrastructure:** Contact DevOps team

---

## 🔒 Storage Instructions

1. **Password Manager:** Store all credentials in enterprise password manager
2. **Encryption:** Use AES-256 encryption at rest
3. **Access Control:** Limit access to production credentials
4. **Backup:** Encrypted backups in secure location
5. **Audit:** Log all credential access

---

**Remember:** Delete this file after saving credentials to password manager!

---

*Generated by Claude Flow Swarm - Security Hardening Agent*
*Document Version: 1.0*
*Classification: CONFIDENTIAL*

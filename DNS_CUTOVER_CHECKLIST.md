# AIPS DNS Cutover Checklist

## Status: Nameservers Changed ✅

**Completed:**
- [x] Squarespace nameservers updated to Cloudflare
- [x] DNSSEC disabled (required for nameserver change)
- [x] Cloudflare zone is **ACTIVE**
- [x] `api.aipremiumshop.com` Worker is healthy
- [x] Pages preview (`ea892f6b.aips-landing.pages.dev`) is live
- [x] Pages custom domains re-added (pending DNS setup)

**Remaining:**
- [ ] Add CNAME `@ → aips-landing.pages.dev` in Cloudflare DNS
- [ ] Add CNAME `www → aips-landing.pages.dev` in Cloudflare DNS
- [ ] Delete old A record (34.111.179.208) if still present
- [ ] Verify all endpoints return 200

---

## Manual Steps (2 minutes)

### 1. Open Cloudflare DNS Records
Go to: https://dash.cloudflare.com/4ca6269edabb6ad2906d70ec6845de22/aipremiumshop.com/dns/records

### 2. Delete Old A Record
Look for an **A record** pointing to `34.111.179.208` and delete it.

### 3. Add Apex CNAME
Click **Add record**:
- **Type:** CNAME
- **Name:** `@` (or `aipremiumshop.com`)
- **Target:** `aips-landing.pages.dev`
- **Proxy status:** ON (orange cloud) ✅
- **TTL:** Auto
- Click **Save**

### 4. Add www CNAME
Click **Add record** again:
- **Type:** CNAME
- **Name:** `www`
- **Target:** `aips-landing.pages.dev`
- **Proxy status:** ON (orange cloud) ✅
- **TTL:** Auto
- Click **Save**

### 5. Verify Pages Domains Activated
Go to: https://dash.cloudflare.com/4ca6269edabb6ad2906d70ec6845de22/pages/view/aips-landing/custom-domains

Both domains should show **Active** within 1-2 minutes.

---

## Verification

Run this script after adding the records:

```bash
python3 scripts/verify-deployment.py
```

Expected output:
```
1. Nameservers: ✅ Cloudflare
2. Apex HTTPS status: 200 ✅
3. www HTTPS status: 200 ✅
4. API health: 200 ✅
5. Pages preview: 200 ✅
🎉 ALL SYSTEMS OPERATIONAL
```

---

## Current State

| Endpoint | Expected | Status |
|----------|----------|--------|
| `https://aipremiumshop.com` | 200 (Pages) | 404 ❌ |
| `https://www.aipremiumshop.com` | 200 (Pages) | 0 ❌ |
| `https://api.aipremiumshop.com/health` | 200 OK | 200 ✅ |
| Pages Preview | 200 | 200 ✅ |

---

## Cloudflare Resources

- **Zone ID:** `67134ebf10f88619577a81b718906ad9`
- **Account ID:** `4ca6269edabb6ad2906d70ec6845de22`
- **Pages Project:** `aips-landing`
- **Worker:** `aips-api`
- **D1 DB:** `aips-prod`
- **R2 Bucket:** `aips-media`

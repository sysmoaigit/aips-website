# AIPS Deploy Workflow Fix

## Problem

GitHub Actions workflow `.github/workflows/deploy.yml` has been failing since **April 20, 2026**.

### Root Cause

The `pnpm-lock.yaml` file was **completely empty** (1 byte). When `pnpm install` ran in CI, it failed because the lockfile was broken.

### Evidence

```bash
# Before fix
$ wc -c pnpm-lock.yaml
1

$ wc -l pnpm-lock.yaml
0
```

### Fix Applied

Regenerated the lockfile locally:

```bash
pnpm install --lockfile-only
```

Result:
```bash
# After fix
$ wc -c pnpm-lock.yaml
252709

$ wc -l pnpm-lock.yaml
6821
```

## Verification

Tested on fork (`sysmoaigit/aips-website`) via GitHub Actions:

- ✅ **Build step:** PASSES (4.42s, 2220 modules)
- ⚠️ **Deploy step:** FAILS due to missing `CLOUDFLARE_API_TOKEN` secret (expected)

## Remaining Action for EMON

### 1. Add Cloudflare API Token Secret

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use template: **"Edit Cloudflare Workers"**
4. Or create custom token with permissions:
   - `Zone:Edit`
   - `Page Rules:Edit`
   - `Cloudflare Pages:Edit`
5. Copy token
6. Go to GitHub repo → Settings → Secrets and variables → Actions
7. Click **"New repository secret"**
8. Name: `CLOUDFLARE_API_TOKEN`
9. Paste token → Save

### 2. Merge the PR

The PR at https://github.com/sysmoai/aips-website/pull/1 contains the lockfile fix.

### 3. Trigger Deploy

After merging, the workflow will auto-trigger on push to main.

Or manually trigger:
1. GitHub repo → Actions → "Deploy to Cloudflare Pages"
2. Click **"Run workflow"**

## Local Build Note (macOS)

The `pnpm-workspace.yaml` has platform package overrides that exclude darwin-arm64 packages. This causes local builds to fail on Mac.

### Workaround for Local Development

```bash
# Install platform packages explicitly
pnpm add -w -D @rollup/rollup-darwin-arm64 lightningcss-darwin-arm64 @tailwindcss/oxide-darwin-arm64
```

### For CI (GitHub Actions)

The overrides in `pnpm-workspace.yaml` are fine for CI because Linux packages are NOT excluded. The build passes on ubuntu-latest.

**Do NOT modify `pnpm-workspace.yaml`** — it's needed for Replit compatibility.

## Summary

| Issue | Status | Action |
|-------|--------|--------|
| Empty lockfile | ✅ FIXED | Regenerated 6821 lines |
| Build failing | ✅ FIXED | Verified on GitHub Actions |
| Deploy failing | ⏳ PENDING | EMON adds CF_API_TOKEN secret |
| Local macOS build | ⚠️ WORKAROUND | Install darwin packages manually |

---

*Diagnosed and fixed by Kimi Desktop on 2026-05-17*

#!/usr/bin/env python3
"""AIPS DNS & Endpoint Verification Script"""
import subprocess, json, sys, time

def dig(record_type, name):
    try:
        out = subprocess.check_output(["dig", "+short", record_type, name], text=True)
        return out.strip().split("\n") if out.strip() else []
    except:
        return []

def curl_status(url):
    try:
        out = subprocess.check_output(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "10", url],
            text=True
        )
        return int(out.strip())
    except:
        return 0

def main():
    print("=" * 60)
    print("AIPS Domain Verification Report")
    print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # NS records
    ns = dig("NS", "aipremiumshop.com")
    print(f"\n1. Nameservers: {'✅ Cloudflare' if 'cloudflare' in ' '.join(ns).lower() else '❌ Not Cloudflare'}")
    for n in ns:
        print(f"   - {n}")

    # Apex domain
    a = dig("A", "aipremiumshop.com")
    print(f"\n2. Apex A record:")
    for ip in a:
        print(f"   - {ip}")

    apex_status = curl_status("https://aipremiumshop.com")
    print(f"   HTTPS status: {apex_status} {'✅' if apex_status == 200 else '❌'}")

    # www
    www_cname = dig("CNAME", "www.aipremiumshop.com")
    print(f"\n3. www CNAME: {'✅ ' + www_cname[0] if www_cname else '❌ Not set'}")
    www_status = curl_status("https://www.aipremiumshop.com")
    print(f"   HTTPS status: {www_status} {'✅' if www_status == 200 else '❌'}")

    # API
    api_status = curl_status("https://api.aipremiumshop.com/health")
    print(f"\n4. API health: {api_status} {'✅' if api_status == 200 else '❌'}")

    # Pages preview
    pages_status = curl_status("https://ea892f6b.aips-landing.pages.dev/")
    print(f"5. Pages preview: {pages_status} {'✅' if pages_status == 200 else '❌'}")

    print("\n" + "=" * 60)
    all_good = (
        any('cloudflare' in n.lower() for n in ns) and
        apex_status == 200 and
        www_status == 200 and
        api_status == 200
    )
    if all_good:
        print("🎉 ALL SYSTEMS OPERATIONAL")
    else:
        print("⏳ WAITING FOR DNS/CNAME SETUP")
    print("=" * 60)

if __name__ == "__main__":
    main()

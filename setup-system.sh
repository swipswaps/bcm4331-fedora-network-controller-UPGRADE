#!/bin/bash
# ================================================
# setup-system.sh - System Integration v30
# ================================================
# This script handles the one-time system integration:
# 1. Installs initial dependencies.
# 2. Configures passwordless sudo for the fix script.
# 3. Sets up SELinux contexts if needed.
# ================================================

set -euo pipefail

echo "🚀 Starting Broadcom Recovery Kit System Integration..."

# 1. Install dependencies
echo "📦 Installing forensic dependencies (sqlite, tcpdump, mtr, traceroute, bind-utils)..."
sudo dnf install -y sqlite tcpdump mtr traceroute bind-utils NetworkManager iw rfkill || true

# 2. Install recovery script system-wide
echo "🔧 Installing recovery script to /usr/local/bin/fix-wifi..."
sudo cp fix-wifi.sh /usr/local/bin/fix-wifi
sudo chmod +x /usr/local/bin/fix-wifi

# 3. Configure passwordless sudo
echo "🔐 Configuring passwordless sudo for owner..."
sudo tee /etc/sudoers.d/broadcom-control <<EOF
owner ALL=(ALL) NOPASSWD: SETENV: /usr/local/bin/fix-wifi
EOF
sudo chmod 0440 /etc/sudoers.d/broadcom-control

# 4. Restore SELinux contexts
echo "🛡️ Restoring SELinux contexts..."
sudo restorecon -v /usr/local/bin/fix-wifi 2>/dev/null || true

echo "✅ System integration complete!"

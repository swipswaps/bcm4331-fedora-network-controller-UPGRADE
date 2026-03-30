# 🛰️ Broadcom Fedora Network Controller (UPGRADE)

A deterministic, forensic recovery and management suite for Broadcom Wi-Fi chipsets (specifically BCM4331) on Fedora. This project automates the complex handshake and driver management required to maintain stable wireless connectivity.

## 📖 User Guide

### 1. Zero-State Recovery (Cold Start)
If your Wi-Fi is completely down or "Enable Networking" is unchecked and unresponsive, use the atomic orchestrator. This is the "Nuclear Option" that builds the path to success from scratch.

```bash
npm run cold-start
```
**What it does:**
- Clears conflicting ports (3000, 24678).
- Injects missing forensic dependencies (sqlite, tcpdump, mtr, etc.).
- Reloads Broadcom drivers (`b43`).
- Forces NetworkManager to re-manage the interface.
- Performs a full forensic handshake to verify Layer 1-4 connectivity.

### 2. System Integration (One-Time Setup)
To allow the web dashboard to trigger repairs without password prompts, run the setup script:

```bash
npm run setup
```
**What it does:**
- Installs system-level dependencies.
- Configures a `sudoers` rule in `/etc/sudoers.d/broadcom-control`.
- Installs the recovery engine to `/usr/local/bin/fix-wifi`.

### 3. Live Dashboard
Start the Control Center to monitor hardware events and signal telemetry in real-time.

```bash
npm run dev
```
Access the UI at: [http://localhost:3000](http://localhost:3000)

### 4. Forensic Auditing
Review the "Black Box" flight recorder to diagnose intermittent drops.

```bash
npm run audit
```
Or view the raw logs:
```bash
cat verbatim_handshake.log
```

---

## 🛠️ Architecture & Transparency

### Request Compliance
This project adheres to strict **Request Compliance** standards:
- **Verbatim Transparency:** No hidden messages. Every command output is logged.
- **Zero-State Resilience:** Assumes the system is broken and fixes it.
- **Self-Healing:** The backend auto-repairs its own configuration (e.g., `sudoers` permissions).
- **Auditability:** Every action leaves a trace in `recovery_state.db`.

### File Manifest
- `fix-wifi.sh`: The core recovery engine.
- `cold-start.sh`: Atomic orchestrator for zero-state recovery.
- `setup-system.sh`: System integration and permission manager.
- `server.ts`: Self-healing Express backend.
- `verbatim_handshake.log`: Real-time flight recorder.
- `recovery_state.db`: SQLite database for deterministic auditing.

---
*Developed for high-reliability hardware management.*

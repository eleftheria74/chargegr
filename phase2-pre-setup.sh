#!/bin/bash
# ============================================================
# PlugMeNow Phase 2 — Προετοιμασία Συστήματος
# Τρέξε αυτό ΠΡΙΝ ανοίξεις Claude Code
# ============================================================
# Χρήση: chmod +x phase2-pre-setup.sh && ./phase2-pre-setup.sh
# ============================================================

set -e

echo "=========================================="
echo "  PlugMeNow Phase 2 — System Setup"
echo "=========================================="

# --- 1. Java JDK 17 ---
echo ""
echo ">>> Έλεγχος Java JDK..."
if java -version 2>&1 | grep -q "17\|18\|19\|20\|21"; then
    echo "✅ Java JDK ήδη εγκατεστημένο"
    java -version
else
    echo "📦 Εγκατάσταση OpenJDK 17..."
    sudo apt update
    sudo apt install -y openjdk-17-jdk
    echo "✅ Java JDK 17 εγκαταστάθηκε"
    java -version
fi

# --- 2. Android SDK Command Line Tools ---
echo ""
echo ">>> Έλεγχος Android SDK..."
ANDROID_HOME="$HOME/android-sdk"

if [ -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
    echo "✅ Android SDK ήδη εγκατεστημένο στο $ANDROID_HOME"
else
    echo "📦 Κατέβασμα Android SDK Command Line Tools..."
    mkdir -p "$ANDROID_HOME"
    cd /tmp
    
    # Κατέβασε τα command line tools (Linux)
    CMDLINE_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    wget -q --show-progress "$CMDLINE_URL" -O cmdline-tools.zip
    
    # Εγκατάσταση
    unzip -q cmdline-tools.zip -d "$ANDROID_HOME/cmdline-tools-tmp"
    mkdir -p "$ANDROID_HOME/cmdline-tools/latest"
    mv "$ANDROID_HOME/cmdline-tools-tmp/cmdline-tools/"* "$ANDROID_HOME/cmdline-tools/latest/"
    rm -rf "$ANDROID_HOME/cmdline-tools-tmp" cmdline-tools.zip
    
    echo "✅ Android SDK Command Line Tools εγκαταστάθηκαν"
fi

# --- 3. Environment Variables ---
echo ""
echo ">>> Ρύθμιση environment variables..."

# Πρόσθεσε στο .bashrc αν δεν υπάρχουν ήδη
BASHRC="$HOME/.bashrc"
if ! grep -q "ANDROID_HOME" "$BASHRC"; then
    echo "" >> "$BASHRC"
    echo "# Android SDK (PlugMeNow Phase 2)" >> "$BASHRC"
    echo "export ANDROID_HOME=\"$HOME/android-sdk\"" >> "$BASHRC"
    echo "export PATH=\"\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools\"" >> "$BASHRC"
    echo "✅ Προστέθηκαν στο .bashrc"
else
    echo "✅ Environment variables ήδη υπάρχουν"
fi

# Φόρτωσε τώρα
export ANDROID_HOME="$HOME/android-sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

# --- 4. Accept licenses & install build-tools ---
echo ""
echo ">>> Εγκατάσταση Android build tools..."
yes | sdkmanager --licenses 2>/dev/null || true
sdkmanager "build-tools;34.0.0" "platform-tools"
echo "✅ Build tools εγκαταστάθηκαν"

# --- 5. Bubblewrap ---
echo ""
echo ">>> Έλεγχος Bubblewrap..."
if command -v bubblewrap &> /dev/null; then
    echo "✅ Bubblewrap ήδη εγκατεστημένο"
    bubblewrap --version
else
    echo "📦 Εγκατάσταση Bubblewrap..."
    npm install -g @nicolo-ribaudo/bubblewrap
    echo "✅ Bubblewrap εγκαταστάθηκε"
fi

# --- 6. Node.js version check ---
echo ""
echo ">>> Έλεγχος Node.js..."
NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -ge 20 ]; then
    echo "✅ Node.js $(node -v) — OK"
else
    echo "⚠️  Node.js $(node -v) — χρειάζεται v20+!"
    echo "   Τρέξε: sudo apt install -y nodejs ή χρησιμοποίησε nvm"
fi

# --- 7. Summary ---
echo ""
echo "=========================================="
echo "  ✅ Σύνοψη Εγκατάστασης"
echo "=========================================="
echo "Java:       $(java -version 2>&1 | head -1)"
echo "Node.js:    $(node -v)"
echo "npm:        $(npm -v)"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "Bubblewrap: $(bubblewrap --version 2>/dev/null || echo 'not found')"
echo ""
echo "=========================================="
echo "  ΕΠΟΜΕΝΟ ΒΗΜΑ:"
echo "  1. source ~/.bashrc"
echo "  2. cd /media/eleftheria/DataSSD/Projects/ChargeGr/chargegr"
echo "  3. claude"
echo "  4. Δώσε: Διάβασε το phase2-prompt.txt"
echo "=========================================="

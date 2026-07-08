#!/bin/bash
# AI Spatial Console Quick Start
echo "Installing dependencies..."
npm install
echo "Starting Expo local dev server..."
echo ""
echo "To connect from your mobile device:"
echo "1. Ensure your phone and computer are on the same Wi-Fi network."
echo "2. Install 'Expo Go' from the App Store or Google Play."
echo "3. Scan the QR code below, or enter the 'exp://192.168.x.x:8081' url."
echo ""
EXPO_USE_FAST_RESOLVER=true npx expo start --lan

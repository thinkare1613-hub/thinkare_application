# Thinkare Patient Mobile App

React Native Expo patient app foundation for connecting a patient to a verified clinic.

## Run

```powershell
cd mobile_app
npm install
npm start
```

Use Expo Go to scan the terminal QR code. The API default is `http://127.0.0.1:8000` for iOS simulator/web and `http://10.0.2.2:8000` for the Android emulator.

For Expo Go on a physical phone, set `EXPO_PUBLIC_API_URL` to your computer's LAN address, for example `http://192.168.1.20:8000`, and run FastAPI on `0.0.0.0`. Keep the phone and computer on the same network. The backend must be reachable from the phone; `localhost` on a phone refers to the phone itself.

## Phase 1 flow

Welcome -> Scan clinic -> Confirm clinic -> Phone login -> OTP -> Create profile -> Home.

The Connected Devices screen is available from the patient home screen. Google Health API approval and live Fitbit authorization/sync are not configured yet; connection and sync remain unavailable until provider access is approved and the backend integration is completed.

The API services are prepared for clinic QR verification and patient OTP endpoints. The QR camera and OTP delivery remain intentionally isolated behind those service boundaries for the next implementation phase.

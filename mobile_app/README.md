# Thinkare Patient Mobile App

React Native Expo patient app foundation for connecting a patient to a verified clinic.

## Run

```powershell
cd mobile_app
npm install
npm start
```

Use Expo Go to scan the terminal QR code. Set `EXPO_PUBLIC_API_URL` when testing against a hosted backend; the default is `http://127.0.0.1:8000`.

## Phase 1 flow

Welcome -> Scan clinic -> Confirm clinic -> Phone login -> OTP -> Create profile -> Home.

The API services are prepared for clinic QR verification and patient OTP endpoints. The QR camera and OTP delivery remain intentionally isolated behind those service boundaries for the next implementation phase.

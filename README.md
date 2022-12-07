# Webapp

This project uses:

- Vite
- React (TS)
- ThreeJS + WebXR

Please check `package.json` file to see available scripts.

## Local environment setup

Local env variables will be added as the project progresses.

VR headsets supported:

- Oculus (Go, Quest, etc)
- Hololens

### Oculus

Follow the instructions from https://developer.oculus.com/documentation/native/android/ts-odh/ to setup Meta Quest Developer Hub app.

The above instructions should allow you to check logs, statuses, file manager, screenshot & record videos.

You should also test if `http://localhost:3000` works on you Oculus browser (don't forget to run the app `npm run dev`).

**Remember: Oculus browser app doesn't auto update, so check frequently and manually for updates.**

If you can't reach localhost in your Oculus browser, follow the instructions below (reference from https://developer.oculus.com/documentation/web/browser-remote-debugging)

- If you installed Meta Quest Developer Hub app (from the instructions above), you should have `android-platform-tools` installed (`adb` command)
- Connect your device (USB) to your PC
  - It is assumed the device and account are both in developer mode from the instructions above
- On the terminal command, run `adb devices` to make sure your PC recognizes the connected Oculus
- Use ADB reverse to view local pages on your Oculus by running `adb reverse tcp:3000 tcp:3000`
  - In this project, the local env uses the port `3000`
- You now should be able to access `http://localhost:3000` from your Oculus browser

### Hololens

TBD

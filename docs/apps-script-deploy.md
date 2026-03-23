# Apps Script Deployment Guide

This Google Apps Script acts as the serverless REST API for your Next.js frontend, reading and writing to the Google Sheet.

## 1. Setup the Script
1. Open your created Google Sheet.
2. Go to `Extensions` > `Apps Script`.
3. In the new window, clear the default `Code.gs` content.
4. Open the `apps-script/Code.gs` file from this repository and copy all the code.
5. Paste it into the Apps Script editor.
6. Replace `const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";` at the top with your actual Sheet ID (found in your Google Sheet URL: `https://docs.google.com/spreadsheets/d/[THIS_PART_IS_THE_ID]/edit`).
7. Save the project (Ctrl+S).

## 2. Deploy as Web App
1. Click the blue **Deploy** button at the top right, then **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Under "Description", type something like `v1`.
4. Under "Execute as", select **Me (your email)**.
5. Under "Who has access", select **Anyone** (this is critical so the frontend can hit the API without Google Auth redirects).
6. Click **Deploy**.
7. Google will ask you to authorize access. Click **Authorize access**, select your account, bypass the safety warning ("Advanced" -> "Go to project (unsafe)"), and click **Allow**.
8. **Copy the Web app URL**. 

## 3. Connect the Frontend
Paste that Web app URL into your `.env.local` file as `GOOGLE_APPS_SCRIPT_URL`.
```env
GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/.../exec"
```
Restart your local Next.js server!

# AIESEC Carthage - Performance Tracking & Voting Tool

A production-ready web application for tracking member performance and voting eligibility in AIESEC Carthage. Built on Next.js 15, TailwindCSS, shadcn/ui and a serverless Google Apps Script backend.

## Features

- **No Database Needed**: Runs entirely off Google Sheets for maximum portability and ease of editing by VPs.
- **Automated Voting Eligibility**: Real-time LCM and action point threshold calculations.
- **Smart Metric Engine**: Supports Fixed, Per-Unit, Percentage and Manual validation models.
- **Sanctions & VP Notes**: Built-in modifier panels for full leadership control.
- **Printable Reports**: Member performance pages have a built-in clean print CSS format for paper evidence.

## Setup Instructions

### 1. Google Sheets & Apps Script Setup

First, initialize your database. All data is structured across specific Tabs in a Google Sheet.

1. Read the [Sheets Setup Guide](./docs/sheets-setup.md) to understand the Schema structure.
2. Read the [Apps Script Deployment Guide](./docs/apps-script-deploy.md) to create the REST API from your Sheets.

### 2. Next.js Frontend Setup

1. Clone or copy this repository to your local machine.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file at the root:
   ```env
   # Your copied URL from Google Apps Script deployment (ends with /exec)
   GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/.../exec"
   
   # A secure passcode for admin login (Default for testing)
   ADMIN_PASSCODE="AIESEC123"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Navigate to `http://localhost:3000` to start seeing the dashboard.

### 3. Quick Seed

To quickly test the application without manually creating 60+ rows in Google Sheets:
1. Ensure your backend is wired up.
2. Login to the application via `/login`.
3. Go to **Admin Settings** -> **Advanced**.
4. Click **Run Seed Command**. 
> Note: this will delete current Members and populate the official Carthage seeded roster.

## Deployment

Deploy this frontend easily on **Vercel**:
1. Push repository to GitHub.
2. Import project into Vercel.
3. Add the `GOOGLE_APPS_SCRIPT_URL` and `ADMIN_PASSCODE` variables to your Vercel Environment variables.
4. Deploy! Next.js App Router caching will automatically optimize speed.

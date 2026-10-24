
# ⚡ Build-Pulse Analytics

> A zero-cost, serverless DevOps observability platform that extracts real-time CI/CD pipeline metrics from GitHub Actions and visualizes them on a high-performance React command center.

![Vercel Deployment](https://img.shields.io/badge/deployment-live-success?style=flat-square&color=B21318)
![GitHub Actions](https://img.shields.io/badge/CI%2FCF-automated-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 🎯 Overview

**Build-Pulse Analytics** eliminates the need for expensive external telemetry tools or paid databases. By leveraging GitHub Actions as a background telemetry worker and a repository-based JSON store (`metrics.json`), it creates a fully automated, serverless closed-loop monitoring system hosted entirely for free on Vercel.

---

## 🏗️ System Architecture

```text
[ GitHub Push / PR ] 
        │
        ▼
[ GitHub Actions Workflow ] 
        │  (Extracts live run ID, duration & status via GitHub REST API)
        ▼
[ data/metrics.json ] (Repository-based Serverless Database)
        │  (Fetched dynamically with cache-busting)
        ▼
[ Vercel-Hosted React Frontend ] (Command-Center Dashboard UI)

```

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS
* **Backend / Tracker:** Node.js (utilizing native `fetch` and `fs` modules—zero external dependencies)
* **CI/CD Automation:** GitHub Actions (Ubuntu runner)
* **Hosting & CDN:** Vercel Global Edge Network

---

## 📂 Project Structure

```text
build-pulse-analytics/
├── .github/
│   └── workflows/
│       └── tracker.yml    # Automated CI/CD pipeline & metrics collector action
├── dashboard/
│   ├── src/
│   │   ├── App.jsx        # Live-fetching React command center UI
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── tracker/
│   └── fetch-metrics.js   # Zero-dependency Node.js script interacting with GitHub REST API
└── data/
    └── metrics.json       # Live serverless database store

```

---

## 🚀 Key Features

* **Serverless Database Architecture:** Bypasses traditional database overhead by utilizing automated git commits to store telemetry directly within the repository.
* **Real-Time Telemetry Extraction:** Automatically polls GitHub's job API during pipeline execution to calculate exact build durations, step statuses, and success rates.
* **Command-Center Aesthetic:** Custom dark-themed UI featuring glowing red accents (`#B21318`), live KPI cards (Total Runs, Average Build Time, Success Rate), and scrollable pipeline history logs.
* **Aggressive Cache-Busting:** Implements dynamic query parameter timestamping (`?t=timestamp`) and `cache: "no-store"` to ensure the frontend instantly reflects fresh data without CDN lag.

---

## ⚙️ Custom Tweaks & Architecture Decisions

* **Zero-Dependency Tracker:** The Node.js tracker script (`tracker/fetch-metrics.js`) relies purely on native JavaScript `fetch` and `fs` modules. This ensures lightning-fast execution inside CI environments without needing an `npm install` overhead.
* **In-Progress State Handling:** Because the tracker executes *during* the active GitHub Actions run, completion timestamps returning `null` are safely caught and tagged as `in-progress` in real-time.

---

## 🛠️ System Tweaks & Troubleshooting

* **Missing `package.json` in Subfolders:** If GitHub Actions throws an `ENOENT` error looking for a package file in `tracker/`, ensure the workflow bypasses dependency installation and executes the script natively using Node.
* **Git Synchronization Conflicts (`[rejected] main -> main`):** Since the GitHub Actions bot commits directly back to the repository (`metrics.json`), local pushes may occasionally require syncing first:
```bash
git pull --rebase
git push

```


* **Vercel CDN Caching:** If live updates take a moment to reflect on your Vercel deployment, verify that the frontend fetch URL includes the dynamic timestamp query parameter (`?t=${Date.now()}`) to force-bypass edge caching.

---

## !Preview
<img width="1027" height="848" alt="Shot-2026-10-22-234452" src="https://github.com/user-attachments/assets/0493a03e-999e-4a1c-b9ae-a558b28b2c3d" />

---

**Author:** [Braveen R](https://braveenr.linklee.in/)</br>

---

## ✌️ Wrapping Up

You now have a fully functional, production-ready, zero-cost CI/CD telemetry dashboard. Push code, watch your GitHub Actions runner fire up, and see your live metrics instantly reflected on your Vercel command center! 🚀 </br>

See you in the terminal!

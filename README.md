# 🌱 EcoAudit: Sustainable Web Engineering Tool

> **Measure, Predict, and Reduce your Digital Carbon Footprint.**

![EcoAudit Banner](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-MERN_%2B_Python-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

EcoAudit is a full-stack distributed system designed to analyze the environmental impact of websites. Unlike simple file-size calculators, EcoAudit uses a **microservices architecture** to perform real-time deep scanning, machine-learning-based projections, and region-aware grid intensity analysis.

---

## 🚀 Key Features

* **🌍 Real-Time Carbon Analysis:** Calculates CO2 per visit using the **Sustainable Web Design (SWD)** model.
* **⚡ Region-Aware Intelligence:** Adjusts carbon scores based on the hosting location's energy grid (e.g., Coal in India vs. Nuclear in France).
* **🤖 ML-Powered Projections:** Uses a **Linear Regression model** (Scikit-Learn) to predict annual carbon emissions based on resource usage patterns.
* **🛠️ Actionable Engineering Insights:** Generates a prioritized list of technical fixes (e.g., "Minify JS", "Use WebP") with calculated carbon savings.
* **🛡️ CI/CD Quality Gate:** Includes a CLI tool (`carbon-cli.py`) to block deployments if the carbon footprint exceeds a set threshold.
* **📊 Visual Dashboard:** A modern React UI with Dark Mode, Donut Charts, and Historical Benchmarking.

---

## 🏗️ System Architecture

EcoAudit operates on a **Microservices Architecture**:

1.  **Scanner Service (Node.js & Puppeteer):** A headless browser service that visits URLs, renders the DOM, and intercepts network traffic to weigh assets (Images, Scripts, CSS).
2.  **Intelligence Engine (Python FastAPI):** The core backend that orchestrates the scan, runs the ML prediction model, and manages the SQLite database.
3.  **Frontend Client (React + Vite):** A modern, responsive dashboard for visualizing audit results and reports.

---

## 🛠️ Technology Stack

* **Frontend:** React.js, Vite, Chart.js, Lucide React
* **Backend:** Python, FastAPI, Uvicorn
* **Database:** SQLite (via SQLModel)
* **Machine Learning:** Scikit-Learn, Pandas, NumPy
* **Scanner:** Node.js, Puppeteer (Headless Chrome)
* **DevOps:** Python CLI for CI/CD integration

---

## ⚙️ Installation & Setup

This project requires **3 separate terminals** to run the distributed services.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/EcoAudit.git](https://github.com/YOUR_USERNAME/EcoAudit.git)
cd EcoAudit
````

### 2\. Terminal A: Scanner Service (Node.js)

This service acts as the "Eyes" of the system.

```bash
cd scanner-service
npm install
npm run dev
# Runs on http://localhost:3000
```

### 3\. Terminal B: Core API (Python)

This service acts as the "Brain" and "Database".

```bash
cd core-api
# Create virtual environment (Windows)
python -m venv venv
.\venv\Scripts\Activate

# Install dependencies
pip install fastapi uvicorn sqlmodel requests pandas scikit-learn httpx

# Start Server
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

### 4\. Terminal C: Web Client (React)

The user interface.

```bash
cd web-client
npm install
npm run dev
# Runs on http://localhost:5173
```

-----

## 🖥️ Usage Guide

### Using the Dashboard

1.  Open `http://localhost:5173`.
2.  Enter a URL (e.g., `https://google.com`).
3.  Select a **Region** to simulate hosting (e.g., `France` for low carbon, `India` for high carbon).
4.  Click **Scan Now**.
5.  View the **Sustainability Grade**, **AI Projection**, and **Optimization Action Plan**.

### Using the CI/CD CLI Tool

Developers can use the command line to audit websites during a build pipeline.

**Pass Condition:**

```bash
# Sets a loose limit of 1.0g CO2. The build will PASS.
python carbon-cli.py --url "[https://google.com](https://google.com)" --limit 1.0
```

**Fail Condition (Breaking the Build):**

```bash
# Sets a strict limit of 0.1g CO2. The build will FAIL.
python carbon-cli.py --url "[https://google.com](https://google.com)" --limit 0.1
```

-----

## 📂 Project Structure

```
EcoAudit/
├── core-api/              # Python FastAPI Backend
│   ├── main.py            # API Endpoints & Logic
│   ├── ml.py              # Machine Learning Model
│   ├── database.py        # SQLite Connection
│   └── models.py          # SQL Tables
├── scanner-service/       # Node.js Puppeteer Service
│   └── server.js          # Network Interceptor Logic
├── web-client/            # React Frontend
│   ├── src/App.jsx        # Dashboard Logic
│   ├── src/Integration.jsx# Docs & API Page
│   └── src/App.css        # Dark Mode Styling
└── carbon-cli.py          # CI/CD Automation Script
```

-----

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

-----

**Developed by [Your Name]**
*B.Tech Information Technology, IGDTUW*

````

### 💾 Final Step: Push the README

Don't forget to upload this file to GitHub so it appears on your repository's front page!

```powershell
git add README.md
git commit -m "docs: Added comprehensive project documentation"
git push
````
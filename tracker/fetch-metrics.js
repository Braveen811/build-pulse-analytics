const fs = require('fs');
const path = require('path');

// Configuration
const dataFilePath = path.join(__dirname, '..', 'data', 'metrics.json');

async function fetchWorkflowMetrics() {
  console.log('🚀 Starting Build-Pulse Analytics Tracker...');

  // 1. Check if we are running in GitHub Actions or Local Dev
  const isGitHubAction = process.env.GITHUB_ACTIONS === 'true';
  let pipelineData = {};

  if (isGitHubAction) {
    console.log('Detected GitHub Actions environment. Fetching live API data...');
    // In production, we fetch real metrics using the injected GitHub token
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPOSITORY;
    const runId = process.env.GITHUB_RUN_ID;

    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/actions/runs/${runId}/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      const data = await response.json();
      
      // Extract the total duration of the CI/CD pipeline
      const mainJob = data.jobs[0]; 
      const startedAt = new Date(mainJob.started_at).getTime();
      const completedAt = new Date(mainJob.completed_at).getTime();
      
      pipelineData = {
        id: runId,
        date: new Date().toISOString(),
        duration_seconds: (completedAt - startedAt) / 1000,
        status: mainJob.conclusion,
        steps: mainJob.steps.map(step => ({
          name: step.name,
          duration_seconds: (new Date(step.completed_at).getTime() - new Date(step.started_at).getTime()) / 1000,
          status: step.conclusion
        }))
      };
    } catch (error) {
      console.error('❌ Error fetching from GitHub API:', error.message);
      process.exit(1);
    }
  } else {
    console.log('Detected Local Environment. Generating mock telemetry data...');
    // Local dev mode: Generate realistic fake data to build the UI
    pipelineData = {
      id: `local-run-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      duration_seconds: Math.floor(Math.random() * 120) + 30, // 30 to 150 seconds
      status: Math.random() > 0.1 ? 'success' : 'failure',
      steps: [
        { name: 'Set up job', duration_seconds: 4, status: 'success' },
        { name: 'Run actions/checkout', duration_seconds: 2, status: 'success' },
        { name: 'Gitleaks Security Scan', duration_seconds: 15, status: 'success' },
        { name: 'Docker Build & Trivy Scan', duration_seconds: Math.floor(Math.random() * 60) + 20, status: 'success' },
        { name: 'Push to GHCR', duration_seconds: 12, status: 'success' }
      ]
    };
  }

  // 2. Read existing database (metrics.json)
  let db = [];
  if (fs.existsSync(dataFilePath)) {
    const rawData = fs.readFileSync(dataFilePath);
    db = JSON.parse(rawData);
  }

  // 3. Append new run data and keep only the last 100 runs (prevent file bloat)
  db.push(pipelineData);
  if (db.length > 100) db.shift(); 

  // 4. Save back to the database file
  fs.writeFileSync(dataFilePath, JSON.stringify(db, null, 2));
  console.log(`✅ Successfully logged build metrics for run: ${pipelineData.id}`);
  console.log(`⏱️ Total Build Time: ${pipelineData.duration_seconds}s`);
}

fetchWorkflowMetrics();
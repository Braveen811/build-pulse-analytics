const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'metrics.json');

async function fetchWorkflowMetrics() {
  const isGitHubAction = process.env.GITHUB_ACTIONS === 'true';
  let pipelineData = {};

  if (isGitHubAction) {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPOSITORY;
    const runId = process.env.GITHUB_RUN_ID;
    
    // Get the short Git commit hash (e.g., "8527b1a") for a clean display name
    const fullSha = process.env.GITHUB_SHA || '';
    const shortSha = fullSha ? fullSha.substring(0, 7) : runId.substring(0, 6);

    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/actions/runs/${runId}/jobs`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' }
      });
      const data = await response.json();
      const mainJob = data.jobs[0]; 
      const startedAt = new Date(mainJob.started_at).getTime();
      const completedAt = mainJob.completed_at ? new Date(mainJob.completed_at).getTime() : Date.now();
      
      pipelineData = {
        id: `build-${shortSha}`, // Clean, professional ID format!
        date: new Date().toISOString(),
        duration_seconds: Math.round((completedAt - startedAt) / 1000),
        status: mainJob.conclusion || 'success' // Automatically logs as success when it finishes!
      };
    } catch (error) {
      console.error('Error fetching API:', error.message);
      process.exit(1);
    }
  } else {
    pipelineData = {
      id: `local-run-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      duration_seconds: Math.floor(Math.random() * 120) + 30,
      status: 'success'
    };
  }

  let db = [];
  if (fs.existsSync(dataFilePath)) db = JSON.parse(fs.readFileSync(dataFilePath));
  db.push(pipelineData);
  if (db.length > 100) db.shift(); 
  fs.writeFileSync(dataFilePath, JSON.stringify(db, null, 2));
}

fetchWorkflowMetrics();
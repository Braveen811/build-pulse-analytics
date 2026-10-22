const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'metrics.json');

async function fetchWorkflowMetrics() {
  console.log('🚀 Starting Build-Pulse Analytics Tracker...');
  const isGitHubAction = process.env.GITHUB_ACTIONS === 'true';
  let pipelineData = {};

  if (isGitHubAction) {
    console.log('Detected GitHub Actions environment. Fetching live API data...');
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
      
      // FIX: Ensure we have job data, and handle 'null' completion times for in-progress runs
      if (!data.jobs || data.jobs.length === 0) {
        throw new Error("No jobs returned from GitHub API.");
      }

      const mainJob = data.jobs[0]; 
      const startedAt = new Date(mainJob.started_at).getTime();
      // If the job is still running, use the current time to calculate duration
      const completedAt = mainJob.completed_at ? new Date(mainJob.completed_at).getTime() : Date.now();
      
      pipelineData = {
        id: `gh-run-${runId}`,
        date: new Date().toISOString(),
        duration_seconds: Math.round((completedAt - startedAt) / 1000),
        status: mainJob.conclusion || 'in-progress',
        steps: mainJob.steps.map(step => ({
          name: step.name,
          duration_seconds: step.completed_at 
            ? Math.round((new Date(step.completed_at).getTime() - new Date(step.started_at).getTime()) / 1000)
            : 0,
          status: step.conclusion || 'pending'
        }))
      };
    } catch (error) {
      console.error('❌ Error fetching from GitHub API:', error.message);
      process.exit(1);
    }
  } else {
    // Local Dev Mock Data
    pipelineData = {
      id: `local-run-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      duration_seconds: Math.floor(Math.random() * 120) + 30,
      status: Math.random() > 0.1 ? 'success' : 'failure'
    };
  }

  let db = [];
  if (fs.existsSync(dataFilePath)) {
    db = JSON.parse(fs.readFileSync(dataFilePath));
  }

  db.push(pipelineData);
  if (db.length > 100) db.shift(); 

  fs.writeFileSync(dataFilePath, JSON.stringify(db, null, 2));
  console.log(`✅ Successfully logged metrics for: ${pipelineData.id}`);
}

fetchWorkflowMetrics();
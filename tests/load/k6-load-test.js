/**
 * K6 Load Testing Script
 * 
 * Installation:
 * brew install k6  (macOS)
 * choco install k6 (Windows)
 * 
 * Usage:
 * k6 run tests/load/k6-load-test.js
 * 
 * With options:
 * k6 run --vus 10 --duration 30s tests/load/k6-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const apiDuration = new Trend('api_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
    errors: ['rate<0.1'],             // Custom error rate
  },
};

// Base URL from environment or default
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';
const API_URL = __ENV.API_URL || 'https://your-project.supabase.co';

// Test data
const testUser = {
  email: __ENV.TEST_EMAIL || 'test@example.com',
  password: __ENV.TEST_PASSWORD || 'TestPassword123!',
};

/**
 * Setup function - runs once per VU
 */
export function setup() {
  console.log('Starting load test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API URL: ${API_URL}`);
  
  return {
    baseUrl: BASE_URL,
    apiUrl: API_URL,
  };
}

/**
 * Main test function
 */
export default function (data) {
  // Test 1: Homepage load
  let response = http.get(`${data.baseUrl}/`);
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in <2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
  
  sleep(1);

  // Test 2: Login attempt
  const loginStart = Date.now();
  response = http.post(`${data.apiUrl}/auth/v1/token?grant_type=password`, {
    email: testUser.email,
    password: testUser.password,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'apikey': __ENV.SUPABASE_ANON_KEY || '',
    },
  });
  
  const loginTime = Date.now() - loginStart;
  loginDuration.add(loginTime);
  
  const loginSuccess = check(response, {
    'login status is 200': (r) => r.status === 200,
    'login returns token': (r) => r.json('access_token') !== undefined,
  });
  
  if (!loginSuccess) {
    errorRate.add(1);
    return; // Skip rest of test if login fails
  }

  const token = response.json('access_token');
  sleep(1);

  // Test 3: API requests with authentication
  const headers = {
    'Authorization': `Bearer ${token}`,
    'apikey': __ENV.SUPABASE_ANON_KEY || '',
  };

  // Get members
  const apiStart = Date.now();
  response = http.get(`${data.apiUrl}/rest/v1/members?limit=20`, { headers });
  apiDuration.add(Date.now() - apiStart);
  
  check(response, {
    'members API status is 200': (r) => r.status === 200,
    'members API returns data': (r) => r.json().length >= 0,
  }) || errorRate.add(1);
  
  sleep(1);

  // Get donations
  response = http.get(`${data.apiUrl}/rest/v1/donations?limit=20`, { headers });
  check(response, {
    'donations API status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(1);

  // Get beneficiaries
  response = http.get(`${data.apiUrl}/rest/v1/beneficiaries?limit=20`, { headers });
  check(response, {
    'beneficiaries API status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(2);
}

/**
 * Teardown function - runs once after all VUs finish
 */
export function teardown(data) {
  console.log('Load test completed');
}

/**
 * Handle summary - custom summary output
 */
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-test-results.json': JSON.stringify(data),
    'load-test-results.html': htmlReport(data),
  };
}

// Helper functions
function textSummary(data, options) {
  const { indent = '', enableColors = false } = options || {};
  let summary = '\n';
  
  summary += `${indent}✓ checks.........................: ${data.metrics.checks.values.passes}/${data.metrics.checks.values.passes + data.metrics.checks.values.fails}\n`;
  summary += `${indent}✓ http_req_duration.............: avg=${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}✓ http_req_failed...............: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
  summary += `${indent}✓ http_reqs.....................: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}✓ vus...........................: ${data.metrics.vus.values.value}\n`;
  
  return summary;
}

function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Load Test Results</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .pass { color: green; font-weight: bold; }
    .fail { color: red; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Load Test Results</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  
  <h2>Summary</h2>
  <table>
    <tr>
      <th>Metric</th>
      <th>Value</th>
    </tr>
    <tr>
      <td>Total Requests</td>
      <td>${data.metrics.http_reqs.values.count}</td>
    </tr>
    <tr>
      <td>Failed Requests</td>
      <td class="${data.metrics.http_req_failed.values.rate > 0.01 ? 'fail' : 'pass'}">
        ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
      </td>
    </tr>
    <tr>
      <td>Avg Response Time</td>
      <td>${data.metrics.http_req_duration.values.avg.toFixed(2)}ms</td>
    </tr>
    <tr>
      <td>P95 Response Time</td>
      <td class="${data.metrics.http_req_duration.values['p(95)'] > 500 ? 'fail' : 'pass'}">
        ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
      </td>
    </tr>
    <tr>
      <td>Max VUs</td>
      <td>${data.metrics.vus.values.max}</td>
    </tr>
  </table>
</body>
</html>
  `;
}

#!/usr/bin/env node

/**
 * SEO Audit Script for Gravitas
 * Checks basic SEO requirements
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gravitas.page';

console.log('🔍 Running SEO Audit for Gravitas\n');
console.log(`Base URL: ${BASE_URL}\n`);

const checks = [];

// Helper function to fetch URL
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', reject);
  });
}

// Check 1: Sitemap exists
async function checkSitemap() {
  try {
    const { status, data } = await fetchUrl(`${BASE_URL}/sitemap.xml`);
    if (status === 200 && data.includes('<?xml')) {
      checks.push({ name: 'Sitemap', status: '✅', message: 'Sitemap exists and is valid XML' });
    } else {
      checks.push({ name: 'Sitemap', status: '❌', message: `Invalid sitemap (status: ${status})` });
    }
  } catch (error) {
    checks.push({ name: 'Sitemap', status: '❌', message: `Error: ${error.message}` });
  }
}

// Check 2: Robots.txt exists
async function checkRobots() {
  try {
    const { status, data } = await fetchUrl(`${BASE_URL}/robots.txt`);
    if (status === 200 && data.includes('User-agent')) {
      checks.push({ name: 'Robots.txt', status: '✅', message: 'Robots.txt exists and is valid' });
    } else {
      checks.push({ name: 'Robots.txt', status: '❌', message: `Invalid robots.txt (status: ${status})` });
    }
  } catch (error) {
    checks.push({ name: 'Robots.txt', status: '❌', message: `Error: ${error.message}` });
  }
}

// Check 3: Homepage has proper meta tags
async function checkHomepage() {
  try {
    const { status, data } = await fetchUrl(BASE_URL);
    if (status === 200) {
      const hasTitle = data.includes('<title>');
      const hasDescription = data.includes('name="description"');
      const hasOG = data.includes('property="og:');
      const hasStructuredData = data.includes('application/ld+json');
      
      if (hasTitle && hasDescription && hasOG && hasStructuredData) {
        checks.push({ name: 'Homepage Meta', status: '✅', message: 'All meta tags present' });
      } else {
        const missing = [];
        if (!hasTitle) missing.push('title');
        if (!hasDescription) missing.push('description');
        if (!hasOG) missing.push('Open Graph');
        if (!hasStructuredData) missing.push('structured data');
        checks.push({ name: 'Homepage Meta', status: '⚠️', message: `Missing: ${missing.join(', ')}` });
      }
    } else {
      checks.push({ name: 'Homepage Meta', status: '❌', message: `Homepage returned status ${status}` });
    }
  } catch (error) {
    checks.push({ name: 'Homepage Meta', status: '❌', message: `Error: ${error.message}` });
  }
}

// Check 4: HTTPS redirect
async function checkHTTPS() {
  if (BASE_URL.startsWith('https')) {
    checks.push({ name: 'HTTPS', status: '✅', message: 'Site uses HTTPS' });
  } else {
    checks.push({ name: 'HTTPS', status: '❌', message: 'Site should use HTTPS' });
  }
}

// Check 5: Manifest exists
async function checkManifest() {
  try {
    const { status, data } = await fetchUrl(`${BASE_URL}/manifest.json`);
    if (status === 200 && data.includes('"name"')) {
      checks.push({ name: 'Manifest', status: '✅', message: 'PWA manifest exists' });
    } else {
      checks.push({ name: 'Manifest', status: '❌', message: `Invalid manifest (status: ${status})` });
    }
  } catch (error) {
    checks.push({ name: 'Manifest', status: '❌', message: `Error: ${error.message}` });
  }
}

// Run all checks
async function runAudit() {
  await Promise.all([
    checkSitemap(),
    checkRobots(),
    checkHomepage(),
    checkHTTPS(),
    checkManifest(),
  ]);

  // Print results
  console.log('📊 Audit Results:\n');
  console.log('─'.repeat(70));
  checks.forEach(check => {
    console.log(`${check.status} ${check.name.padEnd(20)} ${check.message}`);
  });
  console.log('─'.repeat(70));

  const passed = checks.filter(c => c.status === '✅').length;
  const total = checks.length;
  const score = Math.round((passed / total) * 100);

  console.log(`\n📈 SEO Score: ${score}% (${passed}/${total} checks passed)\n`);

  if (score === 100) {
    console.log('🎉 Perfect score! Your SEO setup is excellent.\n');
  } else if (score >= 80) {
    console.log('👍 Good job! A few minor improvements needed.\n');
  } else if (score >= 60) {
    console.log('⚠️  Some important issues need attention.\n');
  } else {
    console.log('❌ Critical SEO issues detected. Please fix them ASAP.\n');
  }

  // Recommendations
  console.log('💡 Recommendations:\n');
  console.log('1. Submit sitemap to Google Search Console');
  console.log('2. Add Google site verification meta tag');
  console.log('3. Monitor search performance regularly');
  console.log('4. Create quality content with target keywords');
  console.log('5. Build quality backlinks');
  console.log('6. Optimize page speed');
  console.log('7. Ensure mobile-friendliness');
  console.log('8. Add structured data to all pages\n');
}

// Run the audit
runAudit().catch(console.error);

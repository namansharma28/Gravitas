const fs = require('fs');
const path = require('path');

// Files to update
const files = [
  'app/admin/communities/page.tsx',
  'app/api/upload/route.ts',
  'app/api/explore/communities/route.ts',
  'app/api/events/[id]/updates/route.ts',
  'app/api/events/[id]/forms/route.ts',
  'app/api/communities/[handle]/permissions/route.ts',
  'app/api/communities/route.ts',
  'app/settings/page.tsx',
];

// Replacement patterns
const replacements = [
  // Admin auth logs
  { from: /console\.log\('Checking admin auth with token:', adminToken\); \/\/ Debug log/g, to: "log.auth('Checking admin authentication');" },
  { from: /console\.log\('Auth check response status:', response\.status\); \/\/ Debug log/g, to: "log.auth('Auth check response', { status: response.status });" },
  { from: /console\.log\('Auth check response data:', data\); \/\/ Debug log/g, to: "log.auth('Auth check complete', { isAdmin: data.isAdmin });" },
  { from: /console\.log\('Auth check failed, removing token and redirecting'\); \/\/ Debug log/g, to: "log.auth('Auth check failed, redirecting');" },
  { from: /console\.log\('Admin auth successful, fetching communities'\); \/\/ Debug log/g, to: "log.auth('Admin auth successful');" },
  { from: /console\.log\('No admin token found during fetch, redirecting to login'\); \/\/ Debug log/g, to: "log.auth('No admin token found');" },
  { from: /console\.log\('Fetching communities with token:', adminToken\); \/\/ Debug log/g, to: "log.debug('Fetching communities');" },
  { from: /console\.log\('Communities response status:', allCommunitiesResponse\.status\); \/\/ Debug log/g, to: "" },
  { from: /console\.log\('Pending communities response status:', pendingCommunitiesResponse\.status\); \/\/ Debug log/g, to: "" },
  { from: /console\.log\('Unauthorized response, removing token and redirecting'\); \/\/ Debug log/g, to: "log.auth('Unauthorized, redirecting');" },
  { from: /console\.log\('Fetched communities data:', allCommunitiesData\); \/\/ Debug log/g, to: "log.debug('Communities fetched', { count: allCommunitiesData.length });" },
  { from: /console\.log\('Fetched pending communities data:', pendingCommunitiesData\); \/\/ Debug log/g, to: "log.debug('Pending communities fetched', { count: pendingCommunitiesData.length });" },
  { from: /console\.log\('Admin token from localStorage:', adminToken\); \/\/ Debug log/g, to: "log.debug('Admin token retrieved');" },
  { from: /console\.log\('Admin verification failed:', verifyResponse\.status\); \/\/ Debug log/g, to: "log.auth('Admin verification failed', { status: verifyResponse.status });" },
  { from: /console\.log\('Admin verification response:', verifyData\); \/\/ Debug log/g, to: "log.auth('Admin verification complete', { isAdmin: verifyData.isAdmin });" },
  { from: /console\.log\('Not authorized as admin'\); \/\/ Debug log/g, to: "log.auth('Not authorized as admin');" },
  { from: /console\.log\('Sending approve request with token:', adminToken\); \/\/ Debug log/g, to: "log.debug('Sending approve request');" },
  { from: /console\.log\('Approve response status:', response\.status\); \/\/ Debug log/g, to: "log.api('POST', 'approve-community', response.status);" },
  { from: /console\.log\('Approve response data:', responseData\); \/\/ Debug log/g, to: "log.debug('Approve response', { success: responseData.success });" },
  { from: /console\.log\('Sending reject request with token:', adminToken\); \/\/ Debug log/g, to: "log.debug('Sending reject request');" },
  
  // API logs
  { from: /console\.log\('Session in API route:', session\); \/\/ Debug log/g, to: "log.debug('Session check', { hasSession: !!session });" },
  { from: /console\.log\('No user ID in session:', session\); \/\/ Debug log/g, to: "log.warn('No user ID in session');" },
  { from: /console\.log\("\[UPDATES_GET\] Visibility filter:", visibilityFilter\);/g, to: "log.debug('Updates visibility filter', { filter: visibilityFilter });" },
  { from: /console\.log\("\[UPDATES_GET\] Found updates:", updates\.length\);/g, to: "log.debug('Updates found', { count: updates.length });" },
  { from: /console\.log\("\[UPDATES_GET\] Transformed updates:", transformedUpdates\.length\);/g, to: "log.debug('Updates transformed', { count: transformedUpdates.length });" },
  { from: /console\.log\("\[FORMS_GET\] Found forms:", forms\.length\);/g, to: "log.debug('Forms found', { count: forms.length });" },
  { from: /console\.log\(`\[PERMISSIONS\] Looking for community with handle: \$\{params\.handle\}`\);/g, to: "log.debug('Looking for community', { handle: params.handle });" },
  { from: /console\.log\(`\[PERMISSIONS\] Community not found for handle: \$\{params\.handle\}`\);/g, to: "log.warn('Community not found', { handle: params.handle });" },
  { from: /console\.log\(`\[PERMISSIONS\] Found community: \$\{community\.name\} \(\$\{community\._id\}\)`\);/g, to: "log.debug('Community found', { name: community.name, id: community._id });" },
  
  // Settings page
  { from: /console\.log\('SW registered: ', registration\);/g, to: "log.info('Service worker registered');" },
  { from: /console\.log\('SW registration failed: ', registrationError\);/g, to: "log.error('Service worker registration failed', registrationError);" },
  { from: /console\.log\('User accepted the install prompt'\);/g, to: "log.info('User accepted PWA install prompt');" },
  { from: /console\.log\('User dismissed the install prompt'\);/g, to: "log.info('User dismissed PWA install prompt');" },
];

console.log('Starting console.log replacement...\n');

files.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let changesMade = 0;
    
    replacements.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        content = content.replace(from, to);
        changesMade += matches.length;
      }
    });
    
    if (changesMade > 0) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${filePath}: ${changesMade} replacements`);
    } else {
      console.log(`ℹ️  ${filePath}: No changes needed`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n✨ Console.log replacement complete!');

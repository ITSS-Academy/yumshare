#!/usr/bin/env node

/**
 * Script to apply Rate Limiting to all controllers
 * Run this script to automatically add rate limiting to all controllers
 */

const fs = require('fs');
const path = require('path');

// Controllers that need rate limiting
const controllers = [
  'notifications/notifications.controller.ts',
  'bookmarks/bookmarks.controller.ts',
  'history/history.controller.ts',
  'ratings/ratings.controller.ts',
  'recipe-steps/recipe-steps.controller.ts',
  'likes/likes.controller.ts',
  'follows/follows.controller.ts',
  'favorites/favorites.controller.ts',
  'chats/chats.controller.ts'
];

// Rate limiting configurations for different types of endpoints
const rateLimitConfigs = {
  // Write operations - Strict rate limiting
  write: {
    decorator: '@RateLimit(RateLimits.STRICT)',
    description: '5 requests per 15 minutes'
  },
  // Read operations - Standard rate limiting
  read: {
    decorator: '@RateLimit(RateLimits.STANDARD)',
    description: '100 requests per 15 minutes'
  },
  // Search operations - Standard rate limiting
  search: {
    decorator: '@RateLimit(RateLimits.STANDARD)',
    description: '100 requests per 15 minutes'
  },
  // File upload operations - Strict rate limiting
  upload: {
    decorator: '@RateLimit(RateLimits.STRICT)',
    description: '5 requests per 15 minutes'
  }
};

// HTTP methods and their rate limiting types
const methodRateLimitMap = {
  'POST': 'write',
  'PUT': 'write',
  'PATCH': 'write',
  'DELETE': 'write',
  'GET': 'read'
};

// Keywords that indicate specific operation types
const operationKeywords = {
  'search': 'search',
  'upload': 'upload',
  'image': 'upload',
  'video': 'upload',
  'file': 'upload'
};

function determineRateLimitType(method, path, methodName) {
  // Check for specific operation types
  for (const [keyword, type] of Object.entries(operationKeywords)) {
    if (path.toLowerCase().includes(keyword) || methodName.toLowerCase().includes(keyword)) {
      return type;
    }
  }
  
  // Default based on HTTP method
  return methodRateLimitMap[method] || 'read';
}

function addRateLimitingToController(controllerPath) {
  try {
    const fullPath = path.join(__dirname, 'src', controllerPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Controller not found: ${controllerPath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Check if already has rate limiting
    if (content.includes('RateLimitGuard') || content.includes('@RateLimit')) {
      console.log(`✅ Already has rate limiting: ${controllerPath}`);
      return;
    }

    // Add imports
    if (!content.includes('RateLimit')) {
      const importLine = "import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';";
      const guardImportLine = "import { RateLimitGuard } from '../common/guards/rate-limit.guard';";
      
      // Find the last import line
      const importMatch = content.match(/import.*from.*['"];?\s*$/m);
      if (importMatch) {
        const insertIndex = content.lastIndexOf(importMatch[0]) + importMatch[0].length;
        content = content.slice(0, insertIndex) + '\n' + importLine + '\n' + guardImportLine + content.slice(insertIndex);
      }
      modified = true;
    }

    // Add UseGuards decorator to controller class
    if (!content.includes('@UseGuards(RateLimitGuard)')) {
      const controllerMatch = content.match(/@Controller\([^)]+\)\s*\n(export\s+)?class\s+(\w+)/);
      if (controllerMatch) {
        const insertIndex = content.indexOf(controllerMatch[0]) + controllerMatch[0].length;
        content = content.slice(0, insertIndex) + '\n@UseGuards(RateLimitGuard)' + content.slice(insertIndex);
        modified = true;
      }
    }

    // Add UseGuards import if not present
    if (!content.includes('UseGuards')) {
      const controllerImportMatch = content.match(/import\s*{[^}]*Controller[^}]*}\s*from\s*['"]@nestjs\/common['"];?/);
      if (controllerImportMatch) {
        const newImport = controllerImportMatch[0].replace('}', ', UseGuards }');
        content = content.replace(controllerImportMatch[0], newImport);
        modified = true;
      }
    }

    // Add rate limiting decorators to methods
    const methodRegex = /@(Get|Post|Put|Patch|Delete)\([^)]*\)\s*\n\s*(\w+)\s*\([^)]*\)/g;
    let methodMatch;
    
    while ((methodMatch = methodRegex.exec(content)) !== null) {
      const method = methodMatch[1];
      const methodName = methodMatch[2];
      const fullMatch = methodMatch[0];
      
      // Skip if already has rate limiting
      if (content.includes(`@RateLimit`)) {
        continue;
      }

      // Determine rate limit type
      const rateLimitType = determineRateLimitType(method, fullMatch, methodName);
      const config = rateLimitConfigs[rateLimitType];
      
      // Add rate limiting decorator
      const decoratorLine = `  ${config.decorator}`;
      const insertIndex = content.indexOf(fullMatch) + fullMatch.length;
      
      // Check if method already has rate limiting
      const methodStartIndex = content.indexOf(fullMatch, insertIndex);
      if (methodStartIndex !== -1 && !content.slice(methodStartIndex, methodStartIndex + 200).includes('@RateLimit')) {
        content = content.slice(0, insertIndex) + '\n' + decoratorLine + content.slice(insertIndex);
        modified = true;
        
        console.log(`  ✅ Added ${rateLimitType} rate limiting to ${method} ${methodName} (${config.description})`);
      }
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated: ${controllerPath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${controllerPath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${controllerPath}:`, error.message);
  }
}

function main() {
  console.log('🚀 Applying Rate Limiting to all controllers...\n');

  // Process each controller
  controllers.forEach(controller => {
    console.log(`📝 Processing: ${controller}`);
    addRateLimitingToController(controller);
    console.log('');
  });

  console.log('✨ Rate limiting application completed!');
  console.log('\n📋 Summary of rate limiting types:');
  console.log('  🔒 STRICT: 5 requests per 15 minutes (write operations)');
  console.log('  📖 STANDARD: 100 requests per 15 minutes (read operations)');
  console.log('  🔍 SEARCH: 100 requests per 15 minutes (search operations)');
  console.log('  📤 UPLOAD: 5 requests per 15 minutes (file uploads)');
  
  console.log('\n🎯 Next steps:');
  console.log('  1. Review the changes in each controller');
  console.log('  2. Test the rate limiting functionality');
  console.log('  3. Adjust limits if needed for specific endpoints');
  console.log('  4. Monitor rate limit violations in production');
}

if (require.main === module) {
  main();
}

module.exports = { addRateLimitingToController };

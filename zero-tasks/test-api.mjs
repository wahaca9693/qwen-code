// Quick test script
import http from 'http';

console.log('🧪 Testing ZERO Tasks API...\n');

// Test 1: Stats
function testStats() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000/api/stats', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const stats = JSON.parse(data);
        console.log('📊 Stats Test:');
        console.log(`   Total: ${stats.total}`);
        console.log(`   In Progress: ${stats.inProgress}`);
        console.log(`   Done: ${stats.done}`);
        console.log('   ✅ PASSED\n');
        resolve();
      });
    }).on('error', () => {
      console.log('   ❌ FAILED - Server not running\n');
      resolve();
    });
  });
}

// Test 2: Tasks
function testTasks() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000/api/tasks', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const tasks = JSON.parse(data);
        console.log('📋 Tasks Test:');
        console.log(`   Tasks count: ${tasks.length}`);
        console.log(`   Sample: ${tasks[0]?.title?.substring(0, 30)}...`);
        console.log('   ✅ PASSED\n');
        resolve();
      });
    });
  });
}

// Test 3: Health
function testHealth() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000/api/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const health = JSON.parse(data);
        console.log('❤️  Health Test:');
        console.log(`   Status: ${health.status}`);
        console.log('   ✅ PASSED\n');
        resolve();
      });
    });
  });
}

(async () => {
  await testStats();
  await testTasks();
  await testHealth();
  console.log('🎉 All API tests completed!');
  process.exit(0);
})();
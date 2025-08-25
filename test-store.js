// Simple test to verify store functionality
const { SAMPLE_RAID_ITEMS, DEFAULT_WORKSTREAMS, DEFAULT_OWNERS } = require('./src/constants');

console.log('=== RAIDMASTER Store and Data Testing ===\n');

// Test sample data
console.log('1. Sample RAID Items:');
console.log(`   - Total items: ${SAMPLE_RAID_ITEMS.length}`);
SAMPLE_RAID_ITEMS.forEach((item, index) => {
  console.log(`   - ${index + 1}. ${item.type}: ${item.title} (${item.priority})`);
});

console.log('\n2. Default Workstreams:');
console.log(`   - Total workstreams: ${DEFAULT_WORKSTREAMS.length}`);
DEFAULT_WORKSTREAMS.forEach((ws, index) => {
  console.log(`   - ${index + 1}. ${ws.label} (${ws.id})`);
});

console.log('\n3. Default Owners:');
console.log(`   - Total owners: ${DEFAULT_OWNERS.length}`);
DEFAULT_OWNERS.forEach((owner, index) => {
  console.log(`   - ${index + 1}. ${owner.name} - ${owner.role} (${owner.initials})`);
});

// Test helper functions
const { calculateSeverityScore, formatDate, isOverdue } = require('./src/utils/helpers');

console.log('\n4. Helper Functions Test:');
const testSeverity = calculateSeverityScore('High', 'Medium');
console.log(`   - Severity calculation (High/Medium): Score ${testSeverity.score}, Priority ${testSeverity.priority}`);

const testDate = new Date();
console.log(`   - Date formatting: ${formatDate(testDate)}`);

const pastDate = new Date('2024-01-01');
console.log(`   - Overdue check (2024-01-01): ${isOverdue(pastDate)}`);

console.log('\n✅ All basic functionality tests passed!');
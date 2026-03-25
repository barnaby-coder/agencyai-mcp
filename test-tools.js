#!/usr/bin/env node

/**
 * Simple test script for Agency AI MCP tools
 * Connects to Railway deployment and tests all 3 tools
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const MCP_URL = 'https://agencyai-mcp.up.railway.app/sse';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testMCPServer() {
  console.log('🔗 Connecting to MCP server:', MCP_URL);

  const transport = new SSEClientTransport(new URL(MCP_URL));
  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to MCP server\n');

    // Wait a moment for connection to stabilize
    await sleep(500);

    // List tools
    console.log('📋 Listing available tools...\n');
    const toolsResponse = await client.listTools();

    console.log(`Found ${toolsResponse.tools.length} tools:\n`);
    toolsResponse.tools.forEach(tool => {
      console.log(`  • ${tool.name}`);
      console.log(`    Description: ${tool.description}`);
      console.log('');
    });

    await sleep(500);

    // Test 1: get_service_offerings
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 1: get_service_offerings');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const serviceResult = await client.callTool({
      name: 'get_service_offerings',
      arguments: {
        industry: 'healthcare',
        company_size: 50,
        pain_points: ['manual_data_entry', 'email_overload']
      }
    });

    console.log('📊 Result:');
    console.log(JSON.stringify(JSON.parse(serviceResult.content[0].text), null, 2));

    await sleep(500);
    console.log('\n');

    // Test 2: assess_ai_readiness
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 2: assess_ai_readiness');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const readinessResult = await client.callTool({
      name: 'assess_ai_readiness',
      arguments: {
        industry: 'healthcare',
        employee_count: 50,
        current_tools: ['salesforce', 'gmail', 'slack'],
        pain_points: ['no_decision_tracking', 'manual_data_entry']
      }
    });

    console.log('📊 Result:');
    console.log(JSON.stringify(JSON.parse(readinessResult.content[0].text), null, 2));

    await sleep(500);
    console.log('\n');

    // Test 3: book_consultation
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 3: book_consultation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const bookingResult = await client.callTool({
      name: 'book_consultation',
      arguments: {
        service_package: 'automated_workflows',
        contact_name: 'Dr. Sarah Johnson',
        contact_email: 'sarah@healthtech.com',
        company_name: 'Health Tech Solutions',
        preferred_times: ['2026-03-26 10am']
      }
    });

    console.log('📊 Result:');
    console.log(JSON.stringify(JSON.parse(bookingResult.content[0].text), null, 2));

    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All tests completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.close();
  }
}

testMCPServer().catch(console.error);

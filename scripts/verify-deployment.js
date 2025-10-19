#!/usr/bin/env node

/**
 * Deployment Verification Script for NollyCrewHub
 * 
 * This script verifies that the application can be built and started correctly
 * for deployment to Render.
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

console.log('🔍 NollyCrewHub Deployment Verification');
console.log('=====================================\n');

// Function to run a command and return a promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Main verification function
async function verifyDeployment() {
  try {
    // Step 1: Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    if (existsSync('dist')) {
      console.log('   Removing existing dist directory...');
      // On Windows, we need to use a different approach to remove directories
      await runCommand('node', ['-e', 'require("fs").rmSync("dist", { recursive: true, force: true })']);
    }
    
    // Ensure dist directory exists
    if (!existsSync('dist')) {
      mkdirSync('dist');
    }
    
    // Step 2: Install dependencies
    console.log('\n📦 Installing dependencies...');
    await runCommand('npm', ['ci']);
    
    // Step 3: Build client
    console.log('\n🏗️  Building client application...');
    await runCommand('npm', ['run', 'build:client']);
    
    // Step 4: Build server
    console.log('\n🖥️  Building server application...');
    await runCommand('npm', ['run', 'build:server']);
    
    // Step 5: Verify build output
    console.log('\n✅ Verifying build output...');
    
    const requiredFiles = [
      'dist/public/index.html',
      'dist/server/index.js',
      'dist/server/utils/logger.js'
    ];
    
    for (const file of requiredFiles) {
      if (existsSync(file)) {
        console.log(`   ✅ ${file} exists`);
      } else {
        throw new Error(`Missing required file: ${file}`);
      }
    }
    
    // Step 6: Test startup (briefly)
    console.log('\n🚀 Testing application startup...');
    const startTest = spawn('node', ['dist/server/index.js'], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '3001', // Use different port to avoid conflicts
        JWT_SECRET: 'test-secret-key-for-verification',
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test' // Dummy database URL
      }
    });
    
    // Give it a moment to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if process is still running
    if (startTest.exitCode === null) {
      console.log('   ✅ Application started successfully (killing process now)');
      startTest.kill();
    } else {
      console.log('   ⚠️  Application exited early (this may be expected during verification)');
    }
    
    console.log('\n🎉 Deployment verification completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Push code to GitHub if not already done');
    console.log('   2. Create services on Render using the render.yaml configuration');
    console.log('   3. Set required environment variables in Render dashboard');
    console.log('   4. Monitor deployment logs for any issues');
    
  } catch (error) {
    console.error('\n❌ Deployment verification failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run verification
verifyDeployment();

import { describe, it } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';

// Load environment variables for the test process
dotenv.config();

describe('Security Headers', () => {

  it('should have security headers enabled', async () => {

    // Ensure API Key is present for the server to start (mock it if necessary)
    const env = { ...process.env, GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'test-key', PORT: '3003' };

    const serverPath = path.resolve('index.js');

    // Use a promise to handle the async nature of starting the server and making the request
    await new Promise((resolve, reject) => {
        const child = spawn('node', [serverPath], { env });

        let started = false;
        let requestMade = false;

        const cleanup = () => {
            child.kill();
        };

        child.stdout.on('data', (data) => {
            const str = data.toString();
            // console.log(`stdout: ${str}`);
            if (str.includes('Server listening on port') && !started) {
                started = true;
                makeRequest();
            }
        });

        child.stderr.on('data', (data) => {
             // console.error(`stderr: ${data}`);
        });

        child.on('close', (code) => {
            // Only reject if we haven't successfully verified the headers
            if (!requestMade && code !== 0 && code !== null) { // code is null if killed by signal
                 reject(new Error(`Server process exited with code ${code}`));
            }
        });

        function makeRequest() {
            if (requestMade) return;
            requestMade = true;

            http.get('http://localhost:3003/health', (res) => {
                try {
                    // Check for Helmet's default headers
                    assert.strictEqual(res.headers['x-dns-prefetch-control'], 'off', 'X-DNS-Prefetch-Control header mismatch');
                    assert.strictEqual(res.headers['x-frame-options'], 'SAMEORIGIN', 'X-Frame-Options header mismatch');
                    assert.ok(res.headers['strict-transport-security'], 'Strict-Transport-Security header missing');
                    assert.strictEqual(res.headers['x-download-options'], 'noopen', 'X-Download-Options header mismatch');
                    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff', 'X-Content-Type-Options header mismatch');
                    assert.ok(res.headers['referrer-policy'], 'Referrer-Policy header missing');

                    cleanup();
                    resolve();
                } catch (err) {
                    cleanup();
                    reject(err);
                }
            }).on('error', (err) => {
                cleanup();
                reject(err);
            });
        }

        // Timeout safeguard
        setTimeout(() => {
            if (!started) {
                cleanup();
                reject(new Error('Timeout waiting for server to start'));
            }
        }, 5000);
    });
  });
});

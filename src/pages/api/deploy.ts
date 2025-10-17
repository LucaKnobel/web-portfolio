import type { APIRoute } from 'astro';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';

// Rate limiting (simple in-memory)
const deployments = new Map<string, number>();
const COOLDOWN_MS = 60 * 1000; // 60 seconds

export const POST: APIRoute = async ({ request }) => {
  try {
    // Security: Only HTTPS in production
    if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https://')) {
      return new Response('HTTPS required', { status: 400 });
    }

    // Verify deploy secret
    const deploySecret = request.headers.get('x-deploy-secret');
    if (!deploySecret || deploySecret !== process.env.DEPLOY_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const lastDeploy = deployments.get(clientIP) || 0;
    const now = Date.now();
    
    if (now - lastDeploy < COOLDOWN_MS) {
      return new Response('Rate limited', { status: 429 });
    }
    
    deployments.set(clientIP, now);

    // Parse request body (optional webhook data)
    let webhookData = {};
    try {
      webhookData = await request.json();
    } catch {
      // Empty body is fine
    }

    const timestamp = new Date().toISOString();
    
    // Log deployment trigger (no secrets logged)
    const logEntry = {
      timestamp,
      source: clientIP,
      trigger: 'webhook',
      ref: (webhookData as any)?.ref || 'unknown',
      sha: (webhookData as any)?.sha?.substring(0, 7) || 'unknown'
    };

    // Log deployment trigger
    try {
      await writeFile(
        '/home/client/sites/lucaknobel.ch/app/logs/webhook.log',
        JSON.stringify(logEntry) + '\n',
        { flag: 'a' }
      );
    } catch (error) {
      console.error('Failed to write webhook log:', error);
    }

    // Check if deploy script exists
    const deployScript = '/home/client/sites/lucaknobel.ch/app/current/web-portfolio/scripts/deploy.sh';
    if (!existsSync(deployScript)) {
      return new Response('Deploy script not found', { status: 500 });
    }

    // Execute deploy script directly (no wrapper)
    const deploy = spawn('bash', [deployScript], {
      cwd: '/home/client/sites/lucaknobel.ch/app',
      stdio: 'ignore', // Don't capture output (goes to log file)
      detached: true,
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
    });

    // Detach the process so it continues after response
    deploy.unref();

    // Return immediately (202 Accepted)
    return new Response(JSON.stringify({
      status: 'accepted',
      message: 'Deployment triggered',
      timestamp,
      release: `deploy-${new Date().toISOString().replace(/[:.]/g, '-')}`
    }), {
      status: 202,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Deploy endpoint error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// Health check endpoint
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'astro-portfolio-deploy'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
};
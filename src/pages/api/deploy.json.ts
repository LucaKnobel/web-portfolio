import type { APIRoute } from "astro";
import { spawn } from "node:child_process";



interface DeployResponse {
  success: boolean;
  message: string;
  deployId?: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    /* Validate deploy secret in custom header */
    const deploySecret = request.headers.get("X-Deploy-Secret");
    if (!deploySecret || typeof deploySecret !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing or invalid X-Deploy-Secret header"
        } as DeployResponse),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    /* Verify secret against environment variable */
    const expectedSecret = process.env.DEPLOY_SECRET;
    if (!expectedSecret || deploySecret !== expectedSecret) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized"
        } as DeployResponse),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    /* Fire-and-forget: Detached spawn for background execution */
    const timestamp = new Date().toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, '')
      .replace('T', '-');
    const deployId = `deploy-${timestamp}`;
    const scriptPath = process.env.SCRIPT_PATH;
    if (!scriptPath) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Script path configuration missing"
        } as DeployResponse),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    /* Spawn detached process - runs independently from API response */
    const child = spawn("bash", [scriptPath], {
      detached: true,       /* Process runs independently */
      stdio: "ignore",     /* No pipe to parent process */
      cwd: process.env.APP_ROOT || process.cwd(),
      env: {
        ...process.env,        
        DEPLOY_ID: deployId,
        DEPLOY_TRIGGER: "api-endpoint",
        DEPLOY_TIMESTAMP: timestamp
      }
    });

    /* Detach process from parent (fire-and-forget) */
    child.unref();

    /* Immediate response - script runs in background */
    return new Response(
      JSON.stringify({
        success: true,
        message: "Deployment initiated successfully",
        deployId
      } as DeployResponse),
      {
        status: 202,  /* Accepted - Processing in background */
        headers: {
          "Content-Type": "application/json",
          "X-Content-Type-Options": "nosniff"
        }
      }
    );

  } catch (err) {
    console.error("Deploy API error:", err instanceof Error ? err.message : 'Unknown error');

    return new Response(
      JSON.stringify({
        success: false,
        message: "Deployment initiation failed"
      } as DeployResponse),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
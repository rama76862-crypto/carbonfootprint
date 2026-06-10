import http from 'node:http';
import { URL } from 'node:url';
import { createAssistantPlan } from './assistant.js';
import { calculateActivity, summarizeEmissions } from './calculations.js';
import { patchEmission, readState, updateProfile, upsertEmission } from './store.js';

const port = Number(process.env.PORT || 5174);

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(payload);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('invalid JSON body');
    error.statusCode = 400;
    throw error;
  }
}

export async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, service: 'carbon-footprint-api' });
    }

    if (req.method === 'GET' && url.pathname === '/api/profile') {
      const state = await readState();
      return sendJson(res, 200, state.profile);
    }

    if (req.method === 'PUT' && url.pathname === '/api/profile') {
      const state = await updateProfile(await readJson(req));
      return sendJson(res, 200, state.profile);
    }

    if (req.method === 'GET' && url.pathname === '/api/emissions') {
      const state = await readState();
      return sendJson(res, 200, {
        emissions: state.emissions,
        summary: summarizeEmissions(state.emissions)
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/emissions') {
      const state = await upsertEmission(await readJson(req));
      return sendJson(res, 201, {
        emissions: state.emissions,
        summary: summarizeEmissions(state.emissions)
      });
    }

    const patchMatch = url.pathname.match(/^\/api\/emissions\/([^/]+)$/);
    if (req.method === 'PATCH' && patchMatch) {
      const month = decodeURIComponent(patchMatch[1]);
      const state = await patchEmission(month, await readJson(req));
      return sendJson(res, 200, {
        emissions: state.emissions,
        summary: summarizeEmissions(state.emissions)
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/calculate') {
      return sendJson(res, 200, calculateActivity(await readJson(req)));
    }

    if (req.method === 'POST' && url.pathname === '/api/assistant') {
      const state = await readState();
      const body = await readJson(req);
      return sendJson(res, 200, createAssistantPlan({ ...state, goal: body.goal }));
    }

    return sendJson(res, 404, { error: 'route not found' });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, {
      error: error.message || 'internal server error'
    });
  }
}

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  http.createServer(handleRequest).listen(port, () => {
    console.log(`Carbon footprint API running on http://localhost:${port}`);
  });
}

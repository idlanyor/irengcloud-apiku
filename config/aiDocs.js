/**
 * AI-Optimized Documentation Generator
 *
 * Derives LLM-friendly docs from the single OpenAPI spec (config/swaggerSpec.js).
 * Serves 3 formats:
 *   - llms.txt   : standardized markdown index (https://llmstxt.org)
 *   - llms.json  : machine-readable manifest
 *   - ai/docs    : dense full markdown reference for LLM context windows
 *
 * Single source of truth = generateOpenApiSpec(). No manual duplication.
 */
import { generateOpenApiSpec } from './swaggerSpec.js';
import { APP_VERSION } from './version.js';

const BASE_URL = 'https://apiku.irengcloud.com';

/** Flatten spec.paths into a flat list of operations. */
function flatOps(spec) {
  const ops = [];
  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, op] of Object.entries(methods)) {
      ops.push({ path, method: method.toUpperCase(), op });
    }
  }
  return ops;
}

/** /api/v1/hadits/{imam}/{number} -> hadits_imam_number */
function toolName(path) {
  return path
    .replace(/^\/api\/v\d+\//, '')
    .replace(/[{}]/g, '')
    .replace(/[/-]/g, '_');
}

/** Build a ready-to-call example URL from path + default param values. */
function buildExample(path, params = []) {
  let url = path;
  const query = [];
  for (const p of params) {
    if (p.in === 'path') {
      const def = p.schema?.default ?? `<${p.name}>`;
      url = url.replace(`{${p.name}}`, def);
    } else if (p.in === 'query' && p.schema?.default !== undefined) {
      query.push(`${p.name}=${encodeURIComponent(p.schema.default)}`);
    }
  }
  return query.length ? `${url}?${query.join('&')}` : url;
}

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

/** Group operations by their first tag. */
function groupByTag(spec) {
  const groups = new Map();
  for (const entry of flatOps(spec)) {
    const tag = entry.op.tags?.[0] || 'Lainnya';
    if (!groups.has(tag)) groups.set(tag, []);
    groups.get(tag).push(entry);
  }
  return groups;
}

/** llms.txt — standardized markdown index. */
export function generateLlmsTxt() {
  const spec = generateOpenApiSpec();
  const groups = groupByTag(spec);

  let out = `# ${spec.info.title}\n\n`;
  out += `> ${spec.info.description.split('.')[0]}.\n\n`;
  out += `Base URL: ${BASE_URL}\n`;
  out += `Auth: Tidak diperlukan (open access, tanpa API Key).\n`;
  out += `Version: ${APP_VERSION}\n\n`;
  out += `Semua endpoint return JSON. Panggil langsung via HTTP biasa.\n\n`;

  for (const [tag, entries] of groups) {
    out += `## ${tag}\n`;
    for (const { path, method, op } of entries) {
      const ex = buildExample(path, op.parameters);
      out += `- [${method} ${ex}](${ex}): ${op.summary || op.description || ''}\n`;
    }
    out += '\n';
  }

  out += `## Referensi Lengkap\n`;
  out += `- [/ai/docs](/ai/docs): Dokumentasi padat markdown lengkap (param + contoh response)\n`;
  out += `- [/llms.json](/llms.json): Manifest mesin-readable (JSON terstruktur)\n`;
  out += `- [/swagger.json](/swagger.json): Spesifikasi OpenAPI 3.0 penuh\n`;
  return out;
}

/** llms.json — machine-readable manifest. */
export function generateLlmsJson() {
  const spec = generateOpenApiSpec();
  const endpoints = flatOps(spec).map(({ path, method, op }) => ({
    name: toolName(path),
    method,
    path,
    category: op.tags?.[0] || null,
    summary: op.summary || null,
    description: op.description || null,
    parameters: (op.parameters || []).map(p => ({
      name: p.name,
      in: p.in,
      required: p.required || false,
      type: p.schema?.type || null,
      default: p.schema?.default ?? null,
      description: p.description || null,
    })),
    example: buildExample(path, op.parameters),
  }));

  return {
    schema: 'irengcloud-llms/v1',
    name: spec.info.title,
    version: APP_VERSION,
    base_url: BASE_URL,
    auth: 'none',
    description: spec.info.description,
    total_endpoints: endpoints.length,
    categories: [...new Set(endpoints.map(e => e.category))],
    endpoints,
  };
}

/** /ai/docs — dense full markdown reference. */
export function generateAiMarkdown() {
  const spec = generateOpenApiSpec();
  const groups = groupByTag(spec);

  let out = `# ${spec.info.title}\n\n`;
  out += `${spec.info.description}\n\n`;
  out += `- **Base URL**: \`${BASE_URL}\`\n`;
  out += `- **Auth**: Tidak diperlukan (open access)\n`;
  out += `- **Version**: ${APP_VERSION}\n`;
  out += `- **Format**: JSON\n`;
  out += `- **Semua path di bawah diawali Base URL**\n\n`;
  out += `> Cara pakai: GET \`${BASE_URL}/api/v1/hadits/search?q=puasa\`\n\n`;
  out += `---\n\n`;

  for (const [tag, entries] of groups) {
    out += `## ${tag}\n\n`;
    for (const { path, method, op } of entries) {
      out += `### \`${method} ${path}\`\n`;
      out += `${op.description || op.summary || ''}\n\n`;

      if (op.parameters?.length) {
        out += `| Parameter | Lokasi | Wajib | Default | Keterangan |\n`;
        out += `|---|---|---|---|---|\n`;
        for (const p of op.parameters) {
          const def = p.schema?.default ?? '—';
          out += `| \`${p.name}\` | ${p.in} | ${p.required ? 'ya' : 'tidak'} | ${def} | ${p.description || ''} |\n`;
        }
        out += '\n';
      }

      out += `**Contoh request:**\n\`\`\`\n${method} ${buildExample(path, op.parameters)}\n\`\`\`\n\n`;
    }
    out += `---\n\n`;
  }

  return out;
}

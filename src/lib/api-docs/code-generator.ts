import { ApiEndpointDoc } from './scanner';

export type SupportedLanguage = 'curl' | 'javascript' | 'typescript' | 'python' | 'php';

export function generateCodeExample(
  api: ApiEndpointDoc,
  language: SupportedLanguage,
  baseUrl: string = 'http://localhost:3000'
): string {
  const cleanBase = baseUrl.replace(/\/$/, '');
  let resolvedEndpoint = api.endpoint;

  // Replace route params [id] with demo-id
  resolvedEndpoint = resolvedEndpoint.replace(/\[([^\]]+)\]/g, 'demo-$1-id');

  // Add query param examples if GET
  if (api.method === 'GET' && api.queryParams && api.queryParams.length > 0) {
    const queryStr = api.queryParams
      .slice(0, 2)
      .map(q => `${q.name}=${q.type === 'number' ? '1' : 'demo'}`)
      .join('&');
    if (queryStr) {
      resolvedEndpoint += `?${queryStr}`;
    }
  }

  const fullUrl = `${cleanBase}${resolvedEndpoint}`;
  const hasPayload = ['POST', 'PUT', 'PATCH'].includes(api.method) && api.requestBody?.sample;
  const payloadJson = hasPayload ? JSON.stringify(api.requestBody!.sample, null, 2) : '';

  switch (language) {
    case 'curl': {
      let code = `curl -X ${api.method} \\\n  "${fullUrl}" \\\n  -H "Accept: application/json"`;
      if (hasPayload) {
        code += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(api.requestBody!.sample)}'`;
      }
      if (api.authRequired) {
        code += ` \\\n  --cookie "auth_token=YOUR_JWT_SESSION_TOKEN"`;
      }
      return code;
    }

    case 'javascript': {
      if (hasPayload) {
        return `// JavaScript (ES6+ / Fetch API)
const response = await fetch("${fullUrl}", {
  method: "${api.method}",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  credentials: "${api.authRequired ? 'include' : 'same-origin'}",
  body: JSON.stringify(${payloadJson}),
});

const result = await response.json();
console.log(result);`;
      } else {
        return `// JavaScript (ES6+ / Fetch API)
const response = await fetch("${fullUrl}", {
  method: "${api.method}",
  headers: {
    "Accept": "application/json",
  },
  credentials: "${api.authRequired ? 'include' : 'same-origin'}",
});

const result = await response.json();
console.log(result);`;
      }
    }

    case 'typescript': {
      const typeName = `${api.category.replace(/[^a-zA-Z]/g, '') || 'Api'}Response`;
      if (hasPayload) {
        return `// TypeScript Integration Example
interface ${typeName} {
  success?: boolean;
  data?: Record<string, any>;
  error?: string;
}

const response = await fetch("${fullUrl}", {
  method: "${api.method}",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  credentials: "${api.authRequired ? 'include' : 'same-origin'}",
  body: JSON.stringify(${payloadJson}),
});

const result: ${typeName} = await response.json();
console.log(result);`;
      } else {
        return `// TypeScript Integration Example
interface ${typeName} {
  success?: boolean;
  data?: Record<string, any>;
  error?: string;
}

const response = await fetch("${fullUrl}", {
  method: "${api.method}",
  headers: {
    "Accept": "application/json",
  },
  credentials: "${api.authRequired ? 'include' : 'same-origin'}",
});

const result: ${typeName} = await response.json();
console.log(result);`;
      }
    }

    case 'python': {
      if (hasPayload) {
        return `# Python 3 (requests)
import requests

url = "${fullUrl}"
headers = {
    "Accept": "application/json",
    "Content-Type": "application/json"
}
payload = ${JSON.stringify(api.requestBody!.sample, null, 4)}

${api.authRequired ? 'cookies = {"auth_token": "YOUR_JWT_SESSION_TOKEN"}\n' : ''}response = requests.${api.method.toLowerCase()}(
    url,
    headers=headers,
    json=payload${api.authRequired ? ',\n    cookies=cookies' : ''}
)

data = response.json()
print(data)`;
      } else {
        return `# Python 3 (requests)
import requests

url = "${fullUrl}"
headers = {
    "Accept": "application/json"
}

${api.authRequired ? 'cookies = {"auth_token": "YOUR_JWT_SESSION_TOKEN"}\n' : ''}response = requests.${api.method.toLowerCase()}(
    url,
    headers=headers${api.authRequired ? ',\n    cookies=cookies' : ''}
)

data = response.json()
print(data)`;
      }
    }

    case 'php': {
      if (hasPayload) {
        return `<?php
// PHP cURL Integration
$ch = curl_init("${fullUrl}");

$payload = json_encode(${JSON.stringify(api.requestBody!.sample)});

curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => "${api.method}",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Accept: application/json",
        "Content-Type: application/json"
    ],
    CURLOPT_POSTFIELDS => $payload,${api.authRequired ? '\n    CURLOPT_COOKIE => "auth_token=YOUR_JWT_SESSION_TOKEN",' : ''}
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);`;
      } else {
        return `<?php
// PHP cURL Integration
$ch = curl_init("${fullUrl}");

curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => "${api.method}",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Accept: application/json"
    ],${api.authRequired ? '\n    CURLOPT_COOKIE => "auth_token=YOUR_JWT_SESSION_TOKEN",' : ''}
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);`;
      }
    }

    default:
      return '';
  }
}

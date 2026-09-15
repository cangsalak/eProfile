import type { ApiInventorySummary } from './scanner';

export function generateOpenApiSpec(summary: ApiInventorySummary, baseUrl: string = 'http://localhost:3000') {
  const paths: Record<string, any> = {};

  summary.apis.forEach((api) => {
    // Convert /api/personnel/:id or /api/personnel/[id] into OpenAPI format {id}
    const openApiPath = api.endpoint
      .replace(/:([a-zA-Z0-9_]+)/g, '{$1}')
      .replace(/\[([a-zA-Z0-9_]+)\]/g, '{$1}');

    if (!paths[openApiPath]) {
      paths[openApiPath] = {};
    }

    const method = api.method.toLowerCase();
    const parameters: any[] = [];

    // Path parameters
    api.pathParams.forEach((p) => {
      parameters.push({
        name: p.name,
        in: 'path',
        required: true,
        description: p.description || '',
        schema: {
          type: p.type === 'number' ? 'integer' : 'string',
        },
      });
    });

    // Query parameters
    api.queryParams.forEach((q) => {
      parameters.push({
        name: q.name,
        in: 'query',
        required: q.required || false,
        description: q.description || '',
        schema: {
          type: q.type === 'number' ? 'integer' : 'string',
        },
      });
    });

    const operation: any = {
      tags: [api.category || 'General'],
      summary: api.description,
      description: `${api.purpose}\n\n**Auth Guard**: ${api.authGuard}\n**Required Permission**: ${api.permission || 'None'}`,
      operationId: `${api.method.toLowerCase()}_${api.endpoint.replace(/[^a-zA-Z0-9_]/g, '_')}`,
      parameters: parameters.length > 0 ? parameters : undefined,
      responses: {},
    };

    if (api.authRequired) {
      operation.security = [{ bearerAuth: [] }, { apiKeyAuth: [] }];
    }

    if (api.requestBody?.hasBody) {
      operation.requestBody = {
        description: api.requestBody.description || 'Request Payload',
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              example: api.requestBody.sample || {},
            },
          },
        },
      };
    }

    // Responses
    if (api.responses && api.responses.length > 0) {
      api.responses.forEach((r) => {
        operation.responses[String(r.status)] = {
          description: r.description,
          content: r.sample
            ? {
                'application/json': {
                  schema: {
                    type: 'object',
                    example: r.sample,
                  },
                },
              }
            : undefined,
        };
      });
    } else {
      operation.responses['200'] = {
        description: 'Successful Response',
      };
    }

    paths[openApiPath][method] = operation;
  });

  return {
    openapi: '3.0.3',
    info: {
      title: 'eProfile System API Reference',
      version: '1.3.0',
      description: 'ศูนย์รวมเอกสารอ้างอิงและ API Endpoints สำหรับเชื่อมต่อระบบบุคลากร eProfile',
    },
    servers: [
      {
        url: baseUrl,
        description: 'Current Environment Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT or API Key',
          description: 'Bearer Token (JWT or ep_live_...)',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API Key Token (ep_live_...)',
        },
      },
    },
    paths,
  };
}

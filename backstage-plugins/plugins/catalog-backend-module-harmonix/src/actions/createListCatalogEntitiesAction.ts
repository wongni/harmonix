/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { CatalogService } from '@backstage/plugin-catalog-node';

export const createListCatalogEntitiesAction = ({
  catalog,
  actionsRegistry,
}: {
  catalog: CatalogService;
  actionsRegistry: ActionsRegistryService;
}) => {
  actionsRegistry.register({
    name: 'list-catalog-entities',
    title: 'List Catalog Entities',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    description: `
List entities from the Backstage software catalog with optional filters, ordering, and pagination.
Returns entities like Components, Templates, Users, Groups, Systems, Resources, and APIs.
    `,
    schema: {
      input: z =>
        z.object({
          filter: z
            .array(z.string())
            .optional()
            .describe('Filter expressions (e.g., ["kind=template", "metadata.namespace=default"])'),
          orderBy: z
            .string()
            .optional()
            .describe('Sort order (e.g., "asc:metadata.name", "desc:metadata.title")'),
          limit: z
            .number()
            .optional()
            .default(100)
            .describe('Maximum number of results'),
          offset: z
            .number()
            .optional()
            .default(0)
            .describe('Pagination offset'),
        }),
      output: z =>
        z.object({
          total: z.number().describe('Number of entities returned'),
          offset: z.number().describe('Pagination offset used'),
          limit: z.number().describe('Limit used'),
          entities: z.array(z.any()).describe('Array of catalog entities'),
        }),
    },
    action: async ({ input, credentials }) => {
      const { filter, orderBy, limit = 100, offset = 0 } = input;

      const queryFilter: Record<string, string | string[]> = {};

      if (filter && filter.length > 0) {
        filter.forEach(f => {
          const [key, value] = f.split('=');
          if (key && value) {
            queryFilter[key] = value;
          }
        });
      }

      const queryParams: any = {
        filter: queryFilter,
        limit,
        offset,
      };

      if (orderBy) {
        const [direction, field] = orderBy.split(':');
        queryParams.orderFields = [{ field, order: direction }];
      }

      const { items } = await catalog.queryEntities(queryParams, { credentials });

      return {
        output: {
          total: items.length,
          offset,
          limit,
          entities: items.map(entity => ({
            apiVersion: entity.apiVersion,
            kind: entity.kind,
            metadata: {
              name: entity.metadata.name,
              namespace: entity.metadata.namespace,
              title: entity.metadata.title,
              description: entity.metadata.description,
              labels: entity.metadata.labels,
              annotations: entity.metadata.annotations,
            },
            spec: entity.spec,
          })),
        },
      };
    },
  });
};

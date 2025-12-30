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
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';

export const createRetryScaffolderTaskAction = ({
  discovery,
  auth,
  actionsRegistry,
}: {
  discovery: DiscoveryService;
  auth: AuthService;
  actionsRegistry: ActionsRegistryService;
}) => {
  actionsRegistry.register({
    name: 'retry-scaffolder-task',
    title: 'Retry Scaffolder Task',
    attributes: {
      destructive: false,
      readOnly: false,
      idempotent: false,
    },
    description: `
Retry a failed Backstage scaffolder task from the point where it failed.
    `,
    schema: {
      input: z =>
        z.object({
          taskId: z.string().describe('Scaffolder task ID to retry'),
          secrets: z
            .record(z.string())
            .optional()
            .default({})
            .describe('Optional secrets for retry'),
        }),
      output: z =>
        z.object({
          taskId: z.string().describe('Task ID (same as input)'),
        }),
    },
    action: async ({ input, credentials }) => {
      const { taskId, secrets = {} } = input;

      const scaffolderUrl = await discovery.getBaseUrl('scaffolder');

      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'scaffolder',
      });

      const response = await fetch(`${scaffolderUrl}/v2/tasks/${taskId}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ secrets }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to retry scaffolder task: ${response.status} ${error}`);
      }

      const result = await response.json();

      return {
        output: {
          taskId: result.id,
        },
      };
    },
  });
};

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

export const createGetScaffolderTaskEventsAction = ({
  discovery,
  auth,
  actionsRegistry,
}: {
  discovery: DiscoveryService;
  auth: AuthService;
  actionsRegistry: ActionsRegistryService;
}) => {
  actionsRegistry.register({
    name: 'get-scaffolder-task-events',
    title: 'Get Scaffolder Task Events',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    description: `
Get events for a scaffolder task execution. Returns events after a specific event ID.
Useful for polling task progress and monitoring execution steps.
    `,
    schema: {
      input: z =>
        z.object({
          taskId: z.string().describe('Scaffolder task ID'),
          after: z
            .number()
            .optional()
            .describe('Return events after this event ID'),
        }),
      output: z =>
        z.object({
          events: z.array(z.any()).describe('Task events'),
        }),
    },
    action: async ({ input, credentials }) => {
      const { taskId, after } = input;

      const scaffolderUrl = await discovery.getBaseUrl('scaffolder');

      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'scaffolder',
      });

      const url = new URL(`${scaffolderUrl}/v2/tasks/${taskId}/events`);
      if (after !== undefined) {
        url.searchParams.set('after', after.toString());
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get task events: ${response.status} ${error}`);
      }

      const events = await response.json();

      return {
        output: {
          events,
        },
      };
    },
  });
};

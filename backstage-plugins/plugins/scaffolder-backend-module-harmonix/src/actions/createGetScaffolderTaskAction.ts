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

export const createGetScaffolderTaskAction = ({
  discovery,
  auth,
  actionsRegistry,
}: {
  discovery: DiscoveryService;
  auth: AuthService;
  actionsRegistry: ActionsRegistryService;
}) => {
  actionsRegistry.register({
    name: 'get-scaffolder-task',
    title: 'Get Scaffolder Task',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    description: `
Get the status and details of a Backstage scaffolder task.
    `,
    schema: {
      input: z =>
        z.object({
          taskId: z.string().describe('Scaffolder task ID'),
        }),
      output: z =>
        z.object({
          task: z.any().describe('Task details'),
        }),
    },
    action: async ({ input, credentials }) => {
      const { taskId } = input;

      const scaffolderUrl = await discovery.getBaseUrl('scaffolder');

      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'scaffolder',
      });

      const response = await fetch(`${scaffolderUrl}/v2/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get scaffolder task: ${response.status} ${error}`);
      }

      const task = await response.json();

      return {
        output: {
          task,
        },
      };
    },
  });
};

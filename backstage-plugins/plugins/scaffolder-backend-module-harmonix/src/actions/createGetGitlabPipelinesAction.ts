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

export const createGetGitlabPipelinesAction = ({
  discovery,
  auth,
  actionsRegistry,
}: {
  discovery: DiscoveryService;
  auth: AuthService;
  actionsRegistry: ActionsRegistryService;
}) => {
  actionsRegistry.register({
    name: 'get-gitlab-pipelines',
    title: 'Get GitLab Pipelines',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    description: 'Fetch GitLab pipelines for a project',
    schema: {
      input: z =>
        z.object({
          projectId: z.string().describe('GitLab project ID'),
          gitlabHost: z.string().default('gitlab.com').describe('GitLab host'),
        }),
      output: z =>
        z.object({
          pipelines: z.any().describe('Array of pipeline objects'),
        }),
    },
    action: async ({ input, credentials }) => {
      const { projectId, gitlabHost } = input;

      const baseUrl = await discovery.getBaseUrl('gitlab');

      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'gitlab',
      });

      const response = await fetch(`${baseUrl}/rest/${gitlabHost}/projects/${projectId}/pipelines`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch GitLab pipelines: ${response.status} ${error}`);
      }

      const pipelines = await response.json();

      return {
        output: {
          pipelines,
        },
      };
    },
  });
};

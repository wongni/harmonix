import { coreServices, createBackendModule } from "@backstage/backend-plugin-api";
import { actionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createExampleAction } from "./actions/example";
import { ScmIntegrations } from '@backstage/integration';
import { CatalogClient } from '@backstage/catalog-client';

import {
  createRepoAccessTokenAction,
  createSecretAction,
  createWriteFileAction,
  getComponentInfoAction,
  getEnvProvidersAction,
  getPlatformMetadataAction,
  getPlatformParametersAction,
  getSsmParametersAction
} from "./actions";
import { createCreateScaffolderTaskAction } from './actions/createCreateScaffolderTaskAction';
import { createGetScaffolderTaskAction } from './actions/createGetScaffolderTaskAction';
import { createCancelScaffolderTaskAction } from './actions/createCancelScaffolderTaskAction';
import { createRetryScaffolderTaskAction } from './actions/createRetryScaffolderTaskAction';
import { createGetScaffolderTaskEventsAction } from './actions/createGetScaffolderTaskEventsAction';
import { createGetGitlabPipelinesAction } from './actions/createGetGitlabPipelinesAction';
import { createGetGitlabProjectAction } from './actions/createGetGitlabProjectAction';

/** 
 * A backend module that registers the action into the scaffolder
 */
export const scaffolderModule = createBackendModule({
  moduleId: 'harmonix-action',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        actionsRegistry: actionsRegistryServiceRef,
        auth: coreServices.auth,
      },
      async init({ scaffolderActions, config, discovery, actionsRegistry, auth }) {
        const integrations = ScmIntegrations.fromConfig(config);
        const catalogClient = new CatalogClient({
          discoveryApi: discovery,
        });

        scaffolderActions.addActions(createWriteFileAction())
        scaffolderActions.addActions(createSecretAction({ envConfig: config }))
        scaffolderActions.addActions(getEnvProvidersAction({ catalogClient }))
        scaffolderActions.addActions(getComponentInfoAction())
        scaffolderActions.addActions(getSsmParametersAction())
        scaffolderActions.addActions(getPlatformMetadataAction({ envConfig: config }))
        scaffolderActions.addActions(getPlatformParametersAction({ envConfig: config }))
        scaffolderActions.addActions(createRepoAccessTokenAction({ integrations, envConfig: config }));
        scaffolderActions.addActions(createExampleAction());

        createCreateScaffolderTaskAction({
          discovery,
          auth,
          actionsRegistry,
        });

        createGetScaffolderTaskAction({
          discovery,
          auth,
          actionsRegistry,
        });

        createCancelScaffolderTaskAction({
          discovery,
          auth,
          actionsRegistry,
        });

        createRetryScaffolderTaskAction({
          discovery,
          auth,
          actionsRegistry,
        });

        createGetScaffolderTaskEventsAction({
          discovery,
          auth,
          actionsRegistry,
        });

        createGetGitlabPipelinesAction({
          discovery,
          auth,
          actionsRegistry,
        });

        createGetGitlabProjectAction({
          discovery,
          auth,
          actionsRegistry,
        });
      }
    });
  },
})

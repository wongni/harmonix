import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { actionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { AWSEnvironmentEntitiesProcessor } from './processor/AWSEnvironmentEntitiesProcessor';
import { AWSEnvironmentProviderEntitiesProcessor } from './processor/AWSEnvironmentProviderEntitiesProcessor';
import { createListCatalogEntitiesAction } from './actions/createListCatalogEntitiesAction';

export const catalogModuleHarmonix = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'aws-apps-entities-processor',
  register(reg) {
    reg.registerInit({
      deps: { 
        logger: coreServices.logger,
        catalog: catalogProcessingExtensionPoint,
        catalogService: catalogServiceRef,
        actionsRegistry: actionsRegistryServiceRef,
      },
      async init({ catalog, logger, catalogService, actionsRegistry }) {
        logger.info('Hello World from your AWS custom entities processor!');
        catalog.addProcessor(new AWSEnvironmentEntitiesProcessor());
        catalog.addProcessor(new AWSEnvironmentProviderEntitiesProcessor());
        
        createListCatalogEntitiesAction({
          catalog: catalogService,
          actionsRegistry,
        });
      },
    });
  },
});

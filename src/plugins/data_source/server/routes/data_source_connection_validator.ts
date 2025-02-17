/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OpenSearchClient } from 'opensearch-dashboards/server';
import { createDataSourceError } from '../lib/error';
import { SigV4ServiceName } from '../../common/data_sources';
export class DataSourceConnectionValidator {
  constructor(
    private readonly callDataCluster: OpenSearchClient,
    private readonly dataSourceAttr: any
  ) {}

  async validate() {
    try {
      let validationResponse;
      // Amazon OpenSearch Serverless does not support .info() API
      if (
        this.dataSourceAttr.auth?.credentials?.service === SigV4ServiceName.OpenSearchServerless
      ) {
        validationResponse = await this.callDataCluster.cat.indices();
        if (validationResponse?.statusCode === 200 && validationResponse?.body) {
          return validationResponse;
        }
      } else {
        validationResponse = await this.callDataCluster.info();
        if (validationResponse?.statusCode === 200 && validationResponse?.body?.cluster_name) {
          return validationResponse;
        }
      }

      throw new Error(JSON.stringify(validationResponse?.body));
    } catch (e) {
      throw createDataSourceError(e);
    }
  }
}

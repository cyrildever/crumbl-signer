import mongo from 'mongodb'

import { logger } from '../utils/logger'

export interface DataRequest {
  type: 'DataRequest'
  dataId: string
  requestId: string
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const insertData = (collection: mongo.Collection<DataRequest | any>, dr: DataRequest): Promise<any> =>
  collection
    .insertOne(dr)
    .catch(err => logger.error(err))

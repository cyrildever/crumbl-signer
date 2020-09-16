import mongo from 'mongodb'

import { logger } from '../utils/logger'

export interface TransactionRequest {
  type: 'TransactionRequest'
  transactionId: string
  requestId: string
}

export const insertTransaction = (collection: mongo.Collection<TransactionRequest | any>, tr: TransactionRequest): Promise<any> =>
  collection
    .insertOne(tr)
    .catch(err => logger.error(err))

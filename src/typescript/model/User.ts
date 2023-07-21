import mongo from 'mongodb'

import { logger } from '../utils/logger'

export interface User {
  type: 'User'
  id: string
  pubKey: string
  secret: string
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const insertUser = (collection: mongo.Collection<User | any>, user: User): Promise<any> =>
  collection
    .insertOne(user)
    .catch(err => logger.error(err))

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const userExists = (collection: mongo.Collection<User | any>, user: User): Promise<boolean> =>
  collection
    .find(user).limit(1).count()
    .then(count => count > 0)

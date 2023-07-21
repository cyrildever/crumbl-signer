import mongo from 'mongodb'
import crypto from 'crypto'

import { logger } from '../utils/logger'

export interface SeedPath {
  type: 'SeedPath'
  lastPath: string
  seed: string
}

export const isSeedPath = (object: any): object is SeedPath =>
  'lastPath' in object && object.type === 'SeedPath' // eslint-disable-line @typescript-eslint/no-unsafe-member-access

export const nextPath = (path: string): string => {
  const [m, account, scope, keyIndex] = path.split('/')
  const nextKeyIndex = parseInt(keyIndex) + 1
  return `${m}/${account}/${scope}/${nextKeyIndex}`
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const updatePath = (collection: mongo.Collection<SeedPath | any>, path: string): Promise<any> =>
  collection
    .updateOne({ type: 'SeedPath' }, { $set: { lastPath: path } }, { upsert: true })
    .catch(err => logger.error(err))

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const updateSeed = (collection: mongo.Collection<SeedPath | any>, seed: Buffer): Promise<any> =>
  collection
    .updateOne({ type: 'SeedPath' }, { $set: { seed: seed.toString('hex') } }, { upsert: true })
    .catch(err => logger.error(err))

export const INITIAL_PATH = 'm/0\'/0/0'

export const generateSeed = (): Buffer =>
  crypto.pseudoRandomBytes(32)

/**
 * Returns a new tuple of seed and path to use for a new session if need be
 */
export const generateNewSessionSeedPath = (): SeedPath => ({
  lastPath: INITIAL_PATH,
  seed: generateSeed().toString('hex')
} as SeedPath)

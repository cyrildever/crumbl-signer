import mongo from 'mongodb'
import { Maybe, None, Some } from 'ts-utls'
import BIP32Factory from 'bip32'
import * as ecc from 'tiny-secp256k1'
import * as crumbljs from 'crumbl-js'

import { logger } from '../utils/logger'

export interface RequestSeed {
  type: 'RequestSeed'
  requestId: string
  path: string
  seed: string
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const insertRequest = (collection: mongo.Collection<RequestSeed | any>, rs: RequestSeed): Promise<any> =>
  collection
    .insertOne(rs)
    .catch(err => logger.error(err))

const bip32 = BIP32Factory(ecc) // eslint-disable-line @typescript-eslint/no-unsafe-argument

export const doDecipher = async (rs: RequestSeed, crumbled: string, verificationHash: string): Promise<Maybe<string>> => {
  const keyPair = bip32.fromSeed(Buffer.from(rs.seed, 'hex')).derivePath(rs.path)
  const signer = {
    encryptionAlgorithm: crumbljs.ECIES_ALGORITHM,
    privateKey: keyPair.privateKey
  }
  const crumblExtractor = new crumbljs.BrowserWorker({
    mode: crumbljs.EXTRACTION,
    data: [crumbled],
    verificationHash: verificationHash
  })
  const uncrumb = await crumblExtractor.extract(signer, false)
  if (uncrumb !== '') {
    return Some(uncrumb)
  } else {
    return None<string>()
  }
}

import express, { Router } from 'express'
import mongo from 'mongodb'
import { Maybe, None } from 'monet'
import { uuid } from 'uuidv4'
import * as bip32 from 'bip32'
import * as crumbljs from 'crumbl-js'
import * as ecies from 'ecies-geth'

import {
  RequestSeed, insertRequest, doDecipher,
  SeedPath, isSeedPath, nextPath, updatePath,
  DataRequest, insertData
} from '..'
import { logger } from '../utils/logger'
import { sanitizeDataId, sanitizeUUID } from '../utils/sanitize'
import { NonEmptyString } from '../utils'
import { userExists, User } from '../model/User'

export type SignerController = Router

export default (collection: mongo.Collection<DataRequest | RequestSeed | SeedPath>): SignerController => {
  const router = express.Router()

  /* GET lastPubKey. */
  router.get('/lastPubKey', (req, res) => {
    const userId = req.header('X-User-ID')
    const userPubKey = req.header('X-User-PubKey')
    const userSecret = req.header('X-User-Secret')
    if (userId === undefined || userPubKey === undefined || userSecret === undefined) {
      logger.error('All HTTP headers are mandatory')
      return res.sendStatus(412).end()
    }
    const user = {
      type: 'User',
      id: userId,
      pubKey: userPubKey,
      secret: userSecret
    } as User
    userExists(collection, user).then(exists => {
      if (exists === true) {
        const requestId = uuid()
        collection.findOne({ type: 'SeedPath' }, (err, item) => {
          if (err || !isSeedPath(item)) { // eslint-disable-line @typescript-eslint/strict-boolean-expressions
            logger.error(err)
            res.sendStatus(500).end()
          } else {
            const newPath = nextPath(item.lastPath)
            const currentSeed = item.seed
            updatePath(collection, newPath).then(r => {
              /* eslint-disable @typescript-eslint/no-unsafe-member-access */
              if (r.result.n > 0) {
                const rs: RequestSeed = {
                  type: 'RequestSeed',
                  requestId: requestId,
                  seed: currentSeed,
                  path: newPath
                }
                insertRequest(collection, rs).then(r => {
                  if (r.result.n > 0) {
                    recoverPubKey(currentSeed, newPath)
                      .then(pubKey => {
                        res.json({
                          encryptionAlgorithm: crumbljs.ECIES_ALGORITHM,
                          publicKey: pubKey.toString('hex'),
                          requestId: requestId
                        })
                      }).catch(err => {
                        logger.error(err)
                        res.sendStatus(500).end()
                      })
                  } else {
                    throw new Error('unable to insert request')
                  }
                }).catch(err => {
                  logger.error(err)
                  res.sendStatus(500).end()
                })
              } else {
                throw new Error('unable to update path')
              }
              /* eslint-enable @typescript-eslint/no-unsafe-member-access */
            }).catch(err => {
              logger.error(err)
              res.sendStatus(500).end()
            })
          }
        })
      } else {
        logger.error(`user does not exist: {"id":"${userId}","pubKey":"${userPubKey}","secret":"${userSecret}"`) // TODO Remove in production?
        res.sendStatus(412).end()
      }
    }).catch(err => {
      logger.error(err)
      res.sendStatus(500).end()
    })
  })

  /* GET uncrumbs. */
  router.get('/uncrumbs', (req, res, _) => {
    if ('dataId' in req.query && 'crumbl' in req.query && 'verificationHash' in req.query && 'token' in req.query) {
      collection
        .findOne({ dataId: req.query.dataId } as DataRequest)
        .then(item => {
          if (item == null) {
            res.sendStatus(404).end()
            return
          }
          if (NonEmptyString.is(req.query.crumbl) && NonEmptyString.is(req.query.verificationHash) && sanitizeUUID(req.query.token as string).isSome()) {
            decipherCrumbl(collection, item as DataRequest, req.query.crumbl, req.query.verificationHash)
              .then(result => {
                if (result.isSome()) {
                  // TODO Record token in special collection (to get paid eventually) ######
                  logger.info('Returning some partial uncrumbs for dataId [' + (req.query.dataId as string) + '] to ' + req.ip + ' for token ' + (req.query.token as string))
                  res.json(result.some())
                } else {
                  res.sendStatus(404).end()
                }
              })
              .catch(err => {
                logger.error(err)
                res.sendStatus(500).end()
              })
          } else {
            res.sendStatus(400).end()
          }
        })
        .catch(err => {
          logger.error(err)
          res.sendStatus(500).end()
        })
    } else {
      res.sendStatus(400).end()
    }
  })

  /* POST crumbl. */
  router.post('/crumbl', (req, res, _) => {
    if ('dataId' in req.body && 'requestId' in req.body) {
      /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
      const dataId = sanitizeDataId(req.body.dataId)
      const requestId = sanitizeUUID(req.body.requestId)
      if (!dataId.isSome() || !requestId.isSome()) {
        res.sendStatus(400).end()
        return
      }
      const dr: DataRequest = {
        type: 'DataRequest',
        dataId: dataId.some(),
        requestId: requestId.some()
      }
      insertData(collection, dr)
        .then(r => {
          logger.info('crumbl recorded', dr) // TODO Remove in production?
          res.sendStatus(r.result.n > 0 ? 201 : 500).end()
        })
        .catch(err => {
          logger.error(err)
          res.sendStatus(500).end()
        })
      /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */
    } else {
      res.sendStatus(400).end()
    }
  })

  /* Catch all */
  router.get('/', (_, res) => res.sendStatus(404).end())
  router.post('/', (_, res) => res.sendStatus(404).end())

  return router
}

const recoverPubKey = async (seed: string, currentPath: string): Promise<Buffer> => {
  const keyPair = bip32.fromSeed(Buffer.from(seed, 'hex')).derivePath(currentPath)
  if (keyPair.privateKey !== undefined) {
    return ecies.getPublic(keyPair.privateKey)
  } else throw new Error('Unable to derive key')
}

const decipherCrumbl = async (collection: mongo.Collection<RequestSeed | any>, tr: DataRequest, crumbled: string, verificationHash: string): Promise<Maybe<string>> =>
  collection
    .findOne({ type: 'RequestSeed', requestId: tr.requestId })
    .then(async (item: RequestSeed) => {
      if (item !== null) {
        return doDecipher(item, crumbled, verificationHash)
      }
      return None<string>()
    })
    .catch(err => {
      logger.error(err)
      return None<string>()
    })

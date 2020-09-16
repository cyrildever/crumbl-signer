import * as chai from 'chai'
import 'mocha'
chai.should()

import { Notaries, Notary } from '../../../src/typescript/model/Notary'

const notaries = Notaries(new Array<Notary>())

const notary: Notary = {
  id: '1234567890abcdef',
  pubKey: '04abcdef9876543210abcdef9876543210abcdef9876543210abcdef9876543210',
  secret: 'Ak/dT7=='
}

describe('Notaries', () => {
  describe('add', () => {
    it('should add a notary to the list of notaries', () => {
      notaries.add(notary)
      notaries.length().should.equal(1)
    })
  })
  describe('exists', () => {
    it('should detect an existing notary appropriately', () => {
      const notExisting: Notary = {
        id: '9876543210fedcba',
        pubKey: '04fedcba1234567890fedcba1234567890fedcba1234567890fedcba1234567890',
        secret: 'BbAKQM7='
      }
      let found = notaries.exists(notExisting)
      found.should.be.false
      found = notaries.exists(notary)
      found.should.be.true
    })
  })
})

import * as chai from 'chai'
import 'mocha'
chai.should()

import { sanitizeUUID, sanitizeTransactionId } from '../../../src/typescript/utils/sanitize'

describe('sanitizeUUID', () => {
  it('should return some string only if it is an appropriate UUID', () => {
    const expected = '9235e66c-c723-44cb-b5de-11f802c5e819'
    let found = sanitizeUUID(expected)

    found.isSome().should.be.true
    found.some().should.equal(expected)

    const wrong = 'not-A-Valid-UUID'
    found = sanitizeUUID(wrong)

    found.isSome().should.be.false
  })
})
describe('sanitizeTransactionId', () => {
  it('should return some string only if it is an appropriate 32-byte hash string', () => {
    const expected = 'a028d39860205482aff35ee942f3a43f49985a2b84b9a844617c6b86ac98c96d'
    let found = sanitizeTransactionId(expected)

    found.isSome().should.be.true
    found.some().should.equal(expected)

    const wrong = 'notAValidTransactionID'
    found = sanitizeTransactionId(wrong)

    found.isSome().should.be.false
  })
})

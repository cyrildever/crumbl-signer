import * as chai from 'chai'
import 'mocha'
chai.should()

import { Users, User } from '../../../src/typescript/model/User'

const users = Users(new Array<User>())

const user: User = {
  id: '1234567890abcdef',
  pubKey: '04abcdef9876543210abcdef9876543210abcdef9876543210abcdef9876543210',
  secret: 'Ak/dT7=='
}

describe('Users', () => {
  describe('add', () => {
    it('should add a user to the list of users', () => {
      users.add(user)
      users.length().should.equal(1)
    })
  })
  describe('exists', () => {
    it('should detect an existing user appropriately', () => {
      const notExisting: User = {
        id: '9876543210fedcba',
        pubKey: '04fedcba1234567890fedcba1234567890fedcba1234567890fedcba1234567890',
        secret: 'BbAKQM7='
      }
      let found = users.exists(notExisting)
      found.should.be.false
      found = users.exists(user)
      found.should.be.true
    })
  })
})

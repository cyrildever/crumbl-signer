import * as chai from 'chai'
import 'mocha'
chai.should()

import { RequestSeed, doDecipher } from '../../../src/typescript'

describe('RequestSeed', () => {
  describe('doDecipher', () => {
    it('should return the partial uncrumbs from a crumnbled string', async () => {
      const expected = 'cc8b00be1cc7592806ba4f8fe4411d3744121dc12e6201dc36e873f7fd9a6bae%02AgICAhhHVw8=%03AgICAgICAgE=.1'
      const rs = {
        requestId: '12345678-90ab-cdef-1234-567890abcdef1',
        path: 'm/0\'/0/1',
        seed: '690f7f7b2575dc9970f499e733eb22fc2a81881d13fbd0c8e0d4670d697fc8ad'
      }
      const crumbled = 'cc8b00be1cc7592806ba4f8fe4411d374064d57e96845c04ed360d0901d64b7a0000a4BHbIv7jmXdjb3n7+/Ewg1Br4EXYksmb4RmavTQsDVJAFY/he1rs7gpRY9+waPCww3YMzr5IIWFYN8LDVDDxV2bdTGBNjHWbsb4WRM2ItLFVYubxBto/6pfGyXJ0ZriYjL2RCVtPw8cdJrkeXqSqOEz1ICBTN9UOBZw==0000a4BLaggeNjl7tsFhAymEipkuIco8xG8trm6E+4WzrTX7spC0DmdyTFhU8enJV2WERxOaF7iy6E64/2+2wIL/MqRMnyRnJJJDab6d7pTWMSEVOUAvEFugTP95XpnnZcDyzLdZ2J+YBbMYtRcnxH4TJA9AIwksl0oJRA/w==0100a4BJOU/0Jo239EUuDd6Lxu8gRICsND71bSg+qY3n1n7o/EA+d5g6orQnpw4Zr5QnfNQIUxgMCmNqI/rY5EpsR+emtHVIF6OS+1cgKhkwhbBHrNRZDsnOvH3XBVrIOk6CpEm1+hPRNt1E6h6zFr7EfDenRhE0RxWth42g==0100a4BPKEPk14AeNPSiPos2Ob5wML/1Oyn3zJDXdKr9nCEct7HhSGu348ESZrhbp14nsNEihbrh6tzOOj11KqfJWeq7PEROAnynm9K2fLp6rl7o1vwAgW5f+4a/7tzn3rH8XkoHbamHfAU1GGYwop1QPFvXhr+FC8SKwuuQ==0200a4BFq+ZlkogXqxBDlTZvMZbCEqi6F480LSEZioZLcj8aGBmT2c+yzY2DR66+KinG1qaYQ+rGRRenMut+dcuRIKbVA5tNZYXJAWBtL3mStYpaDWqYBTIG06Ml3tjpD4+Jr3xgI0lmczL53CUm0SzL7eXaBbxMtQmcfg6Q==0200a4BIq9Hdb9zuSd+YwNwD9kUXuY0RogGe6NNWfpXhhbmbCGM/mhuX9qegKotLit7Ws0osggpVLSQ9b2yV8krH5DUToJNuxdCiRTvKMtgMJpWtDbYuV3yxoITb2azq7u9G2SVkWGaqXUsAupe9si7nIc4maeufh1vXkgWA==0300a4BLHdrR+dhbUfm9O5LByNZfXmJIpEGr2yy6+nyQG1GtLpdMLbUrzStYExEoAfQPuPtpKZmyWCBHleVQVrF71mPBjeiTCLyyuLm6qMXJ6lxQ0D/7jUcKQX6vUymtnEevw0326nD/lobnxp65lhg30cnDsYngT5+AeKSw==0300a4BAhTnL9o/IxxAyVqoal6hn9JlwZCn+SDnuBkhH4fCBrOC+btqM/D3NIDcR1+Zdiy55k9doYtiaeYcdvKGlXbwE3rwK94heEHgEzTysX18ciduFMpgoc1x0aY7MfUipyEw5y5165NFhX6U3lZJ7501AU9kAZ3iHAePA==.1'
      const verificationHash = 'cc8b00be1cc7592806ba4f8fe4411d3744121dc12e6201dc36e873f7fd9a6bae'
      const found = await doDecipher(rs as RequestSeed, crumbled, verificationHash)
      found.isSome().should.be.true // eslint-disable-line @typescript-eslint/no-unused-expressions
      expected.should.equal(found.some())
    })
  })
})

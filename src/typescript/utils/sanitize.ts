import { Maybe, None, Some } from 'monet'

const hashStringRegex = new RegExp('^[0-9a-f]{64}$')
const uuidRegex = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')

export const sanitizeUUID = (requestIdOrToken: string): Maybe<string> => {
  if (uuidRegex.test(requestIdOrToken)) {
    return Some(requestIdOrToken)
  } else {
    return None<string>()
  }
}

export const sanitizeTransactionId = (transactionId: string): Maybe<string> => {
  if (hashStringRegex.test(transactionId)) {
    return Some(transactionId)
  } else {
    return None<string>()
  }
}

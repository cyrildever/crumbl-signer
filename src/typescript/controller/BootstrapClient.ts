import axios from 'axios'
const { get } = axios

import { Notaries, Notary } from '../model/Notary'

const notaries = Notaries(new Array<Notary>())

export interface BootstrapClient {
  exists: (notary: Notary) => Promise<boolean>
}

export default (bootstrapUrl: string, signerCode: string): BootstrapClient => ({
  exists: async (notary: Notary) => {
    if (notaries.exists(notary)) {
      return Promise.resolve(true)
    }
    return get(
      `${bootstrapUrl}/notary`,
      { headers: {
        'X-Signer-Code': signerCode,
        'X-Notary-ID': notary.id,
        'X-Notary-PubKey': notary.pubKey,
        'X-Notary-Secret': notary.secret
      } }
    ).then(res => {
      if (res.status === 200) {
        // As it's a permanent list of notary in the Rooot system, once we know it exists, it will always
        notaries.add(notary)
        return true
      }
      return false
    })
  }
})

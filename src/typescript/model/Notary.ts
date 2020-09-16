export interface Notary {
  id: string
  pubKey: string
  secret: string
}

export interface Notaries {
  add: (notary: Notary) => void
  exists: (notary: Notary) => boolean
  length: () => number
}

const add = (notaries: Array<Notary>) => (notary: Notary) => {
  if (!notaries.includes(notary)) {
    notaries.push(notary)
  }
}

const exists = (notaries: Array<Notary>) => (notary: Notary): boolean =>
  notaries.includes(notary)

const length = (notaries: Array<Notary>) => (): number => notaries.length

export const Notaries = (notaries: Array<Notary>): Notaries => ({
  add: add(notaries),
  exists: exists(notaries),
  length: length(notaries)
})

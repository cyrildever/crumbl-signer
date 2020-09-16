export interface User {
  id: string
  pubKey: string
  secret: string
}

export interface Users {
  add: (user: User) => void
  exists: (user: User) => boolean
  length: () => number
}

const add = (users: Array<User>) => (user: User) => {
  if (!users.includes(user)) {
    users.push(user)
  }
}

const exists = (users: Array<User>) => (user: User): boolean =>
  users.includes(user)

const length = (users: Array<User>) => (): number => users.length

export const Users = (users: Array<User>): Users => ({
  add: add(users),
  exists: exists(users),
  length: length(users)
})

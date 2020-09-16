import * as iots from 'io-ts'

export interface NonEmptyStringBrand {
  readonly NonEmptyString: unique symbol
}
export const NonEmptyString = iots.brand(iots.string, (n: string): n is iots.Branded<string, NonEmptyStringBrand> => n.length > 0, 'NonEmptyString')
export type NonEmptyString = iots.TypeOf<typeof NonEmptyString>

# crumbl-signer
_Easy signer server for the Crumbl&trade; platform_

![Github tag (latest by date)](https://img.shields.io/github/v/tag/cyrildever/crumbl-signer)
![npm](https://img.shields.io/npm/dw/crumbl-signer)
![Github last commit](https://img.shields.io/github/last-commit/cyrildever/crumbl-signer)
![Github issues](https://img.shields.io/github/issues/cyrildever/crumbl-signer)
![NPM](https://img.shields.io/npm/l/crumbl-signer)

This application is an easy signer server for the Crumbl&trade; platform patented by Cyril Dever.


### Usage

1. Either you have set your own MongoDB environment compatible with the `crumbl-signer`'s requirements:
    ```console
    npm i crumbl-signer && npm run compile && npm start
    ```

2. Or you start the Docker container:
    ```console
    git clone https://github.com/cyrildever/crumbl-signer.git && cd crumbl-signer && docker-compose up --build -d
    ```
    You might want to use the `./cleanup` script (or `./cleanup.bat` on Windows) before launching any new Docker session (especially when you've built the NPM project).

Running the application will write a 'crumbl-signer.log' file in the main folder.

#### Production

Change or adapt the following environment variables every time you launch a new session if need be:
* `SESSION_SEED`: the hexadecimal string representation of the initial seed.

To generate a new seed for a session, you might want to use the following snippet:
```typescript
import { generateNewSessionSeedPath } from 'crumbl-signer'

const seedPath = generateNewSessionSeedPath()
const sessionSeed = seedPath.seed
console.log(sessionSeed)
```

_NB: Beware that modifying the seed will reset the path leant to it._


### API

The following endpoints are available:

* `GET /lastPubKey`

This endpoint generates the request ID and the signer's last public key to use for the Crumbl&trade; encryption, eg. `http://localhost:4000/lastPubKey`.

It expects three mandatory HTTP headers (as only registered users should ever call for a new pub key):
 - `X-User-ID`: the ID of the requesting user;
 - `X-User-PubKey`: the public key of the user;
 - `X-User-Secret`: the API secret of the user.

It returns a `412` status code in case these HTTP headers are either missing or wrong.
Otherwise, it returns a `200` status code along with a JSON object in the body respecting the following format:
```json
{
  "encryptionAlgorithm": "ecies",
  "publicKey": "<The ECIES decompressed public key in hexadecimal representation>",
  "requestId": "<The requestId to use when recording the crumbl (see below)>"
}
```

_// TODO Add RSA support._

* `GET /uncrumbs`

This endpoint deciphers the passed crumbled string if the signer had signed one or more of its crumbs.
It expects the 4 following mandatory URI-encoded arguments in the query string: (eg. `http://localhost:4000/uncrumbs?transactionId=123456789abcdef&crumbl=9876543210fedcba[...]&verificationHash=9876543210fedcba[...]&token=12345678-90ab-cdef-1234-567890abcdef1`)
  * `transactionId`: the Rooot blockchain transaction ID related to the crumbled string; // TODO Remove reference to Rooot ####
  * `crumbl`: the full crumbled string;
  * `verificationHash`: the hash of the original source (not to be confused with the initial hashered source of the crumbled string);
  * `token`: a valid token (in UUID format).

It returns a `200` status code along with the partial uncrumb as a plain text body if deciphered any, `400` if any query argument is missing, or a `404` status code if it's not a signer.

* `POST /crumbl`

This endpoint records the transaction ID in the local database to keep track of its relation with the public key used when crumbling the data.
Calling it is necessary to make the crumbl decipherable in time.
It expects the request body to be a JSON object respecting the following format:
```json
{
  "requestId": "<The requestId generated through the /lastPubKey endpoint (see above)>",
  "transactionId": "<A Rooot blockchain's transaction ID>" // TODO Remove reference to Rooot ####
}
```

It returns a `201` status code if everything went well.


As usual, all endpoints return a `500` status code if an error occurred on the server side.


### License

The use of the crumbl-signer server is subject to fees for commercial purpose and to the respect of the [BSD2-Clause-Patent license](LICENSE).
Please [contact me](mailto:cdever@edgewhere.fr) to get further information.


<hr />
&copy; 2020 Cyril Dever. All rights reserved.
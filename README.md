# AdMob rewarded ads SSV for Node.js

Tool for validate AdMob SSV signatures from backend

## Getting Started 🚀

### Prerequisites 📋

* Node >= 12.0.0

### Installing 🔧

Install via NPM

```
$ npm install --save admob-ssv
```

Or Yarn

```
$ yarn add admob-ssv
```

### Usage 📦

Use as ES module:

```typescript
import url from 'url';
import http from 'http';
import Verifier from 'admob-ssv';

const verifier = new Verifier();

const server = http.createServer(async (request) => {
    const parts = urls.parse(request.url, true);
    const isValid = await verifier.verify(parts.query);
    // ...
});

```

Example with express

```typescript
import Verifier from 'admob-ssv';

const verifier = new Verifier();

app.get('/ssvcallback', (req, res, next) => {
    verifier.verify(req.query)
        .then((isValid) => {
            if (!isValid) {
                res.status(500);
                res.json({
                    error: 'Invalid signature',
                });
            }

            // ...
        })
        .catch((e) => {
            return next(e);
        });
});

```

### Example: Passing custom parameters

```typescript
import Verifier, { KeyProvider, MemoryCache, RetryFetcher } from 'admob-ssv'

const verifier = new Verifier({
  keyProvider: new KeyProvider({
    cache: new MemoryCache(),
    fetcher: new RetryFetcher(),
  }),
})
```

## Versioning 📌

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [releases on this repository](https://github.com/exoshtw/node-admob-ssv/releases).

## Credit to Original Author ✒️

* **exos** - *Initial work* - [exos](https://github.com/exos)

## License 📄

This project is licensed under the GPL-2.0 License.

## Acknowledgments

* Bug reports and pull request are welcome 😊
* Buy me a beer 🍺: BTC 14NvJxpQsxs4EK8MTq2rubTDwuy54uCesu

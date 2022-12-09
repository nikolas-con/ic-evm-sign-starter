## Overview

This is an example project of [ic-evm-sign](https://github.com/nikolas-con/ic-evm-sign), a library that signs EVM transactions on the Internet Computer. 

The project consists of:
- A react frontend located in `src/frontend` (build with Create React App and React 18).
- A backend canister located in `src/backend` (build with Rust and `ic_cdk`).
- A hardhat node for local testing with config at `hardhat.config.js`.

## Get Started

Install dependencies:
```sh
npm i
```

Run in development:
```sh
npm run start
```

Then head to `http://localhost:3000`.

## Production

Deploy backend:
```sh
dfx deploy --network ic backend --argument '(opt variant { Production } )'
```

Then create `src/frontend/.env.production` with the backend canister id. Similar to `src/frontend/.env.production.sample`.

Deploy frontend:
```sh
npm run build:frontend
dfx deploy --network ic frontend
```

**Note:** The `npm start` script above starts 1) a local Internet Computer replica 2) a local hardhat node and 3) the React frontend of the project. After starting the IC replica it deploys the canister code and an Internet Identity canister for local authentication.


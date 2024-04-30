# Polkadot dApps

A collection of dApps to interact with the Polkadot ecosystem.

## Testing

For testing, we use [`Chopsticks`](https://github.com/AcalaNetwork/chopsticks).

```bash
npx @acala-network/chopsticks xcm -r westend.yaml -p westend-asset-hub.yaml
```

You can then go to [`Polkadot JS Apps`](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A8000#/explorer) to start experimenting.

## Usage

Those templates dependencies are maintained via [pnpm](https://pnpm.io) via `pnpm up -Lri`.

This is the reason you see a `pnpm-lock.yaml`. That being said, any package manager will work. This file can be safely be removed once you clone a template.

```bash
$ npm install # or pnpm install or yarn install
```

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

### `npm run dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)

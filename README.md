# Unicove 2.0

![inspiration](https://i.ibb.co/2nbtvms/image-1.png)

## Development

Running Unicove in development mode leverages `make` and `bun`. To setup a local development environment, clone this repository and perform the following actions.

#### Install dependencies

Run `make install` to install the same version of the dependencies used in production builds (or `bun install --frozen-lockfile`).

#### Run Unicove

Run `make dev` to start a local development environment running at:

http://localhost:5173

#### Formatting + Linting

The `make check` command will run through Svelte checks, eslint, and prettier. All PRs submitted against the repository will also automatically run these checks to ensure functionality and consistent code formatting.

#### Local Configuration

The `.env` file contains the default configuration for Unicove running the Jungle 4 testnet. This file shouldn't be modified for local changes, and instead a `.env.development` file should be created to selectively override the defaults in the `.env`.

A number of complete chain configurations are available in the `./configs` directory. These configs can be loaded in using one of the Makefile config commands (e.g. `make config/vaulta`). This will copy the configuration for a specific chain and paste it into `.env.local` to override the defaults in the `.env` file.

Available configuration commands:

```
make config/jungle4
make config/kylin
make config/telos
make config/telostestnet
make config/vaulta
make config/wax
make config/waxtestnet
```

With Unicove running, the current configuration can be viewed in the Debug State section:

http://localhost:5173/debug/state/config

![banner](public/banner.png)

# Gantries: ERP rates at a glance

Get the prices of [Singapore's Electronic Road Pricing (ERP)](https://en.wikipedia.org/wiki/Electronic_Road_Pricing) gantries, based on the time and your vehicle type.

## Tech overview

- React app written entirely in TypeScript that runs without a backend.
- Data is periodically fetched, processed and added to a custom Mapbox style using GitHub Actions.
- Playwright is used for E2E tests and cross-platform snapshots are generated using GitHub Actions.

## Usage

Create a `.env` file in the root directory:

```
DATAMALL_ACCOUNT_KEY=$datamall_key
REACT_APP_MAPBOX_ACCESS_TOKEN=$mapbox_access_token
```

Refer to [LTA's DataMall website](https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html) to get an account key

Refer to [Mapbox's website](https://docs.mapbox.com/help/getting-started/access-tokens) to get an access token

### Running on Windows

Because `cross-env` does not support [command substitution](https://github.com/kentcdodds/cross-env#windows-issues) out of the box, some additional setup is needed.

1. Create a `.npmrc` file with the following content ([reference](https://github.com/kentcdodds/cross-env/issues/192#issuecomment-513341729)):

```
script-shell = "C:\\windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
```

2. Try running `npm start`. If you receive an error that "...cross-env.ps1 cannot be loaded because running scripts is disabled on this system", allow the running of scripts by opening a powershell (or terminal in vscode) and enter the following ([reference](https://stackoverflow.com/a/4038991)):

```
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Running `npm start` and `npm run build` should now work as expected.

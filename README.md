# NBM SB

## Deployment
This project uses `hardhat-deploy` to deploy the contract, upload metadata, and mint tokens. It has a dependency with ipfs.

First start by initializing ipfs with the test profile and run offline to avoid connecting to the external network. When running the daemon check the port the API server is listening on.

```
$ ipfs init --profile=test
$ ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
$ ipfs daemon --offline
```


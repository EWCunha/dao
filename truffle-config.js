const path = require("path")
const provider = require("@truffle/hdwallet-provider")
const secrets = require("./.secrets.json")

module.exports = {
  contracts_build_directory: path.join(__dirname, "frontend/src/contracts"),
  networks: {
    rinkeby: {
      provider: () => new provider(
        secrets.privateKeys,
        secrets.network.rinkeby.rpc
      ),
      network_id: secrets.network.rinkeby.id
    }
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.14",      // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },
};

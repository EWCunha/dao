const DAO = artifacts.require("DAO")

module.exports = function (deployer, network, accounts) {
    deployer.deploy(DAO, 365 * 24 * 60 * 60, 24 * 60 * 60, 66);
};
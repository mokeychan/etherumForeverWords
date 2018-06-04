var SimpleStorage = artifacts.require("./SimpleStorage.sol");
//var Words = artifacts.require("Words");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  //deployer.deploy(Words);
};

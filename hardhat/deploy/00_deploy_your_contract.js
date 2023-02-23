// deploy/00_deploy_your_contract.js

const { ethers } = require('hardhat');

const localChainId = '31337';

const sleep = (ms) =>
  new Promise((r) =>
    setTimeout(() => {
      // console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
      r();
    }, ms)
  );

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy('ZKVoting', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    log: true,
  });

  // Getting a previously deployed contract
  const ZKVoting = await ethers.getContract('ZKVoting', deployer);

  /*  await ZKVoting.setPurpose("Hello");
  
    To take ownership of ZKVoting using the ownable library uncomment next line and add the 
    address you want to be the owner. 
    // ZKVoting.transferOwnership(YOUR_ADDRESS_HERE);

    //const ZKVoting = await ethers.getContractAt('ZKVoting', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */

  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner();
  await deployerWallet.sendTransaction({
    to: '0x905cb00659B503af942421B75918Ceda47D2798f',
    value: ethers.utils.parseEther('0.1'),
  });
  await deployerWallet.sendTransaction({
    to: '0x16a60E8152B0453509E7714455CAD1dc103edAA9',
    value: ethers.utils.parseEther('0.1'),
  });

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const ZKVoting = await deploy("ZKVoting", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const ZKVoting = await deploy("ZKVoting", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */

  // Verify your contracts with Etherscan
  // You don't want to verify on localhost
  if (chainId !== localChainId) {
    // wait for etherscan to be ready to verify
    await sleep(15000);
    await run('verify:verify', {
      address: ZKVoting.address,
      contract: 'contracts/ZKVoting.sol:ZKVoting',
      contractArguments: [],
    });
  }
};
module.exports.tags = ['ZKVoting'];

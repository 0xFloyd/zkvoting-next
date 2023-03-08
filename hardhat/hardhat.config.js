require('dotenv').config();
const { utils } = require('ethers');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const resolve = require('resolve');
const { TASK_CIRCOM_TEMPLATE } = require('hardhat-circom');
const { subtask } = require('hardhat/config');

require('@nomiclabs/hardhat-waffle');
require('@tenderly/hardhat-tenderly');

require('hardhat-deploy');
require('hardhat-circom');
require('hardhat-gas-reporter');

require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');

const { isAddress, getAddress, formatUnits, parseUnits } = utils;

const defaultNetwork = 'localhost';

const mainnetGwei = 21;

const GOERLI_ALCHEMY_KEY = process.env.GOERLI_ALCHEMY_KEY;

function mnemonic() {
  try {
    return fs.readFileSync('./mnemonic.txt').toString().trim();
  } catch (e) {
    if (defaultNetwork !== 'localhost') {
      console.log(
        '☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`.'
      );
    }
  }
  return '';
}

function circuits() {
  try {
    const circuitNames = fs
      .readdirSync('./circuits/', { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    let circuits = [];

    circuitNames.forEach((name, index) => {
      circuits[index] = {
        name: name,
        circuit: `${name}/circuit.circom`,
        input: `${name}/input.json`,
        wasm: `${name}.wasm`,
        r1cs: `${name}.r1cs`,
        zkey: `${name}.zkey`,
      };
    });

    return circuits;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  defaultNetwork,

  networks: {
    // hardhat: {
    //   mining: {
    //     auto: false,
    //     interval: 5000,
    //   },
    // },
    localhost: {
      url: 'http://localhost:8545',
      // mining: {
      //   auto: false,
      //   interval: 5000,
      // },
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${GOERLI_ALCHEMY_KEY}`,

      accounts: [`${process.env.GOERLI_DEPLOYER_PRIVATE_KEY}`],
    },

    mainnet: {
      url: 'https://mainnet.infura.io/v3/<API_KEY>',

      gasPrice: mainnetGwei * 1000000000,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.11',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.7',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  ovm: {
    solcVersion: '0.7.6',
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: 'DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW',
  },
  circom: {
    inputBasePath: './circuits/',
    outputBasePath: './client/',
    ptau: 'powersOfTau28_hez_final_15.ptau',
    circuits: circuits(),
  },
};

const DEBUG = false;

function debug(text) {
  if (DEBUG) {
    console.log(text);
  }
}

// async function circomTemplate({ zkeys }, hre) {
//   const snarkjsTemplate = resolve.sync("snarkjs/templates/verifier_groth16.sol");
//
//   for (const zkey of zkeys) {
//     const verifierSol = await hre.snarkjs.zKey.exportSolidityVerifier(zkey, snarkjsTemplate);
//     const verifierPath = path.join(hre.config.paths.sources, `${zkey.name.charAt(0).toUpperCase() + zkey.name.slice(1)}Verifier.sol`);
//     fs.writeFileSync(verifierPath, verifierSol);
//   }
// }

async function circomTemplate({ zkeys }, hre) {
  const verifierTemplatePath = resolve.sync('hardhat-circom/src/Verifier.sol.template');

  let finalSol = '';
  for (const zkey of zkeys) {
    const userTemplate = `
    function ${zkey.name}VerifyingKey() internal pure returns (VerifyingKey memory vk) {
      vk.alfa1 = Pairing.G1Point(<%vk_alpha1%>);
      vk.beta2 = Pairing.G2Point(<%vk_beta2%>);
      vk.gamma2 = Pairing.G2Point(<%vk_gamma2%>);
      vk.delta2 = Pairing.G2Point(<%vk_delta2%>);
      vk.IC = new Pairing.G1Point[](<%vk_ic_length%>);
    <%vk_ic_pts%>
    }

    function verify${zkey.name.charAt(0).toUpperCase() + zkey.name.slice(1)}Proof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[<%vk_input_length%>] memory input
    ) internal view returns (bool) {
        uint256[] memory inputValues = new uint256[](input.length);
        for (uint256 i = 0; i < input.length; i++) {
            inputValues[i] = input[i];
        }
        return verifyProof(a, b, c, inputValues, ${zkey.name}VerifyingKey());
    }
    `;

    // strings are opened as relative path files, so turn into an array of bytes
    const circuitSol = await snarkjs.zKey.exportSolidityVerifier(zkey, new TextEncoder().encode(userTemplate));

    finalSol = finalSol.concat(circuitSol);
  }

  const verifier = path.join(hre.config.paths.sources, 'Verifier.sol');

  const warning = '// THIS FILE IS GENERATED BY HARDHAT-CIRCOM. DO NOT EDIT THIS FILE.\n\n';
  const template = warning + fs.readFileSync(verifierTemplatePath).toString();

  fs.mkdirSync(path.dirname(verifier), { recursive: true });

  fs.writeFileSync(verifier, template.replace(/<%full_circuit%>/g, finalSol));
}

subtask(TASK_CIRCOM_TEMPLATE, 'generate Verifier template shipped by SnarkjS').setAction(circomTemplate);

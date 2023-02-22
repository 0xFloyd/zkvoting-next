import { poseidon } from "circomlibjs";

const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const newMemEmptyTrie = require("circomlibjs").newMemEmptyTrie;
const snarkjs = require("snarkjs");

use(solidity);

describe("My Dapp", function () {
  let myContract;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("ZKVoting", function () {
    it("Should deploy ZKVoting", async function () {
      const ZKVoting = await ethers.getContractFactory("ZKVoting");

      myContract = await ZKVoting.deploy();
    });

    describe("addLeaf()", async function () {
      const tree = await newMemEmptyTrie();
      let secretPairs = [];
      let hashes = [];

      it("Should add a value to the tree", async function () {
        secretPairs.push([1, 1]);
        hashes.push(poseidon([secretPairs[0]]));
      });

      // it("Should be able to set a new purpose", async function () {
      //   const newPurpose = "Test Purpose";
      //
      //   await myContract.setPurpose(newPurpose);
      //   expect(await myContract.purpose()).to.equal(newPurpose);
      // });

      // Uncomment the event and emit lines in ZKVoting.sol to make this test pass

      /*it("Should emit a SetPurpose event ", async function () {
        const [owner] = await ethers.getSigners();

        const newPurpose = "Another Test Purpose";

        expect(await myContract.setPurpose(newPurpose)).to.
          emit(myContract, "SetPurpose").
            withArgs(owner.address, newPurpose);
      });*/
    });
  });
});

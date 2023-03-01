include "../../node_modules/circomlib/circuits/smt/smtverifier.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";

template proveInTree(nLevels) {
  signal input root; // current root of the merkle tree. only public signal - enforced with smart contract
  signal input voteId; //  ID for the proposal you would like to vote on
  signal private input key; // index at which we prove our secret resides
  signal private input secret; //  secret number that we do not want to reveal
  signal private input nullifier; // another secret number we use to hash our secret against
  signal private input siblings[nLevels + 1]; // array of the intermediate hashes up to the root of the merkle tree. This input is private as we do not want to reveal the path to our secret, that would give away our identity

  signal output voterHash; // unique hash used to make sure no one votes more than once

  signal value;

  component poseidon[2];

  poseidon[0] = Poseidon(2);
  poseidon[0].inputs[0] <== secret;
  poseidon[0].inputs[1] <== nullifier;
  value <== poseidon[0].out; // hash of our secret and nullifier signals

  poseidon[1] = Poseidon(3);
  poseidon[1].inputs[0] <== voteId;
  poseidon[1].inputs[1] <== key;
  poseidon[1].inputs[2] <== nullifier;
  voterHash <== poseidon[1].out;

  component tree = SMTVerifier(nLevels + 1);
  tree.enabled <== 1;
  tree.root <== root;
  for (var i=0; i<nLevels + 1; i++) tree.siblings[i] <== siblings[i];
  tree.oldKey <== 0;
  tree.oldValue <== 0;
  tree.isOld0 <== 0;
  tree.key <== key;
  tree.value <== value;
  tree.fnc <== 0;  // fnc:  0 -> VERIFY INCLUSION, 1 -> VERIFY NOT INCLUSION
}

// nLevels must be the same as the parameter in circuits/add2Tree/circuit.circom
component main = proveInTree(3);

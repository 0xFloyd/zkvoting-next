include "../../node_modules/circomlib/circuits/smt/smtprocessor.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template Add2Tree(nLevels) {
  signal input oldRoot; // should be defined in contract. the previous root of the merkle tree that will be updated
  signal input newKey;  // should be defined in contract. index at which secret is added to the merkle tree. The next key will be enforced by smart contract.
  signal input newValue; // value that will be recorded at the index defined above. It should be a hash of a secret and a nullifier. smart contract will record this value so merkle tree can be reconstructed
  signal input oldKey; //  index needed to reconstruct the merkle tree
  signal input oldValue; // value that has been recorded at the index defined above
  signal private input siblings[nLevels]; //  array of the intermediate hashes up to the root of the merkle tree. This input is private to save space, not out of necessity

  signal output outRoot; //  new root of the merkle tree calculated using the new values

  component rootIsZero = IsZero();
  rootIsZero.in <== oldRoot;

  component tree = SMTProcessor(nLevels);
  tree.oldRoot <== oldRoot;
  for (var i=0; i<nLevels; i++) tree.siblings[i] <== siblings[i];
  tree.oldKey <== oldKey;
  tree.oldValue <== oldValue;
  tree.isOld0 <== rootIsZero.out;
  tree.newKey <== newKey;
  tree.newValue <== newValue;
  tree.fnc[0] <== 1;
  tree.fnc[1] <== 0;

  outRoot <== tree.newRoot;
}


// Setting this param determines how many values our merkle tree may hold (2^nLevels)
// nLevels must be the same as the parameter in circuits/proveInTree/circuit.circom
component main = Add2Tree(3);
//component main = SMTProcessor(3);

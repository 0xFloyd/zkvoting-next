// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const snarkjs = require('snarkjs');
const crypto = require('crypto');

export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' });
}

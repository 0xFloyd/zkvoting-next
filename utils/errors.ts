// Clearer error messages from libraries like circomlibjs

const KEY_EXISTS = { error: 'Key already exists', result: 'Wallet already registered' };

const processErrors = (error) => {
  const errorReasonRegex = /reverted with reason string '(.+?)'/;
  const errorTwoReasonRegex = /execution reverted: (.+?),/;
  const match = errorReasonRegex.exec(error);
  const matchTwo = errorTwoReasonRegex.exec(error);

  let e = error;
  if (match && match[0]) {
    e = match[0];
  } else if (matchTwo && matchTwo[0]) {
    e = matchTwo[0];
  }

  switch (e) {
    case KEY_EXISTS.error:
      return KEY_EXISTS.result;
    default:
      return e;
  }
};

export { processErrors };

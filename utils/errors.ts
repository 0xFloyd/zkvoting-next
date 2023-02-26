// Clearer error messages from libraries like circomlibjs

const KEY_EXISTS = { error: 'Key already exists', result: 'Wallet already registered' };

const processErrors = (error) => {
  console.log('processErrors switch error: ', error);
  switch (error) {
    case KEY_EXISTS.error:
      return KEY_EXISTS.result;
    default:
      return error;
  }
};

export { processErrors };

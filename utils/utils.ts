const parseSolidityCalldata = (prf, sgn) => {
  let calldata = [
    [prf.pi_a[0], prf.pi_a[1]],
    [
      [prf.pi_b[0][1], prf.pi_b[0][0]],
      [prf.pi_b[1][1], prf.pi_b[1][0]],
    ],
    [prf.pi_c[0], prf.pi_c[1]],
    [...sgn],
  ];

  return calldata;
};

const trimString = (string) => {
  return string.substring(0, 150);
};

const convertDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const dateString = `${date.getMonth() + 1}/${date.getDate()}/${year} ${formattedHours}:${formattedMinutes} ${ampm}`;
  return dateString;
};

export { parseSolidityCalldata, trimString, convertDate };

export const numberToUsd = (num) => {
  if (num === null || num === undefined || num === '') return '$?';

  const n = typeof num === 'number' ? num : Number(num);
  if (!Number.isFinite(n)) return '$?';

  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const msToMinutesSeconds = (millis) => {
  let seconds = parseInt(((millis % 60000) / 1000).toFixed(0));
  let minutes = Math.floor(millis / 60000);
  if (seconds === 60) {
    minutes += 1;
    seconds = 0;
  }
  return (
    (minutes < 10 ? '0' : '') +
    minutes +
    ':' +
    (seconds < 10 ? '0' : '') +
    seconds
  );
};

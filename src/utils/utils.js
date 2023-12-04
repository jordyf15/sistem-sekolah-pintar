export const formatDateToString = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  return `${day}/${month}/${year} ${hour < 10 ? "0" : ""}${hour}:${
    minute < 10 ? "0" : ""
  }${minute}`;
};

export const splitArrayIntoChunks = (arr, chunkSize) => {
  return arr.reduce((chunk, item, idx) => {
    const chunkIdx = Math.floor(idx / chunkSize);

    if (!chunk[chunkIdx]) {
      chunk[chunkIdx] = [];
    }

    chunk[chunkIdx].push(item);

    return chunk;
  }, []);
};

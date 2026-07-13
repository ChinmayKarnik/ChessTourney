const realDateNow = Date.now.bind(Date);

export const simulateNow = (targetTime: number) => {
  const offset = targetTime - realDateNow();
  Date.now = () => realDateNow() + offset;
};

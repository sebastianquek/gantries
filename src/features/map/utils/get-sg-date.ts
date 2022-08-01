export const getSGDate = () => {
  const date = new Date();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    dateStyle: "short",
  }).format(date);
};

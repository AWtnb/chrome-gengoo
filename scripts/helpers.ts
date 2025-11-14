export const toHalfWidth = (str: string): string => {
  return str.replace(/[０-９Ａ-Ｚａ-ｚ]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  });
};

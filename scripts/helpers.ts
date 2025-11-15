const toHalfWidth = (str: string): string => {
  return str.replace(/[０-９Ａ-Ｚａ-ｚ]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  });
};

const JNum: Record<string, string> = {
  一: "1",
  二: "2",
  三: "3",
  四: "4",
  五: "5",
  六: "6",
  七: "7",
  八: "8",
  九: "9",
  〇: "0",
};

const sanitize = (s: string): string => {
  return (toHalfWidth(s) + "年")
    .replace(/年{2}/, "年")
    .replace("元年", "1年")
    .replace(/十./g, (s) => {
      const last = s.slice(-1);
      if ("一二三四五六七八九".indexOf(last) != -1) {
        return last;
      }
      return s;
    })
    .replace(/一二三四五六七八九〇/g, (s) => {
      return JNum[s] || s;
    });
};

type YearMode = "annodomini" | "gengo";

export const checkMode = (s: string): YearMode | null => {
  s = sanitize(s);
  if (/^[0-9]{4}年/.test(s)) {
    return "annodomini";
  }
  if (/^(明治?|大正?|昭和?|平成?|令和?)[0-9]{1,2}年/.test(s)) {
    return "gengo";
  }
  if (/^[MTSHR][0-9]{1,2}年/.test(s)) {
    return "gengo";
  }
  return null;
};

const fromAnnoDomini = (s: string): string => {
  // TODO: 西暦から和暦に変換。各暦の元年は併記する。
  return s;
};

const fromGengo = (s: string): string => {
  const f = s.substring(0, 1);
  const yy = s.replace(/[^0-9]/g, "");
  const ad = (() => {
    if (f == "明" || f == "M") return 1867;
    if (f == "大" || f == "T") return 1911;
    if (f == "昭" || f == "S") return 1925;
    if (f == "平" || f == "H") return 1988;
    return 2018;
  })();
  return `${ad + Number(yy)}年`;
};

export const convert = (s: string, mode: YearMode): string => {
  s = sanitize(s);
  if (mode == "annodomini") {
    return fromAnnoDomini(s);
  }
  return fromGengo(s);
};

const toHalfWidth = (str: string): string => {
  return str.replace(/[０-９Ａ-Ｚａ-ｚ]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  });
};

const KanjiNum: Record<string, string> = {
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

const toArabic = (s: string): string => {
  const ten = "十";
  return s.replace(/[〇一二三四五六七八九十]+/g, (m) => {
    if (m === ten) {
      return "10";
    }
    if (m.startsWith(ten)) {
      return toArabic(`1${m.slice(1)}`);
    }
    if (m.endsWith(ten)) {
      return toArabic(`${m.slice(0, -1)}0`);
    }
    return m.replace(/十/g, "").replace(/[〇一二三四五六七八九]/g, (c) => {
      return KanjiNum[c] || c;
    });
  });
};

const sanitize = (s: string): string => {
  const f = (toHalfWidth(s) + "年").replace(/年{2}/, "年").replace(/年.+/, "年").replace("元年", "1年");
  return toArabic(f);
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
  const y = Number(s.replace(/[^0-9]/g, ""));
  const r1 = 2019;
  if (r1 <= y) {
    const g = "令和";
    if (y == r1) return g + "元年（～4月30日：平成31年）";
    return `${g}${y - r1 + 1}年`;
  }
  const h1 = 1989;
  if (h1 <= y) {
    const g = "平成";
    if (y == h1) return g + "元年（～1月7日：昭和64年）";
    return `${g}${y - h1 + 1}年`;
  }
  const s1 = 1926;
  if (s1 <= y) {
    const g = "昭和";
    if (y == s1) return g + "元年（～12月25日：大正15年）";
    return `${g}${y - s1 + 1}年`;
  }
  const t1 = 1912;
  if (t1 <= y) {
    const g = "大正";
    if (y == t1) return g + "元年（～7月30日：明治45年）";
    return `${g}${y - t1 + 1}年`;
  }
  const m1 = 1868;
  if (m1 <= y) {
    const g = "明治";
    if (y == m1) return g + "元年（～9月7日：慶応4年）";
    return `${g}${y - m1 + 1}年`;
  }
  return s;
};

const fromGengo = (s: string): string => {
  const ad = (() => {
    const g = s.substring(0, 1);
    if (g == "明" || g == "M") return 1867;
    if (g == "大" || g == "T") return 1911;
    if (g == "昭" || g == "S") return 1925;
    if (g == "平" || g == "H") return 1988;
    return 2018;
  })();
  const y = Number(s.replace(/[^0-9]/g, ""));
  return `${ad + y}年`;
};

export const convert = (s: string, mode: YearMode): string => {
  s = sanitize(s);
  console.log(checkMode(s));
  if (mode == "annodomini") {
    return fromAnnoDomini(s);
  }
  return fromGengo(s);
};

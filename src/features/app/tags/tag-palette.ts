export const tagPalette = {
  "emerald": {
    "surface": "#D6F0E2",
    "text": "#145742",
    "dot": "#16875D"
  },
  "cobalt": {
    "surface": "#E2EAFF",
    "text": "#283C84",
    "dot": "#436ADF"
  },
  "violet": {
    "surface": "#EEE5FF",
    "text": "#54278A",
    "dot": "#8052C8"
  },
  "raspberry": {
    "surface": "#FFE3EF",
    "text": "#851F51",
    "dot": "#CF4681"
  },
  "sunset": {
    "surface": "#FFE6D9",
    "text": "#823913",
    "dot": "#DB682B"
  },
  "ochre": {
    "surface": "#F9EAC2",
    "text": "#664A13",
    "dot": "#A27410"
  },
  "teal": {
    "surface": "#D5F1F3",
    "text": "#10565E",
    "dot": "#198391"
  },
  "slate": {
    "surface": "#E3EBEA",
    "text": "#384E4C",
    "dot": "#607570"
  },
  "ruby": {
    "surface": "#FAE2E0",
    "text": "#843831",
    "dot": "#B94F45"
  },
  "olive": {
    "surface": "#EDF1CF",
    "text": "#45521C",
    "dot": "#6C822D"
  },
  "sky": {
    "surface": "#DDF0FB",
    "text": "#195371",
    "dot": "#2A85AC"
  },
  "plum": {
    "surface": "#F2E2EF",
    "text": "#642450",
    "dot": "#9B5488"
  },
  "brown": {
    "surface": "#F0E8DF",
    "text": "#654B33",
    "dot": "#9D7452"
  },
  "graphite": {
    "surface": "#E6E8EB",
    "text": "#384147",
    "dot": "#626C73"
  },
  "leaf": {
    "surface": "#E3F4D9",
    "text": "#315C26",
    "dot": "#5A9948"
  },
  "indigo": {
    "surface": "#E4E4FC",
    "text": "#392D75",
    "dot": "#6858B2"
  }
} as const;

export function tagStyle(color: string) {
  const palette = Object.values(tagPalette).find((item) => item.dot.toLowerCase() === color.toLowerCase());
  return { backgroundColor: palette?.surface ?? "#E8F2EC", color: palette?.text ?? "#112D25" };
}

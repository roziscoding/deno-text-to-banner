import { getLongestLine, getTotalLinesHeight, measureText } from "./math.ts";

export function breakText(
  text: string,
  fontData: Uint8Array,
  fontSize: number,
  maxTextWidth: number,
  noWrap: boolean,
) {
  if (text.includes("\n")) {
    return text.split("\n");
  }

  if (noWrap) return [text];

  const measure = (text: string) =>
    measureText(text, {
      fontData,
      fontSize,
    });

  if (measure(text).width <= maxTextWidth) return [text];

  const lines: string[] = [];
  let line = [] as string[];

  const splitText = text.split(" ");
  let usedWords = 0;

  for (const word of splitText) {
    const lineWidth = measure(line.concat([word]).join(" ")).width;

    if (lineWidth > maxTextWidth) {
      usedWords += line.length;
      lines.push(line.join(" "));
      line = [word];
      continue;
    }
    line.push(word);
  }

  return lines.concat([splitText.slice(usedWords).join(" ")]);
}

export function getFontSize(
  text: string,
  font: Uint8Array,
  initialFontSize: number,
  maxTextHeight: number,
  maxTextWidth: number,
  noWrap: boolean,
) {
  let fontSize = initialFontSize;

  const fits = () => {
    const brokenText = breakText(text, font, fontSize, maxTextWidth, noWrap);

    const height = getTotalLinesHeight(
      brokenText,
      { fontData: font, fontSize },
    );

    const width = getLongestLine(brokenText, { fontData: font, fontSize });

    return height <= maxTextHeight && width <= maxTextWidth;
  };

  while (!fits()) {
    fontSize -= 5;
  }

  return fontSize;
}

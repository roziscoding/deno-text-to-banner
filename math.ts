import CanvasKit from "https://deno.land/x/canvas@v1.4.1/mod.ts";

type FontInfo = { fontData: Uint8Array; fontSize: number };

function getParagraph(
  text: string,
  fontInfo: FontInfo,
) {
  const { fontData, fontSize } = fontInfo;
  const fontMgr = CanvasKit.FontMgr.FromData(fontData);

  if (fontMgr === null) throw new Error("idk why but fontMgr is null");

  const paraStyle = new CanvasKit.ParagraphStyle({
    textStyle: {
      color: CanvasKit.BLACK,
      fontFamilies: [fontMgr.getFamilyName(0)],
      fontSize,
    },
  });

  const builder = CanvasKit.ParagraphBuilder.Make(paraStyle, fontMgr);
  builder.addText(text);
  const paragraph = builder.build();
  paragraph.layout(Infinity);

  return [paragraph, () => {
    paragraph.delete();
    fontMgr.delete();
  }] as const;
}

export function measureText(
  text: string,
  fontInfo: FontInfo,
) {
  const [paragraph, destroy] = getParagraph(text, fontInfo);

  const height = paragraph.getLineMetrics()[0].ascent - 5;
  const width = paragraph.getLongestLine();

  const metrics = { width, height };

  destroy();

  return metrics;
}

export function getLongestLine(
  lines: string[],
  fontInfo: FontInfo,
) {
  const text = lines.join("\n").trim();
  const [paragraph, destroy] = getParagraph(text, fontInfo);

  const longestLine = paragraph.getLongestLine();

  destroy();

  return longestLine;
}

export function getTotalLinesHeight(
  lines: string[],
  fontInfo: FontInfo,
) {
  const text = lines.join("\n").trim();
  const [paragraph, destroy] = getParagraph(text, fontInfo);

  const height = paragraph.getLineMetrics().map((line) => line.ascent).reduce((sum, current) => sum + current);

  destroy();

  return height;
}

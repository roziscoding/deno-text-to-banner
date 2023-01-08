import {
  CanvasRenderingContext2D,
  createCanvas,
  EmulatedCanvas2D,
  loadImage,
} from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { Options } from "./options.ts";
import { breakText, getFontSize } from "./text.ts";
import { getTotalLinesHeight, measureText } from "./math.ts";

export function prepareCanvas(width: number, height: number) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return { canvas, ctx };
}

export async function drawBackground(
  backgroundUrl: string | null,
  canvas: EmulatedCanvas2D,
  ctx: CanvasRenderingContext2D,
) {
  if (!backgroundUrl) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const background = await loadImage(
    new URL(backgroundUrl).toString(),
  );

  ctx.drawImage(
    background,
    0,
    0,
    canvas.width,
    background.height() * (canvas.width / background.width()),
  );
}

function drawLines(
  lines: string[],
  params: Options & {
    ctx: CanvasRenderingContext2D;
    fontSize: number;
    font: Uint8Array;
  },
) {
  const { debug, ctx, canvasHeight, canvasWidth, font, fontSize } = params;

  const measure = (text: string, fontSize: number) =>
    measureText(text, {
      fontData: font,
      fontSize,
    });

  let baseline = (canvasHeight - getTotalLinesHeight(lines, { fontData: font, fontSize })) / 2;
  let heightOffset = 0;

  ctx.fillStyle = "white";
  ctx.font = `${fontSize}px Default`;

  for (const line of lines) {
    const measurements = measure(line, fontSize);
    const { width, height } = measurements;

    const x = (canvasWidth - width) / 2;

    baseline += height + heightOffset;
    heightOffset = 10;

    ctx.fillText(line, x, baseline);

    if (debug) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(x, baseline - height, width, height);
    }
  }
}

export function drawText(
  canvas: EmulatedCanvas2D,
  ctx: CanvasRenderingContext2D,
  font: Uint8Array,
  options: Options,
) {
  const {
    text,
    initialFontSize,
    debug = false,
    canvasHeight,
    canvasWidth,
    hPadding,
    wPadding,
    nowrap,
  } = options;

  const maxTextHeight = canvasHeight - hPadding;
  const maxTextWidth = canvasWidth - wPadding;

  const fontSize = getFontSize(
    text,
    font,
    initialFontSize,
    maxTextHeight,
    maxTextWidth,
    nowrap,
  );

  const lines = breakText(text, font, fontSize, maxTextWidth, nowrap);

  drawLines(lines, { ...options, ctx, fontSize, font });

  if (debug) {
    ctx.font = "15px Default";
    const debugText = JSON.stringify({ fontSize, lines: lines.length });
    ctx.fillText(
      debugText,
      canvas.width - 10 -
        measureText(debugText, { fontData: font, fontSize: 15 }).width,
      canvas.height - 20,
    );
  }
}

function drawDebugInfo(canvas: EmulatedCanvas2D, ctx: CanvasRenderingContext2D, options: Options) {
  ctx.strokeStyle = "red";

  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);

  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);

  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "12px Default";
  const { debug: _, text: _text, ...toDraw } = options;
  ctx.fillText(JSON.stringify(toDraw), 20, 20);
}

export async function textToImage(options: Options) {
  const {
    backgroundUrl,
    canvasHeight,
    canvasWidth,
    debug,
  } = options;

  const { canvas, ctx } = await prepareCanvas(canvasWidth, canvasHeight);

  const font = options.font || await Deno.readFile("./font.otf");

  canvas.loadFont(font, {
    family: "Default",
    style: "normal",
    weight: "normal",
    variant: "normal",
  });

  await drawBackground(backgroundUrl, canvas, ctx);

  drawText(
    canvas,
    ctx,
    font,
    options,
  );

  if (debug) drawDebugInfo(canvas, ctx, options);

  return canvas.toBuffer();
}

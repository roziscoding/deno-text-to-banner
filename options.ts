export const DEFAULT_CANVAS_HEIGHT = 630;
export const DEFAULT_CANVAS_WIDTH = 1200;
export const DEFAULT_PADDING = 200;

export const DEFAULT_FONT_SIZE = 100;
export const DEFAULT_TEXT = `
Accepted query params:
 
text(string): the text to be rendered
background(string): url of the background image
w(int): image width
h(int): image height
wpadding(int): width padding
hpadding(int): height padding
fontsize(int): initial font size
nowrap(boolean): prevent line wraps
`.trim();

const enrichSearchParams = (searchParams: URLSearchParams) => {
  const getString = (
    name: string | string[],
    defaultValue: string,
  ) =>
    [name].flat().reduce(
      (value, name) => value ?? searchParams.get(name),
      null as null | string,
    ) ?? defaultValue;

  const getInt = (name: string | string[], defaultValue: number) => Number(getString(name, `${defaultValue}`));

  const getBoolean = (name: string | string[], defaultValue: boolean) => {
    const value = getString(name, `${defaultValue}`);

    switch (value) {
      case "true":
        return true;
      case "false":
        return false;
      default:
        return defaultValue;
    }
  };

  const getDecoded = (name: string | string[], defaultValue: string) =>
    decodeURIComponent(getString(name, defaultValue));

  return {
    getString,
    getInt,
    getBoolean,
    getDecoded,
  };
};

export function getOptions(url: string) {
  const params = enrichSearchParams(new URL(url).searchParams);

  const text = params.getDecoded("text", DEFAULT_TEXT);
  const backgroundUrl = params.getDecoded("background", "");

  const debug = params.getBoolean("debug", false);
  const nowrap = params.getBoolean("nowrap", false);

  const canvasWidth = params.getInt(["w", "width"], DEFAULT_CANVAS_WIDTH);
  const canvasHeight = params.getInt(["h", "height"], DEFAULT_CANVAS_HEIGHT);
  const hPadding = params.getInt("hpadding", DEFAULT_PADDING);
  const wPadding = params.getInt("wpadding", DEFAULT_PADDING);
  const initialFontSize = params.getInt("fontsize", DEFAULT_FONT_SIZE);

  return {
    text,
    backgroundUrl,
    debug,
    canvasWidth,
    canvasHeight,
    wPadding,
    hPadding,
    initialFontSize,
    nowrap,
  };
}

export type Options = ReturnType<typeof getOptions>;

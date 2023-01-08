import { serve } from "https://deno.land/std@0.171.0/http/mod.ts";
import { textToImage } from "./canvas.ts";
import { getOptions } from "./options.ts";

serve(async (req) => {
  console.log(req.url);
  if (req.url.includes("favicon")) return new Response(null, { status: 404 });
  const options = getOptions(req.url);
  const image = await textToImage(options);

  return new Response(image, { headers: { "Cache-Control": "max-age=31536000, immutable", "Content-Type": "image/png" } });
});

# Nano Banana Pro — Gemini Image Generation Reference

## ⚠️ ALWAYS USE: `gemini-3-pro-image-preview`
Do NOT use `gemini-2.5-flash-image`. We exclusively use Nano Banana Pro for all image generation.

## Models

| Name | Model ID | Best For |
|---|---|---|
| ~~Nano Banana (Flash)~~ | ~~`gemini-2.5-flash-image`~~ | ~~Speed, high-volume~~ **DO NOT USE** |
| **Nano Banana Pro** ✅ | `gemini-3-pro-image-preview` | Professional assets, complex instructions, high-fidelity text |

## Key Differences

### Nano Banana (Flash)
- Best with up to **3 input images**
- Fixed **1290 tokens** per output image regardless of aspect ratio
- Max resolution ~1344px on longest side
- No thinking mode, no Google Search grounding, no resolution control

### Nano Banana Pro
- Up to **14 reference images** (6 objects + 5 humans)
- **1K / 2K / 4K** output resolutions (use uppercase K: `"2K"` not `"2k"`)
- **Thinking mode** enabled by default (cannot disable) — generates up to 2 interim "thought images"
- **Google Search grounding** for real-time data (weather, scores, events)
- **Thought signatures** must be passed back in multi-turn conversations
- 1K/2K = 1120 tokens, 4K = 2000 tokens per image

## API Basics

### Endpoint
```
POST https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent
```

### Required Config for Image Output
```json
{
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"],
    "imageConfig": {
      "aspectRatio": "16:9",
      "imageSize": "2K"
    }
  }
}
```
- `responseModalities`: `["TEXT", "IMAGE"]` (default) or `["IMAGE"]` (image only)
- `imageSize`: Pro only — `"1K"`, `"2K"`, `"4K"` (uppercase K required)

### Aspect Ratios (both models)
`1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`

## Response Parsing

Response parts can be `text` or `inlineData` (base64 image). Always iterate all parts:

```javascript
for (const part of response.candidates[0].content.parts) {
  if (part.text) {
    console.log(part.text);
  } else if (part.inlineData) {
    const buffer = Buffer.from(part.inlineData.data, "base64");
    fs.writeFileSync("output.png", buffer);
  }
}
```

## Capabilities

### Text-to-Image
Send text prompt → get image back.

### Image Editing (Image+Text → Image)
Send base64 image + text instruction → get edited image.

### Multi-Turn Editing (Chat)
Use chat/conversation API to iterate. Each turn preserves context.
- Pro: thought signatures are auto-handled by SDK chat feature
- REST: must pass full conversation history including model's previous image responses

### Multi-Image Composition
- Flash: up to 3 input images
- Pro: up to 14 input images (6 objects + 5 humans for consistency)

### Google Search Grounding (Pro only)
```json
{ "tools": [{"google_search": {}}] }
```
Generates images based on real-time info. Image-based search results excluded from generation.

## Prompting Best Practices

### Core Principle
> **Describe the scene, don't just list keywords.** Narrative paragraphs > disconnected words.

### Strategies
1. **Be Hyper-Specific** — "ornate elven plate armor, etched with silver leaf patterns" > "fantasy armor"
2. **Provide Context & Intent** — explain the purpose ("logo for high-end skincare brand")
3. **Iterate & Refine** — use multi-turn: "make lighting warmer" / "change expression to serious"
4. **Step-by-Step for Complex Scenes** — "First create background... Then add... Finally place..."
5. **Semantic Negative Prompts** — "empty, deserted street" > "no cars"
6. **Control the Camera** — use photography terms: wide-angle, macro, low-angle, 85mm lens, bokeh

### Prompt Templates by Use Case

**Photorealistic:**
> A photorealistic [shot type] of [subject], [action], set in [environment]. Illuminated by [lighting], creating [mood]. Captured with [camera/lens]. [aspect ratio].

**Stickers/Icons:**
> A [style] sticker of [subject], featuring [characteristics] and [color palette]. [line style], [shading]. Background must be [white/transparent].

**Text in Images (use Pro):**
> Create a [image type] for [brand] with the text "[text]" in [font style]. [style description], [color scheme].

**Product Mockups:**
> Studio-lit product photograph of [product] on [surface]. [lighting setup]. [camera angle]. Ultra-realistic, sharp focus on [detail]. [aspect ratio].

**Minimalist/Negative Space:**
> Minimalist composition, single [subject] in [position]. Background: vast empty [color] canvas. Soft lighting. [aspect ratio].

**Sequential Art (use Pro):**
> Make a [N] panel comic in [style]. Put the character in [scene type].

**Style Transfer:**
> Transform the provided photograph into [art style]. Preserve composition, render with [stylistic elements].

**Inpainting:**
> Change only the [element] to [new description]. Keep everything else exactly the same.

**Multi-Image Composition:**
> Take [element from image 1] and [combine with element from image 2]. Final image should be [description].

**Character Consistency / 360:**
> A studio portrait of this [person] against [background], [angle/direction].

**Sketch to Photo (use Pro):**
> Turn this rough sketch into a polished [style]. Keep [features] but add [details].

## Limitations
- Best languages: EN, ar-EG, de-DE, es-MX, fr-FR, hi-IN, id-ID, it-IT, ja-JP, ko-KR, pt-BR, ru-RU, ua-UA, vi-VN, zh-CN
- No audio/video input
- Model may not match exact requested number of output images
- All generated images include SynthID watermark
- Flash: best with ≤3 input images
- Pro: 5 high-fidelity + up to 14 total

## Resolution Tables

### Flash (all 1290 tokens)
| Ratio | Resolution |
|---|---|
| 1:1 | 1024×1024 |
| 16:9 | 1344×768 |
| 9:16 | 768×1344 |

### Pro
| Ratio | 1K | 2K | 4K |
|---|---|---|---|
| 1:1 | 1024² | 2048² | 4096² |
| 16:9 | 1376×768 | 2752×1536 | 5504×3072 |
| 9:16 | 768×1376 | 1536×2752 | 3072×5504 |

1K/2K = 1120 tokens, 4K = 2000 tokens.

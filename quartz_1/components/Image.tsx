import { JSX } from "preact"

interface ImageProps {
  src: string
  alt?: string
  caption?: string
  width?: string
  height?: string
  aspectRatio?: string
  fit?: "cover" | "contain" | "fill" | "scale-down" | "none"
  position?: string
  align?: "left" | "center" | "right"
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl"
  zoom?: boolean
  class?: string
}

const roundedMap: Record<string, string> = {
  none: "0px",
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px",
  "3xl": "24px",
  full: "9999px",
}

const shadowMap: Record<string, string> = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.15)",
  md: "0 4px 12px rgba(0,0,0,0.2)",
  lg: "0 8px 24px rgba(0,0,0,0.25)",
  xl: "0 12px 32px rgba(0,0,0,0.3)",
  "2xl": "0 20px 48px rgba(0,0,0,0.35)",
}

export default function Image({
  src,
  alt = "",
  caption,
  width = "100%",
  height = "auto",
  aspectRatio = "auto",
  fit = "cover",
  position = "center",
  align = "center",
  rounded = "xl",
  shadow = "md",
  zoom = true,
  class: className = "",
}: ImageProps): JSX.Element {
  const alignStyle: Record<string, string> = {
    left: "margin: 0 auto 0 0",
    center: "margin: 0 auto",
    right: "margin: 0 0 0 auto",
  }

  const wrapperStyle = [`width: ${width}`, "max-width: 100%", alignStyle[align]].join("; ")

  const containerStyle = [
    height !== "auto" ? `height: ${height}` : "",
    aspectRatio !== "auto" ? `aspect-ratio: ${aspectRatio}` : "",
    `border-radius: ${roundedMap[rounded] ?? "12px"}`,
    `box-shadow: ${shadowMap[shadow] ?? shadowMap.md}`,
    "position: relative",
    "overflow: hidden",
    "background: rgba(0,0,0,0.05)",
    "border: 1px solid rgba(255,255,255,0.08)",
  ]
    .filter(Boolean)
    .join("; ")

  const imgStyle = [
    `object-fit: ${fit}`,
    `object-position: ${position}`,
    height !== "auto" || aspectRatio !== "auto"
      ? "position: absolute; inset: 0; width: 100%; height: 100%"
      : "width: 100%; height: auto",
    "display: block",
    "margin: 0; padding: 0",
    "transition: transform 0.7s ease",
  ].join("; ")

  return (
    <figure
      class={`quartz-image not-prose ${className}`}
      style={wrapperStyle}
      data-zoom={zoom ? "true" : "false"}
    >
      <div class="quartz-image-container" style={containerStyle}>
        <img src={src} alt={alt} style={imgStyle} loading="lazy" />
        <div class="quartz-image-overlay" />
      </div>
      {caption && <figcaption class="quartz-image-caption">{caption}</figcaption>}
    </figure>
  )
}

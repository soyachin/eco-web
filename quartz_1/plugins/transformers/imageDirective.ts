import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { visit } from "unist-util-visit"
import { PluggableList } from "unified"
// @ts-ignore
import remarkDirective from "remark-directive"

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

const alignStyle: Record<string, string> = {
  left: "margin: 0 auto 0 0",
  center: "margin: 0 auto",
  right: "margin: 0 0 0 auto",
}

export const ImageDirective: QuartzTransformerPlugin = () => {
  return {
    name: "ImageDirective",
    markdownPlugins() {
      const plugins: PluggableList = [remarkDirective]

      plugins.push(() => {
        return (tree: Root) => {
          visit(tree, "leafDirective", (node: any) => {
            if (node.name !== "image") return

            const data = node.data || (node.data = {})
            const attrs = node.attributes || {}

            const src = attrs.src || ""
            const alt = attrs.alt || ""
            const caption = attrs.caption || ""
            const width = attrs.width || "100%"
            const height = attrs.height || "auto"
            const aspectRatio = attrs["aspect-ratio"] || attrs.aspectRatio || "auto"
            const fit = attrs.fit || "cover"
            const position = attrs.position || "center"
            const align = attrs.align || "center"
            const rounded = attrs.rounded || "xl"
            const shadow = attrs.shadow || "md"
            const zoom = attrs.zoom !== undefined ? true : false

            const wrapperStyle = [
              `width: ${width}`,
              "max-width: 100%",
              alignStyle[align] || alignStyle.center,
            ].join("; ")

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

            const zoomAttr = zoom ? 'data-zoom="true"' : 'data-zoom="false"'

            let html = `<figure class="quartz-image not-prose" style="${wrapperStyle}" ${zoomAttr}>`
            html += `<div class="quartz-image-container" style="${containerStyle}">`
            html += `<img src="${src}" alt="${alt}" style="${imgStyle}" loading="lazy" />`
            html += `<div class="quartz-image-overlay"></div>`
            html += `</div>`
            if (caption) {
              html += `<figcaption class="quartz-image-caption">${caption}</figcaption>`
            }
            html += `</figure>`

            data.hName = "div"
            data.hProperties = {
              className: ["quartz-image-wrapper"],
            }
            // Replace the directive with raw HTML
            node.type = "html"
            node.value = html
          })
        }
      })

      return plugins
    },
  }
}

import * as prod from "react/jsx-runtime";
import rehypeParse from "rehype-parse";
import rehypeReact, { type Components } from "rehype-react";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { Root } from "hast";
import { slugify } from "@/utils/slugify";

interface ProcessorOptions {
  components?: Partial<Components>;
}

export function addIdsToHeadings() {
  return (tree: any) => {
    visit(tree, "element", (node) => {
      if (["h2", "h3", "h4"].includes(node.tagName)) {
        // 子要素が存在し、最初の子要素がテキストノードの場合のみ処理
        const text = node.children?.[0]?.type === "text" 
          ? node.children[0].value 
          : "";
        
        if (text) {
          node.properties = { 
            ...node.properties, 
            id: slugify(text) 
          };
        }
      }
    });
  };
}

export function wrapCodeBlock() {
  return (tree: any) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "pre") {
        const code = node.children?.[0];
        if (code?.tagName === "code") {
          const className = code.properties?.className?.[0] || "";
          const language = className.replace("language-", "");
          
          node.properties = {
            ...node.properties,
            "data-language": language,
          };
        }
      }
    });
  };
}

export function createProcessor({ components }: ProcessorOptions = {}) {
  return unified().use(rehypeParse, { fragment: true }).use(addIdsToHeadings).use(wrapCodeBlock).use(rehypeReact, {
    Fragment: prod.Fragment,
    jsx: prod.jsx,
    jsxs: prod.jsxs,
    components,
  });
}

import DOMPurify from "dompurify";
import truncate from "html-truncate";

export const processContent = (content, maxLength = null) => {
  if (!content) return "";

  // Create a temporary div to parse the HTML
  const div = document.createElement("div");
  div.innerHTML = DOMPurify.sanitize(content);

  // Fix existing links in the content
  div.querySelectorAll("a").forEach((link) => {
    let href = link.getAttribute("href");
    if (href && !href.startsWith("http://") && !href.startsWith("https://")) {
      link.href = `https://${href}`;
    }
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  // Process text nodes to convert URLs to links
  const processTextNode = (node) => {
    const urlRegex = /(?<=^|\s)((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?)/g;
    const text = node.textContent;
    const parts = text.split(urlRegex);

    if (parts.length > 1) {
      const span = document.createElement("span");
      let lastIndex = 0;

      text.replace(urlRegex, (match, url, offset) => {
        // Add text before the URL
        if (offset > lastIndex) {
          span.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
        }

        // Create the link
        const link = document.createElement("a");
        const href = url.startsWith("http") ? url : `https://${url}`;
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = url;
        span.appendChild(link);

        lastIndex = offset + match.length;
      });

      // Add remaining text
      if (lastIndex < text.length) {
        span.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      return span;
    }
    return node;
  };

  // Recursively process all text nodes
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const processedNode = processTextNode(node);
      if (processedNode !== node) {
        node.parentNode.replaceChild(processedNode, node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "A") {
      // Don't process text inside existing links
      Array.from(node.childNodes).forEach(processNode);
    }
  };

  Array.from(div.childNodes).forEach(processNode);

  // If maxLength is provided, truncate the content
  if (maxLength) {
    return truncate(div.innerHTML, maxLength);
  }

  return div.innerHTML;
};

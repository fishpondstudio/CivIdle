export function highlightElement(selector: string): () => void {
   const target = document.querySelector(selector);
   if (!target) {
      return () => {};
   }
   const rect = target.getBoundingClientRect();
   const element = document.createElement("div");
   element.className = "breathing";
   element.style.position = "absolute";
   element.style.top = `${rect.top}px`;
   element.style.left = `${rect.left}px`;
   element.style.width = `${rect.width}px`;
   element.style.height = `${rect.height}px`;
   element.style.backgroundColor = "#e74c3c";
   element.style.opacity = "0.5";
   element.style.pointerEvents = "none";
   document.body.appendChild(element);
   return () => {
      element.remove();
   };
}

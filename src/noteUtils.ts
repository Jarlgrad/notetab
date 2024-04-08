// Types and interfaces
export interface Note {
  id: string;
  content: string;
  date: string;
}

export const isMarkdown = (text: string): boolean => {
    const markdownPatterns = [/^#{1,6}\s/, /^\*\s/, /^-\s/, /^\+\s/, /\*\*/, /__/, /~~/, /\!\[.*\]\(.*\)/, /\[.*\]\(.*\)/];
    return markdownPatterns.some(pattern => pattern.test(text));
  };
  
export const isCursorAtTheEnd = (currentLine: string): boolean => {
    let selection = window.getSelection();
    if (!selection) return false; // Check if selection is null and return false if it is
    let range = selection.getRangeAt(0);
    let offset = range.endOffset;
        
    return offset === currentLine.length;
};

export const insertNewLine = (el: HTMLElement, isBulletList: boolean): void => {
    if (!el.innerHTML.endsWith("<div><br></div>") && !el.innerHTML.endsWith("<br>")) {
        if (isBulletList) { 
            el.innerHTML += "<div>*&nbsp;</div>" // Add a new line with an asterisk and space
        } else {
            el.innerHTML += "<div><br></div>"; 
        }
    }
};

export const placeCaretAtEnd = (el: HTMLElement): void => {
    el.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        if (sel) { // Check if sel is not null
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
};

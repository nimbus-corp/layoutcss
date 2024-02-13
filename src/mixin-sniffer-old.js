let htmlparser2 = require("htmlparser2");

const utilities = {
  "align-self": {},
  "bg-img": {
    "hasStaticPart": true,
    "hasQuote": true,
  },
  "flex-basis": {},
  "flex-grow": {},
  "flex-shrink": {},
  "font-size": {},
  "h": {},
  "hide-over": {},
  "hide-under": {},
  "line-height": {},
  "p": {},
  "pt": {},
  "pb": {},
  "pl": {},
  "pr": {},
  "px": {},
  "py": {},
  "p-recursive": {},
  "pt-recursive": {},
  "pb-recursive": {},
  "pl-recursive": {},
  "pr-recursive": {},
  "px-recursive": {},
  "py-recursive": {},
  "p-child": {},
  "pt-child": {},
  "pb-child": {},
  "pl-child": {},
  "pr-child": {},
  "px-child": {},
  "py-child": {},
  "ratio": {
    "hasStaticPart": true,
  },
  "relative": {},
  "w": {},
  "z-index": {},
};

const components = {
  "area-l": {
    "params": ["layout"],
  },
  "box-l": {
    "params": ["max-width", "grow"],
  },
  "center-l": {
    "params": ["max-width", "and-text", "recursive"],
  },
  "extender-l": {
    "params": ["screen", "keep-center", "keep-p", "keep-pl", "keep-pr"],
  },
  "grid-l": {
    "params": ["gap"],
    "group": ["min-cell-width", "min-cols", "max-cols", "gap"],
  },
  "icon-l": {
    "params": ["scale"],
    "group": ["gap", "gap-dir"],
  },
  "ledge-l": {
    "params": ["gap", "direction", "justify", "align", "nowrap", "twin-width"],
  },
  "outsider-l": {
    "params": ["position", "top", "bottom", "left", "right"],
  },
  "rack-l": {
    "params": ["height", "min-height", "max-height", "gap"],
  },
  "sidebar-l": {
    "params": ["shrink", "gap", "reverse"],
    "group": ["side", "side-width", "content-min"],
  },
  "slider-l": {
    "params": ["hide-bar", "item-width", "gap", "height"],
  },
  "stack-l": {
    "params": ["gap"],
  },
  "switcher-l": {
    "params": ["threshold", "limit", "gap", "reverse"],
  },
};

function generateMixins(text) {
  let mixinSet = new Set();
  let breakpointSet = new Set();
  const parser = new htmlparser2.Parser({
    onopentag(tagName, tagAttributes) {
      let isComponent = Object.keys(components).includes(tagName);

      for ([attrName, attrValue] of Object.entries(tagAttributes)) {
        // process utilities on tag
        if (Object.keys(utilities).includes(attrName)) {
          if (utilities[attrName].hasStaticPart) {
            mixinSet.add(`.${attrName}();`);
          }
          if (utilities[attrName].hasQuote) {
            attrValue = `"${attrValue}"`;
          }
          mixinSet.add(`.${attrName}(${attrValue});`);
        }
        // process the classic params from components (with and without attrValue)
        if (isComponent && components[tagName]["params"].includes(attrName)) {
          let args = attrValue ? `@${attrName}:${attrValue}` : "";
          mixinSet.add(`.${tagName}-${attrName}(${args});`);
        }

        else if (isComponent && attrName.includes(':')) {
          let breakpoint = attrName.slice(0, attrName.indexOf(':'))
          let attribute = attrName.slice(attrName.indexOf(':') + 1, attrName.length)
          let args = attrValue ? `@${attribute}:${attrValue}` : "";
          if (Object.keys(utilities).includes(attribute)) {
            if (utilities[attribute].hasStaticPart) {
              breakpointSet.add(`.${breakpoint}-utility-${attribute}();`);
            }
            if (utilities[attribute].hasQuote) {
              attrValue = `"${attrValue}"`;
            }
            breakpointSet.add(`.${breakpoint}-utility-${attribute}(${attrValue});`)
          }else{
            breakpointSet.add(`.${breakpoint}-${tagName}-${attribute}(${args});`)
          }
        }

      }

      if (isComponent) {
        // we call the empty mixin for the component
        mixinSet.add(`.${tagName}();`);
        // if the component has a group we process it here
        if (components[tagName]["group"]) {
          let args = components[tagName]["group"].map((x) => {
            if (tagAttributes[x]) {
              return `@${x}:${tagAttributes[x]}`;
            } else {
              return undefined;
            }
          }).filter(Boolean).join(","); // allows to ignore undefied values
          mixinSet.add(`.${tagName}-group(${args});`);
        }
      }
    },
  });
  parser.write(text);
  parser.end();
  return [mixinSet, breakpointSet];
}

module.exports = generateMixins;

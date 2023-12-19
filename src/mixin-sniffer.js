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
  "z-index": {},
};

const components = {
  "box-l": {
    "params": ["max-width"],
  },
  "center-l": {
    "params": ["max-width", "and-text", "recursive"],
  },
  "extender-l": {
    "params": ["screen"],
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
    "params": ["height", "min-height", "gap"],
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
  return mixinSet;
}

module.exports = generateMixins;

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
            if (tagAttributes.layout) {
                //separate each properties
                let properties = tagAttributes.layout.split(' ');
                //create a dict for groups attributes
                let groups = {};
                for (let property of properties) {
                    if (isComponent && components[tagName]["group"]) {
                        let groupProperty = property.split(":");
                        let attribute = groupProperty[0];
                        let value = groupProperty[1] ? groupProperty[1] : "";
                        attribute = attribute.split("@");
                        if (attribute.length == 1) {
                            groups[attribute[0]] = [value];
                        } else {
                            //we check if this attribute have already been added to the group dict and add the value
                            groups[`@${attribute[1]}`] ? groups[`@${attribute[1]}`].push([value, attribute[0]]) : groups[`@${attribute[1]}`] = [[value, attribute[0]]];
                        }

                    }
                    property = property.split("@");
                    // check for breakpoints
                    if (property.length == 1) {
                        property = property[0].split(':');
                        let attribute = property[0];
                        let value = property[1] ? property[1] : "";
                        //process utilities on tag
                        if (Object.keys(utilities).includes(attribute)) {
                            if (utilities[attribute].hasStaticPart) {
                                mixinSet.add(`.${attribute}();`);
                            }
                            if (utilities[attribute].hasQuote) {
                                value = `"${value}"`;
                            }
                            mixinSet.add(`.${attribute}(${value});`);
                        }
                        // process the classic params from components
                        if (isComponent && components[tagName]["params"].includes(attribute)) {
                            let args = property[1] ? `@${attribute}:${value}` : "";
                            mixinSet.add(`.${tagName}-${attribute}(${args});`);
                        }
                    } else {
                        let breakpoint = property[0];
                        property = property[1].split(':');
                        let attribute = property[0];
                        let value = property[1] ? property[1] : '';
                        let args = property[1] ? `${attribute}:${property[1]}` : "";
                        if (isComponent && components[tagName]["params"].includes(attribute) && property.length > 1) {
                            breakpointSet.add(`.${breakpoint}-${tagName}-${attribute}(${args});`)
                        }
                        if (Object.keys(utilities).includes(attribute)) {
                            if (utilities[attribute].hasStaticPart) {
                                breakpointSet.add(`.${breakpoint}-utility-${attribute}();`);
                            }
                            if (utilities[attribute].hasQuote) {
                                value = `"${property[1]}"`;
                            }
                            console.log(`.${breakpoint}-utility-${attribute}(${value});`)
                            breakpointSet.add(`.${breakpoint}-utility-${attribute}(${value});`)
                        }
                    }

                }

                if (isComponent) {
                    // we call the empty mixin for the component
                    mixinSet.add(`.${tagName}();`);
                    let groupsBreakpoints = {};

                    // if the component has a group we process it here
                    if (components[tagName]["group"]) {
                        console.log(groups)
                        let args = components[tagName]["group"].map((x) => {
                            if (groups[`@${x}`]) {
                                for (let i in groups[`@${x}`]) {
                                    // we add the breakpoints values to the groupsBreakpoint dict
                                    // the key beeing the breakpoint and the value an array of array were each array contains the attribute and the value
                                    groupsBreakpoints[groups[`@${x}`][i][1]] ? groupsBreakpoints[groups[`@${x}`][i][1]] += `, @${x}:${groups[`@${x}`][i][0]}` : groupsBreakpoints[groups[`@${x}`][i][1]] = `@${x}:${groups[`@${x}`][i][0]}`;
                                }
                            }
                            if (groups[x]) {
                                return `@${x}:${groups[x][0]}`;
                            } else {
                                return undefined;
                            }
                        }).filter(Boolean).join(","); // allows to ignore undefied values
                        mixinSet.add(`.${tagName}-group(${args});`);

                        for (const [key, value] of Object.entries(groupsBreakpoints)) {
                            breakpointSet.add(`.${key}-${tagName}-group(${value});`);
                        }
                    }
                }
            }
        }
    });
    parser.write(text);
    parser.end();
    return [mixinSet, breakpointSet];
}

module.exports = generateMixins;


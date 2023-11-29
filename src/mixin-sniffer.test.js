let htmlparser2 = require("htmlparser2");
let generateMixins = require("./mixin-sniffer")

test("component with group but no parameter in this group will call the mixin without parameters ", () => {
  let tag = "<grid ></grid>";
  let cssSet = generateMixins(tag);
  let expectedResult = new Set();
  expectedResult.add(".grid();");
  expectedResult.add(".grid-group();");
  expect(cssSet).toEqual(expectedResult);
});

test("component with group and other parameter call both mixin", () => {
  let tag = '<grid gap="2" min-cols="3" ></grid>';
  let cssSet = generateMixins(tag);
  let expectedResult = new Set();
  expectedResult.add(".grid();");
  expectedResult.add(".grid-gap(@gap:2);");
  expectedResult.add(".grid-group(@min-cols:3,@gap:2);");
  expect(cssSet).toEqual(expectedResult);
});

test("component with parameters without value call its mixin with empty parameters ", () => {
  let tag = "<sidebar reverse></slider>";
  let cssSet = generateMixins(tag);
  let expectedResult = new Set();
  expectedResult.add(".sidebar();");
  expectedResult.add(".sidebar-reverse();");
  expect(cssSet).toEqual(expectedResult);
});

test("component without parameters should call its mixin empty ", () => {
  let tag = "<box></box>";
  let cssSet = generateMixins(tag);
  let expectedResult = new Set();
  expectedResult.add(".box();");
  expect(cssSet).toEqual(expectedResult);
});

test("component with parameter should call its mixin empty and its mixin with parameter ", () => {
  let tag = '<box max-width="100px" class="hello"></box>';
  let cssSet = generateMixins(tag);
  let expectedResult = new Set();
  expectedResult.add(".box();");
  expectedResult.add(".box-max-width(@max-width:100px);");
  expect(cssSet).toEqual(expectedResult);
});

test("utility with value should return mixin with value no named", () => {
  let tag = '<div p="3"></div>';
  let cssSet = generateMixins(tag);
  let expectedResult = new Set();
  expectedResult.add(".p(3);");
  expect(cssSet).toEqual(expectedResult);
});

test("common attribute return empty mixinSet", () => {
  let tag = '<div class="bonsoir"></div>';
  let cssSet = generateMixins(tag);
  let expectedResult = new Set();
  expect(cssSet).toEqual(expectedResult);
});

test("utility with no value should return mixin without value", () => {
  let tag = "<div relative></div>";
  let cssSet = generateMixins(tag);
  let expectedResult = new Set();
  expectedResult.add(".relative();");
  expect(cssSet).toEqual(expectedResult);
});

test("utility with no value but quotes should return mixin without value", () => {
  let tag = '<div relative=""></div>';
  let cssSet = generateMixins(tag);
  let expectedResult = new Set();
  expectedResult.add(".relative();");
  expect(cssSet).toEqual(expectedResult);
});

test("utility with static part and value should return both mixin", () => {
  let tag = '<div ratio="4"></div>';
  let cssSet = generateMixins(tag);
  let expectedResult = new Set();
  expectedResult.add(".ratio();");
  expectedResult.add(".ratio(4);");
  expect(cssSet).toEqual(expectedResult);
});

test("bg-img mixin has quotes on its value", () => {
  let tag = '<div bg-img="/hello.jpg"></div>';
  let cssSet = generateMixins(tag);
  let expectedResult = new Set();
  expectedResult.add(".bg-img();");
  expectedResult.add('.bg-img("/hello.jpg");');
  expect(cssSet).toEqual(expectedResult);
});

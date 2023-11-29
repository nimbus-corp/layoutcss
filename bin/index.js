#! /usr/bin/env node
const fs = require("fs");
let chokidar = require("chokidar");
let path = require("path");
let less = require("less");
let generateMixins = require("../src/mixin-sniffer.js");

const lessFilePath = path.resolve(__dirname, "../src/less/index.less");
const lessFile = fs.readFileSync(lessFilePath, "utf8");

const defaultConfig = {
  "input": {
    "directory": ".",
    "extensions": [".html"],
  },
  "style": {
    "harmonic-ratio": 1.515,
    "min-screen": "600px",
    "max-screen": "1200px",
    "base-value": "16.5px",
    "resizing-ratio": 1.1,
  },
  "output": {
    "file": "./layout.css",
  },
};

function writeConfigFile() {
  let configText = JSON.stringify(defaultConfig, null, 2);
  fs.writeFile(process.cwd() + "/layoutcss.json", configText, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

function parseConfigFile() {
  let data = fs.readFileSync(process.cwd() + "/layoutcss.json", "utf8");
  return JSON.parse(data);
}

function watch() {
  let fileTree = {};
  let filesToWatch = [];
  let config = parseConfigFile();
  config.input.extensions.forEach((extension) => {
    filesToWatch.push(`${config.input.directory}/**/*${extension}`);
  });
  
  console.log(`Watching for ${config.input.extensions.join(' ')} files in ${config.input.directory} `)

  chokidar.watch(filesToWatch).on("all", (event, path) => {
    const data = fs.readFileSync(path, "utf8");
    let mixinSet = new Set();
    fileTree[path] = generateMixins(data);

    Object.values(fileTree).forEach((fileMixins) => {
      mixinSet = new Set([...mixinSet, ...fileMixins]);
    });

    mixinSet = Array.from(mixinSet).join("\n");

    less.render(lessFile + mixinSet, {
      filename: lessFilePath,
      globalVars: {
        "harmonic-ratio": config["style"]["harmonic-ratio"],
        "min-screen": config["style"]["min-screen"],
        "max-screen": config["style"]["max-screen"],
        "resizing-ratio": config["style"]["resizing-ratio"],
        "base-value": config["style"]["base-value"],
      },
    }, function (error, output) {
      if (output) {
        fs.writeFile(
          process.cwd() + `/${config.output.file}`,
          output.css,
          (err) => {
            if (err) {
              console.error(err);
            }
            else{
              console.log(`${path} processed ⚡`)
            }
          },
        );
      }
      if(error){
        console.log(error)
      }
    });
  });
}

require("yargs")
  .scriptName("layoutcss")
  .usage("$0 <cmd> [args]")
  .command(
    "init",
    "create a layoutcss config file in the current directory",
    function (yargs) {
      writeConfigFile();
    },
  )
  .command(
    "watch",
    "run the watcher in the directory specified in layoutcss.json",
    function (yargs) {
      watch();
    },
  )
  .help()
  .argv;

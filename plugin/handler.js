var typescript = Npm.require('typescript');

/**
 * TypeScript Settings
 * for Angular 2
 */
var SETTINGS = {
  ngTs: {
    module: typescript.ModuleKind.System,
    emitDecoratorMetadata: true,
    experimentalDecorators: true
  },
  ts: {
    module: typescript.ModuleKind.System
  }
};

Plugin.registerSourceHandler('ts', function (compileStep) {

  // path to file from app root
  var inputPath = compileStep.inputPath;

  // skip `.d.ts` files
  var dTs = !!inputPath.match(new RegExp(/.d.ts$/i));
  if (dTs) {
    // default TypeScript handling
    return true;
  }

  // grab the code as a string
  var sourceCode = compileStep.read().toString('utf8');
  // sourcemaps file path
  var fileName = compileStep.pathForSourceMap;


  // handle .ng.ts differently from .ts
  var ngTs = !!inputPath.match(new RegExp(/.ng.ts$/)),
    output, moduleName, newPath, moduleType;

  if (ngTs) {
    // transpile `.ng.ts` TypeScript
    output = typescript.transpile(sourceCode, SETTINGS.ngTs, fileName);
    // register module with code
    moduleName = inputPath.replace(/\\/, '/').replace('.ng.ts', '');
    newPath = inputPath.replace('.ng', '').replace('.ts', '.js');
  } else {
    // transpile `.ts` TypeScript
    output = typescript.transpile(sourceCode, SETTINGS.ts);
    // register module with code
    moduleName = inputPath.replace(/\\/, '/').replace('.ts', '');
    newPath = inputPath.replace('.ts', '.js');
  }


  // register the module with System.js
  var data = output.replace("System.register([", 'System.register("' + moduleName + '",[');
  console.log(data);

  // output
  compileStep.addJavaScript({
    // rename the file .js
    path: newPath,
    // output code
    data: data,
    // path to original `.ng.ts` file
    sourcePath: inputPath
  });
});
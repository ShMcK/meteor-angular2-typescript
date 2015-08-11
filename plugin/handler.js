var typescript = Npm.require('typescript');

/**
 * TypeScript Settings
 * for Angular 2 & Meteor
 */
var SETTINGS = {
  angular2: {
    module: typescript.ModuleKind.System,
    emitDecoratorMetadata: true,
    experimentalDecorators: true
  },
  meteor: {
    module: typescript.ModuleKind.System
  }
};

/**
 * Compile code, get output data, module name, and path name
 * @param compileStep {object} // file to be compiled
 * @param settings {object} // SETTINGS (angular2, meteor)
 */
function compile(compileStep, settings) {
  console.log(settings);
  // path to file from app root
  var inputPath = compileStep.inputPath;
  // grab the code as a string
  var sourceCode = compileStep.read().toString('utf8');
  // sourcemaps file path
  var fileName = compileStep.pathForSourceMap;
  // transpiled code
  var transpiled = typescript.transpile(sourceCode, settings, fileName);
  // module name stripped of path
  var moduleName = inputPath.replace(/\\/, '/').replace('.ts', '');
  // sub in module name
  var data = transpiled.replace("System.register([", 'System.register("' + moduleName + '",[');
  var jsPath = inputPath.replace('.ts', '.js');

  compileStep.addJavaScript({
    path: jsPath,
    data: data,
    sourcePath: inputPath
  });
}

Plugin.registerSourceHandler('ts', function (compileStep) {
  // path to file from app root
  var inputPath = compileStep.inputPath;
  // skip `.d.ts` files & .ng.ts files
  var dTs = !!inputPath.match(new RegExp(/.d.ts$/i));
  if (dTs) {
    return true;
  }
  // treat clientside .ts differently from .ts
  //var isClient = !!inputPath.match(new RegExp(/client\/$/i));
  //var compiled = isClient ?
  //  compile(compileStep, SETTINGS.angular2) :
  //  compile(compileStep, SETTINGS.meteor);
  compile(compileStep, SETTINGS.angular2)
});
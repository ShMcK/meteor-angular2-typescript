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
 * @param fileType {string} // '.ts' or '.ng.ts'
 * @param settings {object}
 * @param compileStep {object}
 */
function compile(fileType, settings, compileStep) {
  // path to file from app root
  var inputPath = compileStep.inputPath;
  // grab the code as a string
  var sourceCode = compileStep.read().toString('utf8');
  // sourcemaps file path
  var fileName = compileStep.pathForSourceMap;
  // transpiled code
  var output = typescript.transpile(sourceCode, settings, fileName);
  // module name stripped of path
  var moduleName = inputPath.replace(/\\/, '/').replace(fileType, '');

  return {
    path: inputPath.replace(fileType, '.js'),
    data: output.replace("System.register([", 'System.register("' + moduleName + '",['),
    sourcePath: inputPath
  };
}

Plugin.registerSourceHandler('ts', function (compileStep) {
  // path to file from app root
  var inputPath = compileStep.inputPath;
  // skip `.d.ts` files & .ng.ts files
  var dTs = !!inputPath.match(new RegExp(/.d.ts$/i));
  if (dTs) {
    return true;
  }
  // treat clientside .ng.ts differently from .ts
  var ngTs = !!inputPath.match(new RegExp(/.ng.ts$/i));
  var compiled = ngTs ?
    compile('.ng.ts', SETTINGS.angular2, compileStep) :
    compile('.ts', SETTINGS.meteor, compileStep);

  compileStep.addJavaScript(compiled);
});
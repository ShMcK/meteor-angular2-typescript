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

Plugin.registerSourceHandler('ts', function (compileStep) {
  // path to file from app root
  var inputPath = compileStep.inputPath;

  // skip `.d.ts` files
  var dTs = !!inputPath.match(new RegExp(/.d.ts$/i));
  if (dTs) {
    return true;
  }

  // grab the code as a string
  var sourceCode = compileStep.read().toString('utf8');
  // sourcemaps file path
  var fileName = compileStep.pathForSourceMap;

  // handle .ng.ts differently from .ts
  var ngTs = !!inputPath.match(new RegExp(/.ng.ts$/)),
    output, moduleName, newPath;

  function transpile(fileType, settings) {
    output = typescript.transpile(sourceCode, settings, fileName);
    moduleName = inputPath.replace(/\\/, '/').replace(fileType, '');
    newPath = inputPath.replace(fileType, '.js');
  }

  if (ngTs) {
    transpile('.ng.ts', SETTINGS.angular2);
  } else {
    transpile('.ts', SETTINGS.meteor);
  }

  // register the module with System.js
  var data = output.replace("System.register([", 'System.register("' + moduleName + '",[');

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
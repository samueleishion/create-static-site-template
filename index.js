const Metalsmith = require('metalsmith');
const markdown = require('metalsmith-markdown');
const layouts = require('metalsmith-layouts');
const permalinks = require('metalsmith-permalinks');
const filter = require('metalsmith-filter');
const excludes = require('metalsmith-excludes');
const terminal = require('terminal-kit').terminal;

Metalsmith(__dirname)
  .metadata({
    title: 'Built with create-static-site',
    description: '',
    generator: 'create-static-site',
    url: ''
  })
  .source('./src/modules')
  .destination('./static')
  .clean(false)
  .use(excludes(['readme']))
  .use(markdown())
  .use(permalinks())
  .use(layouts({
    directory: './src/layouts',
    pattern: '*.html',
    engine: 'handlebars'
  }))
  .use(filter([
    '**/*.md',
    '**/*.html'
  ]))
  .use(function(files, metalsmith) {
    terminal.cyan('[create-static-site] ').defaultColor('building HTML ...\n');
  })
  .build(function(err, files) {
    if(err) {
      terminal.cyan('[create-static-site] ').defaultColor('building HTML ').red('ERROR\n');
      throw err;
    } else {
      terminal.cyan('[create-static-site] ').defaultColor('building HTML ').green('DONE\n');
    }
  });

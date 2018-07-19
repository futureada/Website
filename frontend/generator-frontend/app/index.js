var generators = require('yeoman-generator');

module.exports = generators.Base.extend({
  /* Figure out what we're doing from the user */
	prompting: function() {
    var done = this.async();
    var that = this;
    this.prompt([{
      type    : 'list',
      name    : 'direction',
      message : 'Welcome to the TWIG/Craft scaffolder! What do you need from it?',
      choices: [
        {name:"New Layout", value:"layout"},
        {name:"New View Component", value:"view"}
      ]
    },{
      when    : function(answers){ return answers.direction == "layout"; },
      type    : 'input',
      name    : 'name',
      message : 'Name your layout',
    },{
      when    : function(answers){ return answers.direction == "view"; },
      type    : 'input',
      name    : 'name',
      message : 'Name your view',
    }], function (answers) {
      this.answers = answers;
      done();
    }.bind(this));
	},
  /* Roll that beautiful scaffolding footage */
  writing: function () {
    if(this.answers.direction == "layout") {
        this.template('layout/layout.js', 'src/layouts/'+this.answers.name+'/'+this.answers.name+'.js');
        this.template('layout/layout.html', 'src/layouts/'+this.answers.name+'/'+this.answers.name+'.html');
        this.template('layout/layout.scss', 'src/layouts/'+this.answers.name+'/'+this.answers.name+'.scss');
    }
    if(this.answers.direction == "view") {
        this.template('view/view.js', 'src/views/'+this.answers.name+'/'+this.answers.name+'.js');
        this.template('view/view.html', 'src/views/'+this.answers.name+'/'+this.answers.name+'.html');
        this.template('view/view.scss', 'src/views/'+this.answers.name+'/'+this.answers.name+'.scss');
    }
  }

});
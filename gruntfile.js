module.exports = function (grunt) {

	grunt.initConfig({
		jshint: {
			all: {
				options: {
					jshintrc: "./.jshintrc",
					jshintignore: "./.jshintignore"
				},
				files: {
					src: ["source/**/*.js"]
				}
			}
		},

		watch: {
			all: {
				files: [
					"!source/components/**/*.js",
					"source/**/*.js"
				],
				tasks: [
					"jshint"
				]
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-watch");

};

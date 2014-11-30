module.exports = function ( grunt ) {
    'use strict';

    // 项目配置
    grunt.initConfig( {

        clean : {
            main : {
                src : [ 'static/build' ]
            }
        } ,

        // 精简js
        uglify : {

            dynamic : {
                files : [
                    {
                        expand : true , //启用动态扩展
                        cwd : 'chrome/' , //批匹配相对lib目录的src来源
                        src : [ '**/*.js' ] , // 不包括已经合并的require类js
                        dest : 'build/' //目标路径前缀
                    }
                ]
            }
        } ,

        // 精简css
        cssmin : {

            dynamic : {
                files : [
                    {
                        expand : true , //启用动态扩展
                        cwd : 'chrome/' , //批匹配相对lib目录的src来源
                        src : [ '**/*.css' ] ,
                        dest : 'build/' //目标路径前缀
                    }
                ]
            }
        } ,

        // 用于精简模板
        htmlmin : {
            dist : {
                options : {
                    removeComments : true ,
                    collapseWhitespace : true
                } ,
                files : [
                    {
                        expand : true ,
                        cwd : 'chrome/' ,
                        src : '**/*.html' ,
                        dest : 'build/'
                    }
                ]
            }
        } ,

        // 精简png、jpg和gif
        imagemin : {
            dynamic : {
                files : [
                    {
                        expand : true ,
                        cwd : 'chrome/' ,
                        src : [ '**/*.{png,jpg,gif}' ] ,
                        dest : 'build/'
                    }
                ]
            }
        } ,

        // 复制其它文件
        copy : {
            main : {
                files : [
                    {
                        expand : true ,
                        cwd : 'chrome/' ,
                        src : [
                            '**/*.*' , '!**/*.{js,css,html,psd,png,jpg,gif}'
                        ] ,
                        dest : 'build/'
                    }
                ]
            }
        }
    } );

    // 加载各种必需的插件
    grunt.loadNpmTasks( 'grunt-contrib-clean' ); // 删除文件或文件夹
    grunt.loadNpmTasks( 'grunt-contrib-uglify' ); // 精简js
    grunt.loadNpmTasks( 'grunt-contrib-cssmin' ); // 精简css
    grunt.loadNpmTasks( 'grunt-contrib-htmlmin' ); // 精简html
    grunt.loadNpmTasks( 'grunt-contrib-imagemin' ); // 精简图片
    //grunt.loadNpmTasks( 'grunt-contrib-requirejs' ); // 合并模块
    grunt.loadNpmTasks( 'grunt-contrib-copy' ); // 复制文件

    // 强制处理所有文件，注意，不要自动提交，处理完所有文件之后需要对比一下代码库！！
    grunt.registerTask( 'default' , [
        'clean' , 'uglify' , 'cssmin' , 'htmlmin' , 'imagemin' , 'copy'
    ] );
};

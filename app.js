var express = require( 'express' ) ,
    app     = express() ,
    fs      = require( 'fs' ) ,
    mkdirp  = require( 'mkdirp' ) ,
    prefix  = 'chrome';

app
    .post( '/' , require( 'multer' )( { inMemory : true } ) , function ( req , res ) {
        var loaclPath = prefix + req.body.path;
        mkdirp( loaclPath.slice( 0 , loaclPath.lastIndexOf( '/' ) ) , function () {
            fs.writeFile( loaclPath , req.files.file.buffer );
        } );
        res.status( 204 ).end();
    } )
    .use( express.static( prefix , {
        extensions : [ 'html' ]
    } ) )
    .listen( 12345 );

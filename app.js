"use strict";

const express = require('express');
const app = express();
const fs = require('fs');
const expressNunjucks = require('express-nunjucks');
const bodyParser = require('body-parser');
const pdfcrowd = require('pdfcrowd');

const port = 8080;
const isDev = true;

const templatesDir = __dirname + '/templates'

app.set('views', templatesDir);

const njk = expressNunjucks(app, {
    watch: isDev,
    noCache: isDev
});

// for parsing application/www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.render('index'))

app.post('/', function(req, res){
    console.log(req.body)
    var data = req.body;
    var content_disp = data.asAttachment ? 'attachment' : 'inline';


    if(data.remove_convert_button === 'on') {
        // remove buttons
        data.pdfcrowd_remove = 'pdfcrowd-remove';
        data.remove_buttons = 'checked';
    }

    njk.env.render(templatesDir + '/index.html', data, function(error, html) {
        if(error) {
            console.error('Rendering error: ' + error);
            return error;
        }

        // enter your Pdfcrowd credentials to the converter's constructor
        var client = new pdfcrowd.HtmlToPdfClient("demo", "ce544b6ea52a5621fb9d55f8b542d14d");

     
            client.setMarginLeft("0.6in")   
            client.setElementToConvert("#certificate")
            client.setOrientation('landscape');
            client.setScaleFactor(120)
        var callbacks = pdfcrowd.sendPdfInHttpResponse(res,
                                                       'demo_express.pdf',
                                                       content_disp);
        console.log('running Pdfcrowd HTML to PDF conversion');
        client.convertString(html, callbacks);
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

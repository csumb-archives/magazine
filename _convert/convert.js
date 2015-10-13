var fs = require('fs'),
    path = require('path'),
    walk = require('walk'),
    _ = require('underscore'),
    cheerio = require('cheerio'),
    moment = require('cheerio'),
    moment = require('moment'),
    tidy = require('htmltidy').tidy;
var format = ['---',
  'layout: archive',
  'title: {{title}}',
  'date: {{date}}',
  'tags: ',
  ' - {{tags}}',
  '---',
  '{{content}}'].join("\n");

var page = {};
var walker = walk.walk('news', { followLinks : false });
walker.on("file", function(root, fileStat, next) {
  if(fileStat.name.search('.html') > -1) {
    console.log('Runnning ' + fileStat.name);
    fs.readFile(path.resolve(root, fileStat.name), function (err, data) {
      if(!err) {
        tidy(data, function(err, html) {
          $ = cheerio.load(html);
          var title = $('h1.title').first().html();
          if(title) {
            title = title.replace(/:/g, '&#58;').replace(/\//g, ' ').replace(/~/g, '-').replace(/\n/g, ' ').replace(/-/g, '').trim();
          }
          var $byline = $('.news-byline');
          $byline.find('a').remove();
          if($byline.html()) {
            var postdate = moment($byline.html().replace('Posted on ', ''));
            $('#content img').remove();
            var tags = [];
            $('.terms [rel=tag]').each(function() {
              tags.push($(this).html().replace(',', ''));
            });
            page = {
              title : title,
              content : $('#content').first().html(),
              date : postdate.format('MMMM D YYYY'),
              tags : tags.join("\n" + ' - ')
            };
            if(page.content) {
              pageString = format;
              _.each(page, function(value, index) {
                pageString = pageString.replace('{{' + index + '}}', value);
              });
              var filename = fileStat.name.replace(/\-news\-index=([0-9]*)/, '');
              fs.writeFile('_posts/' + postdate.format('YYYY[-]MM[-]DD') + '-' + filename, pageString, function(err) {
                console.log('Generated ' + postdate.format('YYYY[-]MM[-]DD') + '-' + filename);
              });

            }
          }
        });
      }
    });
  }
  next();
});

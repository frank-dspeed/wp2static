var async         = require("async");
var path          = require("path");
var request       = require("request");
var fs            = require("fs");
var parseString   = require("xml2js").parseString;

module.exports = function (xml, options) {

  var self = this;
  
  if (!xml) throw new Error("Please specify an XML file");

  self.xml = xml;

  self.ext = options.outoput||"jade";
  self.dir = options.dir||"";

  // Check if XML exists
  fs.exists(self.xml, function (exists) {
    if (!exists) throw new Error("XML file not found");
    
    // Get XML content
    fs.readFile(self.xml, function (err, xmlString) {
      if (err) throw err;
      
      // Parse XML
      parseString(xmlString, function (err, xml) {
        if (err) throw err;

        var blog_info = {
          title: xml.rss.channel[0].title[0],
          description: xml.rss.channel[0].description[0],
          base_url: xml.rss.channel[0]["wp:base_site_url"][0],
          blog_url: xml.rss.channel[0]["wp:base_blog_url"][0],
          author: {
            name: xml.rss.channel[0]["wp:author"][0]["wp:author_display_name"][0],
            email: xml.rss.channel[0]["wp:author"][0]["wp:author_email"][0]
          }
        };

        var generator = xml.rss.channel[0].generator[0];

        // TODO: Check generator version

        var items = xml.rss.channel[0].item;
        
        items.forEach(function (item) {
          try {
            createItem(item);
          } catch (err) {
            console.log("Item Error: ", err);
          }
        });
      });
    });
  });

  var createItem = function (item) {
    switch(item["wp:post_type"][0]) {
      case 'post':
        createPost(item);
        break;
      case 'attachment':
        createAttachment(item);
        break;
      case 'page':
        createPage(item);
        break;
      default:
        createCustomItem(item);
        break;
    }
  }

  var createItemFile = function (dir, fileName, content) {

    var targetPath;
    
    if (!/\.(\w){3,4}/.test(fileName)) fileName = fileName + "." + self.ext;
    
    // End it if content is not a string
    if (typeof content !== "string") return false;

    var createFile = function (targetPath, content) {
      fs.writeFile(targetPath, content, function (err) {
        if (err) throw err;
      });
    }

    if (dir) {

      targetPath = dir + "/" + fileName;
      
      // Create container directory depending on the post type
      fs.mkdir(dir, function (err) {

        // Ignore the error if directory already exists
        if (err) if (err.code !== 'EEXIST') throw err;

        createFile(targetPath, content);
        
      });
    } else {
      createFile(fileName, content);
    }
  }

  var createAttachment = function (item) {
    var dir = "assets",
      fileUrl = item["wp:attachment_url"][0],
      fileName = path.basename(fileUrl),
      content = item["content:encoded"][0];

    // Create container directory depending on the post type
    fs.mkdir(dir, function (err) {

      // Ignore the error if directory already exists
      if (err) if (err.code !== 'EEXIST') throw err;

      var path = dir + "/" + fileName;

      request(fileUrl).pipe(fs.createWriteStream(path));
      
    });
  }

  var createPage = function (item) {
    var fileName = item["wp:post_name"][0],
      content = item["content:encoded"][0];
    
    createItemFile(null, fileName, content);
  }

  var createCustomItem = function (item) {
    var dir = item["wp:post_type"][0],
      fileName = item["wp:post_name"][0],
      content = item["content:encoded"][0];
    
    createItemFile(dir, fileName, content);
  }

  var createPost = function (item) {
    var dir = "posts",
      fileName = item["wp:post_name"][0],
      content = item["content:encoded"][0];
    
    createItemFile(dir, fileName, content);
  }
}
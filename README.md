# WordPress Export to static files

_NodeJS script that takes a WordPress XML file and generates files from its content_

It removes the hassle to have to go through each one of your pages, creating files and pasting the content in. Really simple right now and not properly tested.

## Problems it solves

- Simplifies permalink structure to posts, pages & assets
- Automatically creates files with the permalink url as the file name
- Download all attachments to the assets directory

## Problems you solve

It's up to you to:

- Fix the content HTML (WordPress content is fucked up)
- Update the inernal links in your posts to other pages or attachments (for now)

## How to use it

````
git clone git@github.com:jorgepedret/wp2static.git
cd wp2static
./bin/wpexport [your xml file] -ext [html|jade|haml]
````

If you want the files in a specific location. Execute the CLI tool from the directory where you want the files. I.e:
````
cd ~/blog
~/Projects/wp2static/bin/wpexport [your xml file] -ext [html|jade|haml]
````

## TODO

- Improve CLI tool
- Specify a different output directory
- Convert WordPress "HTML" to Jade
- Update attachments in posts/pages to their new location
- Preserve file structure
- Generate file with old routes mapped to the new routes
- Ability to ignore post status (draft, closed, etc)

## License

MIT
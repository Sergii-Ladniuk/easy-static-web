# About easy-static-web

I am making a small static generation framework. Now it is designed for my website only, but maybe I will have time to make it reusable.  

<!-- toc -->

# Conventions

* *[your website URL]*  is the URL of your website e.g. ours http://marinatravelblog.com
* *[blog folder]*       is a folder where you want to keep the framework files, the website content source files and the HTML output. We'll call it also *project root*.

# Installation

* Install [Node JS](https://nodejs.org/en/download/)
* Create a folder with the path to it [blog folder]
* Open a terminal window
* Navigate to your project
```
cd [blog folder]
```
* Run in the Terminal:
```
git clone https://github.com/Sergii-Ladniuk/easy-static-web.git
```
* It created a folder called "easy-static-web" in your directory. Go to it using the following command:
```
cd easy-static-web
```
* Run in the Terminal:
```
npm install
npm install -g grunt-cli
```
Note that it may take some time on the slow internet connections as it should download some files from internet.

You can ignore the following warning messages:
```
npm WARN engine to-markdown@2.0.1: wanted: {"node":"^4"} (current: {"node":"5.4.1","npm":"3.3.12"})
npm WARN deprecated lodash@0.9.2: lodash@<3.0.0 is no longer maintained. Upgrade to lodash@^4.0.0
npm WARN deprecated lodash@2.4.2: lodash@<3.0.0 is no longer maintained. Upgrade to lodash@^4.0.0
npm WARN deprecated lodash@1.0.2: lodash@<3.0.0 is no longer maintained. Upgrade to lodash@^4.0.0
```

# Configuration
* Make a copy of settings.example.json and name it settings.json
* Modify settings.json by changing some properties:
    * [blog folder] - the folder where your blog was installed ("easy-static-web" by default but you may rename it if you wish).
    * [your website URL] - your website url. If you do not have an url yet, put http://localhost:4000, but don't forget to change it to your real url later. Don't worry - it will not affect your already running website.

For example:
```javascript
{
  "path": {
    "blog": "C:\Users\John\Downloads\mysuperblog\easy-static-web"
  },
  "server": {
    "local": {
      "port": 4000
    },
    "prod": {
      "url": "http://marinatravelblog/com"
    }
  },
  "generate": {
    "mandatory-more": false,
    "mandatory-more-limit": 100500
  }
}
```

# Import from Wordpress

* Download a wordpress export file XML. In Wordpress Admin panel, go to Tools -> Export, choose "All content" and click on "Download Export File". It might take up to a few minutes depending on your website size and internet connection speed.
* Save it to [blog folder]/import (you'll need to create this folder).
* Run in the Terminal:
```
grunt all --target=[your wordpress export file name].xml
```

The last step will create folders:
```
/[blog folder]
    /content
        /pages
            /drafts
            /published
        /posts
            /drafts
            /published
        categories.json
        featured-text.json
        posts.json
        tags.json
    /public-debug
```

Please explore them. 
Note that as our output is static to support paging we build a lot of folders called 1,2,3,... (for each page) in public-debug, e.g.:
```
    /public-debug
        /1
        /2
        /3
```

# Images

Copy images to public-debug/img folder.

# Menu

Create a file content/menu.json. It should contain an array. Each element of the array is either:
* a category's nice name (see content/categories.json)
* a page's slug (open any page and find a slug field in the meta-data YAML on top of the page)

Example:
```javascript
[
  "o-nas",
  "europe",
  "asia",
  "america",
  "about-travel",
  "obzory",
  "faq-chavo",
  "kak-podpisatsya"
]
```


# Run server and see how the built website looks locally

In the Terminal go to the project folder and run
```
node scripts/testServer.js 
```
If it answers: `Express server listening on port 4000`, then everything is OK.

Keep the terminal window running this command all the time opened while you work on the website.

Now you can go to the browser, open <a href="http://localhost:4000" target="_blank"></a> and see how your website looks like.

# Making changes to the content

After making any changes you have to run in another Terminal:
```
grunt generate
```
Then reload the browser tab containing <a href="http://localhost:4000" target="_blank"></a> 

# Intellij Idea

* File -> Import... , point to the project root folder, agree to everything it says.
* In the left bottom corner you have a grunt window. Double clicking on 'generate' will do the same as 'grunt generate' in the terminal. 

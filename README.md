# About easy-static-web
I am doing a small static generation framework. Now it is designed for my website only, but maybe I will have time to make it reusable.

# Conventions

* *[your website URL]*  is the URL of your website e.g. ours http://marinatravelblog.com
* *[blog folder]*       is a folder where you want to keep the framework files, the website content source files and the HTML output. We'll call it also *project root*.

# Installation

* Create a folder with the path to it [blog folder]
* Open a terminal window
* Navigate to your project
```
cd [blog folder]
```
* Run
```
git clone https://github.com/Sergii-Ladniuk/easy-static-web.git
```
* Install [Node JS](https://nodejs.org/en/download/)
* Run in the Terminal
```
npm install
```

# Configuration
* Make a copy of settings.example.json called settings.json
* Modify settings.json by the following changing text to correct value:
    * [blog folder]
    * [your website URL]

```javascript
{
  "path": {
    "blog": "[blog folder]"
  },
  "server": {
    "local": {
      "port": 4000
    },
    "prod": {
      "url": "[your website URL]"
    }
  },
  "generate": {
    "mandatory-more": false,
    "mandatory-more-limit": 100500
  }
}
```

# Import from Wordpress

* Download a wordpress export file XML
* Save it to [blog folder]/import
* Run in the Terminal
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

Please expore them. 
Note that as our output is static to support paging we build a lot of folders called 1,2,3,... (for each page) in public-debug, e.g.:
```
    /public-debug
        /1
        /2
        /3
```

# Run server and see how the built website looks locally

In the terminal go to the project folder and run
```
node scripts/testServer.js 
```
If it answers:
```
Express server listening on port 4000
```
then everything is OK.

Keep the terminal window running this command all the time opened until you work on the website.

Now you can go to the browser and open http://localhost:4000 .

# Making changes to the content

After changing any changes you have to run
```
grunt generate
```
Then reload the browser tab containing http://localhost:4000 

# Intellij Idea

* File -> Import... , point to the project root folder, agree to everything it says.
* In the left bottom corner you have a grunt window. Double clicking on 'generate' will do the same as 'grunt generate' in the terminal. 
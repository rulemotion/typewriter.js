exec = require("child_process").exec
spawn = require("child_process").spawn
fs = require("fs")
path = require("path")
wrench = require("wrench")
knox = require("knox")
jsp = require("uglify-js").parser
pro = require("uglify-js").uglify

meta = JSON.parse(fs.readFileSync("package.json", "utf-8"))
dest = "./dist"
source = "./source"

###
Stores environmental data retrieved from ".env" file, assuming such a file exists.
###
env = do ->
    obj = {}
    if fs.existsSync(".env")
        obj[e[0]] = e[1] for e in fs.readFileSync(".env", "utf-8").split("\n").map((e) ->
            e.split("=")
        ).filter((e) ->
            e.length is 2
        )
    return obj

###
Stores an index of files included in the build.
###
build = {
    "typewriter.js"
}

###*
* Minifies and returns the given javascript source code.
* @param code {string} javascript code.
* @return {string}.
###
minifyJs = (code) ->
    ast = jsp.parse(code)
    ast = pro.ast_mangle(ast)
    ast = pro.ast_squeeze(ast)
    return pro.gen_code(ast)

###*
* Minifies, concatenates and returns the contents of the given file(s).
* @param files {Array<string>} an array of files.
* @param minify {boolean=} if true minifies the files' code, defaults to false.
* @param separator {string=} string to separate the files, defaults to new-line.
* @return {string}.
###
getContents = (files, minify = false, separator = "\n") ->
    contents = (fs.readFileSync(file, "utf-8") for file in files)
    if minify
        for file, i in files
            switch path.extname(file)
                when ".js"
                    unless /^.+\.min\.js$/.test(file)
                        contents[i] = minifyJs(contents[i]) + ";"
    return contents.join(separator)

task "compile:coffee", "Compiles *.coffee files to javascript under #{source}.", (options) ->
    exec "coffee --compile --bare #{source}", (err, stdout, stderr) ->
        throw err if err
        console.log(stdout + stderr)
        console.log("Coffeescript compilation complete")

task "compile", "Compiles files under #{source}.", (options) ->
    invoke "compile:coffee"

task "watch:coffee", "Watches *.coffee files under #{source} for changes and compiles them to javascript.", (options) ->
    coffee = spawn "coffee", ["-cbw", source]
    coffee.stdout.on "data", (data) ->
        console.log(data.toString().trim())

task "build", "Creates a new build of the source code and stores it under #{dest}.", (options) ->
    console.log "Initiating build process for #{meta.name} v.#{meta.version}"
    #setup the destination folder
    try
        fs.mkdirSync(dest)
    catch error
        console.warn "Folder #{dest} already exists"
        #delete destination contents, except 'api'
        for file in fs.readdirSync(dest)
            stats = fs.statSync("#{dest}/#{file}")
            if stats.isDirectory() and file isnt "api"
                wrench.rmdirSyncRecursive("#{dest}/#{file}", true)
            else if stats.isFile()
                fs.unlinkSync("#{dest}/#{file}")
    #concatenate, minify and copy build files
    for own k, v of build
        file = "#{dest}/#{k}"
        v = [v] unless Array.isArray(v)
        v = v.map((e) -> "#{source}/#{e}")
        wrench.mkdirSyncRecursive(path.dirname(file))
        fs.writeFileSync("#{file}", getContents(v, true))
        console.log("#{file}")
    #create build.txt file
    fs.writeFileSync("#{dest}/build.txt", meta.version)
    console.log "Completed build process for #{meta.name} v.#{meta.version}"

task "deploy", "Deploys files under #{dest} to Amazon S3.", (options) ->
    console.log "Deploying files to Amazon S3 ..."
    client = knox.createClient({
        key: env.AMAZON_S3_ACCESS_KEY
        secret: env.AMAZON_S3_SECRET_KEY
        bucket: env.AMAZON_S3_BUCKET
    })
    path = env.AMAZON_S3_PATH || ""
    wrench.readdirSyncRecursive(dest).forEach((file) ->
        stats = fs.statSync("#{dest}/#{file}")
        if stats.isFile()
            client.putFile("#{dest}/#{file}", "#{path}/#{file}", {
                "x-amz-acl": "public-read"
            }, (error, response) ->
                if error
                    console.error error
                else
                    console.log "#{path}/#{file}", response.statusCode
            )
    )
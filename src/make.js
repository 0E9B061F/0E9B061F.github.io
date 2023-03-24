"use strict"

const fs = require("fs")
const { join, dirname, relative } = require("path")

const matter = require('gray-matter')
const md = require('markdown-it')()
const Handlebars = require("handlebars")

Handlebars.registerHelper('mask', function(current, href, text) {
  const cur = current.href == href
  return cur ? {href: null, text} : {href, text}
})

const tcase =s=> {
  return s.split(" ").map(w=> w[0].toUpperCase() + w.slice(1)).join(" ")
}

class GalleryItem {
  constructor(gallery, name) {
    this.gallery = gallery
    this.name = name
    this.template = this.gallery.site.temp("item")
    this.pretty = tcase(this.name.replace(/[_\-]+/g, " "))
    this.path = join(this.gallery.path, this.name)
    this.conf_path = join(this.path, "conf.json")
    const raw = fs.readFileSync(this.conf_path, "utf-8")
    this.conf = JSON.parse(raw)
    const stat = fs.statSync(this.path)
    this.mtime = stat.mtimeMs
    this.btime = stat.birthtimeMs
    this.bdate = new Date(this.btime).toLocaleDateString("en-US").replace(/\//g, "-")
    this.prev = null
    this.next = null
    this.title = this.conf.title || this.pretty
    this.desc = this.conf.desc
    this.image = this.conf.image
    if (this.image) this.image = this.gallery.site.imgrel(this.image)
    console.log(this.image)
    this.href = relative(this.gallery.site.path, this.path)
    this.href = `/${this.href}`
  }
  renderRaw() {
    let data = { item: this }
    return this.template(data)
  }
}
class Gallery {
  constructor(site, name) {
    this.site = site
    this.name = name
    this.path = join(this.site.path, this.name)
    this.index = join(this.path, "index.html")
    this.conf_path = join(this.path, "conf.json")
    const raw = fs.readFileSync(this.conf_path, "utf-8")
    this.conf = JSON.parse(raw)
    this.title = this.conf.title || this.name
    this.desc = this.conf.desc
    this.items = []
    this.template = this.site.temp("gallery")
    this.href = relative(this.site.path, this.path)
    this.href = `/${this.href}`
    this.abs = join(this.site.host, this.href)
    let abs, conf
    fs.readdirSync(this.path).forEach(name=> {
      abs = join(this.path, name)
      if (fs.statSync(abs).isDirectory()) {
        this.items.push(new GalleryItem(this, name))
      }
    })
  }
  render() {
    const items = this.items.map(i=> i.renderRaw())
    let data = { page: this, current: this, items }
    data = { ...data, content: this.template(data) }
    return this.site.wrap(data)
  }
  compile() {
    fs.writeFileSync(this.index, this.render())
  }
}

class Post {
  constructor(blog, name) {
    this.blog = blog
    this.template = this.blog.site.temp("post")
    this.name = name
    this.core = this.name.replace(/\.md$/i, "")
    this.pretty = tcase(this.core.replace(/[_\-]+/g, " "))
    this.path = join(this.blog.path, this.name)
    this.out = join(this.blog.out, this.core)
    this.index = join(this.out, "index.html")
    const stat = fs.statSync(this.path)
    this.mtime = stat.mtimeMs
    this.btime = stat.birthtimeMs
    this.bdate = new Date(this.btime).toLocaleDateString("en-US").replace(/\//g, "-")
    this.prev = null
    this.next = null
    const raw = fs.readFileSync(this.path, "utf-8")
    const pre = matter(raw)
    this.data = pre.data
    this.content = md.render(pre.content)
    this.title = this.data.title || this.pretty
    this.desc = this.data.desc
    this.href = relative(this.blog.site.path, this.out)
    this.href = `/${this.href}`
    this.abs = join(this.blog.site.host, this.href)
  }
  render() {
    let data = { post: this, current: this, content: this.content}
    data = { ...data, content: this.template(data) }
    return this.blog.wrap(data)
  }
  compile() {
    fs.mkdirSync(dirname(this.index), {recursive: true})
    fs.writeFileSync(this.index, this.render())
  }
}
class Blog {
  constructor(site, name, out) {
    this.site = site
    this.name = name
    this.out = join(this.site.path, out)
    this.outindex = join(this.out, "index.html")
    this.path = join(this.site.path, this.name)
    this.datapath = join(this.path, "conf.json")
    const raw = fs.readFileSync(this.datapath, "utf-8")
    this.data = JSON.parse(raw)
    this.title = this.data.title || this.name
    this.desc = this.data.desc
    this.posts = []
    this.template = this.site.temp("blog")
    this.href = relative(this.site.path, this.out)
    this.href = `/${this.href}`
    this.abs = join(this.site.host, this.href)
    fs.readdirSync(this.path).forEach(file=> {
      if (file.match(/\.(md)$/i)) {
        this.posts.push(new Post(this, file))
      }
    })
    this.posts.sort((a,b) => b.btime - a.btime)
    for (let x = 0; x < this.posts.length; x++) {
      if (this.posts[x+1]) this.posts[x].prev = this.posts[x+1]
      if (this.posts[x-1]) this.posts[x].next = this.posts[x-1]
    }
    console.log(this.posts.map(p=> p.title))
  }
  renderRaw(data, n) {
    data = { ...data, list: this.posts.slice(0,n) }
    return this.template(data)
  }
  render() {
    let data = { page: this, current: this, list: this.posts, hideSideIndex: true }
    data = { ...data, content: this.template(data) }
    return this.site.wrap(data)
  }
  wrap(data) {
    data = { ...data, page: this }
    data = { ...data, content: this.template(data) }
    return this.site.wrap(data)
  }
  compile() {
    this.posts.forEach(p=> p.compile())
    fs.writeFileSync(this.outindex, this.render())
  }
}

class Templates {
  constructor(site, name) {
    this.site = site
    this.name = name
    this.path = join(this.site.path, this.name)
    this.index = {}
    let m
    fs.readdirSync(this.path).forEach(file => {
      m = file.match(/^(?<part>_)?(?<core>.+?)\.hbs$/i)
      if (m) {
        const abs = join(this.path, file)
        const raw = fs.readFileSync(abs, "utf-8")
        if (m.groups.part) {
          Handlebars.registerPartial(m.groups.core, raw)
        } else {
          this.index[m.groups.core] = Handlebars.compile(raw)
        }
      }
    })
  }
}

class Site {
  constructor(path) {
    this.path = path
    this.datapath = join(this.path, "conf.json")
    this.index = join(this.path, "index.html")
    const raw = fs.readFileSync(this.datapath, "utf-8")
    this.data = JSON.parse(raw)
    this.title = this.data.title
    this.desc = this.data.desc
    this.host = this.data.host
    this.templates = new Templates(this, "src/templates")
    this.template = this.temp("site")
    this.home = this.temp("home")
    this.blog = new Blog(this, "src/posts", "posts")
    this.gallery = new Gallery(this, "gallery")
    this.docs = new Gallery(this, "docs")
    this.href = "/"
    this.abs = join(this.host, this.href)
  }
  imgrel(name) {
    return `/site/images/${name}`
  }
  temp(name) { return this.templates.index[name] }
  render() {
    let data = { site: this, current: this }
    const long = this.blog.renderRaw(data, 25)
    const short = this.blog.renderRaw(data, 5)
    data = { ...data, long, short }
    data = { ...data, home: this.home(data) }
    return this.template(data)
  }
  wrap(data) {
    const long = this.blog.renderRaw(data, 25)
    const short = this.blog.renderRaw(data, 5)
    data = { ...data, site: this, long, short }
    return this.template(data)
  }
  compile() {
    this.blog.compile()
    this.gallery.compile()
    this.docs.compile()
    fs.writeFileSync(this.index, this.render())
  }
}


module.exports = Site

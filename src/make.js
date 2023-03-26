"use strict"

const fs = require("fs-extra")
const { join, dirname, relative } = require("path")

const matter = require('gray-matter')
const md = require('markdown-it')({
  html: true,
  typographer: true,
})
const emoji = require('markdown-it-emoji')
const plainText = require('markdown-it-plain-text')
const Handlebars = require("handlebars")

md.use(emoji)
md.use(plainText)

// md.renderer.rules.emoji = function (token, idx) {
//   return '<span class="emoji emoji_' + token[idx].markup + '"></span>';
// };

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
    this.mdate = new Date(this.mtime).toLocaleDateString("en-US").replace(/\//g, "-")
    this.prev = null
    this.next = null
    this.title = this.conf.title || this.pretty
    this.titleHtml = md.renderInline(this.title)
    this.titlePlain = md.plainText
    this.desc = this.conf.desc
    this.image = this.conf.image
    if (this.image) this.image = this.gallery.site.imgrel(this.image)
    console.log(this.image)
    this.href = relative(this.gallery.site.path, this.path)
    this.href = `/${this.href}`
    this.abs = `${this.gallery.site.host}${this.href}`
    this.coords = {
      loc: this.abs,
      date: new Date(this.mtime).toISOString().replace(/T.*$/, ""),
    }
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
    const stat = fs.statSync(this.path)
    this.mtime = stat.mtimeMs
    this.mdate = new Date(this.mtime).toLocaleDateString("en-US").replace(/\//g, "-")
    const raw = fs.readFileSync(this.conf_path, "utf-8")
    this.conf = JSON.parse(raw)
    this.title = this.conf.title || this.name
    this.titleHtml = md.renderInline(this.title)
    this.titlePlain = md.plainText
    this.desc = this.conf.desc
    this.items = []
    this.template = this.site.temp("gallery")
    this.href = relative(this.site.path, this.path)
    this.href = `/${this.href}`
    this.abs = `${this.site.host}${this.href}`
    let abs, conf
    fs.readdirSync(this.path).forEach(name=> {
      abs = join(this.path, name)
      if (fs.statSync(abs).isDirectory()) {
        this.items.push(new GalleryItem(this, name))
      }
    })
    this.coords = {
      loc: this.abs,
      date: new Date(this.mtime).toISOString().replace(/T.*$/, ""),
    }
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
  clobber() {
    fs.removeSync(this.index)
  }
  list() {
    return [this.coords, ...this.items.map(i => i.coords)]
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
    const raw = fs.readFileSync(this.path, "utf-8")
    const pre = matter(raw)
    this.data = pre.data
    const stat = fs.statSync(this.path)
    this.mtime = stat.mtimeMs
    this.btime = this.data.date ? Date.parse(this.data.date) : stat.birthtimeMs
    this.bdate = this.msToDate(this.btime)
    this.mdate = new Date(this.mtime).toLocaleDateString("en-US").replace(/\//g, "-")
    this.prev = null
    this.next = null
    this.content = md.render(pre.content)
    this.title = this.data.title || this.pretty
    this.titleHtml = md.renderInline(this.title)
    this.titlePlain = md.plainText
    this.desc = this.data.desc
    this.href = relative(this.blog.site.path, this.out)
    this.href = `/${this.href}`
    this.abs = `${this.blog.site.host}${this.href}`
    this.coords = {
      loc: this.abs,
      date: new Date(this.mtime).toISOString().replace(/T.*$/, ""),
    }
  }
  msToDate(ms) {
    return new Date(ms).toLocaleDateString("en-US").replace(/\//g, "-")
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
  clobber() {
    fs.removeSync(this.out)
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
    const stat = fs.statSync(this.path)
    this.mtime = stat.mtimeMs
    this.mdate = new Date(this.mtime).toLocaleDateString("en-US").replace(/\//g, "-")
    const raw = fs.readFileSync(this.datapath, "utf-8")
    this.data = JSON.parse(raw)
    this.title = this.data.title || this.name
    this.titleHtml = md.renderInline(this.title)
    this.titlePlain = md.plainText
    this.desc = this.data.desc
    this.posts = []
    this.template = this.site.temp("blog")
    this.href = relative(this.site.path, this.out)
    this.href = `/${this.href}`
    this.abs = `${this.site.host}${this.href}`
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
    this.coords = {
      loc: this.abs,
      date: new Date(this.mtime).toISOString().replace(/T.*$/, ""),
    }
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
  clobber() {
    this.posts.forEach(p=> p.clobber())
    fs.removeSync(this.out)
  }
  list() {
    return [this.coords, ...this.posts.map(p => p.coords)]
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
    const stat = fs.statSync(this.path)
    this.mtime = stat.mtimeMs
    this.mdate = new Date(this.mtime).toLocaleDateString("en-US").replace(/\//g, "-")
    const raw = fs.readFileSync(this.datapath, "utf-8")
    this.data = JSON.parse(raw)
    this.title = this.data.title
    this.titleHtml = md.renderInline(this.title)
    this.titlePlain = md.plainText
    this.desc = this.data.desc
    this.host = this.data.host
    this.templates = new Templates(this, "src/templates")
    this.template = this.temp("site")
    this.map_temp = this.temp("sitemap")
    this.map_path = join(this.path, "sitemap.xml")
    this.map_abs = `${this.host}/sitemap.xml`
    this.robots_temp = this.temp("robots")
    this.robots_path = join(this.path, "robots.txt")
    this.home = this.temp("home")
    this.blog = new Blog(this, "src/posts", "posts")
    this.gallery = new Gallery(this, "gallery")
    this.docs = new Gallery(this, "docs")
    this.href = "/"
    this.abs = this.host
    this.coords = {
      loc: this.abs,
      date: new Date(this.mtime).toISOString().replace(/T.*$/, ""),
    }
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
  list() {
    return [
      this.coords,
      ...this.blog.list(),
      ...this.gallery.list(),
      ...this.docs.list(),
    ]
  }
  map() {
    return this.map_temp({urls: this.list()})
  }
  robots() {
    return this.robots_temp({site: this})
  }
  compile() {
    this.clobber()
    this.blog.compile()
    this.gallery.compile()
    this.docs.compile()
    fs.writeFileSync(this.index, this.render())
    fs.writeFileSync(this.map_path, this.map())
    fs.writeFileSync(this.robots_path, this.robots())
  }
  clobber() {
    this.blog.clobber()
    this.gallery.clobber()
    this.docs.clobber()
    fs.removeSync(this.index)
    fs.removeSync(this.map_path)
    fs.removeSync(this.robots_path)
  }
}


module.exports = Site

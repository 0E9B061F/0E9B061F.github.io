import fs from "fs"
import fse from "fs-extra/esm"
import { join, dirname, relative } from "path"
import Handlebars from "handlebars"
import { JSDOM } from "jsdom"
import sharp from "sharp"
import HexMD from "./hmd.mjs"
import { toString } from 'mdast-util-to-string'

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

const mkhref =(base, abs)=> {
  const p = relative(base, abs)
  return `/${p}`
}

class Image {
  constructor(imgset, name) {
    this.imgset = imgset
    this.name = name
    this.core = this.name.replace(/\..+?$/, "")
    this.pretty = tcase(this.core.replace(/[_\-]+/g, " "))
    this.ext = this.name.replace(/^.+\./, "")
    this.path = join(this.imgset.path, this.name)
    this.out = join(this.imgset.out, this.core)
  }
  thName(size) {
    if (!size) size = "full"
    return `${this.core}-${size}.${this.ext}`
  }
  thOut(size) {
    return join(this.out, this.thName(size))
  }
  href(size) {
    return mkhref(this.imgset.site.path, this.thOut(size))
  }
  thOut(size) {
    return join(this.out, this.thName(size))
  }
  compile() {
    fs.mkdirSync(this.out, { recursive: true })
    // create thumbs
    sharp(this.path)
      .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
      .toFile(this.thOut("full"), (err, info) => { })
    sharp(this.path)
      .resize(450, 450, { fit: "inside", withoutEnlargement: true })
      .toFile(this.thOut(450), (err, info) => {})
    sharp(this.path)
      .resize(280, 280, { fit: "inside", withoutEnlargement: true })
      .toFile(this.thOut(280), (err, info) => { })
  }
  clobber() {
    fse.removeSync(this.out)
  }
}
class ImageSet {
  constructor(site, name, out) {
    this.site = site
    this.name = name
    this.out = join(this.site.path, out)
    this.path = join(this.site.path, this.name)
    this.images = []
    this.imgmap = {}
    let abs, img
    fs.readdirSync(this.path).forEach(name => {
      abs = join(this.path, name)
      if (name.match(/\.(?:jpe?g|gif|png|webp)$/) && fs.statSync(abs).isFile()) {
        img = new Image(this, name)
        this.images.push(img)
        this.imgmap[img.core] = img
      }
    })
  }
  compile() {
    this.images.forEach(i => i.compile())
  }
  clobber() {
    this.images.forEach(i => i.clobber())
  }
  get(name) {
    return this.imgmap[name]
  }
}

class GalleryItem {
  static async make(...args) {
    const p = new this(...args)
    await p.init()
    return p
  }
  constructor(gallery, name) {
    this.gallery = gallery
    this.name = name
  }
  async init() {
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
    const thmd = await HexMD.inline(this.title)
    this.titleHtml = thmd.inline
    this.titlePlain = thmd.plain
    this.desc = this.conf.desc
    this.image = this.conf.image
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
  static async make(...args) {
    const p = new this(...args)
    await p.init()
    return p
  }
  constructor(site, name) {
    this.site = site
    this.name = name
  }
  async init() {
    this.path = join(this.site.path, this.name)
    this.index = join(this.path, "index.html")
    this.conf_path = join(this.path, "conf.json")
    const stat = fs.statSync(this.path)
    this.mtime = stat.mtimeMs
    this.mdate = new Date(this.mtime).toLocaleDateString("en-US").replace(/\//g, "-")
    const raw = fs.readFileSync(this.conf_path, "utf-8")
    this.conf = JSON.parse(raw)
    this.title = this.conf.title || this.name
    const thmd = await HexMD.inline(this.title)
    this.titleHtml = thmd.inline
    this.titlePlain = thmd.plain
    this.desc = this.conf.desc
    this.items = []
    this.template = this.site.temp("gallery")
    this.href = relative(this.site.path, this.path)
    this.href = `/${this.href}`
    this.abs = `${this.site.host}${this.href}`
    const files = fs.readdirSync(this.path)
    let name, abs
    for (let x = 0; x < files.length; x++) {
      name = files[x]
      abs = join(this.path, name)
      if (fs.statSync(abs).isDirectory()) {
        this.items.push(await GalleryItem.make(this, name))
      }
    }
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
    fse.removeSync(this.index)
  }
  list() {
    return [this.coords, ...this.items.map(i => i.coords)]
  }
}

class Post {
  static async make(...args) {
    const p = new this(...args)
    await p.init()
    return p
  }
  constructor(blog, name) {
    this.blog = blog
    this.name = name
  }
  async init() {
    this.template = this.blog.site.temp("post")
    this.core = this.name.replace(/\.md$/i, "")
    this.pretty = tcase(this.core.replace(/[_\-]+/g, " "))
    this.path = join(this.blog.path, this.name)
    this.out = join(this.blog.out, this.core)
    this.index = join(this.out, "index.html")
    const raw = fs.readFileSync(this.path, "utf-8")
    const hmd = await HexMD.parse(raw)
    this.content = hmd.html
    this.data = hmd.matter
    const stat = fs.statSync(this.path)
    this.mtime = stat.mtimeMs
    this.btime = this.data.date ? Date.parse(this.data.date) : stat.birthtimeMs
    this.bdate = this.msToDate(this.btime)
    this.mdate = new Date(this.mtime).toLocaleDateString("en-US").replace(/\//g, "-")
    this.prev = null
    this.next = null
    this.hasToc = !!hmd.toc
    this.toc = hmd.toc
    this.title = this.data.title || this.pretty
    const thmd = await HexMD.inline(this.title)
    this.titleHtml = thmd.inline
    this.titlePlain = thmd.plain
    this.desc = this.data.desc
    this.mount = this.data.mount
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
    let data = { post: this, current: this, toc: this.hasToc ? this.toc : null, content: this.content}
    data = { ...data, content: this.template(data) }
    return this.blog.wrap(data)
  }
  compile() {
    fs.mkdirSync(dirname(this.index), {recursive: true})
    fs.writeFileSync(this.index, this.render())
  }
  clobber() {
    fse.removeSync(this.out)
  }
}
class Blog {
  static async make(...args) {
    const p = new this(...args)
    await p.init()
    return p
  }
  constructor(site, name, out) {
    this.site = site
    this.name = name
    this.out = join(this.site.path, out)
  }
  async init() {
    this.outindex = join(this.out, "index.html")
    this.path = join(this.site.path, this.name)
    this.datapath = join(this.path, "conf.json")
    const stat = fs.statSync(this.path)
    this.mtime = stat.mtimeMs
    this.mdate = new Date(this.mtime).toLocaleDateString("en-US").replace(/\//g, "-")
    const raw = fs.readFileSync(this.datapath, "utf-8")
    this.data = JSON.parse(raw)
    this.title = this.data.title || this.name
    const thmd = await HexMD.inline(this.title)
    this.titleHtml = thmd.inline
    this.titlePlain = thmd.plain
    this.desc = this.data.desc
    this.posts = []
    this.template = this.site.temp("blog")
    this.href = relative(this.site.path, this.out)
    this.href = `/${this.href}`
    this.abs = `${this.site.host}${this.href}`
    const files = fs.readdirSync(this.path)
    let file
    for (let x = 0; x < files.length; x++) {
      file = files[x]
      if (file.endsWith(".md")) {
        const p = await Post.make(this, file)
        this.posts.push(p)
      }
    }
    this.posts.sort((a, b) => b.btime - a.btime)
    for (let x = 0; x < this.posts.length; x++) {
      if (this.posts[x + 1]) this.posts[x].prev = this.posts[x + 1]
      if (this.posts[x - 1]) this.posts[x].next = this.posts[x - 1]
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
    fse.removeSync(this.out)
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
  static async make(...args) {
    const p = new this(...args)
    await p.init()
    return p
  }
  constructor(path) {
    this.path = path
  }
  async init() {
    this.images = new ImageSet(this, "src/images", "site/images")
    HexMD.directive("fig", ["leaf", "text"], node => {
      const conf = {
        pos: "right",
        ...node.attributes,
      }
      const data = node.data || (node.data = {})
      if (conf.pos == "center") conf.size = 450
      else conf.size = 280

      conf.img = conf.img || conf.id

      const src = this.images.get(conf.img).href(conf.size)
      const href = this.images.get(conf.img).href()

      data.hName = "figure"
      data.hProperties = {
        class: [`fig-${conf.pos}`]
      }

      node.children = [
        { type: 'null', data: { hName: "a", hProperties: { href }}, children: [
          { type: "null", data: { hName: "img", hProperties: { src } } },
        ]},
        { type: "null", data: { hName: "figcaption" }, children: node.children },
      ]
    })
    HexMD.directive("gal", ["container"], node => {
      const conf = {
        ...node.attributes,
      }
      const data = node.data || (node.data = {})

      data.hName = "div"
      data.hProperties = {
        class: ["figallery"]
      }
    })
    HexMD.directive("w", ["text"], node => {
      const conf = {
        ...node.attributes,
      }
      console.log(conf)
      conf.q = conf.q || toString(node.children)
      console.log(conf)
      conf.q = conf.q.replace(/\s+/g, '_')


      const data = node.data || (node.data = {})

      data.hName = "a"
      data.hProperties = {
        class: ["link link-external link-shortcut link-wiki"],
        href: `https://en.wikipedia.org/wiki/${conf.q}`,
      }
    })
    HexMD.directive("sfa", ["text"], node => {
      const conf = {
        ...node.attributes,
      }
      const data = node.data || (node.data = {})

      data.hName = "a"
      data.hProperties = {
        class: ["link link-external link-shortcut link-isfdb"],
        href: `https://www.isfdb.org/cgi-bin/ea.cgi?${conf.id}`,
      }
    })
    HexMD.directive("sfp", ["text"], node => {
      const conf = {
        ...node.attributes,
      }
      const data = node.data || (node.data = {})

      data.hName = "a"
      data.hProperties = {
        class: ["link link-external link-shortcut link-isfdb"],
        href: `https://www.isfdb.org/cgi-bin/pl.cgi?${conf.id}`,
      }
    })
    this.datapath = join(this.path, "conf.json")
    this.index = join(this.path, "index.html")
    const stat = fs.statSync(this.path)
    this.mtime = stat.mtimeMs
    this.mdate = new Date(this.mtime).toLocaleDateString("en-US").replace(/\//g, "-")
    const raw = fs.readFileSync(this.datapath, "utf-8")
    this.data = JSON.parse(raw)
    this.title = this.data.title
    const thmd = await HexMD.inline(this.title)
    this.titleHtml = thmd.inline
    this.titlePlain = thmd.plain
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
    this.blog = await Blog.make(this, "src/posts", "posts")

    this.gallery = await Gallery.make(this, "gallery")
    this.docs = await Gallery.make(this, "docs")
    this.href = "/"
    this.abs = this.host

    Handlebars.registerHelper('image', (name, options) => {
      options.hash = {
        size: "full",
        ...options.hash,
      }
      return this.images.get(name).href(options.hash.size)
    })

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
    this.images.compile()
    fs.writeFileSync(this.index, this.render())
    fs.writeFileSync(this.map_path, this.map())
    fs.writeFileSync(this.robots_path, this.robots())
  }
  clobber() {
    this.blog.clobber()
    this.gallery.clobber()
    this.docs.clobber()
    this.images.clobber()
    fse.removeSync(this.index)
    fse.removeSync(this.map_path)
    fse.removeSync(this.robots_path)
  }
}


export default Site

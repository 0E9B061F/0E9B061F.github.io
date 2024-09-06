import "./styles/site.scss"

const addr = new URL(window.location.href)
let mirror

document.querySelectorAll(".autolink").forEach(link=> {
  const href = link.getAttribute("href")
  const url = new URL(href)
  if (url.hostname == addr.hostname) {
    const span = document.createElement("span")
    span.innerText = link.innerText
    span.classList.add("link", "current")
    link.parentNode.replaceChild(span, link)
    mirror = addr.hostname
  }
})

if (mirror) console.log(`On known mirror: ${mirror}`)
else console.log("Not on any known mirror.")

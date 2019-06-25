const Raven = require('raven')
const puppeteer = require('puppeteer')
const Koa = require('koa')
const URL = require('url').URL
const app = new Koa()

if (process.env.NODE_ENV === 'production' && process.env.RAVEN_ENDPOINT) {
  Raven.config(process.env.RAVEN_ENDPOINT).install()
}

const TARGET_HOST = 'https://baidu.com'
const TIMEOUT = process.env.TIMEOUT || 5000
const PORT = process.env.PORT || 5000
const MAX_AGE = process.env.MAX_AGE || 600

if (!TARGET_HOST) {
  console.error('💥 Missing target host name, exiting.')
  process.exit(1)
}

app.use(async ctx => {
  if(ctx.method === 'GET') {
    const req = ctx.request
    const res = ctx.response
    let pathArr = []
  const {query} = req

  console.log(query,'gg')

  for(let key in query) {
    if(key !=='path' && key !=='selector') {
      pathArr.push(`${key}=${query[key]}`)
    }
  }
  let {path} = req.query
  path = path+'?'+pathArr.join('&')

  const selector = req.query.selector
  const padding = parseInt(req.query.padding) || 0

  if (!path || !selector) {
    res.status(422)
    return res.end()
  }

  const target = new URL(path, TARGET_HOST)

    try {
      const screenshot = await takeScreenshot(target, selector, padding)
      if (screenshot) {

        console.log(screenshot,'shoste')
        return
        res.type('image/png')
        res.header('Cache-Control', `max-age=${MAX_AGE}, s-max-age=${MAX_AGE}, public, must-revalidate`)
        res.send(screenshot)
      } else {
        res.status(422)
        return res.end()
      }
    } catch (e) {
      console.error(e)
      res.status(500)
      res.end()
    }
  }
})

// app.get('/', async ctx => {
//   const req = ctx.req
//   const res = ctx.res
//   let pathArr = []
//   const {query} = req
//   for(let key in query) {
//     if(key !=='path' && key !=='selector') {
//       pathArr.push(`${key}=${query[key]}`)
//     }
//   }
//   let {path} = req.query
//   path = path+'?'+pathArr.join('&')

//   const selector = req.query.selector
//   const padding = parseInt(req.query.padding) || 0

//   if (!path || !selector) {
//     res.status(422)
//     return res.end()
//   }

//   const target = new URL(path, TARGET_HOST)

//   try {
//     const screenshot = await takeScreenshot(target, selector, padding)
//     if (screenshot) {
//       res.type('image/png')
//       res.header('Cache-Control', `max-age=${MAX_AGE}, s-max-age=${MAX_AGE}, public, must-revalidate`)
//       res.send(screenshot)
//     } else {
//       res.status(422)
//       return res.end()
//     }
//   } catch (e) {
//     console.error(e)
//     res.status(500)
//     res.end()
//   }
// })

app.listen(PORT, () => console.log(`Hotshot listening on port ${PORT}.`))

async function takeScreenshot (url, selector, padding = 0) {
  let screenshot
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  })
  const page = await browser.newPage()

  page.setDefaultNavigationTimeout(TIMEOUT)
  page.setViewport({ width: 500, height: 300, deviceScaleFactor: 1 })

  await page.goto(url, { waitUntil: 'networkidle0' })

  const rect = await page.evaluate(selector => {
    const element = document.querySelector(selector)
    if (!element) {
      return null
    }
    const { x, y, width, height } = element.getBoundingClientRect()
    return { left: x, top: y, width, height, id: element.id }
  }, selector)

  if (rect) {
    screenshot = await page.screenshot({
      clip: {
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2
      },
      encoding:'base64'
    })
    console.log(`📸 ${url} => ${selector}`)
  } else {
    console.error(`💥 Can't find selector ${selector}`)
  }

  browser.close()
  return screenshot
}
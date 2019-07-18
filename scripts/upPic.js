const Koa = require('koa')
const views = require('koa-views')
const path = require('path')
const convert = require('koa-convert')
const static = require('koa-static')
const {uploadFile} = require('../util/upload.js')

const app = new Koa()

app.use(views(path.join(__dirname,'../view'),{
  extension: 'ejs'
}))

const staticPath = '../static'

app.use(convert(static(
  path.join(__dirname, staticPath)
)))

app.use(async ctx => {
  if(ctx.method === 'GET') {
    let title = 'upload pic async'
    await ctx.render('index',{
      title
    })
  } else if(ctx.url.includes('up/pic.json') && ctx.method === 'POST') {
    let result = {success: false}
    let serverFilePath = path.join(__dirname,'../static/image')

    result = await uploadFile(ctx, {
      fileType: 'album',
      path: serverFilePath
    })
    
    ctx.body = result
  } else {
    ctx.body = '<h1>404！！！</h1>'
  }
})

app.listen(8005, ()=>{
  console.log(`[demo] upload-pic-async is starting at port 8005`)
})
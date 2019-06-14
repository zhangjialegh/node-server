const path = require('path')
const fs = require('fs')
const Busboy = require('busboy')

function mkdirsSync(dirname) {
  if(fs.existsSync(dirname)) {
    return true
  } else {
    if(mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

function getSuffixName(fileName) {
  let nameList = fileName.split('.')
  return nameList[nameList.length - 1]
}

function uploadFile(ctx,options) {
  let req = ctx.req
  let busboy = new Busboy({headers: req.headers})

  let fileType = options.fileType || 'common'
  let filePath = path.join(options.path, fileType)

  return new Promise((resolve,reject) => {
    console.log('文件上传中...')
    let result = {
      success: false,
      message: '',
      data: null
    }

    busboy.on('file',function (fieldname, file, filename, encoding, minetype) {
      let fileName = Math.random().toString(16).substr(2) + '.' + getSuffixName(filename)
      let _uploadFilePath = path.join(filePath, fileName)
      let saveTo = path.join(_uploadFilePath)

      file.pipe(fs.createWriteStream(saveTo))

      file.on('end', function(){
        result.success = true
        result.message = '文件上传成功'
        result.data = {
          pictureUrl: `//${ctx.host}/image/${fileType}/${fileName}`
        }

        console.log('文件上传成功！')
        resolve(result)
      })
    })

    busboy.on('finish',function(){
      console.log('文件上结束')
      resolve(result)
    })

    busboy.on('error',function(err){
      console.log('文件上出错')
      reject(result)
    })

    req.pipe(busboy)
  })
}

module.exports = {
  uploadFile
}
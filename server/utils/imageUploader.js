import expressAsyncHandler from 'express-async-handler'
import path from 'path'
import slugify from 'slugify'
import sharp from 'sharp'
import axios from 'axios'
import aws4 from 'aws4'
import fs from 'fs'
import User from '../models/User.js'

/* 
  @Desc:   Uploads a photo to the images folder
  @Route:  POST /api/auth/image
  @Access: Private. This will upload a photo to the images folder, then it takes it from the folder and uploads it to CDN.
*/

export const imageUploader = expressAsyncHandler(async (req, res) => {
  // console.log(req.files);
  if (!req.files) {
    return res.status(400).json({ message: `Please upload a file` })
  }

  const file = req.files.file
  // make sure image is a photo
  if (!file.mimetype.startsWith('image')) {
    return res
      .status(400)
      .json({ message: `Please make sure to upload an image` })
  }
  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return res.status(400).json({
      message: `File was too large, please upload an image less than ${process.env.MAX_FILE_UPLOAD} or 1MB`,
    })
  }

  // ***NOTE*** Path.parse() returns a {}, youll need to .name to access {name: String} for slugify
  const fileName = path.parse(file.name)

  // Create custom filename
  file.name = slugify(`${fileName.name}`, { lower: true }) + `-photo.png`

  // move file to the public images folder
  file.mv(`public/images/${file.name}`, async (err) => {
    await sharp(file.data)
      .resize(300, 300)
      .toFormat('png') //png or webp instead of jpeg
      .toFile(`public/images/${file.name}`)

    if (err) {
      console.log(err)
      return res
        .status(500)
        .json({ message: `Problem with file being moved to filesystem` })
    }
  })

  try {
    const user = await User.findOne({ username: req.user.username })
    const username = user.username

    const photo = fs.readFileSync(`public/images/${file.name}`)

    let request = {
      host: process.env.CDN_HOST,
      method: 'PUT',
      url: `https://${process.env.CDN_HOST}/${process.env.CDN_BUCKET}/${username}/images/${file.name}`,
      path: `/${process.env.CDN_BUCKET}/${username}/images/${file.name}`,
      data: photo,
      body: photo,
      headers: {
        //content-type should be application/octet-stream which means binary data or a stream of bytes
        'Content-Type': 'application/octet-stream',
      },
      service: 's3',
      region: 'us-east-1',
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }

    let signedRequest = aws4.sign(request, {
      accessKeyId: process.env.CDN_KEY,
      secretAccessKey: process.env.CDN_SECRET,
    })

    //delete the Host and Content-Length headers
    delete signedRequest.headers.Host
    delete signedRequest.headers['Content-Length']

    const response = await axios(signedRequest)

    console.log('success to user bucket', response.status)
  } catch (error) {
    console.error(error)

    return res.json({
      message: `Problem with uploading photo to User's Bucket`,
    })
  }

  try {
    const photo = fs.readFileSync(`public/images/${file.name}`)
    //also want to upload the photo's to the image folder in the truthcasting bucket, because if we delete the user's bucket, the photo's will be deleted as well
    let request = {
      host: process.env.CDN_HOST,
      method: 'PUT',
      url: `https://${process.env.CDN_HOST}/${process.env.CDN_BUCKET}/${username}/images/${file.name}`,
      path: `/${process.env.CDN_BUCKET}/${username}/images/${file.name}`,
      data: photo,
      body: photo,
      headers: {
        //content-type should be application/octet-stream which means binary data or a stream of bytes
        'Content-Type': 'application/octet-stream',
      },
      service: 's3',
      region: 'us-east-1',
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }

    let signedRequest = aws4.sign(request, {
      accessKeyId: process.env.CDN_KEY,
      secretAccessKey: process.env.CDN_SECRET,
    })

    //delete the Host and Content-Length headers
    delete signedRequest.headers.Host
    delete signedRequest.headers['Content-Length']

    const response = await axios(signedRequest)
    //need to get the image url from the response and return it to the user
    const imageUrl = `https://${process.env.CDN_HOST}/${process.env.CDN_BUCKET}/images/${file.name}`
    res.json({ imageUrl })
    console.log(imageUrl)

    //update user's profile image
    await User.findOneAndUpdate(
      { username: req.user.username },
      { $set: { profileImageUrl: imageUrl } }
    )
    //console.log('success to image folder', response.status)
    //console.log(response)

    fs.unlinkSync(`public/images/${file.name}`)
  } catch (error) {
    console.log(error)
    return res.json({
      message: `Problem with uploading photo to Image's Bucket`,
    })
  }
})

export default imageUploader

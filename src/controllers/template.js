const Template = require("../models/templates");
const Userupload = require("../models/upload");
const Musicupload = require("../models/uploadMedia");
const Block = require("../models/templateBlocks");
const Scene = require("../models/lastBlock");
const UserVideos = require("../models/userVideos");
const User = require("../models/user");
const fs = require("fs");
var gl = require("gl")(10, 10);
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
var ffprobe = require("ffprobe-static");
const Jimp = require("jimp");
ffmpeg.setFfprobePath(ffprobe.path);
ffmpeg.setFfmpegPath(ffmpegPath);

var userId;
// const ffprobe = require('node-ffprobe')
// const ffprobeInstaller = require('@ffprobe-installer/ffprobe')

// //console.log(ffprobeInstaller.path, ffprobeInstaller.version)

// ffprobe.FFPROBE_PATH = ffprobeInstaller.path
const concat = require("ffmpeg-concat");
const glob = require("glob");
const userVideos = require("../models/userVideos");
const user = require("../models/user");

var assetsPath = "./src/Assets/";
var fonts = [
  {
    family: "'Montserrat', sans-serif",
    file: "./src/Assets/fonts/Montserrat-Regular.ttf",
    light: "./src/Assets/fonts/Montserrat-Light.ttf",
  },
  {
    family: "'Lato', sans-serif",
    file: "./src/Assets/fonts/Lato-Regular.ttf",
    light: "./src/Assets/fonts/Lato-Light.ttf",
  },
  {
    family: "'Oswald', sans-serif",
    file: "./src/Assets/fonts/Oswald-Regular.ttf",
    light: "./src/Assets/fonts/Oswald-Light.ttf",
  },
  {
    family: "'Roboto', sans-serif",
    file: "./src/Assets/fonts/Roboto-Regular.ttf",
    light: "./src/Assets/fonts/Roboto-Light.ttf",
  },
  {
    family: "'Noto Serif', serif",
    file: "./src/Assets/fonts/NotoSerif-Regular.ttf",
    light: "./src/Assets/fonts/NotoSerif-Regular.ttf",
  },
];
//Upload
exports.upload = async (req, res, next) => {
  //const sharp = require("sharp");
  console.log("heressss");
  console.log(req.file);
  try {
    const file = req.file;
    if (file) {
      const filePath = file.path;
      //Save Event Image
      if (filePath) {
        try {
          if (!req.body.noUpload) {
            if (req.file.mimetype !== "video/mp4") {
              console.log("there")
              const filename =
                req.file.destination +
                "/file--" +
                Date.now() +
                "--" +
                req.file.filename;
              // const img = await sharp(req.file.path)
              //   // .resize(200, 200)
              //   .jpeg({ quality: 50 })
              //   .toFile(filename
              //   );
              // const newUpload = new Userupload({
              //   fieldname: "file",
              //   originalname: req.file.originalname,
              //   mimetype: req.file.mimetype,
              //   destination: req.file.destination,
              //   filename: req.file.filename,
              //   path:filename,
              //   size: req.file.size,
              //   userId: req.body.userId,
              //   templateId: req.body.templateId,
              // });
              // fs.unlink(req.file.path, function (err) {
              //   // if (err) throw err;
              // });
              // const uploadData = await newUpload.save();
              // res.status(200).json({ message: filename });
              console.log('hetresssss')
              Jimp.read(req.file.path)
                .then((img) => {
                  img
                    .quality(65) // set JPEG quality
                    .write(filename); // save
                  setTimeout(async function () {
                    const newUpload = new Userupload({
                      fieldname: "file",
                      originalname: req.file.originalname,
                      mimetype: req.file.mimetype,
                      destination: req.file.destination,
                      filename: req.file.filename,
                      path: filename,
                      size: req.file.size,
                      userId: req.body.userId,
                      templateId: req.body.templateId,
                    });
                    setTimeout(function () {
                      fs.unlink(req.file.path, function (err) {
                        // if (err) throw err;
                      });
                    }, 500);
                    const uploadData = await newUpload.save();
                    console.log('hetre')
                    res.status(200).json({ message: filename });
                  }, 100);
                })
                .catch(async (err) => {

                  const newUpload = new Userupload({
                    ...file,
                    userId: req.body.userId,
                    templateId: req.body.templateId,
                  });
                  const uploadData = await newUpload.save();
                  res.status(200).json({ message: filePath });
                });

            } else {

              const newUpload = new Userupload({
                ...file,
                userId: req.body.userId,
                templateId: req.body.templateId,
              });
              const uploadData = await newUpload.save();
              res.status(200).json({ message: filePath });
            }
          } else {

            const filename = req.file.destination + '/' + req.file.filename;
            res.status(200).json({ message: filename });
          }
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      }
    } else {
      res.status(500).json({ message: error.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Upload
exports.uploadMedia = async (req, res, next) => {
  console.log("heressss");
  try {
    const file = req.file;
    if (file) {
      const filePath = file.path;
      //console.log(file)
      //Save Event Image
      if (filePath) {
        try {
          const newUpload = new Musicupload({
            ...file,
            userId: req.body.userId,
            templateId: req.body.templateId,
            adminMedia: req.body.adminMedia,
          });
          const uploadData = await newUpload.save();
          res.status(200).json({ message: filePath });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      }
    } else {
      res.status(500).json({ message: error.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const cutVideo = async (sourcePath, outputPath, startTime, duration) => {
  console.log("start cut video");
  const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
  const ffmpeg = require("fluent-ffmpeg");
  var ffprobe = require("ffprobe-static");
  ffmpeg.setFfprobePath(ffprobe.path);
  ffmpeg.setFfmpegPath(ffmpegPath);
  await new Promise((resolve, reject) => {
    ffmpeg(sourcePath)
      // .setFfmpegPath(ffmpegPath)
      // .setFfprobePath(ffprobe)
      .output(outputPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .withVideoCodec("copy")
      .withAudioCodec("copy")
      .on("end", function (err) {
        if (!err) {
          console.log("conversion Done");
          resolve("ok");
        }
      })
      .on("error", function (err) {
        console.log("error: ", err);
        reject(err);
      })
      .run();
  });
};
//Upload
exports.editVideo = async (req, res, next) => {
  console.log("here");
  console.log(req.body);
  try {
    let filename = "video-" + Date.now() + "-video.mp4";
    let sourcePath = "./src/Assets/" + req.body.path;
    var outputPath = "./src/Assets/template/" + filename;
    let startTime = req.body.sceneData.start;
    let duration =
      parseFloat(req.body.sceneData.end) - req.body.sceneData.start;
    const cut = await cutVideo(sourcePath, outputPath, startTime, duration);
    if (cut == undefined) {
      console.log("jhere");
      console.log(outputPath);
      const newUpload = new Musicupload({
        originalname: filename,
        mimetype: "video/mpeg",
        filename: filename,
        path: "./src/Assets/template/" + filename,
        size: "296000077",
        userId: req.body.userId,
        templateId: req.body.templateId,
        adminMedia: false,
      });
      const uploadData = await newUpload.save();
      res.status(200).json({ message: "template/" + filename });
    }
    console.log(cut);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/** @route GET admin/user
 *   @desc Returns all users
 *   @access Public
 */
exports.getAdminTemplates = async function (req, res) {
  try {
    const datas = Template.aggregate(
      [
        {
          $match: { adminTemplate: true },
        },
        {
          $project: {
            _id: {
              $toString: "$_id",
            },
            userId: "$userId",
            title: "$title",
            templateImage: "$templateImage",
            templatePreview: "$templatePreview",
            sceneOrder: "$sceneOrder",
            templateCategory: "$templateCategory",
            musicFile: "$musicFile",
            templateScenes: "$templateScenes",
            templateId: "$templateId",
            fontWeight: "$fontWeight",
            fontSize: "$fontSize",
            fontFamily: "$fontFamily",
            fontColor: "$fontColor",
          },
        },
        {
          $lookup: {
            from: `templateblocks`,
            localField: "_id",
            foreignField: "templateId",
            as: "blocks",
          },
        },
      ],
      function (err, data) {
        if (err) throw err;
        res.status(200).json({ message: "Template Data", template: data });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** @route GET admin/user
 *   @desc Returns all users
 *   @access Public
 */

exports.addAdminTemplates = async function (req, res) {
  try {
    const sceneOrder = req.body.sceneOrder;

    var scenes = [];
    await sceneOrder.map((data, index) => {
      scenes = [...scenes]; // copying the old datas array
      scenes[index] = {
        sceneTitle: data.sceneTitle,
        id: data._id,
      };
    });
    var tempId = "";
    if (req.body.templateId) {
      tempId = req.body.templateId;
    }
    const user = await User.findById(req.body.userId);
    //console.log(user);
    const newTemplate = new Template({
      userId: req.body.userId,
      templateId: tempId,
      title: "Untitled Video",
      templateImage: req.body.templateImage,
      templatePreview: req.body.templatePreview,
      adminTemplate: req.body.adminTemplate,
      templateCategory: req.body.templateCategory,
      templateScenes: scenes,
    });
    const tempateData = await newTemplate.save();
    //console.log(tempateData);
    var newArr = [];
    var blockData = [];

    await sceneOrder
      .sort((a, b) => a.order - b.order)
      .map(async (data, index) => {
        if (user.userPlan == 0) {
          if (index <= 1) {
            const newBlock = new Block({
              sceneId: data.sceneId,
              templateId: data._id,
              sceneTitle: data.sceneTitle,
              sceneThumbnail: data.sceneThumbnail,
              sceneData: data.sceneData,
              order: index + 1,
              templateId: tempateData._id,
            });
            let newblockData = await newBlock.save();
            blockData.push(newblockData);
          }
        } else {
          const newBlock = new Block({
            sceneId: data.sceneId,
            templateId: data._id,
            sceneTitle: data.sceneTitle,
            sceneThumbnail: data.sceneThumbnail,
            sceneData: data.sceneData,
            order: index + 1,
            templateId: tempateData._id,
          });
          let newblockData = await newBlock.save();
          blockData.push(newblockData);
        }
      });

    if (req.body.lastSceneOption == false) {

      const sceneData = await Scene.findOne({ templateId: "1" });
      const newScene = new Scene({
        sceneId: sceneData.sceneId,
        templateId: tempateData._id,
        sceneTitle: sceneData.sceneTitle,
        sceneThumbnail: sceneData.sceneThumbnail,
        sceneData: sceneData.sceneData,
      });
      const blockDatas = await newScene.save();
    }
    setTimeout(function () { res.status(200).json({ message: "Template created", blockData: blockData }) }, 1000);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTemplate = async function (req, res) {
  try {
    const { id } = req.body;
    // Make sure to update existing division
    const template = await Template.findOne({ _id: id });
    if (!template) {
      return res.status(200).json({ message: "Template not found" });
    }
    //console.log(req.body);
    // // Update existing division
    const templateUpdate = await Template.findOneAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true, useFindAndModify: false }
    );
    if (req.body.fontFamily && typeof req.body.fontFamily != undefined) {
      const templateBlock = await Block.find({ templateId: id });
      const lastBlock = await Scene.find({ templateId: id });
      //console.log(lastBlock);
      //console.log(templateBlock);
      let blockData;
      lastBlock.map(async function (data) {
        let color, textsize, fontweight, fontfamily;
        if (req.body.fontFamily) {
          fontfamily = req.body.fontFamily;
        } else {
          fontfamily = data.sceneData.fontFamily;
        }
        if (req.body.fontColor) {
          color = req.body.fontColor;
        } else {
          color = data.sceneData.textColor;
        }
        if (req.body.fontWeight) {
          fontweight = req.body.fontWeight;
        } else {
          fontweight = data.sceneData.fontWeight;
        }
        if (req.body.fontSize) {
          textsize = req.body.fontSize;
        } else {
          textsize = data.sceneData.textSize;
        }
        if (data.sceneData.textArray) {
          let newArr = [...data.sceneData.textArray]; // copying the old datas
          data.sceneData.textArray.map(async function (data, arrayIndex) {
            newArr[arrayIndex] = {
              text: newArr[arrayIndex].text,
              fontSize: textsize,
              fontFamily: fontfamily,
              fontWeight: fontweight,
              fontLineHeight: newArr[arrayIndex].fontLineHeight,
              fontAlignment: newArr[arrayIndex].fontAlignment,
              fontColor: color,
              fontCapitalize: newArr[arrayIndex].texttransform,
              x: newArr[arrayIndex].x,
              y: newArr[arrayIndex].y,
              boxWidth: newArr[arrayIndex].boxWidth,
              boxHeight: newArr[arrayIndex].boxHeight,
            };
          });
          blockData = {
            media: data.sceneData.media,
            time: 4,
            textArray: newArr,
          };
        }
        const templateBlockUpdate = await Scene.findOneAndUpdate(
          { _id: data._id },
          { $set: { sceneData: blockData } },
          { new: true, useFindAndModify: false }
        );
      });
      templateBlock.map(async function (data) {
        let color, textsize, fontweight, fontfamily;
        if (req.body.fontFamily) {
          fontfamily = req.body.fontFamily;
        } else {
          fontfamily = data.sceneData.fontFamily;
        }
        if (req.body.fontColor) {
          color = req.body.fontColor;
        } else {
          color = data.sceneData.textColor;
        }
        if (req.body.fontWeight) {
          fontweight = req.body.fontWeight;
        } else {
          fontweight = data.sceneData.fontWeight;
        }
        if (req.body.fontSize) {
          textsize = req.body.fontSize;
        } else {
          textsize = data.sceneData.textSize;
        }
        if (data.sceneData.textArray) {
          let newArr = [...data.sceneData.textArray]; // copying the old datas
          data.sceneData.textArray.map(async function (data, arrayIndex) {
            newArr[arrayIndex] = {
              text: newArr[arrayIndex].text,
              fontSize: textsize,
              fontFamily: fontfamily,
              fontWeight: fontweight,
              fontLineHeight: newArr[arrayIndex].fontLineHeight,
              fontAlignment: newArr[arrayIndex].fontAlignment,
              fontColor: color,
              fontCapitalize: newArr[arrayIndex].texttransform,
              x: newArr[arrayIndex].x,
              y: newArr[arrayIndex].y,
              boxWidth: newArr[arrayIndex].boxWidth,
              boxHeight: newArr[arrayIndex].boxHeight,
            };
          });
          blockData = {
            media: data.sceneData.media,
            time: 4,
            textArray: newArr,
          };
        } else {
          blockData = {
            content: data.sceneData.content,
            textAligmnet: data.sceneData.textAligmnet,
            textColor: color,
            textlineHeight: data.sceneData.textlineHeight,
            textSize: textsize,
            x: data.sceneData.x,
            y: data.sceneData.y,
            boxwidth: data.sceneData.boxwidth,
            boxheight: data.sceneData.boxheight,
            textTransform: data.sceneData.textTransform,
            media: data.sceneData.media,
            time: data.sceneData.time,
            fontFamily: fontfamily,
            fontWeight: fontweight,
            titleFontFamily: fontfamily,
            titleFontWeight: fontweight,
            titleColor: color,
            titletextSize: textsize,
          };
        }
        const templateBlockUpdate = await Block.findOneAndUpdate(
          { _id: data._id },
          { $set: { sceneData: blockData } },
          { new: true, useFindAndModify: false }
        );
      });
      res.status(200).json({
        message: "Template has been updated",
      });
    } else if (req.body.data && typeof req.body.data != undefined) {
      const templateBlock = await Block.find({ templateId: id });
      const order = parseInt(templateBlock[templateBlock.length - 1].order) + 1;
      const newBlock = new Block({
        templateId: id,
        order: order,
        sceneId: req.body.data.sceneId,
        sceneTitle: req.body.data.sceneTitle,
        sceneThumbnail: req.body.data.sceneThumbnail,
        sceneData: req.body.data.sceneData,
      });
      const blockData = await newBlock.save();
      res.status(200).json({
        templateUpdate,
        message: "Template has been updated",
      });
    } else {
      res.status(200).json({
        templateUpdate,
        message: "Template has been updated",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminTemplate = async (req, res, next) => {
  var mongoose = require("mongoose");
  const { templateId } = req.query;
  var id = mongoose.Types.ObjectId(templateId);
  try {
    const datas = Template.aggregate(
      [
        {
          $match: { _id: id },
        },
        {
          $project: {
            _id: {
              $toString: "$_id",
            },
            userId: "$userId",
            title: "$title",
            templateImage: "$templateImage",
            templatePreview: "$templatePreview",
            sceneOrder: "$sceneOrder",
            templateCategory: "$templateCategory",
            musicFile: "$musicFile",
            templateScenes: "$templateScenes",
            templateId: "$templateId",
            fontWeight: "$fontWeight",
            fontSize: "$fontSize",
            fontFamily: "$fontFamily",
            fontColor: "$fontColor",
          },
        },
        {
          $lookup: {
            from: `templateblocks`,
            // localField: "_id",
            // foreignField: "templateId",
            let: {
              templateId: "$_id",
            },
            pipeline: [
              {
                $match: { $expr: { $eq: ["$templateId", "$$templateId"] } },
              },
              {
                $sort: { order: 1 },
              },
            ],
            as: "blocks",
          },
        },
      ],
      function (err, data) {
        if (err) throw err;
        res.status(200).json({ message: "Template Data", data: data });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** @route Delete block
 *   @desc Delete block
 *   @access Public
 */
exports.deleteBlock = async function (req, res) {
  try {
    const id = req.query.blockId;
    const block = await Block.findOneAndDelete({
      _id: id,
    });
    console.log(id)
    if (block == null) {
      const lasttemplate = await Scene.findOneAndDelete({
        _id: id,
      });

      console.log(lasttemplate)
    }

   
    res.status(200).json({ message: "Block has been deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMedia = async function (req, res) {
  try {
    const id = req.query.mediaId;
    const mediaPath = req.query.media;

    const block = await Userupload.findOneAndDelete({
      _id: id,
    });
    var fs = require("fs");
    fs.unlink(assetsPath + mediaPath, function (err) {
      // if (err) throw err;
      console.log("File deleted!");
    });
    res.status(200).json({ message: "File deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteVideo = async function (req, res) {
  //console.log(req.query);
  try {
    const id = req.query.mediaId;
    const mediaPath = req.query.media;
    const block = await userVideos.findOneAndDelete({
      _id: id,
    });
    var fs = require("fs");
    fs.unlink(assetsPath + mediaPath, function (err) {
      // if (err) throw err;
      console.log("File deleted!");
    });
    res.status(200).json({ message: "File deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** @route Delete block
 *   @desc Delete block
 *   @access Public
 */
exports.deleteTemplate = async function (req, res) {
  try {
    const id = req.query.templateId;
    const template = await Template.findOneAndDelete({
      _id: id,
    });
    const block = await Block.deleteMany({
      templateId: id,
    });
    const lasttemplate = await Scene.findOneAndDelete({
      templateId: id,
    });
    res.status(200).json({ message: "Block has been deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Upload
exports.getTemplate = async (req, res, next) => {
  var mongoose = require("mongoose");
  const { userId } = req.query;
  try {
    const datas = Template.aggregate(
      [
        {
          $match: { userId: userId, adminTemplate: false },
        },
        {
          $project: {
            _id: {
              $toString: "$_id",
            },
            userId: "$userId",
            title: "$title",
            templateImage: "$templateImage",
            templatePreview: "$templatePreview",
            templateCategory: "$templateCategory",
            musicFile: "$musicFile",
          },
        },
        {
          $lookup: {
            from: `templateblocks`,
            localField: "_id",
            foreignField: "templateId",
            as: "blocks",
          },
        },
      ],
      function (err, data) {
        if (err) throw err;
        res.status(200).json({ message: "Template Data", data: data });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUploads = async (req, res, next) => {
  const { userId } = req.query;
  const { templateId } = req.query;
  //console.log(req.query);
  try {
    if (templateId) {
      var uploads = await Userupload.find({
        userId: userId,
        templateId: templateId,
      }).sort({
        createdAt: -1,
      });
    } else {
      var uploads = await Userupload.find({ userId: userId }).sort({
        createdAt: -1,
      });
    }
    if (typeof uploads !== "undefined" && uploads.length > 0) {
      res.status(200).json({ message: "Uploads List", data: uploads });
    } else {
      res.status(200).json({ message: "No Data Found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVideos = async (req, res, next) => {
  const { userId } = req.query;
  try {
    const uploads = await UserVideos.find({ userId: userId }).sort({
      createdAt: -1,
    });
    if (typeof uploads !== "undefined" && uploads.length > 0) {
      res.status(200).json({ message: "Uploads List", data: uploads });
    } else {
      res.status(200).json({ message: "No Data Found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getVideo = async (req, res, next) => {
  const { videoId } = req.query;
  //console.log(videoId)
  try {
    const uploads = await UserVideos.findOne({ _id: videoId });
    // console.log(uploads)
    if (uploads) {
      res.status(200).json({ message: "Uploads List", data: uploads });
    } else {
      res.status(200).json({ message: "No Data Found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMusicUploads = async (req, res, next) => {
  const { userId } = req.query;
  if (userId) {
    try {
      const uploads = await Musicupload.find({ userId: userId });
      if (typeof uploads !== "undefined" && uploads.length > 0) {
        res.status(200).json({ message: "Uploads List", data: uploads });
      } else {
        res.status(200).json({ message: "No Data Found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    try {
      const uploads = await Musicupload.find({ adminMedia: true });
      if (typeof uploads !== "undefined" && uploads.length > 0) {
        res.status(200).json({ message: "Uploads List", data: uploads });
      } else {
        res.status(200).json({ message: "No Data Found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
/**
 * @function  addTemplate used to create new Event
 * @route POST /api/template/add-template
 * @desc Add Event
 * @access Admin
 */
exports.addTemplate = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const { templateNumber } = req.body;
    const template = await Template.findOne({
      userId: userId,
      templateNumber: templateNumber,
    });
    var tempateData;
    if (!template) {
      const newTemplate = new Template({ ...req.body });
      tempateData = await newTemplate.save();
      res
        .status(200)
        .json({ message: "Template successfully created", data: tempateData });
    } else {
      tempateData = await Template.findOneAndUpdate(
        { templateNumber: templateNumber, userId: userId },
        { $set: req.body },
        { new: true, useFindAndModify: false }
      );
      const datas = Template.aggregate(
        [
          {
            $match: { userId: userId, templateNumber: templateNumber },
          },
          {
            $project: {
              _id: {
                $toString: "$_id",
              },
              userId: "$userId",
              templateNumber: "$templateNumber",
              globalFontTitle: "$globalFontTitle",
              globalFontSubTitle: "$globalFontSubTitle",
              globaltitleColor: "$globaltitleColor",
              globalsubtitleColor: "$globalsubtitleColor",
              globalfontFamily: "$globalfontFamily",
            },
          },
          {
            $lookup: {
              from: `templateblocks`,
              localField: "_id",
              foreignField: "templateId",
              as: "blocks",
            },
          },
        ],
        function (err, data) {
          if (err) throw err;
          res
            .status(200)
            .json({ message: "Template successfully created", data: data });
        }
      );
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @function  addBlock used to create new Event
 * @route POST /api/template/add-block
 * @desc Add Event
 * @access Admin
 */
exports.addBlock = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const { blockId } = req.body;
    const { templateNumber } = req.body;
    const { templateId } = req.body;
    const templateBlock = await Block.findOne({
      templateId: templateId,
      blockId: blockId,
    });
    await Template.findOneAndUpdate(
      { templateNumber: templateNumber, userId: userId },
      { $set: req.body },
      { new: true, useFindAndModify: false }
    );
    var tempateData;
    if (!templateBlock) {
      const newTemplate = new Block({ ...req.body, templateId: templateId });
      tempateData = await newTemplate.save();
    } else {
      tempateData = await Block.findOneAndUpdate(
        { templateId: templateId, blockId: blockId },
        { $set: req.body },
        { new: true, useFindAndModify: false }
      );
    }
    res
      .status(200)
      .json({ message: "Template successfully created", data: tempateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** @route PUT api/division/{id}
 *   @desc Update division details
 *   @access Public
 */
exports.update = async function (req, res) {
  try {
    const { id } = req.body;
    //Make sure to update existing division
    const scene = await Block.findOne({ _id: id });
    if (!scene) {
      return res.status(200).json({ message: "Scene not found" });
    }

    // Update existing division
    const sceneUpdate = await Block.findOneAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true, useFindAndModify: false }
    );
    res.status(200).json({ sceneUpdate, message: "Scene has been updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @function  addBlock used to create new Event
 * @route POST /api/template/create-videos
 * @desc Add Event
 * @access Admin
 */
exports.createVideo = async (req, res, next) => {
  console.log("here");
  const { templateId } = req.body;
  try {
    const templateBlock = await Block.find({ templateId: templateId });
    const template = await Template.findOne({ _id: templateId });
    const data = {
      templateBlock: templateBlock,
      template: template,
    };
    // console.log(template)
    userId = template.userId;
    if (templateBlock) {
      const folderName = "./src/Assets/template/videos/" + userId;
      try {
        if (!fs.existsSync(folderName)) {
          fs.mkdirSync(folderName);
        }
      } catch (err) {
        console.error(err);
      }
      let functionName = "videoTemplate" + template.templateNumber;
      await global[functionName](data, req, res);
    } else {
      res.status(200).json({ message: "Video failed 1" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

global.videoTemplate1 = async function videoTemplate1(data, req, res) {
  var block2, block3, block4;
  var command = new ffmpeg();
  var fontfamily = data.template.globalfontFamily;

  var selectedfonts;
  var selectedfontsLight;
  fonts.map(function (font) {
    if (font.family == fontfamily) {
      selectedfonts = font.file;
      selectedfontsLight = font.light;
    }
  });

  var numberOfBlocks = data.templateBlock.length;
  data.templateBlock.map(function (block) {
    if (block.blockId == 1) {
      console.log(block.blockData.containerTwo);
      var container1, container2, container3, container4, videoCheck;
      if (block.blockData.containerOne) {
        container1 = "./src/Assets/" + block.blockData.containerOne;
      }
      if (block.blockData.containerTwo) {
        container2 = "./src/Assets/" + block.blockData.containerTwo;
      }
      if (block.blockData.containerOne) {
        container3 = "./src/Assets/" + block.blockData.containerThree;
      }
      if (block.blockData.containerFour) {
        container4 = "./src/Assets/" + block.blockData.containerFour;
      }
      if (
        block.blockData.imageFour == "" &&
        block.blockData.containerFour != ""
      ) {
        videoCheck = 1;
      }
      block1Video(
        [container1, container2, container3, container4],
        videoCheck,
        block
      );
    }
    if (block.blockId == 2) {
      block2 = block;
    }
    if (block.blockId == 3) {
      block3 = block;
      //block3Video(block3, req, res)
    }
    if (block.blockId == 4) {
      block4 = block;
      //block4Video(block4, req, res)
    }
  });
  async function block1Video(inputs, videoCheck, block) {
    let videoChecks = videoCheck;
    const folderName = "./src/Assets/template/videos/" + userId + "/template1";
    try {
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
      }
    } catch (err) {
      console.error(err);
    }
    inputs.forEach((input) => {
      command.input(input);
    });
    if (videoChecks == 1) {
      command
        .complexFilter(
          "[0:v]  setpts=PTS-STARTPTS, scale=950:530,pad=960:540:5:5:white [a0];[1:v] setpts=PTS-STARTPTS, scale=950:530,pad=960:540:5:5:white [a1];[2:v] setpts=PTS-STARTPTS,  scale=950:530,pad=960:540:5:5:white [a2];[3:v] setpts=PTS-STARTPTS,  scale=950:530,pad=960:540:5:5:white [a3];[a0][a1][a2][a3]xstack=inputs=4:layout=0_0|0_h0|w0_0|w0_h0[out]"
        )
        .addOption("-map", "[out]")
        .addOption("-c:v", "libx264")
        .save(
          "./src/Assets/template/videos/" +
          userId +
          "/template1/block-1-video-1.mp4"
        )
        .on("start", function (commandLine) {
          console.log("step1");
        })
        .on("error", function (er) {
          console.log(er);
          console.log("error occured: " + er.message);
        })
        .on("end", function () {
          if (block.blockData.blockTitle) {
            var datas = {
              block: block,
              file:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block-1-video-1.mp4",
            };
            block1VideoTxt(datas, req, res);
          } else {
            return res.status(200).json({
              message: "Video created",
              data:
                "template/videos/" + userId + "/template1/block-1-video-1.mp4",
            });
          }
        });
    } else {
      command
        .complexFilter(
          "[0:v]  setpts=PTS-STARTPTS, scale=630:470,pad=640:480:5:5:white [a0];[1:v] setpts=PTS-STARTPTS, scale=630:470,pad=640:480:5:5:white [a1];[2:v] setpts=PTS-STARTPTS,  scale=630:470,pad=640:480:5:5:white [a2];[3:v] setpts=PTS-STARTPTS,  scale=630:470,pad=640:480:5:5:white [a3];[a0][a1][a2][a3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0[out]"
        )
        .loop("5")
        .addOption("-map", "[out]")
        .addOption("-t", "5")
        .addOption("-c:v", "libx264")
        .save(
          "./src/Assets/template/videos/" +
          userId +
          "/template1/block-1-video-1.mp4"
        )
        .on("start", function (commandLine) {
          console.log("step1");
        })
        .on("error", function (er) {
          res.status(200).json({ message: "Video failed" });
          return;
        })
        .on("end", function () {
          if (block.blockData.blockTitle) {
            var datas = {
              block: block,
              file:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block-1-video-1.mp4",
            };
            block1VideoTxt(datas, req, res);
          } else {
            res.status(200).json({
              message: "Video created",
              data:
                "template/videos/" + userId + "/template1/block-1-video-1.mp4",
            });
            return;
          }
        });
    }

    function block1VideoTxt(datas, req, res) {
      var commands = ffmpeg();
      var titleColor = datas.block.blockData.titleColor;
      if (titleColor.lenth == "4") {
        titleColor = titleColor.replaceAll(
          "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
          "#$1$1$2$2$3$3"
        );
      }
      var subtitleColor = datas.block.blockData.subtitleColor;
      if (subtitleColor.lenth == "4") {
        subtitleColor = subtitleColor.replaceAll(
          "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
          "#$1$1$2$2$3$3"
        );
      }
      ffmpeg(datas.file)
        .complexFilter(
          [
            "scale=1920:1080[rescaled]",
            {
              filter: "drawbox",
              options: {
                x: 0,
                y: 0,
                color: "white",
                t: "fill",
                enable: "between(t,0,0.30)",
              },
              inputs: "rescaled",
              outputs: "output1",
            },
            {
              filter: "drawbox",
              options: {
                x: "(w - 120)",
                y: "(h - 60)",
                height: 400,
                width: 720,
                color: "white",
                t: "fill",
                enable: "between(t,0.50,60000)",
              },
              inputs: "output1",
              outputs: "output2",
            },
            {
              filter: "drawbox",
              options: {
                x: "(w - 240)",
                y: "(h - 180)",
                height: 480,
                width: 800,
                color: "white",
                t: "2",
                enable: "between(t,0.40,60000)",
              },
              inputs: "output2",
              outputs: "output3",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts,
                text: datas.block.blockData.blockTitle,
                fontsize:
                  parseInt(datas.block.blockData.blocktitleFontsize) + 20,
                fontcolor: titleColor,
                line_spacing: "20",
                x: "(w-text_w)/2",
                y: "(h-text_h-50)/2",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "50",
                bordercolor: "white",
                enable: "between(t,1.1,10000)",
              },
              inputs: "output3",
              outputs: "output4",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts,
                text: datas.block.blockData.blocksubTitle,
                fontsize:
                  parseInt(datas.block.blockData.blocksubTitleFontsize) + 20,
                fontcolor: subtitleColor,
                x: "(w-text_w )/2",
                y: "(h-text_h + 70)/2",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "50",
                bordercolor: "white",
                enable: "between(t,2,10000)",
              },
              inputs: "output4",
              outputs: "output",
            },
          ],
          "output"
        )
        .addOption("-c:v", "libx264")
        .save(
          "./src/Assets/template/videos/" +
          userId +
          "/template1/block-1-text-video.mp4"
        )
        .on("start", function (commandLine) {
          console.log("step2");
        })
        .on("error", function (er) {
          res.status(200).json({ message: "Video failed 3" });
          console.log(er);
          return;
        })
        .on("end", function (commandLine) {
          if (
            typeof block2 != "undefined" &&
            typeof block2.blockData != "undefined"
          ) {
            block2Video(block2, req, res);
          } else {
            res.status(200).json({
              message: "Video created",
              data:
                "template/videos/" +
                userId +
                "/template1/block-1-text-video.mp4",
            });
            console.log("success");
            return;
          }
        });
    }
  }

  function block2Video(block2, req, res) {
    var i = 1;
    var k = 1;
    var video1, video2;
    inputs = [block2.blockData.containerOne, block2.blockData.containerTwo];
    inputs.forEach((input) => {
      var commands = new ffmpeg();
      if (
        input == block2.blockData.imageOne ||
        input == block2.blockData.imageTwo
      ) {
        commands
          .input(assetsPath + input)
          .complexFilter(
            [
              "scale=1080:720:force_original_aspect_ratio=decrease[rescaled]",
              {
                filter: "zoompan",
                options: "z='zoom+0.0009'",
                inputs: "rescaled",
                outputs: "padded",
              },
            ],
            "padded"
          )
          .loop(3)
          .addOption("-pix_fmt", "yuv420p")
          .addOption("-framerate", "50")
          .addOption("-c:v", "libx264")
          .save(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block-2-" +
            k +
            ".mp4"
          )
          .on("start", function (commandLine) {
            console.log("step3");
          })
          .on("error", function (er) {
            res.status(200).json({ message: "Video failed 4" });
            console.log(er);
            return;
          })
          .on("end", function (commandLine) {
            if (typeof video1 == "undefined") {
              // console.log(i)
              video1 =
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block-2-1.mp4";
            } else if (typeof video2 == "undefined") {
              // console.log(i)
              video2 =
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block-2-2.mp4";
            }
            if (
              i == 2 &&
              typeof video1 != "undefined" &&
              typeof video2 != "undefined"
            ) {
              //    console.log('heres');
              setTimeout(function () {
                let data = {
                  video1: video1,
                  video2: video2,
                };
                mergeBlock2Videos(data, req, res);
              }, 500);
            }
            i = i + 1;
          });
      } else {
        commands
          .input(assetsPath + input)
          .complexFilter(
            [
              // Rescale input stream into stream 'rescaled'
              "scale=1280:720[rescaled]",
            ],
            "rescaled"
          )
          .addOption("-c:v", "libx264")
          .save(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block-2-" +
            k +
            ".mp4"
          )
          .on("start", function (commandLine) {
            console.log("step4");
          })
          .on("error", function (er) {
            res.status(200).json({ message: "Video failed 5" });
            console.log(er);
            // console.log("error occured: " + er.message);
            return;
          })
          .on("end", function (commandLine) {
            if (typeof video1 == "undefined") {
              video1 =
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block-2-1.mp4";
            } else if (typeof video2 == "undefined") {
              video2 =
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block-2-2.mp4";
            }
            if (
              i == 2 &&
              typeof video1 != "undefined" &&
              typeof video2 != "undefined"
            ) {
              setTimeout(function () {
                let data = {
                  video1: video1,
                  video2: video2,
                };
                mergeBlock2Videos(data, req, res);
              }, 500);
            }

            i = i + 1;
          });
      }
      k = k + 1;
    });
    async function mergeBlock2Videos(data, req, res) {
      try {
        const Createdvideo = await concat({
          output:
            "./src/Assets/template/videos/" +
            userId +
            "/template1/blockmerged.mp4",
          videos: [data.video1, data.video2],
          transitions: [
            {
              name: "directional",
              params: { direction: [1.0, 0.0] },
              duration: 1000,
            },
          ],
        });

        if (typeof Createdvideo == "undefined") {
          setTimeout(function () {
            const datas = {
              block: block2,
            };
            block2VideoTxt(datas, req, res);
            // res.status(200).json({ message: 'Video created', data: 'template/videos/' + userId + '/template1/blockmerged.mp4' });
            // // console.log(commandLine);
            // console.log("successhere");
            // return;
          }, 600);
        }
      } catch {
        res.status(500).json({ message: "video failed 6" });
      }
      // var command = new ffmpeg();
      // command.input(data.video1);
      // command.input(data.video2);
      // command
      //     .on('start', function (commandLine) {
      //         console.log('step5');
      //     })
      //     .on("error", function (er) {
      //         console.log(er);
      //         res.status(200).json({ message: 'Video failed' });
      //         return
      //     })
      //     .on("end", function () {
      //         console.log('yhn success');
      //         setTimeout(function () {
      //             const datas = {
      //                 block: block2
      //             }
      //             block2VideoTxt(datas, req, res)

      //         }, 600);

      //     })
      //     .mergeToFile('./src/Assets/template/videos/' + userId + '/template1/blockmerged.mp4');
    }

    function block2VideoTxt(datas, req, res) {
      var commands = new ffmpeg();
      var titleColor = datas.block.blockData.titleColor;
      if (titleColor.lenth == "4") {
        titleColor = titleColor.replaceAll(
          "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
          "#$1$1$2$2$3$3"
        );
      }
      var subtitleColor = datas.block.blockData.subtitleColor;
      if (subtitleColor.lenth == "4") {
        subtitleColor = subtitleColor.replaceAll(
          "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
          "#$1$1$2$2$3$3"
        );
      }
      setTimeout(function () {
        commands
          .input(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/blockmerged.mp4"
          )
          .complexFilter(
            [
              "scale=1920:1080[checked]",
              {
                filter: "drawbox",
                options: {
                  x: 0,
                  y: 0,
                  width: 480,
                  color: "white",
                  t: "fill",
                },
                inputs: "checked",
                outputs: "firstOne",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfontsLight,
                  text: datas.block.blockData.squareFeetTitle,
                  fontsize:
                    parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                  fontcolor: titleColor,
                  line_spacing: "20",
                  x: "120",
                  y: "150",
                  box: 1,
                  boxcolor: "white@0.0",
                  boxborderw: "50",
                  bordercolor: "white",
                  enable: "between(t,1.1,10000)",
                },
                inputs: "firstOne",
                outputs: "output2",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfonts,
                  text: datas.block.blockData.squareFeet,
                  fontsize:
                    parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                  fontcolor: subtitleColor,
                  x: "120",
                  y: "220",
                  box: 1,
                  boxcolor: "white@0.0",
                  boxborderw: "50",
                  bordercolor: "white",
                  enable: "between(t,1.3,10000)",
                },
                inputs: "output2",
                outputs: "output3",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfontsLight,
                  text: datas.block.blockData.acersTitle,
                  fontsize:
                    parseInt(datas.block.blockData.blocktitleFontsize) + 15,
                  fontcolor: titleColor,
                  x: "120",
                  y: "320",
                  box: 1,
                  boxcolor: "white@0.0",
                  boxborderw: "50",
                  bordercolor: "white",
                  enable: "between(t,1.5,10000)",
                },
                inputs: "output3",
                outputs: "output4",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfonts,
                  text: datas.block.blockData.acers,
                  fontsize:
                    parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                  fontcolor: subtitleColor,
                  x: "120",
                  y: "370",
                  box: 1,
                  boxcolor: "white@0.0",
                  boxborderw: "50",
                  bordercolor: "white",
                  enable: "between(t,1.8,10000)",
                },
                inputs: "output4",
                outputs: "output5",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfontsLight,
                  text: datas.block.blockData.bedroomTitle,
                  fontsize:
                    parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                  fontcolor: titleColor,
                  x: "120",
                  y: "470",
                  box: 1,
                  boxcolor: "white@0.0",
                  boxborderw: "50",
                  bordercolor: "white",
                  enable: "between(t,2,10000)",
                },
                inputs: "output5",
                outputs: "output6",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfonts,
                  text: datas.block.blockData.bedroom,
                  fontsize:
                    parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                  fontcolor: subtitleColor,
                  x: "120",
                  y: "520",
                  box: 1,
                  boxcolor: "white@0.0",
                  boxborderw: "50",
                  bordercolor: "white",
                  enable: "between(t,2.2,10000)",
                },
                inputs: "output6",
                outputs: "output7",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfontsLight,
                  text: datas.block.blockData.bathroomTitle,
                  fontsize:
                    parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                  fontcolor: titleColor,
                  x: "120",
                  y: "620",
                  box: 1,
                  boxcolor: "white@0.0",
                  boxborderw: "50",
                  bordercolor: "white",
                  enable: "between(t,2.4,10000)",
                },
                inputs: "output7",
                outputs: "output8",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfonts,
                  text: datas.block.blockData.price,
                  fontsize:
                    parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                  fontcolor: subtitleColor,
                  x: "120",
                  y: "670",
                  box: 1,
                  boxcolor: "white@0.0",
                  boxborderw: "50",
                  bordercolor: "white",
                  enable: "between(t,2.6,10000)",
                },
                inputs: "output8",
                outputs: "output9",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfontsLight,
                  text: datas.block.blockData.priceTitle,
                  fontsize:
                    parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                  fontcolor: titleColor,
                  x: "120",
                  y: "770",
                  box: 1,
                  boxcolor: "white@0.0",
                  boxborderw: "50",
                  bordercolor: "white",
                  enable: "between(t,2.8,10000)",
                },
                inputs: "output9",
                outputs: "output10",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfonts,
                  text: datas.block.blockData.price,
                  fontsize:
                    parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                  fontcolor: subtitleColor,
                  x: "120",
                  y: "820",
                  box: 1,
                  boxcolor: "white@0.0",
                  boxborderw: "50",
                  bordercolor: "white",
                  enable: "between(t,3,10000)",
                },
                inputs: "output10",
                outputs: "output",
              },
            ],
            "output"
          )
          .addOption("-c:v", "libx264")
          .save(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block2text.mp4"
          )
          .on("start", function (commandLine) {
            console.log("step6");
          })
          .on("error", function (er) {
            res.status(200).json({ message: " 7" });
            console.log(er);
            // console.log("error occured: " + er.message);
            return;
          })
          .on("end", function (commandLine) {
            setTimeout(function () {
              let data = [
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block-1-text-video.mp4",
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block2text.mp4",
              ];
              mergeVideos(data, req, res);
            }, 800);
          });
      }, 600);
    }
    async function mergeVideos(data, req, res) {
      try {
        const Createdvideo = await concat({
          output:
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block2final.mp4",
          videos: data,
          transitions: [
            {
              name: "directional",
              params: { direction: [1.0, 0.0] },
              duration: 1000,
            },
          ],
        });
        if (typeof Createdvideo == "undefined") {
          if (block3 && typeof block3.blockData != "undefined") {
            block3Video(block3, req, res);
          } else {
            res.status(200).json({
              message: "Video created",
              data: "template/videos/" + userId + "/template1/block2final.mp4",
            });
            return;
          }
        }
      } catch {
        res.status(500).json({ message: "video failed 8" });
      }
    }
  }

  function block3Video(block2, req, res) {
    var commands = new ffmpeg();
    var i = 1;
    var k = 1;
    var video1, video2;
    inputs = [block2.blockData.containerOne, block2.blockData.containerTwo];
    inputs.forEach((input) => {
      var commands = new ffmpeg();
      if (
        input == block2.blockData.imageOne ||
        input == block2.blockData.imageTwo
      ) {
        console.log(k);
        commands
          .input(assetsPath + input)
          .complexFilter(
            [
              "scale=1080:720:force_original_aspect_ratio=decrease[rescaled]",
              {
                filter: "zoompan",
                options: "z='zoom+0.0009'",
                inputs: "rescaled",
                outputs: "padded",
              },
            ],
            "padded"
          )
          .loop(3)
          .addOption("-pix_fmt", "yuv420p")
          .addOption("-framerate", "50")
          .addOption("-c:v", "libx264")
          .save(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block-3-" +
            k +
            ".mp4"
          )
          .on("start", function (commandLine) {
            console.log("step3");
          })
          .on("error", function (er) {
            res.status(200).json({ message: "Video failed 9" });
            console.log(er);
            return;
          })
          .on("end", function (commandLine) {
            if (typeof video1 == "undefined") {
              console.log(i);
              video1 =
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block-3-1.mp4";
            } else if (typeof video2 == "undefined") {
              console.log(i);
              video2 =
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block-3-2.mp4";
            }
            if (
              i == 2 &&
              typeof video1 != "undefined" &&
              typeof video2 != "undefined"
            ) {
              //console.log("heres");
              setTimeout(function () {
                let data = {
                  video1: video1,
                  video2: video2,
                };
                mergeBlock3Videos(data, req, res);
              }, 800);
            }
            i = i + 1;
          });
      } else {
        commands
          .input(assetsPath + input)
          .complexFilter(
            [
              // Rescale input stream into stream 'rescaled'
              "scale=1280:720[rescaled]",
            ],
            "rescaled"
          )
          .addOption("-c:v", "libx264")
          .save(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block-3-" +
            k +
            ".mp4"
          )
          .on("start", function (commandLine) {
            console.log("step4");
          })
          .on("error", function (er) {
            res.status(200).json({ message: "Video failed 10" });
            console.log(er);
            // console.log("error occured: " + er.message);
            return;
          })
          .on("end", function (commandLine) {
            if (typeof video1 == "undefined") {
              video1 =
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block-3-1.mp4";
            } else if (typeof video2 == "undefined") {
              video2 =
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block-3-2.mp4";
            }
            if (
              i == 2 &&
              typeof video1 != "undefined" &&
              typeof video2 != "undefined"
            ) {
              setTimeout(function () {
                let data = {
                  video1: video1,
                  video2: video2,
                };
                mergeBlock3Videos(data, req, res);
              }, 800);
            }

            i = i + 1;
          });
      }
      k = k + 1;
    });
    async function mergeBlock3Videos(data, req, res) {
      try {
        const Createdvideo = await concat({
          output:
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block3merged.mp4",
          videos: [data.video1, data.video2],
          transitions: [
            {
              name: "fade",
              duration: 1000,
            },
          ],
        });
        if (typeof Createdvideo == "undefined") {
          setTimeout(function () {
            const datas = {
              block: block3,
            };
            block3VideoTxt(datas, req, res);
          }, 600);
        }
      } catch {
        res.status(500).json({ message: "Video failed 11" });
      }
      // var command = new ffmpeg();
      // command.input(data.video1);
      // command.input(data.video2);
      // command
      //     .on('start', function (commandLine) {
      //         console.log('step5');
      //     })
      //     .on("error", function (er) {
      //         console.log(er);
      //         res.status(200).json({ message: 'Video failed' });
      //         return
      //     })
      //     .on("end", function () {
      //         console.log('yhn success');
      //         setTimeout(function () {
      //             const datas = {
      //                 block: block2
      //             }
      //             block2VideoTxt(datas, req, res)

      //         }, 600);

      //     })
      //     .mergeToFile('./src/Assets/template/videos/' + userId + '/template1/blockmerged.mp4');
    }

    function block3VideoTxt(datas, req, res) {
      var commands = new ffmpeg();
      var titleColor = datas.block.blockData.titleColor;
      if (titleColor.lenth == "4") {
        titleColor = titleColor.replaceAll(
          "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
          "#$1$1$2$2$3$3"
        );
      }
      var subtitleColor = datas.block.blockData.subtitleColor;
      if (subtitleColor.lenth == "4") {
        subtitleColor = subtitleColor.replaceAll(
          "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
          "#$1$1$2$2$3$3"
        );
      }
      var result = datas.block.blockData.blockTitle.split(" ");
      var text = "";
      for (var i = 0; i < result.length; i++) {
        if (i == 3) {
          text = text + result[i] + " \n ";
        } else {
          text = text + result[i] + " ";
        }
      }
      setTimeout(function () {
        //console.log(datas);
        commands
          .input(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block3merged.mp4"
          )
          .complexFilter(
            [
              "scale=1920:1080[checked]",
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfonts,
                  text: text,
                  fontsize:
                    parseInt(datas.block.blockData.blocktitleFontsize) + 25,
                  fontcolor: titleColor,
                  line_spacing: 30,
                  x: "20",
                  y: "H-th-100",
                  box: 1,
                  boxcolor: "white@1",
                  boxborderw: "50",
                  bordercolor: "white",
                },
                inputs: "checked",
                outputs: "output",
              },
            ],
            "output"
          )
          .addOption("-c:v", "libx264")
          .save(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block3FinalVideo.mp4"
          )
          .on("start", function (commandLine) {
            console.log("step6");
          })
          .on("error", function (er) {
            res.status(200).json({ message: "Video failed 12" });
            console.log(er);
            // console.log("error occured: " + er.message);
            return;
          })
          .on("end", function (commandLine) {
            // res.status(200).json({ message: 'Video created', data: 'template/videos/' + userId + '/template1/block3FinalVideo.mp4' });
            console.log("step6");
            setTimeout(function () {
              let data = {
                video1:
                  "./src/Assets/template/videos/" +
                  userId +
                  "/template1/block2final.mp4",
                video2:
                  "./src/Assets/template/videos/" +
                  userId +
                  "/template1/block3FinalVideo.mp4",
              };
              merge3Videos(data, req, res);
            }, 600);
          });
      }, 600);
    }
    async function merge3Videos(data, req, res) {
      // try {

      //     const Createdvideo = await concat({
      //         output: './src/Assets/template/videos/' + userId + '/template1/lastmerged.mp4',
      //         videos: data,
      //         transitions: [
      //             {
      //                 name: 'crossWarp',
      //                 duration: 800
      //             },
      //         ]
      //     })
      //     if (typeof Createdvideo == 'undefined') {
      //         if (block4) {
      //             block4Video(block3, req, res)
      //         } else {

      //             res.status(200).json({ message: 'Video created', data: 'template/videos/' + userId + '/template1/lastmerged.mp4' });
      //             return;
      //         }
      //     }
      // }
      // catch {
      //     res.status(500).json({ message: 'video faileds 12' });
      // }
      var command = new ffmpeg();
      command.input(data.video1);
      command.input(data.video2);
      command
        .on("start", function (commandLine) {
          console.log("step5");
        })
        .on("error", function (er) {
          console.log(er);
          res.status(200).json({ message: "Video failed 13" });
          return;
        })
        .on("end", function () {
          // console.log('yhn success');
          // setTimeout(function () {
          //     const datas = {
          //         block: block2
          //     }
          //     block2VideoTxt(datas, req, res)

          // }, 600);
          if (block4 && typeof block4.blockData != "undefined") {
            setTimeout(function () {
              block4Video(block4, req, res);
            }, 600);
          } else {
            res.status(200).json({
              message: "Video created",
              data: "template/videos/" + userId + "/template1/block3video.mp4",
            });
            //             return;
          }
        })
        .mergeToFile(
          "./src/Assets/template/videos/" +
          userId +
          "/template1/block3video.mp4"
        );
    }
  }

  function block4Video(block4, req, res) {
    console.log("step1log");
    var commands = new ffmpeg();
    var result = block4.blockData.blockTitle.split(" ");
    var text = "";
    for (var i = 0; i < result.length; i++) {
      if (i == 4) {
        text = text + result[i] + " \n ";
      } else {
        text = text + result[i] + " ";
      }
    }
    var titleColor = block4.blockData.titleColor;
    if (titleColor.lenth == "4") {
      titleColor = titleColor.replaceAll(
        "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
        "#$1$1$2$2$3$3"
      );
    }
    var subtitleColor = block4.blockData.subtitleColor;
    if (subtitleColor.lenth == "4") {
      subtitleColor = subtitleColor.replaceAll(
        "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
        "#$1$1$2$2$3$3"
      );
    }
    if (block4.blockData.containerOne == block4.blockData.imageOne) {
      commands
        .input(assetsPath + block4.blockData.containerOne)
        .complexFilter(
          [
            "scale=960:1080[checked]",
            {
              filter: "drawbox",
              options: {
                x: 0,
                y: "920",
                height: 200,
                width: 960,
                color: "white",
                t: "fill",
              },
              inputs: "checked",
              outputs: "output1",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfontsLight,
                text: text,
                fontsize: parseInt(block4.blockData.blocktitleFontsize) + 15,
                fontcolor: titleColor,
                line_spacing: 20,
                x: "50",
                y: "H-th - 20",
                box: 1,
                boxcolor: "white@1",
                boxborderw: "30",
                bordercolor: "white",
                enable: "gte(t,1)",
              },
              inputs: "output1",
              outputs: "output",
            },
          ],
          "output"
        )
        .loop(4)
        .addOption("-pix_fmt", "yuv420p")
        .addOption("-framerate", "50")
        .addOption("-c:v", "libx264")
        .save(
          "./src/Assets/template/videos/" +
          userId +
          "/template1/block4video1.mp4"
        )
        .on("start", function (commandLine) {
          console.log("step62");
        })
        .on("error", function (er) {
          res.status(200).json({ message: "Video failed 14" });
          console.log(er);
          // console.log("error occured: " + er.message);
          return;
        })
        .on("end", function (commandLine) {
          block4video2(block4, req, res);
        });
    } else {
      commands
        .input(assetsPath + block4.blockData.containerOne)
        .complexFilter(
          [
            "scale=960:1080[checked]",
            {
              filter: "drawbox",
              options: {
                x: 0,
                y: "920",
                height: 200,
                width: 960,
                color: "white",
                t: "fill",
              },
              inputs: "checked",
              outputs: "output1",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfontsLight,
                text: text,
                fontsize: parseInt(block4.blockData.blocktitleFontsize) + 15,
                fontcolor: titleColor,
                line_spacing: 20,
                x: "50",
                y: "H-th - 20",
                box: 1,
                boxcolor: "white@1",
                boxborderw: "30",
                bordercolor: "white",
                enable: "gte(t,1)",
              },
              inputs: "output1",
              outputs: "output",
            },
          ],
          "output"
        )
        .addOption("-pix_fmt", "yuv420p")
        .addOption("-framerate", "50")
        .addOption("-c:v", "libx264")
        .save(
          "./src/Assets/template/videos/" +
          userId +
          "/template1/block4video1.mp4"
        )
        .on("start", function (commandLine) {
          console.log("step6 here");
        })
        .on("error", function (er) {
          res.status(200).json({ message: "Video failed 15" });
          console.log(er);
          // console.log("error occured: " + er.message);
          return;
        })
        .on("end", function (commandLine) {
          block4video2(block4, req, res);
        });
    }

    function block4video2(block4, req, res) {
      console.log("step2log");
      var commands = new ffmpeg();
      if (block4.blockData.containerTwo == block4.blockData.imageTwo) {
        console.log("here");
        commands
          .input(assetsPath + block4.blockData.imageTwo)
          .complexFilter(["scale=960:1080[checked]"], "checked")
          .loop(4)
          .addOption("-pix_fmt", "yuv420p")
          .addOption("-framerate", "50")
          .addOption("-c:v", "libx264")
          .save(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block4video2.mp4"
          )
          .on("start", function (commandLine) {
            console.log("step7");
          })
          .on("error", function (er) {
            res.status(200).json({ message: "Video failed 16" });
            console.log(er);
            // console.log("error occured: " + er.message);
            return;
          })
          .on("end", function (commandLine) {
            let data = {
              video1:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video1.mp4",
              video2:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video2.mp4",
            };
            mergeBlock4Videos1(data, req, res);
          });
      } else {
        commands
          .input(assetsPath + block4.blockData.imageTwo)
          .complexFilter(["scale=960:1080[checked]"], "checked")
          .loop(4)
          .addOption("-pix_fmt", "yuv420p")
          .addOption("-framerate", "50")
          .addOption("-c:v", "libx264")
          .save(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block4video2.mp4"
          )
          .on("start", function (commandLine) {
            console.log("step7");
          })
          .on("error", function (er) {
            res.status(200).json({ message: "Video failed 17" });
            console.log(er);
            // console.log("error occured: " + er.message);
            return;
          })
          .on("end", function (commandLine) {
            let data = {
              video1:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video1.mp4",
              video2:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video2.mp4",
            };
            mergeBlock4Videos1(data, req, res);
          });
      }
    }
    async function mergeBlock4Videos1(data) {
      console.log("step3log");
      try {
        const Createdvideo3 = await concat({
          output:
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block4merged1.mp4",
          videos: [data.video1, data.video2],
          transitions: [
            {
              name: "directional",
              params: { direction: [0, 1] },
              duration: 1000,
            },
          ],
        });
        if (typeof Createdvideo3 == "undefined") {
          block4video3(block4, req, res);
        }
      } catch {
        res.status(500).json({ message: "Video failed 18" });
      }
    }

    function block4video3(block4, req, res) {
      console.log("step4log");
      var commands = new ffmpeg();
      if (block4.blockData.containerThree == block4.blockData.imageThree) {
        commands
          .input(assetsPath + block4.blockData.containerThree)
          .complexFilter(["scale=960:1080[checked]"], "checked")
          .loop(5)
          .addOption("-pix_fmt", "yuv420p")
          .addOption("-framerate", "50")
          .addOption("-c:v", "libx264")
          .save(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block4video3.mp4"
          )
          .on("start", function (commandLine) {
            console.log("step7");
          })
          .on("error", function (er) {
            res.status(200).json({ message: "Video failed 19" });
            console.log(er);
            // console.log("error occured: " + er.message);
            return;
          })
          .on("end", function (commandLine) {
            block4video4(block4, req, res);
          });
      } else {
        commands
          .input(assetsPath + block4.blockData.containerThree)
          .complexFilter(["scale=960:1080[checked]"], "checked")
          .loop(4)
          .addOption("-pix_fmt", "yuv420p")
          .addOption("-framerate", "50")
          .addOption("-c:v", "libx264")
          .save(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block4video3.mp4"
          )
          .on("start", function (commandLine) {
            console.log("step7");
          })
          .on("error", function (er) {
            res.status(200).json({ message: "Video failed 20" });
            console.log(er);
            // console.log("error occured: " + er.message);
            return;
          })
          .on("end", function (commandLine) {
            block4video4(block4, req, res);
          });
      }
    }

    function block4video4(block4, req, res) {
      var commands = new ffmpeg();
      var result = block4.blockData.blocksubTitle.split(" ");
      var text = "";
      for (var i = 0; i < result.length; i++) {
        if (i == 5) {
          text = text + result[i] + " \n ";
        } else {
          text = text + result[i] + " ";
        }
      }
      var titleColor = block4.blockData.titleColor;
      if (titleColor.lenth == "4") {
        titleColor = titleColor.replaceAll(
          "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
          "#$1$1$2$2$3$3"
        );
      }
      var subtitleColor = block4.blockData.subtitleColor;
      if (subtitleColor.lenth == "4") {
        subtitleColor = subtitleColor.replaceAll(
          "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
          "#$1$1$2$2$3$3"
        );
      }
      if (block4.blockData.containerFour == block4.blockData.imageFour) {
        commands
          .input(assetsPath + block4.blockData.containerFour)
          .complexFilter(
            [
              "scale=960:1080[checked]",
              {
                filter: "drawbox",
                options: {
                  x: 0,
                  y: "920",
                  height: 200,
                  width: 960,
                  color: "white",
                  t: "fill",
                },
                inputs: "checked",
                outputs: "output1",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfontsLight,
                  text: text,
                  fontsize:
                    parseInt(block4.blockData.blocksubTitleFontsize) + 15,
                  fontcolor: titleColor,
                  line_spacing: 20,
                  x: "50",
                  y: "H-th - 20",
                  box: 1,
                  boxcolor: "white@1",
                  boxborderw: "30",
                  bordercolor: "white",
                  enable: "gte(t,1)",
                },
                inputs: "output1",
                outputs: "output",
              },
            ],
            "output"
          )
          .loop(4)
          .addOption("-pix_fmt", "yuv420p")
          .addOption("-framerate", "50")
          .addOption("-c:v", "libx264")
          .save(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block4video4.mp4"
          )
          .on("start", function (commandLine) {
            console.log("step62");
          })
          .on("error", function (er) {
            res.status(200).json({ message: "Video failed 21" });
            console.log(er);
            // console.log("error occured: " + er.message);
            return;
          })
          .on("end", function (commandLine) {
            let data = {
              video1:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video3.mp4",
              video2:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video4.mp4",
            };
            mergeBlock4Videos2(data, req, res);
          });
      } else {
        commands
          .input(assetsPath + block4.blockData.containerFour)
          .complexFilter(
            [
              "scale=960:1080[checked]",
              {
                filter: "drawbox",
                options: {
                  x: 0,
                  y: "920",
                  height: 200,
                  width: 960,
                  color: "white",
                  t: "fill",
                },
                inputs: "checked",
                outputs: "output1",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfontsLight,
                  text: text,
                  fontsize:
                    parseInt(block4.blockData.blocksubTitleFontsize) + 15,
                  fontcolor: titleColor,
                  line_spacing: 20,
                  x: "50",
                  y: "H-th - 20",
                  box: 1,
                  boxcolor: "white@1",
                  boxborderw: "30",
                  bordercolor: "white",
                  enable: "gte(t,1)",
                },
                inputs: "output1",
                outputs: "output",
              },
            ],
            "output"
          )
          .addOption("-pix_fmt", "yuv420p")
          .addOption("-framerate", "50")
          .addOption("-c:v", "libx264")
          .save(
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block4video4.mp4"
          )
          .on("start", function (commandLine) {
            console.log("step6 here");
          })
          .on("error", function (er) {
            res.status(200).json({ message: "Video failed 22" });
            console.log(er);
            // console.log("error occured: " + er.message);
            return;
          })
          .on("end", function (commandLine) {
            let data = {
              video1:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video3.mp4",
              video2:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video4.mp4",
            };
            mergeBlock4Videos2(data, req, res);
          });
      }
    }
    async function mergeBlock4Videos2(data) {
      try {
        const Createdvideo4 = await concat({
          output:
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block4merged2.mp4",
          videos: [data.video1, data.video2],
          transitions: [
            {
              name: "directional",
              params: { direction: [0, 1] },
              duration: 1000,
            },
          ],
        });
        if (typeof Createdvideo4 == "undefined") {
          block4Finalmerged(block4, req, res);
        }
      } catch {
        res.status(500).json({ message: "Video failed 23" });
      }
    }

    function block4Finalmerged(block4, req, res) {
      var command = new ffmpeg();
      command.input(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/block4merged1.mp4"
      );
      command.input(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/block4merged2.mp4"
      );
      command
        .complexFilter(
          "[0:v]  setpts=PTS-STARTPTS, scale=950:1070,pad=960:1080:5:5:white [a0];[1:v] setpts=PTS-STARTPTS, scale=950:1070,pad=960:1080:5:5:white [a1];[a0][a1]xstack=inputs=2:layout=0_0|w0_0[out]"
        )
        .addOption("-map", "[out]")
        .addOption("-c:v", "libx264")
        .save(
          "./src/Assets/template/videos/" +
          userId +
          "/template1/block4Finalvideo.mp4"
        )
        .on("start", function (commandLine) {
          console.log(commandLine);
        })
        .on("error", function (er) {
          console.log(er);
          res.status(200).json({ message: "Video failed 24" });
          return;
        })
        .on("end", function () {
          setTimeout(function () {
            finalmerged(block4, req, res);
          }, 600);
        });
    }

    function finalmerged(block4, req, res) {
      // try {
      //     const lastvideomerged = await concat({
      //         output: './src/Assets/template/videos/' + userId + '/template1/mergedBlock4.mp4',
      //         videos: [
      //             './src/Assets/template/videos/' + userId + '/template1/block3video.mp4',
      //             './src/Assets/template/videos/' + userId + '/template1/block4Finalvideo.mp4',
      //         ],
      //         transitions: [
      //             {
      //                 name: 'fade',
      //                 duration: 1000
      //             },
      //         ]
      //     })
      //     if (typeof lastvideomerged == 'undefined') {
      //         res.status(200).json({ message: 'Video created', data: 'template/videos/' + userId + '/template1/mergedBlock4.mp4' });
      //     }

      // }
      // catch {
      //     res.status(500).json({ message: 'Video failed 25' });
      // }
      var command = new ffmpeg();
      command.input(
        "./src/Assets/template/videos/" + userId + "/template1/block3video.mp4"
      );
      command.input(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/block4Finalvideo.mp4"
      );
      command
        .on("start", function (commandLine) {
          console.log("step5");
        })
        .on("error", function (er) {
          console.log(er);
          res.status(200).json({ message: "Video failed 13" });
          return;
        })
        .on("end", function () {
          // console.log('yhn success');
          // setTimeout(function () {
          //     const datas = {
          //         block: block2
          //     }
          //     block2VideoTxt(datas, req, res)

          // }, 600);

          res.status(200).json({
            message: "Video created",
            data: "template/videos/" + userId + "/template1/mergedBlock4.mp4",
          });
          //             return;
        })
        .mergeToFile(
          "./src/Assets/template/videos/" +
          userId +
          "/template1/mergedBlock4.mp4"
        );
    }
  }
};
exports.getTemplateStats = async (req, res, next) => {
  const { templateId } = req.query;
  try {
    var templateData = [];
    const template = await UserVideos.find({
      templateId: templateId,
    });
    //console.log(template);
    if (template) {
      await template.map(async (data, index) => {
        const userData = await user.find({
          _id: data.userId,
        });
        let templateDatas = {
          userName: userData[0].firstName,
          videoTitle: data.videoTitle,
          path: data.path,
          createdAt: data.createdAt,
        };
        templateData.push(templateDatas);
        if (index == template.length - 1) {
          console.log(templateData);
          console.log("templateData");
          res.status(200).json({ message: "data", data: templateData });
        }
      });
    } else {
      res.status(500).json({ message: "Data Not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllVideos = async (req, res, next) => {
  const users = await UserVideos.find({});
  res.status(200).json({ users });
};

/** @route GET admin/user
 *   @desc Returns all users
 *   @access Public
 */
exports.getAllTemplates = async function (req, res) {
  try {
    const datas = Template.aggregate(
      [
        {
          $match: { adminTemplate: false },
        },
        {
          $project: {
            _id: {
              $toString: "$_id",
            },
            userId: "$userId",
            title: "$title",
            templateImage: "$templateImage",
            templatePreview: "$templatePreview",
            sceneOrder: "$sceneOrder",
            templateCategory: "$templateCategory",
            musicFile: "$musicFile",
            templateScenes: "$templateScenes",
            templateId: "$templateId",
            fontWeight: "$fontWeight",
            fontSize: "$fontSize",
            fontFamily: "$fontFamily",
            fontColor: "$fontColor",
          },
        },
        {
          $lookup: {
            from: `templateblocks`,
            localField: "_id",
            foreignField: "templateId",
            as: "blocks",
          },
        },
      ],
      function (err, data) {
        if (err) throw err;
        res.status(200).json({ message: "Template Data", template: data });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

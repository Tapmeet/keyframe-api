/* eslint-disable brace-style */
/* eslint-disable new-cap */
/* eslint-disable prefer-const */
/* eslint-disable one-var */
/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable require-jsdoc */
/* eslint-disable no-var */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable valid-jsdoc */
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const path = require("path");
const Jimp = require("jimp");
const Template = require("../models/templates");
const Block = require("../models/templateBlocks");
const Scene = require("../models/lastBlock");
const UserVideos = require("../models/userVideos");
const User = require("../models/user");
const fs = require("fs");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("ffprobe-static");
const { getVideoDurationInSeconds } = require("get-video-duration");
ffmpeg.setFfprobePath(ffprobe.path);
ffmpeg.setFfmpegPath(ffmpegPath);
let userId;
const mediaDate = Date.now();
const concat = require("ffmpeg-concat");
const { get } = require("mongoose");
const assetsPath = "./src/Assets/";
var fonts = [
  {
    family: "Montserrat",
    file: "./src/Assets/fonts/Montserrat-Regular.ttf",
    lighter: "./src/Assets/fonts/Montserrat-Light.ttf",
    bold: "./src/Assets/fonts/Montserrat-Bold.ttf",
  },
  {
    family: "Lato",
    file: "./src/Assets/fonts/Lato-Regular.ttf",
    lighter: "./src/Assets/fonts/Lato-Light.ttf",
    bold: "./src/Assets/fonts/Lato-Bold.ttf",
  },
  {
    family: "Oswald",
    file: "./src/Assets/fonts/Oswald-Regular.ttf",
    lighter: "./src/Assets/fonts/Oswald-Light.ttf",
    bold: "./src/Assets/fonts/Oswald-Bold.ttf",
  },
  {
    family: "Roboto",
    file: "./src/Assets/fonts/Roboto-Regular.ttf",
    lighter: "./src/Assets/fonts/Roboto-Light.ttf",
    bold: "./src/Assets/fonts/Roboto-Bold.ttf",
  },
  {
    family: "Noto Serif",
    file: "./src/Assets/fonts/NotoSerif-Regular.ttf",
    lighter: "./src/Assets/fonts/NotoSerif-Regular.ttf",
    bold: "./src/Assets/fonts/NotoSerif-Bold.ttf",
  },
  {
    family: "Josefin Sans",
    file: "./src/Assets/fonts/JosefinSans-Regular.ttf",
    lighter: "./src/Assets/fonts/JosefinSans-Light.ttf",
    bold: "./src/Assets/fonts/JosefinSans-Bold.ttf",
  },
  {
    family: "Arimo",
    file: "./src/Assets/fonts/Arimo-Regular.ttf",
    lighter: "./src/Assets/fonts/Arimo-Medium.ttf",
    bold: "./src/Assets/fonts/Arimo-Bold.ttf",
  },
  {
    family: "Barlow",
    file: "./src/Assets/fonts/Barlow-Regular.ttf",
    lighter: "./src/Assets/fonts/Barlow-Light.ttf",
    bold: "./src/Assets/fonts/Barlow-Bold.ttf",
  },
  {
    family: "Open Sans",
    file: "./src/Assets/fonts/OpenSans-Regular.ttf",
    lighter: "./src/Assets/fonts/OpenSans-Light.ttf",
    bold: "./src/Assets/fonts/OpenSans-Bold.ttf",
  },
  {
    family: "Raleway",
    file: "./src/Assets/fonts/Raleway-Regular.ttf",
    lighter: "./src/Assets/fonts/Raleway-Light.ttf",
    bold: "./src/Assets/fonts/Raleway-SemiBold.ttf",
  },
  {
    family: "Saira Condensed",
    file: "./src/Assets/fonts/SairaCondensed-Regular.ttf",
    lighter: "./src/Assets/fonts/SairaCondensed-Thin.ttf",
    bold: "./src/Assets/fonts/SairaCondensed-Bold.ttf",
  },
  {
    family: "Poppins",
    file: "./src/Assets/fonts/Poppins-Regular.ttf",
    lighter: "./src/Assets/fonts/Poppins-Thin.ttf",
    bold: "./src/Assets/fonts/Poppins-Bold.ttf",
  },
  {
    family: "Cairo",
    file: "./src/Assets/fonts/Cairo-Regular.ttf",
    lighter: "./src/Assets/fonts/Cairo-Light.ttf",
    bold: "./src/Assets/fonts/Cairo-Bold.ttf",
  },
  {
    family: "Asap",
    file: "./src/Assets/fonts/Asap-Regular.ttf",
    lighter: "./src/Assets/fonts/Asap-Regular.ttf",
    bold: "./src/Assets/fonts/Asap-Bold.ttf",
  },
  {
    family: "Hurricane",
    file: "./src/Assets/fonts/Hurricane-Regular.ttf",
    lighter: "./src/Assets/fonts/Hurricane-Regular.ttf",
    bold: "./src/Assets/fonts/Hurricane-Regular.ttf",
  },
  {
    family: "Inspiration",
    file: "./src/Assets/fonts/Inspiration-Regular.ttf",
    lighter: "./src/Assets/fonts/Inspiration-Regular.ttf",
    bold: "./src/Assets/fonts/Inspiration-Regular.ttf",
  },
  {
    family: "Saira",
    file: "./src/Assets/fonts/Saira-Regular.ttf",
    lighter: "./src/Assets/fonts/Saira-Light.ttf",
    bold: "./src/Assets/fonts/Saira-Bold.ttf",
  },
];

function deleteFiles(file) {
  var fs = require("fs");
  fs.unlink(file, function (err) {
    // if (err) throw err;
  });
}
/**
 * @function  "createVideo" used to create new Event
 * @route POST /api/template/create-videos
 * @desc Add Event
 * @access Admin
 */
exports.mergeVideo = async (req, res, next) => {
  // console.log(req.body.videos);
  const transitions = [];
  const { templateId } = req.body;
  const template = await Template.findOne({ _id: templateId });
  const videos = req.body.videos;
  const userId = template.userId;
  const templateTitle = template.title.split(" ").join("-");
  const videoName = templateTitle + Date.now();
  const tractionsVideos = [
    {
      name: "circleOpen",
      duration: 1000,
    },
    {
      duration: 1000,
      name: "fade",
    },
    {
      duration: 1000,
      name: "swap",
    },
    {
      name: "crossWarp",
      duration: 1000,
    },
    {
      name: "directionalWarp",
      duration: 1000,
      params: { direction: [1, -1] },
    },
    {
      name: "squaresWire",
      duration: 1000,
    },
    {
      name: "dreamy",
      duration: 1000,
    },
    {
      name: "squareswire",
      duration: 1000,
    },
    {
      name: "angular",
      duration: 1000,
    },
  ];

  var transitionsvideo = [];
  videos.map((video, index) => {
    if (index + 1 < videos.length) {
      var transaionsRand = Math.floor(Math.random() * 9);
      var trans = tractionsVideos[transaionsRand];
      transitionsvideo.push(trans);
    }
  });
  const promises = await concat({
    output:
      "./src/Assets/template/videos/" +
      userId +
      "/template1/" +
      videoName +
      ".mp4",
    videos: videos,
    transition: {
      name: "fade",
      duration: 1000,
    },
    concurrency: videos.length,
    cleanupFrames: true,
  });
  if (typeof promises == "undefined") {
    videos.map(async (data) => {
      deleteFiles(data);
    });
    if (template.musicFile) {
      mergeAudio();
    } else {
      saveVideoDb(
        template.title,
        "template/videos/" + userId + "/template1/" + videoName + ".mp4"
      );
      // res.status(200).json({
      //   message: "successfull",
      //   data: "template/videos/" + userId + "/template1/finalVideo.mp4",
      // });
    }
  }
  function mergeAudio() {
    var command = new ffmpeg();
    command.input(
      "./src/Assets/template/videos/" +
      userId +
      "/template1/" +
      videoName +
      ".mp4"
    );
    command.input(assetsPath + template.musicFile);
    command
      .addOption("-map", "0")
      .addOption("-map", "1:a")
      .addOption("-c:v", "copy")
      .addOption("-shortest")
      .save(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        videoName +
        "-audio.mp4"
      )
      .on("start", function (commandLine) {
        console.log(commandLine);
      })
      .on("error", function (er) {
        res.status(200).json({ message: "Video failed" });
        return;
      })
      .on("end", function () {
        deleteFiles(
          "./src/Assets/template/videos/" +
          userId +
          "/template1/" +
          videoName +
          ".mp4"
        );
        saveVideoDb(
          template.title,
          "template/videos/" + userId + "/template1/" + videoName + "-audio.mp4"
        );
      });
  }
  async function saveVideoDb(videoTitle, path) {
    try {
      const newUpload = new UserVideos({
        userId: userId,
        videoTitle: videoTitle,
        templateImage: template.templateImage,
        path: path,
      });
      const uploadData = await newUpload.save();
      res.status(200).json({
        message: "successfull",
        data: path,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
/**
 * @function  "createVideo" used to create new Event
 * @route POST /api/template/create-videos
 * @desc Add Event
 * @access Admin
 */
exports.createVideo = async (req, res, next) => {
  const { templateId } = req.body;

  var templatemainId;
  try {
    const templateBlock = await Block.find({ templateId: templateId }).sort({
      order: 1,
    });
    const template = await Template.findOne({ _id: templateId });

    templatemainId = template.templateId;
    const lastScene = await Scene.findOne({ templateId: templateId });

    // console.log(templateBlock);
    // return false
    const data = {
      templateBlock: templateBlock,
      template: template,
    };
    userId = template.userId;
    const user = await User.findById(userId);

    const folderName = "./src/Assets/template/videos/" + userId;
    try {
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
      }
    } catch (err) {
      console.error(err);
    }
    const folderNames = "./src/Assets/template/videos/" + userId + "/template1";
    try {
      if (!fs.existsSync(folderNames)) {
        fs.mkdirSync(folderNames);
      }
    } catch (err) {
      console.error(err);
    }

    if (templateBlock) {
      const blockLength = parseFloat(templateBlock.length);
      console.log(blockLength);
      let i = 0;
      // init FFcreator
      const {
        FFScene,
        FFText,
        FFImage,
        FFVideo,
        FFCreator,
      } = require("ffcreator");
      const outputDir = path.join(
        __dirname,
        "./src/Assets/template/videos/" + userId + "/template1"
      );
      const creator = new FFCreator({
        //  cacheDir,
        outputDir,
        width: 1920,
        height: 1080,
        log: true,
        parallel: 25,
      });
      while (i < blockLength) {
        // Scene 1 Data
        if (templateBlock[i].sceneId == 1) {
          // Resize Images for scene
          let data = templateBlock[i];
          // console.log(data)
          const firstVideo = await videoTemplate1(data);

          fontfamily = data.sceneData.fontFamily;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          const content = data.sceneData.content;
          const contentParts = content.split("\n");

          const scene1 = new FFScene();
          scene1.setBgColor("#fff");

          const img1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img1.png",
            x: 477,
            y: 265,
          });
          scene1.addChild(img1);
          const img2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img2.png",
            x: 1442,
            y: 265,
          });
          scene1.addChild(img2);
          const img3 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img3.png",
            x: 477,
            y: 815,
          });
          // fimg1.addEffect("slideInUp", 1.5, 1);
          scene1.addChild(img3);
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 150,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene1.addChild(watermark);

          }
          const img4 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img4.png",
            x: 1442,
            y: 815,
          });
          // fimg1.addEffect("slideInUp", 1.5, 1);

          scene1.addChild(img4);

          const fcloud2 = new FFImage({
            path: assetsPath + "whitescene2.jpg",
            y: 540,
            x: 960,
          });
          fcloud2.addEffect("zoomOut", 1.3, 0);
          scene1.addChild(fcloud2);

          const fimg1 = new FFImage({
            path: assetsPath + "whitescene2.jpg",
            x: 960,
            y: 540,
          });
          // fimg1.addEffect("slideInUp", 1.5, 1);
          // fimg1.addEffect("fadeIn", 0.5, 1.1);
          fimg1.setScale(0.38);

          scene1.addChild(fimg1);
          if (contentParts[2] != undefined && contentParts[2] != "") {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 960,
              y: 480,
            });
            scene1.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("fadeIn", 1, 1.3);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene1.addChild(text);

            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 960,
              y: 540,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("fadeIn", 1.0, 1.4);
            scene1.addChild(text2);

            const text3 = new FFText({
              text: contentParts[2],
              fontSize: fontSize1,
              x: 960,
              y: 610,
            });
            text3.alignCenter();
            text3.setStyle({ padding: [4, 20, 6, 20] });
            text3.setColor(titleColor);
            text3.setFont(selectedfonts);
            text3.addEffect("fadeIn", 1.0, 1.4);
            scene1.addChild(text3);
          } else {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 960,
              y: 515,
            });
            scene1.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("fadeIn", 1, 1.3);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene1.addChild(text);

            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 960,
              y: 575,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("fadeIn", 1.0, 1.4);
            scene1.addChild(text2);
          }
          // add bottom cloud
          const fcloud = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud.addAnimate({
            from: { x: -960 },
            to: { x: 960 },
            time: 1,
            delay: parseFloat(data.sceneData.time) - 1,
            ease: "Cubic.InOut",
          });
          scene1.addChild(fcloud);
          scene1.setDuration(data.sceneData.time);
          creator.addChild(scene1);
          i++;
        } else if (templateBlock[i].sceneId == 2) {
          let data = templateBlock[i];
          const firstVideo = await videoTemplate2(data);

          let titleColor;
          if (data.sceneData.titleColor) {
            titleColor = data.sceneData.titleColor;
          } else {
            titleColor = data.sceneData.textColor;
          }
          let fontfamily = data.sceneData.fontFamily;
          let titlefontfamily = data.sceneData.titleFontFamily;
          let selectedfonts;
          let titlefonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
            if (font.family == titlefontfamily) {
              if (data.sceneData.titleFontWeight == "lighter") {
                titlefonts = font.lighter;
              } else if (data.sceneData.titleFontWeight == "normal") {
                titlefonts = font.file;
              } else if (data.sceneData.titleFontWeight == "bold") {
                titlefonts = font.bold;
              }
            }
          });
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var subtitleColor = data.sceneData.textColor;
          if (subtitleColor.length == "4") {
            subtitleColor = subtitleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }
          if (data.sceneData.titletextSize) {
            var titletextSize = data.sceneData.titletextSize;
          } else {
            var titletextSize = data.sceneData.textSize;
          }
          if (data.sceneData.textSize) {
            var textSize = data.sceneData.textSize;
          } else {
            var textSize = data.sceneData.textSize;
          }
          if (typeof data.sceneData.content[0].title == undefined) {
            var fieldTitle1 = "";
            var fieldText1 = "";
          } else {
            var fieldTitle1 = data.sceneData.content[0].title;
            var fieldText1 = data.sceneData.content[0].text;
          }
          if (data.sceneData.content[1] == undefined) {
            var fieldTitle2 = "";
            var fieldText2 = "";
          } else {
            var fieldTitle2 = data.sceneData.content[1].title;
            var fieldText2 = data.sceneData.content[1].text;
          }
          if (data.sceneData.content[2] == undefined) {
            var fieldTitle3 = "";
            var fieldText3 = "";
          } else {
            var fieldTitle3 = data.sceneData.content[2].title;
            var fieldText3 = data.sceneData.content[2].text;
          }
          if (data.sceneData.content[3] == undefined) {
            var fieldTitle4 = "";
            var fieldText4 = "";
          } else {
            var fieldTitle4 = data.sceneData.content[3].title;
            var fieldText4 = data.sceneData.content[3].text;
          }
          if (data.sceneData.content[4] != undefined) {
            var fieldTitle5 = data.sceneData.content[4].title;
            var fieldText5 = data.sceneData.content[4].text;
          } else {
            var fieldTitle5 = "";
            var fieldText5 = "";
          }

          const scene2 = new FFScene();
          scene2.setBgColor("#fff");

          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img21.png",
            y: 540,
            width: 1920,
            height: 1080,
          });
          slide1.addAnimate({
            from: { x: -960 },
            to: { x: 960 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene2.addChild(slide1);

          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img22.png",
            y: 540,
            width: 1920,
            height: 1080,
          });
          slide2.addAnimate({
            from: { x: -960 },
            to: { x: 960 },
            time: 1,
            delay: 3,
            ease: "Cubic.InOut",
          });
          slide2.addEffect("zoomingIn", 3.5, 4);
          scene2.addChild(slide2);
          const slidebg = new FFImage({
            path: assetsPath + "bgwhite.jpg",
            y: 540,
          });
          slidebg.addAnimate({
            from: { x: -250 },
            to: { x: 250 },
            time: 1,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          scene2.addChild(slidebg);
          const fontSize1 = parseInt(titletextSize) + 20;
          const fontSize2 = parseInt(textSize) + 20;
          if (fieldTitle1 != "") {
            const text1 = new FFText({
              text: fieldTitle1,
              fontSize: fontSize1,
              x: 120,
              y: 170,
            });
            text1.setColor(titleColor);
            text1.setFont(titlefonts);
            text1.addEffect("fadeInLeft", 1, 0.5);
            scene2.addChild(text1);
          }
          if (fieldText1 != "") {
            const textField = new FFText({
              text: fieldText1,
              fontSize: fontSize1,
              x: 120,
              y: 220,
            });
            textField.setColor(subtitleColor);
            textField.setFont(selectedfonts);
            textField.addEffect("fadeInLeft", 1, 0.5);
            scene2.addChild(textField);
          }
          if (fieldTitle2 != "") {
            const textTitle2 = new FFText({
              text: fieldTitle2,
              fontSize: fontSize1,
              x: 120,
              y: 320,
            });
            textTitle2.setColor(titleColor);
            textTitle2.setFont(titlefonts);
            textTitle2.addEffect("fadeInLeft", 1, 0.7);
            scene2.addChild(textTitle2);
          }
          if (fieldText2 != "") {
            const textField2 = new FFText({
              text: fieldText2,
              fontSize: fontSize2,
              x: 120,
              y: 370,
            });
            textField2.setColor(subtitleColor);
            textField2.setFont(selectedfonts);
            textField2.addEffect("fadeInLeft", 1, 0.7);
            scene2.addChild(textField2);
          }
          if (fieldTitle3 != "") {
            const text5 = new FFText({
              text: fieldTitle3,
              fontSize: fontSize1,
              x: 120,
              y: 470,
            });
            text5.setColor(titleColor);
            text5.setFont(titlefonts);
            text5.addEffect("fadeInLeft", 1, 0.9);
            scene2.addChild(text5);
          }
          if (fieldText3) {
            const text6 = new FFText({
              text: fieldText3,
              fontSize: fontSize2,
              x: 120,
              y: 520,
            });
            text6.setColor(subtitleColor);
            text6.setFont(selectedfonts);
            text6.addEffect("fadeInLeft", 1, 0.9);
            scene2.addChild(text6);
          }

          if (fieldTitle4) {
            const text7 = new FFText({
              text: fieldTitle4,
              fontSize: fontSize1,
              x: 120,
              y: 620,
            });
            text7.setColor(titleColor);
            text7.setFont(titlefonts);
            text7.addEffect("fadeInLeft", 1, 1.1);
            scene2.addChild(text7);
          }
          if (fieldText4) {
            const text8 = new FFText({
              text: fieldText4,
              fontSize: fontSize2,
              x: 120,
              y: 670,
            });
            text8.setColor(subtitleColor);
            text8.setFont(selectedfonts);
            text8.addEffect("fadeInLeft", 1, 1.1);
            scene2.addChild(text8);
          }

          if (fieldTitle5) {
            const text9 = new FFText({
              text: fieldTitle5,
              fontSize: fontSize1,
              x: 120,
              y: 770,
            });
            text9.setColor(titleColor);
            text9.setFont(titlefonts);
            text9.addEffect("fadeInLeft", 1, 1.3);
            scene2.addChild(text9);
          }
          if (fieldText5) {
            const text10 = new FFText({
              text: fieldText5,
              fontSize: fontSize2,
              x: 120,
              y: 820,
            });
            text10.setColor(subtitleColor);
            text10.setFont(selectedfonts);
            text10.addEffect("fadeInLeft", 1, 1.3);
            scene2.addChild(text10);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene2.addChild(watermark);
          }
          const fcloud = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud.addAnimate({
            from: { x: -960 },
            to: { x: 960 },
            time: 1,
            delay: parseFloat(data.sceneData.time) - 1,
            ease: "Cubic.InOut",
          });
          scene2.addChild(fcloud);
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          // scene2.setTransition("fade", 1);
          i++;
        } else if (templateBlock[i].sceneId == 3) {
          let data = templateBlock[i];
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 6) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          const scene3 = new FFScene();
          const slide1 = new FFImage({
            path: assetsPath + data.sceneData.media[0].url,
            y: 540,
            x: 960,
            width: 1920,
            height: 1080,
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene3.addChild(slide1);
          const slide2 = new FFImage({
            path: assetsPath + data.sceneData.media[1].url,
            y: 540,
            width: 1920,
            height: 1080,
          });
          slide2.addAnimate({
            from: { x: -960 },
            to: { x: 960 },
            time: 1,
            delay: 3,
            ease: "Cubic.InOut",
          });
          slide2.addEffect("zoomingIn", 3.5, 4);
          scene3.addChild(slide2);
          scene3.setBgColor("#fff");
          const fimg1 = new FFImage({
            path: assetsPath + "whitebg2.png",
            y: 950,
          });
          fimg1.addAnimate({
            from: { x: -480 },
            to: { x: 480 },
            time: 1,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fimg1);
          if (data.sceneData.textAligmnet == "text-center") {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 480,
              y: 920,
            });
            textOne.alignCenter();
            textOne.setStyle({ padding: [0, 20, 10, 20] });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.addEffect("fadeIn", 1.5, 0.6);
            scene3.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 480,
                y: 980,
              });
              textNext.alignCenter();
              textNext.setStyle({ padding: [0, 20, 10, 20] });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("fadeIn", 1.5, 1.0);
              scene3.addChild(textNext);
            }
          } else {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 50,
              y: 895,
            });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.addEffect("fadeIn", 1.5, 0.6);
            scene3.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 50,
                y: 950,
              });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("fadeIn", 1.5, 1.0);
              scene3.addChild(textNext);
            }
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene3.addChild(watermark);
          }

          const scene3img = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          scene3img.addAnimate({
            from: { x: 960 },
            to: { x: 3000 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene3.addChild(scene3img);
          const fcloud2 = new FFImage({
            path: assetsPath + "cropped.jpg",
            x: 960,
          });
          fcloud2.addAnimate({
            from: { y: 1620 },
            to: { y: 540 },
            time: 1,
            delay: parseFloat(data.sceneData.time) - 1,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fcloud2);
          scene3.setDuration(data.sceneData.time);
          creator.addChild(scene3);
          i++;
        } else if (templateBlock[i].sceneId == 4) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate4(data);
          var result = data.sceneData.textArray[0].text.split(" ");
          var text1 = "";
          var text2 = "";
          for (var l = 0; l < result.length; l++) {
            if (l >= 10) {
              //  text1= text1 + result[i] + " \n ";
              text2 = text2 + result[l] + " ";
            } else {
              text1 = text1 + result[l] + " ";
            }
          }
          let fontfamily = data.sceneData.textArray[0].fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.textArray[0].fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.textArray[0].fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.textArray[0].fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          var titleColor = data.sceneData.textArray[0].fontColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }

          let result2 = data.sceneData.textArray[1].text.split(" ");
          let text3 = "";
          let text4 = "";
          for (var k = 0; k < result2.length; k++) {
            if (k >= 10) {
              text4 = text4 + result2[k] + " ";
            } else {
              text3 = text3 + result2[k] + " ";
            }
          }
          let fontfamily2 = data.sceneData.textArray[1].fontFamily;
          let selectedfonts2;
          fonts.map(function (font) {
            if (font.family == fontfamily2) {
              if (data.sceneData.textArray[1].fontWeight == "lighter") {
                selectedfonts2 = font.lighter;
              } else if (data.sceneData.textArray[1].fontWeight == "normal") {
                selectedfonts2 = font.file;
              } else if (data.sceneData.textArray[1].fontWeight == "bold") {
                selectedfonts2 = font.bold;
              }
            }
          });
          var titleColor2 = data.sceneData.textArray[1].fontColor;
          if (titleColor2.length == "4") {
            titleColor2 = titleColor2.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }

          if (data.sceneData.media[0].type == "image") {
            const scene4 = new FFScene();
            const image = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img41.png",
              x: 475,
              y: 540,
            });
            scene4.addChild(image);
            const image2 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img43.png",
              x: 1445,
              y: 540,
            });
            scene4.addChild(image2);
            scene4.setBgColor("#fff");
            const fimg1 = new FFImage({
              path: assetsPath + "whitebg2.png",
              x: 475,
            });
            fimg1.addAnimate({
              from: { y: 1720 },
              to: { y: 1010 },
              time: 0.6,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fimg1);

            if (data.sceneData.textArray[0].fontAlignment == "text-center") {
              const fontSize1 =
                parseInt(data.sceneData.textArray[0].fontSize) + 15;
              const fontSize2 =
                parseInt(data.sceneData.textArray[1].fontSize) + 15;
              const text = new FFText({
                text: text1,
                fontSize: fontSize1,
                x: 480,
                y: 975,
                height: 200,
              });
              text.alignCenter();
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("fadeIn", 1, 0.6);
              scene4.addChild(text);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 480,
                  y: 1035,
                  height: 100,
                });
                textNext.alignCenter();
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1, 0.8);
                scene4.addChild(textNext);
              }
            } else {
              const fontSize1 =
                parseInt(data.sceneData.textArray[0].fontSize) + 15;
              const fontSize2 =
                parseInt(data.sceneData.textArray[1].fontSize) + 15;
              const text = new FFText({
                text: text1,
                fontSize: fontSize1,
                x: 50,
                y: 955,
                height: 200,
              });
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("fadeIn", 1, 0.6);
              scene4.addChild(text);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 50,
                  y: 1015,
                  height: 100,
                });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1, 0.8);
                scene4.addChild(textNext);
              }
            }
            const img3 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img42.png",
              x: 475,
            });
            img3.addAnimate({
              from: { y: 1720 },
              to: { y: 540 },
              time: 1,
              delay: 3,
              ease: "Cubic.InOut",
            });
            scene4.addChild(img3);
            const img4 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img44.png",
              x: 1445,
            });

            img4.addAnimate({
              from: { y: 1720 },
              to: { y: 540 },
              time: 1,
              delay: 3.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(img4);
            scene4.setBgColor("#fff");
            const fimg2 = new FFImage({
              path: assetsPath + "whitebg2.png",
              x: 1445,
            });
            fimg2.addAnimate({
              from: { y: 1720 },
              to: { y: 1010 },
              time: 1,
              delay: 3.5,
              ease: "Cubic.InOut",
            });
            // fimg2.addEffect("fadeInUp", 1, 3.2);
            scene4.addChild(fimg2);
            if (data.sceneData.textArray[1].fontAlignment == "text-center") {
              const textnext3 = new FFText({
                text: text3,
                fontSize: fontSize2,
                x: 1440,
                y: 975,
                height: 100,
              });
              textnext3.alignCenter();
              textnext3.setColor(titleColor2);
              textnext3.setFont(selectedfonts2);
              textnext3.addEffect("fadeIn", 1.2, 4.2);
              scene4.addChild(textnext3);
              if (text4 != "") {
                const textNext2 = new FFText({
                  text: text4,
                  fontSize: fontSize2,
                  x: 1440,
                  y: 1035,
                  height: 100,
                });
                textNext2.alignCenter();
                textNext2.setColor(titleColor2);
                textNext2.setFont(selectedfonts2);
                textNext2.addEffect("fadeIn", 1.2, 4.4);
                scene4.addChild(textNext2);
              }
            } else {
              const textnext3 = new FFText({
                text: text3,
                fontSize: fontSize2,
                x: 1010,
                y: 955,
                height: 100,
              });
              textnext3.setColor(titleColor2);
              textnext3.setFont(selectedfonts2);
              textnext3.addEffect("fadeIn", 1.2, 4.2);
              scene4.addChild(textnext3);
              if (text4 != "") {
                const textNext2 = new FFText({
                  text: text4,
                  fontSize: fontSize2,
                  x: 1010,
                  y: 1015,
                  height: 100,
                });
                textNext2.setColor(titleColor2);
                textNext2.setFont(selectedfonts2);
                textNext2.addEffect("fadeIn", 1.2, 4.4);
                scene4.addChild(textNext2);
              }
            }
            if (user.userPlan == 0) {
              const watermark = new FFImage({
                path: assetsPath + "reveoLogo.png",
                x: 1680,
                y: 50,
              });
              watermark.setOpacity(0.7);
              watermark.setScale(0.5);
              scene4.addChild(watermark);
            }
            const fcloud2 = new FFImage({
              path: assetsPath + "cropped.jpg",
              x: 960,
            });
            fcloud2.addAnimate({
              from: { y: 540 },
              to: { y: -600 },
              time: 1,
              delay: 0,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud2);

            const fcloud3 = new FFImage({
              path: assetsPath + "cropped.jpg",
              x: 960,
            });
            fcloud3.addAnimate({
              from: { y: 1620 },
              to: { y: 540 },
              time: 1,
              delay: parseFloat(data.sceneData.time) - 1,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud3);

            scene4.setDuration(data.sceneData.time);
            creator.addChild(scene4);
          }
          i++;
        } else if (templateBlock[i].sceneId == 5) {
          let data = templateBlock[i];
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 7) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          const scene5 = new FFScene();
          const slide1 = new FFImage({
            path: assetsPath + data.sceneData.media[0].url,
            y: 540,
            x: 960,
            width: 1920,
            height: 1080,
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene5.addChild(slide1);
          scene5.setBgColor("#fff");
          // const scene3img = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // scene3img.addAnimate({
          //   from: { x: 960 },
          //   to: { x: 3000 },
          //   time: 1,
          //   delay: 0,
          //   ease: "Cubic.InOut",
          // });
          const fimg1 = new FFImage({
            path: assetsPath + "gerrnstrip.png",
            y: 950,
          });
          fimg1.addAnimate({
            from: { x: -480 },
            to: { x: 520 },
            time: 1,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          // fimg1.setOpacity(0.8);
          scene5.addChild(fimg1);
          const fontSize1 = parseInt(data.sceneData.textSize) + 15;
          if (data.sceneData.textAligmnet == "text-center") {
            if (text2 != "") {
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 520,
                y: 920,
                height: 150,
              });
              textOne.alignCenter();
              textOne.setStyle({ padding: [0, 20, 10, 20] });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.setStyle({ padding: 10 });
              textOne.addEffect("fadeIn", 1.5, 0.6);
              scene5.addChild(textOne);

              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 520,
                y: 980,
                height: 150,
              });
              textNext.alignCenter();
              textNext.setStyle({ padding: [0, 20, 10, 20] });
              textNext.setStyle({ padding: 10 });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("fadeIn", 1.5, 1.0);
              scene5.addChild(textNext);
            } else {
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 520,
                y: 950,
                height: 150,
              });
              textOne.alignCenter();
              textOne.setStyle({ padding: [0, 20, 10, 20] });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.setStyle({ padding: 10 });
              textOne.addEffect("fadeIn", 1.5, 0.6);
              scene5.addChild(textOne);
            }
          } else {
            if (text2 != "") {
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 100,
                y: 890,
                height: 150,
              });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.setStyle({ padding: 10 });
              textOne.addEffect("fadeIn", 1.5, 0.6);
              scene5.addChild(textOne);

              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 100,
                y: 940,
                height: 150,
              });
              textNext.setStyle({ padding: 10 });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("fadeIn", 1.5, 1.0);
              scene5.addChild(textNext);
            } else {
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 80,
                y: 900,
                height: 150,
              });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.setStyle({ padding: 10 });
              textOne.addEffect("fadeIn", 1.5, 0.6);
              scene5.addChild(textOne);
            }
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene5.addChild(watermark);
          }
          // scene5.addChild(scene3img);
          const fcloud3 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud3.addAnimate({
            from: { x: 960 },
            to: { x: 3960 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          console.log("here");
          scene5.addChild(fcloud3);
          const fcloud2 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud2.addAnimate({
            from: { x: -1620 },
            to: { x: 960 },
            time: 1,
            delay: 4,
            ease: "Cubic.InOut",
          });
          console.log("here");
          scene5.addChild(fcloud2);
          scene5.setDuration(data.sceneData.time);
          creator.addChild(scene5);
          i++;
        } else if (templateBlock[i].sceneId == 6) {
          let data = templateBlock[i];
          const sixVideo = await videoTemplate6(data);
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 13) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          const scene6 = new FFScene();

          const fimg1 = new FFImage({
            path: assetsPath + "whitescenegallery.jpg",
            y: 470,
            x: 990,
            width: 1368,
            height: 768,
          });
          fimg1.addAnimate({
            from: { x: 960, y: 500 },
            to: { x: 930, y: 470 },
            time: 4.5,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          fimg1.setOpacity(0.8);
          scene6.addChild(fimg1);
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img61.png",
            y: 500,
            width: 1368,
            height: 768,
          });
          slide1.addAnimate({
            from: { x: 960 },
            to: { x: 900 },
            time: 4.5,
            delay: 0.1,
            ease: "Cubic.InOut",
          });

          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(slide1);
          const fontSize1 = parseInt(data.sceneData.textSize) + 15;
          if (data.sceneData.textAligmnet == "text-center") {
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 960,
              y: 920,
            });
            textOne.alignCenter();
            textOne.setStyle({ padding: [0, 20, 10, 20] });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.setStyle({ padding: 10 });
            textOne.addEffect("fadeInUp", 1.5, 0.6);
            scene6.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 960,
                y: 980,
              });
              textNext.alignCenter();
              textNext.setStyle({ padding: [0, 20, 10, 20] });
              textNext.setStyle({ padding: 10 });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("fadeIn", 1.5, 1.0);
              scene6.addChild(textNext);
            }
          } else {
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 150,
              y: 900,
            });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.setStyle({ padding: 10 });
            textOne.addEffect("fadeInUp", 1.5, 0.6);
            scene6.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 150,
                y: 970,
              });
              textNext.setStyle({ padding: 10 });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("fadeIn", 1.5, 1.0);
              scene6.addChild(textNext);
            }
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene6.addChild(watermark);
          }
          const fcloud2 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud2.addAnimate({
            from: { x: 960 },
            to: { x: 3200 },
            time: 1,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          console.log("here");
          scene6.addChild(fcloud2);
          const fcloud3 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud3.addAnimate({
            from: { x: 3200 },
            to: { x: 960 },
            time: 1,
            delay: 4.5,
            ease: "Cubic.InOut",
          });
          scene6.addChild(fcloud3);
          scene6.setBgColor("#399891");
          // scene5.addChild(fcloud2);
          scene6.setDuration(data.sceneData.time);
          creator.addChild(scene6);
          i++;
        } else if (templateBlock[i].sceneId == 7) {
          let data = templateBlock[i];
          const sevenVideo = await videoTemplate7(data);
          const scene6 = new FFScene();
          const img71White = new FFImage({
            path: assetsPath + "cropped-white2.jpg",
          });
          img71White.addAnimate({
            from: { x: 450, y: 300 },
            to: { x: 530, y: 270 },
            time: 2,
            delay: 0.5,
            ease: "Cubic.InOut",
          });
          // img71White.addEffect("fadeIn", 1.5, 1.6);
          img71White.setOpacity(0.8);
          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(img71White);
          const img71 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img71.png",
            y: 300,
          });
          img71.addAnimate({
            from: { x: 450 },
            to: { x: 550 },
            time: 2,
            delay: 0.5,
            ease: "Cubic.InOut",
          });
          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(img71);
          const img72White = new FFImage({
            path: assetsPath + "cropped-white2.jpg",
          });
          img72White.addAnimate({
            from: { x: 450, y: 780 },
            to: { x: 530, y: 810 },
            time: 2,
            delay: 0.8,
            ease: "Cubic.InOut",
          });
          // img71White.addEffect("fadeIn", 1.5, 1.6);
          img72White.setOpacity(0.8);
          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(img72White);
          const img72 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img72.png",
            y: 780,
          });
          img72.addAnimate({
            from: { x: 450 },
            to: { x: 550 },
            time: 2,
            delay: 0.8,
            ease: "Cubic.InOut",
          });
          scene6.addChild(img72);
          const img73White = new FFImage({
            path: assetsPath + "cropped-white2.jpg",
          });
          img73White.addAnimate({
            from: { x: 1400, y: 300 },
            to: { x: 1370, y: 270 },
            time: 2,
            delay: 1,
            ease: "Cubic.InOut",
          });
          // img71White.addEffect("fadeIn", 1.5, 1.6);
          img73White.setOpacity(0.8);
          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(img73White);
          const img73 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img73.png",
            y: 300,
          });
          img73.addAnimate({
            from: { x: 1400 },
            to: { x: 1350 },
            time: 2,
            delay: 1,
            ease: "Cubic.InOut",
          });

          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(img73);

          scene6.addChild(img72);
          const img74White = new FFImage({
            path: assetsPath + "cropped-white2.jpg",
            height: 360,
            width: 640,
          });
          img74White.addAnimate({
            from: { x: 1400, y: 780 },
            to: { x: 1370, y: 800 },
            time: 2,
            delay: 1.2,
            ease: "Cubic.InOut",
          });
          // img71White.addEffect("fadeIn", 1.5, 1.6);
          img74White.setOpacity(0.8);
          scene6.addChild(img74White);
          const img74 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img74.png",
            y: 780,
          });
          img74.addAnimate({
            from: { x: 1400 },
            to: { x: 1350 },
            time: 2,
            delay: 1.2,
            ease: "Cubic.InOut",
          });

          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(img74);

          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene6.addChild(watermark);
          }
          const fcloud2 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud2.addAnimate({
            from: { x: 960 },
            to: { x: 3200 },
            time: 1,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          console.log("here");
          scene6.addChild(fcloud2);
          const fcloud3 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud3.addAnimate({
            from: { x: 3200 },
            to: { x: 960 },
            time: 1,
            delay: 4.5,
            ease: "Cubic.InOut",
          });
          scene6.addChild(fcloud3);
          scene6.setBgColor("#399891");
          // scene5.addChild(fcloud2);
          scene6.setDuration(data.sceneData.time);
          creator.addChild(scene6);
          i++;
        } else if (templateBlock[i].sceneId == 8) {
          let data = templateBlock[i];
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          console.log(result);
          var text = "";
          var text2 = "";
          for (var m = 0; m < result.length; m++) {
            if (m >= 14) {
              text2 = text2 + result[m] + " ";
            } else {
              text = text + result[m] + " ";
            }
          }

          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          const scene3 = new FFScene();
          const slide1 = new FFImage({
            path: assetsPath + data.sceneData.media[0].url,
            y: 620,
            x: 960,
            width: 1920,
            height: 1080,
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene3.addChild(slide1);
          const slide2 = new FFImage({
            path: assetsPath + data.sceneData.media[1].url,
            y: 620,
            x: 960,
            width: 1920,
            height: 1080,
          });
          slide2.addEffect("fadeIn", 1.5, 3);
          slide2.addEffect("zoomingIn", 3.5, 4);
          scene3.addChild(slide2);
          scene3.setBgColor("#fff");
          const fimg1 = new FFImage({
            path: assetsPath + "whitestrip.jpg",
            x: 960,
          });
          fimg1.addAnimate({
            from: { y: -120 },
            to: { y: 70 },
            time: 1,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fimg1);
          if (data.sceneData.textAligmnet == "text-center") {
            const fontSize1 = parseInt(data.sceneData.textSize) + 25;
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 960,
              y: 50,
            });
            textOne.alignCenter();
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.addEffect("fadeIn", 1.5, 0.6);
            scene3.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 960,
                y: 120,
              });
              textNext.alignCenter();
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("fadeIn", 1.0, 1.0);
              scene3.addChild(textNext);
            }
          } else {
            const fontSize1 = parseInt(data.sceneData.textSize) + 25;
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 50,
              y: 50,
            });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.addEffect("fadeIn", 1.5, 0.6);
            scene3.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 50,
                y: 120,
              });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("fadeIn", 1.0, 1.0);
              scene3.addChild(textNext);
            }
          }
          const scene3img = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          scene3img.addAnimate({
            from: { x: 960 },
            to: { x: 3000 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene3.addChild(scene3img);
          const fcloud2 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud2.addAnimate({
            from: { x: -1620 },
            to: { x: 960 },
            time: 1,
            delay: parseFloat(data.sceneData.time) - 1,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fcloud2);
          scene3.setDuration(data.sceneData.time);
          creator.addChild(scene3);
          i++;
        } else if (templateBlock[i].sceneId == 9) {
          let data = templateBlock[i];
          const scene3 = new FFScene();
          const slide1 = new FFImage({
            path: assetsPath + data.sceneData.media[0].url,
            y: 540,
            x: 960,
            width: 1920,
            height: 1080,
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene3.addChild(slide1);
          scene3.setBgColor("#fff");
          const scene3img = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          scene3img.addAnimate({
            from: { x: 960 },
            to: { x: 3000 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene3.addChild(scene3img);
          const fcloud2 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud2.addAnimate({
            from: { x: -1620 },
            to: { x: 960 },
            time: 1,
            delay: 4,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fcloud2);
          scene3.setDuration(data.sceneData.time);
          creator.addChild(scene3);
          i++;
        } else if (templateBlock[i].sceneId == 10) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate10(data);
          var result = data.sceneData.textArray[0].text.split(" ");
          var text1 = "";
          var text2 = "";
          var text3 = "";
          for (var p = 0; p < result.length; p++) {
            if (p >= 7 && p < 14) {
              text2 = text2 + result[p] + " ";
            } else if (p > 13) {
              text3 = text3 + result[p] + " ";
            } else {
              text1 = text1 + result[p] + " ";
            }
          }
          let fontfamily = data.sceneData.textArray[0].fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.textArray[0].fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.textArray[0].fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.textArray[0].fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          var titleColor = data.sceneData.textArray[0].fontColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          if (data.sceneData.media[0].type == "image") {
            const scene4 = new FFScene();
            const image2 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img103.png",
              x: 1445,
              y: 540,
            });
            image2.addEffect("zoomingIn", 5.5, 0);
            scene4.addChild(image2);
            const whitebgscene1 = new FFImage({
              path: assetsPath + "scene10bg.jpg",
              y: 540,
              x: 475,
            });
            scene4.addChild(whitebgscene1);
            const image = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img101.png",
              x: 475,
              y: 270,
            });
            scene4.addChild(image);
            const img3 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img102.png",
              x: 475,
              y: 810,
            });
            scene4.addChild(img3);
            scene4.setBgColor("#fff");
            const fimg1 = new FFImage({
              path: assetsPath + "whitescene3.jpg",
              x: 475,
              y: 560,
            });
            scene4.addChild(fimg1);
            if (data.sceneData.textArray[0].fontAlignment == "text-center") {
              const fontSize1 =
                parseInt(data.sceneData.textArray[0].fontSize) + 15;
              const fontSize2 =
                parseInt(data.sceneData.textArray[1].fontSize) + 15;
              console.log(text1);
              const text = new FFText({
                text: text1,
                fontSize: fontSize1,
                x: 480,
                y: 510,
                height: 300,
                width: 540,
              });
              text.alignCenter();
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("fadeIn", 1, 0.6);
              scene4.addChild(text);
              console.log(text2);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 480,
                  y: 560,
                  height: 100,
                });
                textNext.alignCenter();
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1, 0.8);
                scene4.addChild(textNext);
              }
              console.log(text3);
              if (text3 != "") {
                const textNext3 = new FFText({
                  text: text3,
                  fontSize: fontSize1,
                  x: 480,
                  y: 610,
                  height: 100,
                });
                textNext3.alignCenter();
                textNext3.setColor(titleColor);
                textNext3.setFont(selectedfonts);
                textNext3.addEffect("fadeIn", 1, 0.8);
                scene4.addChild(textNext3);
              }
            } else {
              const fontSize1 =
                parseInt(data.sceneData.textArray[0].fontSize) + 15;
              const fontSize2 =
                parseInt(data.sceneData.textArray[1].fontSize) + 15;
              console.log(text1);
              const text = new FFText({
                text: text1,
                fontSize: fontSize1,
                x: 80,
                y: 480,
                height: 300,
                width: 540,
              });
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("fadeIn", 1, 0.6);
              scene4.addChild(text);
              console.log(text2);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 80,
                  y: 530,
                  height: 100,
                });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1, 0.8);
                scene4.addChild(textNext);
              }
              console.log(text3);
              if (text3 != "") {
                const textNext3 = new FFText({
                  text: text3,
                  fontSize: fontSize1,
                  x: 80,
                  y: 580,
                  height: 100,
                });
                textNext3.setColor(titleColor);
                textNext3.setFont(selectedfonts);
                textNext3.addEffect("fadeIn", 1, 0.8);
                scene4.addChild(textNext3);
              }
            }
            scene4.setBgColor("#fff");
            const fcloud2 = new FFImage({
              path: assetsPath + "cropped.jpg",
              x: 960,
            });
            fcloud2.addAnimate({
              from: { y: 540 },
              to: { y: -600 },
              time: 1,
              delay: 0,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud2);
            const fcloud3 = new FFImage({
              path: assetsPath + "cropped.jpg",
              x: 960,
            });
            fcloud3.addAnimate({
              from: { y: 1620 },
              to: { y: 540 },
              time: 1,
              delay: parseFloat(data.sceneData.time) - 1,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud3);

            scene4.setDuration(data.sceneData.time);
            creator.addChild(scene4);
          }
          i++;
        } else if (templateBlock[i].sceneId == 11) {
          let data = templateBlock[i];
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          console.log(result);
          var text = "";
          var text2 = "";
          for (var m = 0; m < result.length; m++) {
            if (m > 12) {
              text2 = text2 + result[m] + " ";
            } else {
              text = text + result[m] + " ";
            }
          }
          console.log(text2);
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          const scene3 = new FFScene();
          const slide1 = new FFImage({
            path: assetsPath + data.sceneData.media[0].url,
            y: 480,
            x: 960,
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene3.addChild(slide1);
          const slide2 = new FFImage({
            path: assetsPath + data.sceneData.media[1].url,
            y: 480,
            x: 960,
          });
          slide2.addEffect("fadeIn", 1.5, 3);
          slide2.addEffect("zoomingIn", 3.5, 4);
          scene3.addChild(slide2);
          scene3.setBgColor("#fff");
          const fimg1 = new FFImage({
            path: assetsPath + "whitestrip.jpg",
            x: 960,
          });
          fimg1.addAnimate({
            from: { y: 1180 },
            to: { y: 1040 },
            time: 1,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fimg1);
          if (data.sceneData.textAligmnet == "text-center") {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 960,
              y: 930,
            });
            textOne.alignCenter();
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.addEffect("fadeIn", 1.5, 0.6);
            scene3.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 960,
                y: 990,
              });
              textNext.alignCenter();
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("fadeIn", 1.0, 1.0);
              scene3.addChild(textNext);
            }
          } else {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 50,
              y: 930,
            });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.addEffect("fadeIn", 1.5, 0.6);
            scene3.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 50,
                y: 990,
              });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("fadeIn", 1.0, 1.0);
              scene3.addChild(textNext);
            }
          }
          const scene3img = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          scene3img.addAnimate({
            from: { x: 960 },
            to: { x: 3000 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene3.addChild(scene3img);
          const fcloud2 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud2.addAnimate({
            from: { x: -1620 },
            to: { x: 960 },
            time: 1,
            delay: parseFloat(data.sceneData.time) - 1,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fcloud2);
          scene3.setDuration(data.sceneData.time);
          creator.addChild(scene3);
          i++;
        } else if (templateBlock[i].sceneId == 12) {
          let data = templateBlock[i];
          console.log(data.sceneData.media[0]);
          console.log(assetsPath + data.sceneData.media[0].url);
          const scene3 = new FFScene();
          if (data.sceneData.media[0].type == "video") {
            const videoDuration = await videoTemplate12(data);
            console.log(videoDuration);
            var slide1 = new FFVideo({
              path: assetsPath + data.sceneData.media[0].url,
              y: 540,
              x: 960,
              width: 1920,
              height: 1080,
            });
            scene3.setDuration(videoDuration);
          } else {
            var slide1 = new FFImage({
              path: assetsPath + data.sceneData.media[0].url,
              y: 540,
              x: 960,
              width: 1920,
              height: 1080,
            });
            slide1.addEffect("zoomingIn", 3.5, 1);
            scene3.addChild(slide1);
            scene3.setBgColor("#fff");
            const scene3img = new FFImage({
              path: assetsPath + "cropped.jpg",
              y: 540,
            });
            scene3img.addAnimate({
              from: { x: 960 },
              to: { x: 3000 },
              time: 1,
              delay: 0,
              ease: "Cubic.InOut",
            });
            scene3.addChild(scene3img);
            const fcloud2 = new FFImage({
              path: assetsPath + "cropped.jpg",
              y: 540,
            });
            fcloud2.addAnimate({
              from: { x: -1620 },
              to: { x: 960 },
              time: 1,
              delay: parseFloat(data.sceneData.time) - 1,
              ease: "Cubic.InOut",
            });
            scene3.addChild(fcloud2);
            scene3.setDuration(data.sceneData.time);
          }
          scene3.addChild(slide1);
          creator.addChild(scene3);
          i++;
        } else if (templateBlock[i].sceneId == 13) {
          console.log("firstVideo");
          let data = templateBlock[i];
          const firstVideo = await videoTemplate13(data);
          console.log(firstVideo);
          let titleColor;
          if (data.sceneData.titleColor) {
            titleColor = data.sceneData.titleColor;
          } else {
            titleColor = data.sceneData.textColor;
          }
          let fontfamily = data.sceneData.fontFamily;
          let titlefontfamily = data.sceneData.titleFontFamily;
          let selectedfonts;
          let titlefonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
            if (font.family == titlefontfamily) {
              if (data.sceneData.titleFontWeight == "lighter") {
                titlefonts = font.lighter;
              } else if (data.sceneData.titleFontWeight == "normal") {
                titlefonts = font.file;
              } else if (data.sceneData.titleFontWeight == "bold") {
                titlefonts = font.bold;
              }
            }
          });
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var subtitleColor = data.sceneData.textColor;
          if (subtitleColor.length == "4") {
            subtitleColor = subtitleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }
          if (data.sceneData.titletextSize) {
            var titletextSize = data.sceneData.titletextSize;
          } else {
            var titletextSize = data.sceneData.textSize;
          }
          if (data.sceneData.textSize) {
            var textSize = data.sceneData.textSize;
          } else {
            var textSize = data.sceneData.textSize;
          }
          if (typeof data.sceneData.content[0].title == undefined) {
            var fieldTitle1 = "";
            var fieldText1 = "";
          } else {
            var fieldTitle1 = data.sceneData.content[0].title;
            var fieldText1 = data.sceneData.content[0].text;
          }
          if (data.sceneData.content[1] == undefined) {
            var fieldTitle2 = "";
            var fieldText2 = "";
          } else {
            var fieldTitle2 = data.sceneData.content[1].title;
            var fieldText2 = data.sceneData.content[1].text;
          }
          if (data.sceneData.content[2] == undefined) {
            var fieldTitle3 = "";
            var fieldText3 = "";
          } else {
            var fieldTitle3 = data.sceneData.content[2].title;
            var fieldText3 = data.sceneData.content[2].text;
          }
          if (data.sceneData.content[3] == undefined) {
            var fieldTitle4 = "";
            var fieldText4 = "";
          } else {
            var fieldTitle4 = data.sceneData.content[3].title;
            var fieldText4 = data.sceneData.content[3].text;
          }
          if (data.sceneData.content[4] != undefined) {
            var fieldTitle5 = data.sceneData.content[4].title;
            var fieldText5 = data.sceneData.content[4].text;
          } else {
            var fieldTitle5 = "";
            var fieldText5 = "";
          }

          const scene2 = new FFScene();
          scene2.setBgColor("#399891");
          // scene2.setBgColor("#fff");
          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img131.png",
            y: 540,
          });
          slide1.addAnimate({
            from: { x: -960 },
            to: { x: 680 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene2.addChild(slide1);

          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img132.png",
            y: 540,
          });
          slide2.addAnimate({
            from: { x: -960 },
            to: { x: 680 },
            time: 1,
            delay: 3,
            ease: "Cubic.InOut",
          });
          slide2.addEffect("zoomingIn", 3.5, 4);
          scene2.addChild(slide2);
          const slidebg1 = new FFImage({
            path: assetsPath + "greenbg.png",
            y: 540,
            x: -80,
          });
          scene2.addChild(slide2);
          const slidebg3 = new FFImage({
            path: assetsPath + "greenbg2.png",
            y: -50,
            x: 960,
          });
          slidebg3.setScale(2);
          scene2.addChild(slidebg3);
          const slidebg4 = new FFImage({
            path: assetsPath + "greenbg2.png",
            y: 1130,
            x: 960,
          });
          slidebg4.setScale(2);
          scene2.addChild(slidebg4);
          scene2.addChild(slidebg1);
          const slidebg = new FFImage({
            path: assetsPath + "greenbg.png",
            y: 540,
            x: 1620,
          });
          // slidebg.addAnimate({
          //   from: { x: -250 },
          //   to: { x: 250 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          scene2.addChild(slidebg);
          const fontSize1 = parseInt(titletextSize) + 20;
          const fontSize2 = parseInt(textSize) + 20;
          if (fieldTitle1 != "") {
            const text1 = new FFText({
              text: fieldTitle1,
              fontSize: fontSize1,
              x: 1540,
              y: 170,
            });
            text1.setColor(titleColor);
            text1.setFont(titlefonts);
            text1.addEffect("fadeInLeft", 1, 0.5);
            scene2.addChild(text1);
          }
          if (fieldText1 != "") {
            const textField = new FFText({
              text: fieldText1,
              fontSize: fontSize1,
              x: 1540,
              y: 220,
            });
            textField.setColor(subtitleColor);
            textField.setFont(selectedfonts);
            textField.addEffect("fadeInLeft", 1, 0.5);
            scene2.addChild(textField);
          }
          if (fieldTitle2 != "") {
            const textTitle2 = new FFText({
              text: fieldTitle2,
              fontSize: fontSize1,
              x: 1540,
              y: 320,
            });
            textTitle2.setColor(titleColor);
            textTitle2.setFont(titlefonts);
            textTitle2.addEffect("fadeInLeft", 1, 0.7);
            scene2.addChild(textTitle2);
          }
          if (fieldText2 != "") {
            const textField2 = new FFText({
              text: fieldText2,
              fontSize: fontSize2,
              x: 1540,
              y: 370,
            });
            textField2.setColor(subtitleColor);
            textField2.setFont(selectedfonts);
            textField2.addEffect("fadeInLeft", 1, 0.7);
            scene2.addChild(textField2);
          }
          if (fieldTitle3 != "") {
            const text5 = new FFText({
              text: fieldTitle3,
              fontSize: fontSize1,
              x: 1540,
              y: 470,
            });
            text5.setColor(titleColor);
            text5.setFont(titlefonts);
            text5.addEffect("fadeInLeft", 1, 0.9);
            scene2.addChild(text5);
          }
          if (fieldText3) {
            const text6 = new FFText({
              text: fieldText3,
              fontSize: fontSize2,
              x: 1540,
              y: 520,
            });
            text6.setColor(subtitleColor);
            text6.setFont(selectedfonts);
            text6.addEffect("fadeInLeft", 1, 0.9);
            scene2.addChild(text6);
          }

          if (fieldTitle4) {
            const text7 = new FFText({
              text: fieldTitle4,
              fontSize: fontSize1,
              x: 1540,
              y: 620,
            });
            text7.setColor(titleColor);
            text7.setFont(titlefonts);
            text7.addEffect("fadeInLeft", 1, 1.1);
            scene2.addChild(text7);
          }
          if (fieldText4) {
            const text8 = new FFText({
              text: fieldText4,
              fontSize: fontSize2,
              x: 1540,
              y: 670,
            });
            text8.setColor(subtitleColor);
            text8.setFont(selectedfonts);
            text8.addEffect("fadeInLeft", 1, 1.1);
            scene2.addChild(text8);
          }

          if (fieldTitle5) {
            const text9 = new FFText({
              text: fieldTitle5,
              fontSize: fontSize1,
              x: 1540,
              y: 770,
            });
            text9.setColor(titleColor);
            text9.setFont(titlefonts);
            text9.addEffect("fadeInLeft", 1, 1.3);
            scene2.addChild(text9);
          }
          if (fieldText5) {
            const text10 = new FFText({
              text: fieldText5,
              fontSize: fontSize2,
              x: 1540,
              y: 820,
            });
            text10.setColor(subtitleColor);
            text10.setFont(selectedfonts);
            text10.addEffect("fadeInLeft", 1, 1.3);
            scene2.addChild(text10);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene2.addChild(watermark);
          }
          const fcloud = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud.addAnimate({
            from: { x: -960 },
            to: { x: 960 },
            time: 1,
            delay: 5.5,
            ease: "Cubic.InOut",
          });
          const fcloud2 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud2.addAnimate({
            from: { x: 960 },
            to: { x: 3200 },
            time: 1,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          scene2.addChild(fcloud2);
          scene2.addChild(fcloud);
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          // scene2.setTransition("fade", 1);
          i++;
        } else if (templateBlock[i].sceneId == 14) {
          let data = templateBlock[i];
          const sixVideo = await videoTemplate6(data);
          fontfamily = data.sceneData.fontFamily;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          const content = data.sceneData.content;
          const contentParts = content.split("\n");
          const scene6 = new FFScene();

          const fimg1 = new FFImage({
            path: assetsPath + "whitescenegallery.jpg",
            y: 470,
            x: 990,
            width: 1368,
            height: 768,
          });
          fimg1.addAnimate({
            from: { x: 960, y: 500 },
            to: { x: 990, y: 470 },
            time: 0.5,
            delay: 0.8,
            ease: "Cubic.InOut",
          });
          fimg1.setOpacity(0.8);
          fimg1.addEffect("zoomingIn", 10, 1);
          scene6.addChild(fimg1);
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img61.png",
            y: 500,
            x: 960,
            width: 1368,
            height: 768,
          });
          slide1.addEffect("zoomingIn", 10, 1);
          scene6.addChild(slide1);
          const fimg2 = new FFImage({
            path: assetsPath + "grya-bg3.png",
            y: 800,
          });
          fimg2.addAnimate({
            from: { x: -960 },
            to: { x: 450 },
            time: 1,
            delay: 0.5,
            ease: "Cubic.InOut",
          });
          fimg2.setScale(0.4);
          // fimg1.addEffect("slideInUp", 1.5, 1);
          // fimg1.addEffect("fadeIn", 1, 1.1);
          scene6.addChild(fimg2);
          if (contentParts[2] != undefined && contentParts[2] != "") {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 450,
              y: 730,
            });
            scene6.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("fadeIn", 1, 1.3);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene6.addChild(text);

            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 450,
              y: 800,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("fadeIn", 1.0, 1.4);
            scene6.addChild(text2);

            const text3 = new FFText({
              text: contentParts[2],
              fontSize: fontSize1,
              x: 450,
              y: 870,
            });
            text3.alignCenter();
            text3.setStyle({ padding: [4, 20, 6, 20] });
            text3.setColor(titleColor);
            text3.setFont(selectedfonts);
            text3.addEffect("fadeIn", 1.0, 1.4);
            scene6.addChild(text3);
          } else {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 450,
              y: 760,
            });
            scene6.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("fadeIn", 1, 1.3);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene6.addChild(text);

            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 450,
              y: 830,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("fadeIn", 1.0, 1.4);
            scene6.addChild(text2);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene6.addChild(watermark);
          }
          const fcloud2 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud2.addAnimate({
            from: { x: 960 },
            to: { x: 3200 },
            time: 1,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          console.log("here");
          scene6.addChild(fcloud2);
          const fcloud3 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud3.addAnimate({
            from: { x: 3200 },
            to: { x: 960 },
            time: 1,
            delay: 4.5,
            ease: "Cubic.InOut",
          });
          scene6.addChild(fcloud3);
          scene6.setBgColor("#399891");
          // scene5.addChild(fcloud2);
          scene6.setDuration(data.sceneData.time);
          creator.addChild(scene6);
          i++;
        } else if (templateBlock[i].sceneId == 15) {
          let data = templateBlock[i];
          const firstVideo15 = await videoTemplate15(data);
          const scene3 = new FFScene();
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img151.png",
            y: 540,
            x: 960,
          });
          slide1.addEffect("zoomingIn", 3.5, 0.5);
          scene3.addChild(slide1);
          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img152.png",
            y: 540,
          });
          slide2.addAnimate({
            from: { x: -1960 },
            to: { x: 960 },
            time: 1,
            delay: 2.5,
            ease: "Cubic.InOut",
          });
          slide2.addEffect("zoomingIn", 3.5, 3);
          scene3.addChild(slide2);
          // const slide3 = new FFImage({
          //   path:
          //     assetsPath +
          //     "template/videos/" +
          //     userId +
          //     "/template1/" +
          //  mediaDate + "-img153.png",
          //   y: 540,
          // });
          // slide3.addAnimate({
          //   from: { x: -1960 },
          //   to: { x: 960 },
          //   time: 1,
          //   delay: 4,
          //   ease: "Cubic.InOut",
          // });
          // slide3.addEffect("zoomingIn", 3.5, 5);
          // scene3.addChild(slide3);
          // const slide4 = new FFImage({
          //   path:
          //     assetsPath +
          //     "template/videos/" +
          //     userId +
          //     "/template1/" +
          //     mediaDate + "-img154.png",
          //   y: 540,
          // });
          // slide4.addAnimate({
          //   from: { x: -1960 },
          //   to: { x: 960 },
          //   time: 1,
          //   delay: 6,
          //   ease: "Cubic.InOut",
          // });
          // slide4.addEffect("zoomingIn", 3.5, 7);
          // scene3.addChild(slide4);
          scene3.setBgColor("#fff");
          // const fimg1 = new FFImage({
          //   path: assetsPath + "whitebg2.png",
          //   y: 950,
          // });
          // fimg1.addAnimate({
          //   from: { x: -480 },
          //   to: { x: 480 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          // scene3.addChild(fimg1);
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene3.addChild(watermark);
          }

          const scene3img = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          scene3img.addAnimate({
            from: { x: 960 },
            to: { x: 3000 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene3.addChild(scene3img);
          const fcloud2 = new FFImage({
            path: assetsPath + "cropped.jpg",
            x: 960,
          });
          fcloud2.addAnimate({
            from: { y: 1620 },
            to: { y: 540 },
            time: 1,
            delay: parseFloat(data.sceneData.time) - 1,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fcloud2);
          scene3.setTransition("fade", 0.5);
          scene3.setDuration(data.sceneData.time);
          creator.addChild(scene3);
          i++;
        } else if (templateBlock[i].sceneId == 16) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate16(data);
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 7) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          if (data.sceneData.media[0].type == "image") {
            const scene4 = new FFScene();
            const image = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img161.png",
            });
            image.addAnimate({
              from: { x: 350, y: 410 },
              to: { x: 460, y: 500 },
              time: 4,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image);
            const image2 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img162.png",
              x: 1530,
              y: 600,
            });
            image2.addAnimate({
              from: { x: 1620, y: 690 },
              to: { x: 1530, y: 600 },
              time: 4,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image2);
            scene4.setBgColor("#fff");
            const fimg1 = new FFImage({
              path: assetsPath + "whitebg2.png",
              x: 520,
            });
            fimg1.addAnimate({
              from: { y: 1720 },
              to: { y: 950 },
              time: 0.6,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fimg1);
            console.log("heres2");
            if (data.sceneData.textAligmnet == "text-center") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 520,
                y: 925,
              });
              textOne.alignCenter();
              textOne.setStyle({ padding: [0, 20, 10, 20] });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.addEffect("fadeIn", 1.5, 0.6);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 520,
                  y: 995,
                });
                textNext.alignCenter();
                textNext.setStyle({ padding: [0, 20, 10, 20] });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1.5, 1.0);
                scene4.addChild(textNext);
              }
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 100,
                y: 895,
              });

              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.addEffect("fadeIn", 1.5, 0.6);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 100,
                  y: 950,
                });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1.5, 1.0);
                scene4.addChild(textNext);
              }
            }
            scene4.setBgColor("#444");
            // const fimg2 = new FFImage({
            //   path: assetsPath + "whitebg2.png",
            //   x: 1445,
            // });
            // fimg2.addAnimate({
            //   from: { y: 1720 },
            //   to: { y: 1010 },
            //   time: 1,
            //   delay: 3.5,
            //   ease: "Cubic.InOut",
            // });
            // fimg2.addEffect("fadeInUp", 1, 3.2);
            // scene4.addChild(fimg2);
            if (user.userPlan == 0) {
              const watermark = new FFImage({
                path: assetsPath + "reveoLogo.png",
                x: 1680,
                y: 50,
              });
              watermark.setOpacity(0.7);
              watermark.setScale(0.5);
              scene4.addChild(watermark);
            }
            const fcloud2 = new FFImage({
              path: assetsPath + "cropped.jpg",
              x: 960,
            });
            fcloud2.addAnimate({
              from: { y: 540 },
              to: { y: -600 },
              time: 1,
              delay: 0,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud2);

            const fcloud3 = new FFImage({
              path: assetsPath + "cropped.jpg",
              x: 960,
            });
            fcloud3.addAnimate({
              from: { y: 1620 },
              to: { y: 540 },
              time: 1,
              delay: parseFloat(data.sceneData.time) - 1,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud3);

            scene4.setDuration(data.sceneData.time);
            creator.addChild(scene4);
          }
          i++;
        } else if (templateBlock[i].sceneId == 17) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate17(data);
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 10) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          if (data.sceneData.media[0].type == "image") {
            const scene4 = new FFScene();
            const image = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img171.png",
              y: 540,
            });
            image.addAnimate({
              from: { x: 350 },
              to: { x: 620 },
              time: 3.5,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image);
            const image2 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img172.png",
              y: 540,
            });
            image2.addAnimate({
              from: { x: 1620 },
              to: { x: 1560 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image2);
            scene4.setBgColor("#444");
            const fimg1 = new FFImage({
              path: assetsPath + "whitebg2.png",
              x: 520,
            });
            fimg1.addAnimate({
              from: { y: 1720 },
              to: { y: 950 },
              time: 0.6,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fimg1);
            console.log("heres2");
            const fontSize1 = parseInt(data.sceneData.textSize) + 15;
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 100,
              y: 895,
            });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.addEffect("fadeIn", 1.5, 0.6);
            scene4.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 100,
                y: 950,
              });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("fadeIn", 1.5, 1.0);
              scene4.addChild(textNext);
            }
            if (user.userPlan == 0) {
              const watermark = new FFImage({
                path: assetsPath + "reveoLogo.png",
                x: 1680,
                y: 50,
              });
              watermark.setOpacity(0.7);
              watermark.setScale(0.5);
              scene4.addChild(watermark);
            }
            const fcloud2 = new FFImage({
              path: assetsPath + "cropped.jpg",
              x: 960,
            });
            fcloud2.addAnimate({
              from: { y: 540 },
              to: { y: -600 },
              time: 1,
              delay: 0,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud2);

            const fcloud3 = new FFImage({
              path: assetsPath + "cropped.jpg",
              x: 960,
            });
            fcloud3.addAnimate({
              from: { y: 1620 },
              to: { y: 540 },
              time: 1,
              delay: parseFloat(data.sceneData.time) - 1,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud3);

            scene4.setDuration(data.sceneData.time);
            creator.addChild(scene4);
          }
          i++;
        } else if (templateBlock[i].sceneId == 18) {
          let data = templateBlock[i];
          const firstVideo = await videoTemplate18(data);

          let titleColor;
          if (data.sceneData.titleColor) {
            titleColor = data.sceneData.titleColor;
          } else {
            titleColor = data.sceneData.textColor;
          }
          let fontfamily = data.sceneData.fontFamily;
          let titlefontfamily = data.sceneData.titleFontFamily;
          let selectedfonts;
          let titlefonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
            if (font.family == titlefontfamily) {
              if (data.sceneData.titleFontWeight == "lighter") {
                titlefonts = font.lighter;
              } else if (data.sceneData.titleFontWeight == "normal") {
                titlefonts = font.file;
              } else if (data.sceneData.titleFontWeight == "bold") {
                titlefonts = font.bold;
              }
            }
          });
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var subtitleColor = data.sceneData.textColor;
          if (subtitleColor.length == "4") {
            subtitleColor = subtitleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }
          if (data.sceneData.titletextSize) {
            var titletextSize = data.sceneData.titletextSize;
          } else {
            var titletextSize = data.sceneData.textSize;
          }
          if (data.sceneData.textSize) {
            var textSize = data.sceneData.textSize;
          } else {
            var textSize = data.sceneData.textSize;
          }
          if (typeof data.sceneData.content[0].title == undefined) {
            var fieldTitle1 = "";
            var fieldText1 = "";
          } else {
            var fieldTitle1 = data.sceneData.content[0].title;
            var fieldText1 = data.sceneData.content[0].text;
          }
          if (data.sceneData.content[1] == undefined) {
            var fieldTitle2 = "";
            var fieldText2 = "";
          } else {
            var fieldTitle2 = data.sceneData.content[1].title;
            var fieldText2 = data.sceneData.content[1].text;
          }
          if (data.sceneData.content[2] == undefined) {
            var fieldTitle3 = "";
            var fieldText3 = "";
          } else {
            var fieldTitle3 = data.sceneData.content[2].title;
            var fieldText3 = data.sceneData.content[2].text;
          }
          if (data.sceneData.content[3] == undefined) {
            var fieldTitle4 = "";
            var fieldText4 = "";
          } else {
            var fieldTitle4 = data.sceneData.content[3].title;
            var fieldText4 = data.sceneData.content[3].text;
          }
          if (data.sceneData.content[4] != undefined) {
            var fieldTitle5 = data.sceneData.content[4].title;
            var fieldText5 = data.sceneData.content[4].text;
          } else {
            var fieldTitle5 = "";
            var fieldText5 = "";
          }

          const scene2 = new FFScene();
          scene2.setBgColor("#444");

          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img181.png",
            y: 540,
            width: 1200,
            height: 1080,
          });
          slide1.addAnimate({
            from: { x: 2960 },
            to: { x: 1340 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene2.addChild(slide1);

          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img182.png",
            y: 540,
            width: 1200,
            height: 1080,
          });
          slide2.addAnimate({
            from: { x: 2960 },
            to: { x: 1340 },
            time: 1,
            delay: 3,
            ease: "Cubic.InOut",
          });
          slide2.addEffect("zoomingIn", 3.5, 4);
          scene2.addChild(slide2);
          const slidebg = new FFImage({
            path: assetsPath + "blackbg.png",
            y: 540,
            x: 400,
          });
          scene2.addChild(slidebg);
          // slidebg.addAnimate({
          //   from: { x: -250 },
          //   to: { x: 250 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          // scene2.addChild(slidebg);
          const fontSize1 = parseInt(titletextSize) + 20;
          const fontSize2 = parseInt(textSize) + 20;
          if (fieldTitle1 != "") {
            const text1 = new FFText({
              text: fieldTitle1,
              fontSize: fontSize1,
              x: 150,
              y: 170,
            });
            text1.setColor(titleColor);
            text1.setFont(titlefonts);
            text1.addEffect("fadeInLeft", 1, 0.5);
            scene2.addChild(text1);
          }
          if (fieldText1 != "") {
            const textField = new FFText({
              text: fieldText1,
              fontSize: fontSize1,
              x: 150,
              y: 220,
            });
            textField.setColor(subtitleColor);
            textField.setFont(selectedfonts);
            textField.addEffect("fadeInLeft", 1, 0.5);
            scene2.addChild(textField);
          }
          if (fieldTitle2 != "") {
            const textTitle2 = new FFText({
              text: fieldTitle2,
              fontSize: fontSize1,
              x: 150,
              y: 320,
            });
            textTitle2.setColor(titleColor);
            textTitle2.setFont(titlefonts);
            textTitle2.addEffect("fadeInLeft", 1, 0.7);
            scene2.addChild(textTitle2);
          }
          if (fieldText2 != "") {
            const textField2 = new FFText({
              text: fieldText2,
              fontSize: fontSize2,
              x: 150,
              y: 370,
            });
            textField2.setColor(subtitleColor);
            textField2.setFont(selectedfonts);
            textField2.addEffect("fadeInLeft", 1, 0.7);
            scene2.addChild(textField2);
          }
          if (fieldTitle3 != "") {
            const text5 = new FFText({
              text: fieldTitle3,
              fontSize: fontSize1,
              x: 150,
              y: 470,
            });
            text5.setColor(titleColor);
            text5.setFont(titlefonts);
            text5.addEffect("fadeInLeft", 1, 0.9);
            scene2.addChild(text5);
          }
          if (fieldText3) {
            const text6 = new FFText({
              text: fieldText3,
              fontSize: fontSize2,
              x: 150,
              y: 520,
            });
            text6.setColor(subtitleColor);
            text6.setFont(selectedfonts);
            text6.addEffect("fadeInLeft", 1, 0.9);
            scene2.addChild(text6);
          }

          if (fieldTitle4) {
            const text7 = new FFText({
              text: fieldTitle4,
              fontSize: fontSize1,
              x: 150,
              y: 620,
            });
            text7.setColor(titleColor);
            text7.setFont(titlefonts);
            text7.addEffect("fadeInLeft", 1, 1.1);
            scene2.addChild(text7);
          }
          if (fieldText4) {
            const text8 = new FFText({
              text: fieldText4,
              fontSize: fontSize2,
              x: 150,
              y: 670,
            });
            text8.setColor(subtitleColor);
            text8.setFont(selectedfonts);
            text8.addEffect("fadeInLeft", 1, 1.1);
            scene2.addChild(text8);
          }

          if (fieldTitle5) {
            const text9 = new FFText({
              text: fieldTitle5,
              fontSize: fontSize1,
              x: 150,
              y: 770,
            });
            text9.setColor(titleColor);
            text9.setFont(titlefonts);
            text9.addEffect("fadeInLeft", 1, 1.3);
            scene2.addChild(text9);
          }
          if (fieldText5) {
            const text10 = new FFText({
              text: fieldText5,
              fontSize: fontSize2,
              x: 150,
              y: 820,
            });
            text10.setColor(subtitleColor);
            text10.setFont(selectedfonts);
            text10.addEffect("fadeInLeft", 1, 1.3);
            scene2.addChild(text10);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene2.addChild(watermark);
          }
          const fcloud1 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud1.addAnimate({
            from: { x: 960 },
            to: { x: -1260 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene2.addChild(fcloud1);
          const fcloud = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud.addAnimate({
            from: { x: -960 },
            to: { x: 960 },
            time: 1,
            delay: parseFloat(data.sceneData.time) - 1,
            ease: "Cubic.InOut",
          });
          scene2.addChild(fcloud);
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          // scene2.setTransition("fade", 1);
          i++;
        } else if (templateBlock[i].sceneId == 19) {
          let data = templateBlock[i];
          const firstVideo = await videoTemplate19(data);

          fontfamily = data.sceneData.fontFamily;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          const content = data.sceneData.content;
          const contentParts = content.split("\n");

          const scene2 = new FFScene();
          scene2.setBgColor("#444");

          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img191.png",
            y: 540,
            width: 1200,
            height: 1080,
          });
          slide1.addAnimate({
            from: { x: 2960 },
            to: { x: 1340 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene2.addChild(slide1);

          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img192.png",
            y: 540,
            x: 1340,
            width: 1200,
            height: 1080,
          });
          slide2.addAnimate({
            from: { x: 2960 },
            to: { x: 1340 },
            time: 1,
            delay: 3,
            ease: "Cubic.InOut",
          });
          // slide2.addEffect("fadeIn", 1, 3);
          slide2.addEffect("zoomingIn", 3.5, 3);
          scene2.addChild(slide2);
          const slidebg = new FFImage({
            path: assetsPath + "blackbg.png",
            y: 540,
            x: 400,
          });
          // slidebg.addAnimate({
          //   from: { x: -250 },
          //   to: { x: 250 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          scene2.addChild(slidebg);

          if (data.sceneData.textAligmnet == "text-center") {
            if (contentParts[2] != undefined && contentParts[2] != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 25;
              const text = new FFText({
                text: contentParts[0],
                fontSize: fontSize1,
                x: 350,
                y: 475,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInLeft", 1, 1.3);
              text.alignCenter();
              text.setStyle({ padding: [0, 20, 10, 20] });
              scene2.addChild(text);

              const text2 = new FFText({
                text: contentParts[1],
                fontSize: fontSize1,
                x: 350,
                y: 545,
              });
              text2.alignCenter();
              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInLeft", 1.0, 1.4);
              scene2.addChild(text2);

              const text3 = new FFText({
                text: contentParts[2],
                fontSize: fontSize1,
                x: 350,
                y: 615,
              });
              text3.alignCenter();
              text3.setStyle({ padding: [4, 20, 6, 20] });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("backInLeft", 1.0, 1.4);
              scene2.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 25;
              const text = new FFText({
                text: contentParts[0],
                fontSize: fontSize1,
                x: 350,
                y: 510,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInLeft", 1, 1.3);
              text.alignCenter();
              text.setStyle({ padding: [0, 20, 10, 20] });
              scene2.addChild(text);

              const text2 = new FFText({
                text: contentParts[1],
                fontSize: fontSize1,
                x: 350,
                y: 580,
              });
              text2.alignCenter();
              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInLeft", 1.0, 1.4);
              scene2.addChild(text2);
            }
          } else {
            if (contentParts[2] != undefined && contentParts[2] != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 25;
              const text = new FFText({
                text: contentParts[0],
                fontSize: fontSize1,
                x: 80,
                y: 445,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInLeft", 1, 1.3);

              text.setStyle({ padding: [0, 20, 10, 20] });
              scene2.addChild(text);

              const text2 = new FFText({
                text: contentParts[1],
                fontSize: fontSize1,
                x: 80,
                y: 505,
              });

              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInLeft", 1.0, 1.4);
              scene2.addChild(text2);

              const text3 = new FFText({
                text: contentParts[2],
                fontSize: fontSize1,
                x: 80,
                y: 475,
              });

              text3.setStyle({ padding: [4, 20, 6, 20] });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("backInLeft", 1.0, 1.4);
              scene2.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 25;
              const text = new FFText({
                text: contentParts[0],
                fontSize: fontSize1,
                x: 80,
                y: 470,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInLeft", 1, 1.3);

              text.setStyle({ padding: [0, 20, 10, 20] });
              scene2.addChild(text);

              const text2 = new FFText({
                text: contentParts[1],
                fontSize: fontSize1,
                x: 80,
                y: 540,
              });

              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInLeft", 1.0, 1.4);
              scene2.addChild(text2);
            }
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene2.addChild(watermark);
          }
          const fcloud = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud.addAnimate({
            from: { x: -960 },
            to: { x: 960 },
            time: 1,
            delay: parseFloat(data.sceneData.time) - 1,
            ease: "Cubic.InOut",
          });
          scene2.addChild(fcloud);
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          console.log("here19 end");
          // scene2.setTransition("fade", 1);
          i++;
        } else if (templateBlock[i].sceneId == 20) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate20(data);
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 12) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          if (data.sceneData.media[0].type == "image") {
            const scene4 = new FFScene();
            const image = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img201.png",
              y: 540,
            });
            image.addAnimate({
              from: { x: 1000 },
              to: { x: 960 },
              time: 3.0,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image);
            // const image2 = new FFImage({
            //   path:
            //     assetsPath +
            //     "template/videos/" +
            //     userId +
            //     "/template1/" +
            mediaDate + "-img172.png",
              //   y: 540,
              // });
              // image2.addAnimate({
              //   from: { x: 1620 },
              //   to: { x: 1560 },
              //   time: 3,
              //   delay: 0.2,
              //   ease: "Cubic.InOut",
              // });
              // scene4.addChild(image2);
              scene4.setBgColor("#444");
            const fimg1 = new FFImage({
              path: assetsPath + "whitestrip.jpg",
              x: 960,
            });
            fimg1.addAnimate({
              from: { y: 1720 },
              to: { y: 950 },
              time: 0.6,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            fimg1.setScale(0.6);
            scene4.addChild(fimg1);
            if (data.sceneData.textAligmnet == "text-center") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 15;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 960,
                y: 920,
              });
              textOne.alignCenter();
              textOne.setStyle({ padding: [4, 20, 6, 20] });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.addEffect("fadeIn", 1.5, 0.6);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 960,
                  y: 980,
                });
                textNext.alignCenter();
                textNext.setStyle({ padding: [4, 20, 6, 20] });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1.5, 1.0);
                scene4.addChild(textNext);
              }
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 15;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 450,
                y: 895,
              });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.addEffect("fadeIn", 1.5, 0.6);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 450,
                  y: 950,
                });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1.5, 1.0);
                scene4.addChild(textNext);
              }
            }
            if (user.userPlan == 0) {
              const watermark = new FFImage({
                path: assetsPath + "reveoLogo.png",
                x: 1680,
                y: 50,
              });
              watermark.setOpacity(0.7);
              watermark.setScale(0.5);
              scene4.addChild(watermark);
            }
            const fcloud2 = new FFImage({
              path: assetsPath + "cropped.jpg",
              x: 960,
            });
            fcloud2.addAnimate({
              from: { y: 540 },
              to: { y: -600 },
              time: 1,
              delay: 0,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud2);

            const fcloud3 = new FFImage({
              path: assetsPath + "cropped.jpg",
              x: 960,
            });
            fcloud3.addAnimate({
              from: { y: 1620 },
              to: { y: 540 },
              time: 1,
              delay: parseFloat(data.sceneData.time) - 1,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud3);

            scene4.setDuration(data.sceneData.time);
            creator.addChild(scene4);
          }
          i++;
        } else if (templateBlock[i].sceneId == 21) {
          // Resize Images for scene
          let data = templateBlock[i];
          fontfamily = data.sceneData.fontFamily;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          const content = data.sceneData.content;
          const contentParts = content.split("\n");
          console.log(contentParts);
          const scene1 = new FFScene();
          scene1.setBgColor("#fff");

          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 150,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene1.addChild(watermark);
            console.log("here");
          }
          const fimg1 = new FFImage({
            path: assetsPath + "gradient.png",
            x: 960,
            y: 540,
          });
          scene1.addChild(fimg1);
          if (contentParts[2] != undefined && contentParts[2] != "") {
            const fontSize1 = parseInt(data.sceneData.textSize) + 30;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 960,
              y: 470,
            });
            scene1.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("fadeIn", 1, 0.3);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene1.addChild(text);

            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 960,
              y: 540,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("fadeIn", 1.0, 0.8);
            scene1.addChild(text2);

            const text3 = new FFText({
              text: contentParts[2],
              fontSize: fontSize1,
              x: 960,
              y: 620,
            });
            text3.alignCenter();
            text3.setStyle({ padding: [4, 20, 6, 20] });
            text3.setColor(titleColor);
            text3.setFont(selectedfonts);
            text3.addEffect("fadeIn", 1.0, 1.1);
            scene1.addChild(text3);
          } else {
            const fontSize1 = parseInt(data.sceneData.textSize) + 30;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 960,
              y: 515,
            });
            scene1.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("fadeIn", 1, 0.3);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene1.addChild(text);

            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 960,
              y: 585,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("fadeIn", 1.0, 0.8);
            scene1.addChild(text2);
          }
          // add bottom cloud
          // const fcloud = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud.addAnimate({
          //   from: { x: -960 },
          //   to: { x: 960 },
          //   time: 1,
          //   delay: 3.5,
          //   ease: "Cubic.InOut",
          // });
          // scene1.addChild(fcloud);
          scene1.setTransition("fade", 0.5);
          scene1.setDuration(data.sceneData.time);
          creator.addChild(scene1);
          console.log(i);
          console.log("scene1");
          i++;
          console.log(i);
        } else if (templateBlock[i].sceneId == 22) {
          let data = templateBlock[i];
          const firstVideo = await videoTemplate22(data);
          console.log(firstVideo);
          let titleColor;
          if (data.sceneData.titleColor) {
            titleColor = data.sceneData.titleColor;
          } else {
            titleColor = data.sceneData.textColor;
          }
          let fontfamily = data.sceneData.fontFamily;
          let titlefontfamily = data.sceneData.titleFontFamily;
          let selectedfonts;
          let titlefonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
            if (font.family == titlefontfamily) {
              if (data.sceneData.titleFontWeight == "lighter") {
                titlefonts = font.lighter;
              } else if (data.sceneData.titleFontWeight == "normal") {
                titlefonts = font.file;
              } else if (data.sceneData.titleFontWeight == "bold") {
                titlefonts = font.bold;
              }
            }
          });
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var subtitleColor = data.sceneData.textColor;
          if (subtitleColor.length == "4") {
            subtitleColor = subtitleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }
          if (data.sceneData.titletextSize) {
            var titletextSize = data.sceneData.titletextSize;
          } else {
            var titletextSize = data.sceneData.textSize;
          }
          if (data.sceneData.textSize) {
            var textSize = data.sceneData.textSize;
          } else {
            var textSize = data.sceneData.textSize;
          }
          if (typeof data.sceneData.content[0].title == undefined) {
            var fieldTitle1 = "";
            var fieldText1 = "";
          } else {
            var fieldTitle1 = data.sceneData.content[0].title;
            var fieldText1 = data.sceneData.content[0].text;
          }
          if (data.sceneData.content[1] == undefined) {
            var fieldTitle2 = "";
            var fieldText2 = "";
          } else {
            var fieldTitle2 = data.sceneData.content[1].title;
            var fieldText2 = data.sceneData.content[1].text;
          }
          if (data.sceneData.content[2] == undefined) {
            var fieldTitle3 = "";
            var fieldText3 = "";
          } else {
            var fieldTitle3 = data.sceneData.content[2].title;
            var fieldText3 = data.sceneData.content[2].text;
          }
          if (data.sceneData.content[3] == undefined) {
            var fieldTitle4 = "";
            var fieldText4 = "";
          } else {
            var fieldTitle4 = data.sceneData.content[3].title;
            var fieldText4 = data.sceneData.content[3].text;
          }
          if (data.sceneData.content[4] != undefined) {
            var fieldTitle5 = data.sceneData.content[4].title;
            var fieldText5 = data.sceneData.content[4].text;
          } else {
            var fieldTitle5 = "";
            var fieldText5 = "";
          }

          const scene2 = new FFScene();
          const slidebg1 = new FFImage({
            path: assetsPath + "gradient.png",
            y: 540,
            x: 960,
          });
          scene2.addChild(slidebg1);
          scene2.setBgColor("#3789c7");

          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img221.png",
            y: 540,
            width: 1200,
            height: 1080,
            x: 1340,
          });
          // slide1.addAnimate({
          //   from: { x: 2060 },
          //   to: { x: 1340 },
          //   time: 1,
          //   delay: 0,
          //   ease: "Cubic.InOut",
          // });
          slide1.addEffect("zoomingIn", 3.5, 0.1);
          scene2.addChild(slide1);

          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img222.png",
            y: 540,
            width: 1200,
            height: 1080,
          });
          slide2.addAnimate({
            from: { x: 2960 },
            to: { x: 1340 },
            time: 1,
            delay: 3,
            ease: "Cubic.InOut",
          });
          slide2.addEffect("zoomingIn", 3.5, 4);
          scene2.addChild(slide2);
          const slidebg = new FFImage({
            path: assetsPath + "gradient.png",
            y: 540,
            x: -200,
          });
          scene2.addChild(slidebg);
          // slidebg.addAnimate({
          //   from: { x: -250 },
          //   to: { x: 250 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          // scene2.addChild(slidebg);
          const fontSize1 = parseInt(titletextSize) + 20;
          const fontSize2 = parseInt(textSize) + 20;
          if (fieldTitle1 != "") {
            const text1 = new FFText({
              text: fieldTitle1,
              fontSize: fontSize1,
              x: 180,
              y: 170,
            });
            text1.setColor(titleColor);
            text1.setFont(titlefonts);
            text1.addEffect("fadeInDown", 1, 0.5);
            scene2.addChild(text1);
          }
          if (fieldText1 != "") {
            const textField = new FFText({
              text: fieldText1,
              fontSize: fontSize1,
              x: 180,
              y: 220,
            });
            textField.setColor(subtitleColor);
            textField.setFont(selectedfonts);
            textField.addEffect("fadeInDown", 1, 0.5);
            scene2.addChild(textField);
          }
          if (fieldTitle2 != "") {
            const textTitle2 = new FFText({
              text: fieldTitle2,
              fontSize: fontSize1,
              x: 180,
              y: 320,
            });
            textTitle2.setColor(titleColor);
            textTitle2.setFont(titlefonts);
            textTitle2.addEffect("fadeInDown", 1, 0.7);
            scene2.addChild(textTitle2);
          }
          if (fieldText2 != "") {
            const textField2 = new FFText({
              text: fieldText2,
              fontSize: fontSize2,
              x: 180,
              y: 370,
            });
            textField2.setColor(subtitleColor);
            textField2.setFont(selectedfonts);
            textField2.addEffect("fadeInDown", 1, 0.7);
            scene2.addChild(textField2);
          }
          if (fieldTitle3 != "") {
            const text5 = new FFText({
              text: fieldTitle3,
              fontSize: fontSize1,
              x: 180,
              y: 470,
            });
            text5.setColor(titleColor);
            text5.setFont(titlefonts);
            text5.addEffect("fadeInDown", 1, 0.9);
            scene2.addChild(text5);
          }
          if (fieldText3) {
            const text6 = new FFText({
              text: fieldText3,
              fontSize: fontSize2,
              x: 180,
              y: 520,
            });
            text6.setColor(subtitleColor);
            text6.setFont(selectedfonts);
            text6.addEffect("fadeInDown", 1, 0.9);
            scene2.addChild(text6);
          }

          if (fieldTitle4) {
            const text7 = new FFText({
              text: fieldTitle4,
              fontSize: fontSize1,
              x: 180,
              y: 620,
            });
            text7.setColor(titleColor);
            text7.setFont(titlefonts);
            text7.addEffect("fadeInDown", 1, 1.1);
            scene2.addChild(text7);
          }
          if (fieldText4) {
            const text8 = new FFText({
              text: fieldText4,
              fontSize: fontSize2,
              x: 180,
              y: 670,
            });
            text8.setColor(subtitleColor);
            text8.setFont(selectedfonts);
            text8.addEffect("fadeInDown", 1, 1.1);
            scene2.addChild(text8);
          }

          if (fieldTitle5) {
            const text9 = new FFText({
              text: fieldTitle5,
              fontSize: fontSize1,
              x: 180,
              y: 770,
            });
            text9.setColor(titleColor);
            text9.setFont(titlefonts);
            text9.addEffect("fadeInDown", 1, 1.3);
            scene2.addChild(text9);
          }
          if (fieldText5) {
            const text10 = new FFText({
              text: fieldText5,
              fontSize: fontSize2,
              x: 180,
              y: 820,
            });
            text10.setColor(subtitleColor);
            text10.setFont(selectedfonts);
            text10.addEffect("fadeInDown", 1, 1.3);
            scene2.addChild(text10);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene2.addChild(watermark);
          }
          // const fcloud1 = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud1.addAnimate({
          //   from: { x: 960 },
          //   to: { x: -1260 },
          //   time: 1,
          //   delay: 0,
          //   ease: "Cubic.InOut",
          // });
          // scene2.addChild(fcloud1);
          // const fcloud = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud.addAnimate({
          //   from: { x: -960 },
          //   to: { x: 960 },
          //   time: 1,
          //   delay: 5.5,
          //   ease: "Cubic.InOut",
          // });
          // scene2.addChild(fcloud);
          scene2.setTransition("fade", 0.5);
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          // scene2.setTransition("fade", 1);
          i++;
        } else if (templateBlock[i].sceneId == 23) {
          // Resize Images for scene
          let data = templateBlock[i];
          fontfamily = data.sceneData.fontFamily;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          // const  content= data.sceneData.content;
          var content = data.sceneData.content.split(" ");
          var textcontent1 = "";
          var textcontent2 = "";
          var textcontent3 = "";
          for (var l = 0; l < content.length; l++) {
            if (l >= 9 && l <= 16) {
              textcontent2 = textcontent2 + content[l] + " ";
            } else if (l > 16) {
              textcontent3 = textcontent3 + content[l] + " ";
            } else {
              textcontent1 = textcontent1 + content[l] + " ";
            }
          }

          // console.log(contentParts);
          const scene1 = new FFScene();
          scene1.setBgColor("#fff");

          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 150,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene1.addChild(watermark);
            console.log("here");
          }
          const fimg1 = new FFImage({
            path: assetsPath + "gradient.png",
            x: 960,
            y: 540,
          });
          scene1.addChild(fimg1);
          if (data.sceneData.textAligmnet == "text-center") {
            if (textcontent3 != undefined && textcontent3 != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 25;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 960,
                y: 465,
              });
              scene1.addChild(text);
              text.alignCenter();
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("fadeIn", 1, 0.3);
              text.alignCenter();
              text.setStyle({ padding: [0, 20, 10, 20] });
              scene1.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 960,
                y: 540,
              });
              text2.alignCenter();
              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("fadeIn", 1.0, 0.8);
              scene1.addChild(text2);

              const text3 = new FFText({
                text: textcontent3,
                fontSize: fontSize1,
                x: 960,
                y: 625,
              });
              text3.alignCenter();
              text3.setStyle({ padding: [4, 20, 6, 20] });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("fadeIn", 1.0, 1.1);
              scene1.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 25;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 960,
                y: 515,
              });
              scene1.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("fadeIn", 1, 0.3);
              text.alignCenter();
              text.setStyle({ padding: [0, 20, 10, 20] });
              scene1.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 960,
                y: 585,
              });
              text2.alignCenter();
              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("fadeIn", 1.0, 0.8);
              scene1.addChild(text2);
            }
          } else {
            if (textcontent3 != undefined && textcontent3 != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 25;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 100,
                y: 425,
              });
              scene1.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("fadeIn", 1, 0.3);

              text.setStyle({ padding: [0, 20, 10, 20] });
              scene1.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 100,
                y: 500,
              });

              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("fadeIn", 1.0, 0.8);
              scene1.addChild(text2);

              const text3 = new FFText({
                text: textcontent3,
                fontSize: fontSize1,
                x: 100,
                y: 580,
              });

              text3.setStyle({ padding: [4, 20, 6, 20] });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("fadeIn", 1.0, 1.1);
              scene1.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 25;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 100,
                y: 465,
              });
              scene1.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("fadeIn", 1, 0.3);

              text.setStyle({ padding: [0, 20, 10, 20] });
              scene1.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 100,
                y: 545,
              });

              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("fadeIn", 1.0, 0.8);
              scene1.addChild(text2);
            }
          }
          // add bottom cloud
          // const fcloud = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud.addAnimate({
          //   from: { x: -960 },
          //   to: { x: 960 },
          //   time: 1,
          //   delay: 3.5,
          //   ease: "Cubic.InOut",
          // });
          // scene1.addChild(fcloud);
          scene1.setTransition("fade", 0.5);
          scene1.setDuration(data.sceneData.time);
          creator.addChild(scene1);
          console.log(i);
          console.log("scene1");
          i++;
          console.log(i);
        } else if (templateBlock[i].sceneId == 24) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate24(data);

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 7) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          if (data.sceneData.media[0].type == "image") {
            const scene4 = new FFScene();
            const fcloud2 = new FFImage({
              path: assetsPath + "gradient.png",
              x: 960,
              y: 540,
            });
            scene4.addChild(fcloud2);
            const image = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img241.png",
              x: 480,
            });
            image.addAnimate({
              from: { y: -650 },
              to: { y: 540 },
              time: 2,
              delay: 0,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image);
            const image2 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img242.png",
              x: 1440,
            });
            image2.addAnimate({
              from: { y: 1600 },
              to: { y: 540 },
              time: 2,
              delay: 0,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image2);
            scene4.setBgColor("#fff");
            const fimg1 = new FFImage({
              path: assetsPath + "gradient-2.png",
              x: 520,
            });
            fimg1.addAnimate({
              from: { y: 1720 },
              to: { y: 950 },
              time: 0.6,
              delay: 1.0,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fimg1);
            console.log(data.sceneData.textAligmnet);
            console.log("data.sceneData.textAligmnet");
            if (data.sceneData.textAligmnet == "text-center") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 18;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 500,
                y: 920,
              });
              textOne.alignCenter();
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.addEffect("fadeIn", 1.5, 1.3);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 500,
                  y: 970,
                });
                textNext.alignCenter();
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1.5, 1.5);
                scene4.addChild(textNext);
              }
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 18;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 100,
                y: 900,
              });

              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.addEffect("fadeIn", 1.5, 1.3);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 100,
                  y: 950,
                });

                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1.5, 1.5);
                scene4.addChild(textNext);
              }
            }
            if (user.userPlan == 0) {
              const watermark = new FFImage({
                path: assetsPath + "reveoLogo.png",
                x: 1680,
                y: 50,
              });
              watermark.setOpacity(0.7);
              watermark.setScale(0.5);
              scene4.addChild(watermark);
            }
            // const fcloud3 = new FFImage({
            //   path: assetsPath + "cropped.jpg",
            //   x: 960,
            // });
            // fcloud3.addAnimate({
            //   from: { y: 1620 },
            //   to: { y: 540 },
            //   time: 1,
            //   delay: 6.5,
            //   ease: "Cubic.InOut",
            // });
            // scene4.addChild(fcloud3);
            scene4.setTransition("fade", 0.5);
            scene4.setDuration(data.sceneData.time);
            creator.addChild(scene4);
          }
          i++;
        } else if (templateBlock[i].sceneId == 25) {
          let data = templateBlock[i];
          const sixVideo = await videoTemplate25(data);
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 12) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          const scene6 = new FFScene();
          const fcloud2 = new FFImage({
            path: assetsPath + "gradient.png",
            y: 540,
            x: 960,
          });
          scene6.addChild(fcloud2);
          // const fimg1 = new FFImage({
          //   path: assetsPath + "whitescenegallery.jpg",
          //   y: 470,
          //   x: 990,
          //   width: 1368,
          //   height: 768,
          // });
          // fimg1.addAnimate({
          //   from: { x: 960, y: 500 },
          //   to: { x: 930, y: 470 },
          //   time: 4.5,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          // fimg1.setOpacity(0.8);
          // scene6.addChild(fimg1);
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img251.png",
            y: 480,
          });
          slide1.addAnimate({
            from: { x: 1200 },
            to: { x: 960 },
            time: 4.5,
            delay: 0.1,
            ease: "Cubic.InOut",
          });

          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(slide1);
          const fontSize1 = parseInt(data.sceneData.textSize) + 15;
          let textOne = new FFText({
            text: text,
            fontSize: fontSize1,
            x: 960,
            y: 950,
          });
          textOne.alignCenter();
          textOne.setColor(titleColor);
          textOne.setFont(selectedfonts);
          textOne.setStyle({ padding: 10 });
          textOne.addEffect("fadeInUp", 1.5, 0.6);
          scene6.addChild(textOne);
          if (text2 != "") {
            const textNext = new FFText({
              text: text2,
              fontSize: fontSize1,
              x: 960,
              y: 1020,
            });
            textNext.alignCenter();
            textNext.setStyle({ padding: 10 });
            textNext.setColor(titleColor);
            textNext.setFont(selectedfonts);
            textNext.addEffect("fadeIn", 1.5, 1.0);
            scene6.addChild(textNext);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene6.addChild(watermark);
          }

          // const fcloud3 = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud3.addAnimate({
          //   from: { x: 3200 },
          //   to: { x: 960 },
          //   time: 1,
          //   delay: 4.5,
          //   ease: "Cubic.InOut",
          // });
          // scene6.addChild(fcloud3);
          scene6.setTransition("fade", 0.5);
          scene6.setBgColor("#399891");
          // scene5.addChild(fcloud2);
          scene6.setDuration(data.sceneData.time);
          creator.addChild(scene6);
          i++;
        } else if (templateBlock[i].sceneId == 26) {
          let data = templateBlock[i];
          const firstVideo = await videoTemplate26(data);
          fontfamily = data.sceneData.fontFamily;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          const content = data.sceneData.content;
          const contentParts = content.split("\n");

          const scene2 = new FFScene();
          scene2.setBgColor("#e04e1c");

          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img261.png",
            x: 1340,
          });
          slide1.addAnimate({
            from: { y: -1960 },
            to: { y: -150 },
            time: 3,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene2.addChild(slide1);
          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img262.png",
            x: 1340,
          });
          slide2.addAnimate({
            from: { y: -1960 },
            to: { y: 540 },
            time: 3,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene2.addChild(slide2);
          const slide3 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img263.png",
            x: 1340,
          });
          slide3.addAnimate({
            from: { y: -1960 },
            to: { y: 1200 },
            time: 3,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene2.addChild(slide3);
          const slidebg = new FFImage({
            path: assetsPath + "orangebg.png",
            y: 540,
            x: 400,
          });
          // slidebg.addAnimate({
          //   from: { x: -250 },
          //   to: { x: 250 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          if (data.sceneData.textAligmnet == "text-center") {
            if (contentParts[2] != undefined && contentParts[2] != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 25;
              const text = new FFText({
                text: contentParts[0],
                fontSize: fontSize1,
                x: 350,
                y: 475,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInLeft", 1, 1.3);
              text.alignCenter();
              text.setStyle({ padding: [0, 20, 10, 20] });
              scene2.addChild(text);

              const text2 = new FFText({
                text: contentParts[1],
                fontSize: fontSize1,
                x: 350,
                y: 545,
              });
              text2.alignCenter();
              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInLeft", 1.0, 1.4);
              scene2.addChild(text2);

              const text3 = new FFText({
                text: contentParts[2],
                fontSize: fontSize1,
                x: 350,
                y: 615,
              });
              text3.alignCenter();
              text3.setStyle({ padding: [4, 20, 6, 20] });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("backInLeft", 1.0, 1.4);
              scene2.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 25;
              const text = new FFText({
                text: contentParts[0],
                fontSize: fontSize1,
                x: 350,
                y: 510,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInLeft", 1, 1.3);
              text.alignCenter();
              text.setStyle({ padding: [0, 20, 10, 20] });
              scene2.addChild(text);

              const text2 = new FFText({
                text: contentParts[1],
                fontSize: fontSize1,
                x: 350,
                y: 580,
              });
              text2.alignCenter();
              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInLeft", 1.0, 1.4);
              scene2.addChild(text2);
            }
          } else {
            if (contentParts[2] != undefined && contentParts[2] != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 25;
              const text = new FFText({
                text: contentParts[0],
                fontSize: fontSize1,
                x: 80,
                y: 445,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInLeft", 1, 1.3);

              text.setStyle({ padding: [0, 20, 10, 20] });
              scene2.addChild(text);

              const text2 = new FFText({
                text: contentParts[1],
                fontSize: fontSize1,
                x: 80,
                y: 505,
              });

              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInLeft", 1.0, 1.4);
              scene2.addChild(text2);

              const text3 = new FFText({
                text: contentParts[2],
                fontSize: fontSize1,
                x: 80,
                y: 475,
              });

              text3.setStyle({ padding: [4, 20, 6, 20] });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("backInLeft", 1.0, 1.4);
              scene2.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 25;
              const text = new FFText({
                text: contentParts[0],
                fontSize: fontSize1,
                x: 80,
                y: 470,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInLeft", 1, 1.3);

              text.setStyle({ padding: [0, 20, 10, 20] });
              scene2.addChild(text);

              const text2 = new FFText({
                text: contentParts[1],
                fontSize: fontSize1,
                x: 80,
                y: 540,
              });

              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInLeft", 1.0, 1.4);
              scene2.addChild(text2);
            }
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene2.addChild(watermark);
          }
          // const fcloud = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud.addAnimate({
          //   from: { x: -960 },
          //   to: { x: 960 },
          //   time: 1,
          //   delay: 5.5,
          //   ease: "Cubic.InOut",
          // });
          // scene2.addChild(fcloud);
          scene2.setTransition("fade", 0.5);
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          // scene2.setTransition("fade", 1);
          i++;
        } else if (templateBlock[i].sceneId == 27) {
          let data = templateBlock[i];
          const firstVideo = await videoTemplate27(data);
          let titleColor;
          if (data.sceneData.titleColor) {
            titleColor = data.sceneData.titleColor;
          } else {
            titleColor = data.sceneData.textColor;
          }
          let fontfamily = data.sceneData.fontFamily;
          let titlefontfamily = data.sceneData.titleFontFamily;
          let selectedfonts;
          let titlefonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
            if (font.family == titlefontfamily) {
              if (data.sceneData.titleFontWeight == "lighter") {
                titlefonts = font.lighter;
              } else if (data.sceneData.titleFontWeight == "normal") {
                titlefonts = font.file;
              } else if (data.sceneData.titleFontWeight == "bold") {
                titlefonts = font.bold;
              }
            }
          });
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var subtitleColor = data.sceneData.textColor;
          if (subtitleColor.length == "4") {
            subtitleColor = subtitleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }
          if (data.sceneData.titletextSize) {
            var titletextSize = data.sceneData.titletextSize;
          } else {
            var titletextSize = data.sceneData.textSize;
          }
          if (data.sceneData.textSize) {
            var textSize = data.sceneData.textSize;
          } else {
            var textSize = data.sceneData.textSize;
          }
          if (typeof data.sceneData.content[0].title == undefined) {
            var fieldTitle1 = "";
            var fieldText1 = "";
          } else {
            var fieldTitle1 = data.sceneData.content[0].title;
            var fieldText1 = data.sceneData.content[0].text;
          }
          if (data.sceneData.content[1] == undefined) {
            var fieldTitle2 = "";
            var fieldText2 = "";
          } else {
            var fieldTitle2 = data.sceneData.content[1].title;
            var fieldText2 = data.sceneData.content[1].text;
          }
          if (data.sceneData.content[2] == undefined) {
            var fieldTitle3 = "";
            var fieldText3 = "";
          } else {
            var fieldTitle3 = data.sceneData.content[2].title;
            var fieldText3 = data.sceneData.content[2].text;
          }
          if (data.sceneData.content[3] == undefined) {
            var fieldTitle4 = "";
            var fieldText4 = "";
          } else {
            var fieldTitle4 = data.sceneData.content[3].title;
            var fieldText4 = data.sceneData.content[3].text;
          }
          if (data.sceneData.content[4] != undefined) {
            var fieldTitle5 = data.sceneData.content[4].title;
            var fieldText5 = data.sceneData.content[4].text;
          } else {
            var fieldTitle5 = "";
            var fieldText5 = "";
          }

          const scene2 = new FFScene();
          scene2.setBgColor("#e04e1c");
          // scene2.setBgColor("#fff");
          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img271.png",
            y: 540,
          });
          slide1.addAnimate({
            from: { x: -960 },
            to: { x: 680 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene2.addChild(slide1);

          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img272.png",
            y: 540,
          });
          slide2.addAnimate({
            from: { x: -960 },
            to: { x: 680 },
            time: 1,
            delay: 3,
            ease: "Cubic.InOut",
          });
          slide2.addEffect("zoomingIn", 3.5, 4);
          scene2.addChild(slide2);
          const slidebg1 = new FFImage({
            path: assetsPath + "orangebg.png",
            y: 540,
            x: -80,
          });
          scene2.addChild(slide2);
          const slidebg3 = new FFImage({
            path: assetsPath + "orangebg3.png",
            y: -40,
            x: 960,
          });
          slidebg3.setScale(2);
          scene2.addChild(slidebg3);
          const slidebg4 = new FFImage({
            path: assetsPath + "orangebg3.png",
            y: 1130,
            x: 960,
          });
          slidebg4.setScale(2);
          scene2.addChild(slidebg4);
          scene2.addChild(slidebg1);
          const slidebg = new FFImage({
            path: assetsPath + "orangebg.png",
            y: 540,
            x: 1620,
          });
          // slidebg.addAnimate({
          //   from: { x: -250 },
          //   to: { x: 250 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          scene2.addChild(slidebg);
          const fontSize1 = parseInt(titletextSize) + 20;
          const fontSize2 = parseInt(textSize) + 20;
          if (fieldTitle1 != "") {
            const text1 = new FFText({
              text: fieldTitle1,
              fontSize: fontSize1,
              x: 1540,
              y: 170,
            });
            text1.setColor(titleColor);
            text1.setFont(titlefonts);
            text1.addEffect("backInRight", 1, 0.5);
            scene2.addChild(text1);
          }
          if (fieldText1 != "") {
            const textField = new FFText({
              text: fieldText1,
              fontSize: fontSize1,
              x: 1540,
              y: 220,
            });
            textField.setColor(subtitleColor);
            textField.setFont(selectedfonts);
            textField.addEffect("backInRight", 1, 0.5);
            scene2.addChild(textField);
          }
          if (fieldTitle2 != "") {
            const textTitle2 = new FFText({
              text: fieldTitle2,
              fontSize: fontSize1,
              x: 1540,
              y: 320,
            });
            textTitle2.setColor(titleColor);
            textTitle2.setFont(titlefonts);
            textTitle2.addEffect("backInRight", 1, 0.7);
            scene2.addChild(textTitle2);
          }
          if (fieldText2 != "") {
            const textField2 = new FFText({
              text: fieldText2,
              fontSize: fontSize2,
              x: 1540,
              y: 370,
            });
            textField2.setColor(subtitleColor);
            textField2.setFont(selectedfonts);
            textField2.addEffect("backInRight", 1, 0.7);
            scene2.addChild(textField2);
          }
          if (fieldTitle3 != "") {
            const text5 = new FFText({
              text: fieldTitle3,
              fontSize: fontSize1,
              x: 1540,
              y: 470,
            });
            text5.setColor(titleColor);
            text5.setFont(titlefonts);
            text5.addEffect("backInRight", 1, 0.9);
            scene2.addChild(text5);
          }
          if (fieldText3) {
            const text6 = new FFText({
              text: fieldText3,
              fontSize: fontSize2,
              x: 1540,
              y: 520,
            });
            text6.setColor(subtitleColor);
            text6.setFont(selectedfonts);
            text6.addEffect("backInRight", 1, 0.9);
            scene2.addChild(text6);
          }

          if (fieldTitle4) {
            const text7 = new FFText({
              text: fieldTitle4,
              fontSize: fontSize1,
              x: 1540,
              y: 620,
            });
            text7.setColor(titleColor);
            text7.setFont(titlefonts);
            text7.addEffect("backInRight", 1, 1.1);
            scene2.addChild(text7);
          }
          if (fieldText4) {
            const text8 = new FFText({
              text: fieldText4,
              fontSize: fontSize2,
              x: 1540,
              y: 670,
            });
            text8.setColor(subtitleColor);
            text8.setFont(selectedfonts);
            text8.addEffect("backInRight", 1, 1.1);
            scene2.addChild(text8);
          }

          if (fieldTitle5) {
            const text9 = new FFText({
              text: fieldTitle5,
              fontSize: fontSize1,
              x: 1540,
              y: 770,
            });
            text9.setColor(titleColor);
            text9.setFont(titlefonts);
            text9.addEffect("backInRight", 1, 1.3);
            scene2.addChild(text9);
          }
          if (fieldText5) {
            const text10 = new FFText({
              text: fieldText5,
              fontSize: fontSize2,
              x: 1540,
              y: 820,
            });
            text10.setColor(subtitleColor);
            text10.setFont(selectedfonts);
            text10.addEffect("backInRight", 1, 1.3);
            scene2.addChild(text10);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene2.addChild(watermark);
          }
          // const fcloud = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud.addAnimate({
          //   from: { x: -960 },
          //   to: { x: 960 },
          //   time: 1,
          //   delay: 5.5,
          //   ease: "Cubic.InOut",
          // });
          // const fcloud2 = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud2.addAnimate({
          //   from: { x: 960 },
          //   to: { x: 3200 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          // console.log("here");
          // scene2.addChild(fcloud2);
          // scene2.addChild(fcloud);
          scene2.setTransition("fade", 0.5);
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          // scene2.setTransition("fade", 1);
          i++;
        } else if (templateBlock[i].sceneId == 28) {
          let data = templateBlock[i];
          const firstVideo = await videoTemplate28(data);
          fontfamily = data.sceneData.fontFamily;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          // const  content= data.sceneData.content;
          var content = data.sceneData.content.split(" ");
          var textcontent1 = "";
          var textcontent2 = "";
          var textcontent3 = "";
          var textcontent4 = "";
          for (var l = 0; l < content.length; l++) {
            if (l > 4 && l <= 9) {
              textcontent2 = textcontent2 + content[l] + " ";
            } else if (l > 9 && l <= 14) {
              textcontent3 = textcontent3 + content[l] + " ";
            } else if (l > 14) {
              textcontent4 = textcontent4 + content[l] + " ";
            } else {
              textcontent1 = textcontent1 + content[l] + " ";
            }
          }
          const scene2 = new FFScene();
          scene2.setBgColor("#e04e1c");
          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img281.png",
            x: 620,
          });
          slide1.addAnimate({
            from: { y: -1960 },
            to: { y: -150 },
            time: 3,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene2.addChild(slide1);
          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img282.png",
            x: 620,
          });
          slide2.addAnimate({
            from: { y: -1960 },
            to: { y: 540 },
            time: 3,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene2.addChild(slide2);
          const slide3 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img283.png",
            x: 620,
          });
          slide3.addAnimate({
            from: { y: -1960 },
            to: { y: 1200 },
            time: 3,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene2.addChild(slide3);
          const slidebg = new FFImage({
            path: assetsPath + "orangebg.png",
            y: 540,
            x: 1400,
          });
          scene2.addChild(slidebg);
          if (data.sceneData.textAligmnet == "text-left") {
            if (textcontent4 != undefined && textcontent4 != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 1160,
                y: 405,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInRight", 1, 0.6);
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 1160,
                y: 480,
              });
              // text2.alignCenter();
              // text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInRight", 1.0, 1);
              scene2.addChild(text2);

              const text3 = new FFText({
                text: textcontent3,
                fontSize: fontSize1,
                x: 1160,
                y: 545,
              });
              // text3.alignCenter();
              // text3.setStyle({ padding: [4, 20, 6, 20] });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("backInRight", 1.0, 1.4);
              scene2.addChild(text3);
              const text4 = new FFText({
                text: textcontent4,
                fontSize: fontSize1,
                x: 1160,
                y: 610,
              });
              // text3.alignCenter();
              // text3.setStyle({ padding: [4, 20, 6, 20] });
              text4.setColor(titleColor);
              text4.setFont(selectedfonts);
              text4.addEffect("backInRight", 1.0, 1.4);
              scene2.addChild(text4);
            } else if (
              textcontent3 != undefined &&
              textcontent3 != "" &&
              textcontent4 == ""
            ) {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 1160,
                y: 465,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInRight", 1, 0.6);
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 1160,
                y: 540,
              });
              // text2.alignCenter();
              // text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInRight", 1.0, 1);
              scene2.addChild(text2);

              const text3 = new FFText({
                text: textcontent3,
                fontSize: fontSize1,
                x: 1160,
                y: 625,
              });
              // text3.alignCenter();
              // text3.setStyle({ padding: [4, 20, 6, 20] });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("backInRight", 1.0, 1.4);
              scene2.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 1160,
                y: 515,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInRight", 1, 0.6);
              // text.alignCenter();
              // text.setStyle({ padding: [0, 20, 10, 20] });
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 1160,
                y: 575,
              });
              // text2.alignCenter();
              // text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInRight", 1.0, 1);
              scene2.addChild(text2);
            }
          } else {
            if (textcontent4 != undefined && textcontent4 != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 1500,
                y: 405,
              });
              text.alignCenter();
              text.setStyle({ padding: [4, 20, 6, 20] });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInRight", 1, 0.6);
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 1500,
                y: 480,
              });
              text2.alignCenter();
              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInRight", 1.0, 1);
              scene2.addChild(text2);

              const text3 = new FFText({
                text: textcontent3,
                fontSize: fontSize1,
                x: 1500,
                y: 545,
              });
              text3.alignCenter();
              text3.setStyle({ padding: [4, 20, 6, 20] });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("backInRight", 1.0, 1.4);
              scene2.addChild(text3);
              const text4 = new FFText({
                text: textcontent4,
                fontSize: fontSize1,
                x: 1500,
                y: 610,
              });
              text4.alignCenter();
              text4.setStyle({ padding: [4, 20, 6, 20] });
              text4.setColor(titleColor);
              text4.setFont(selectedfonts);
              text4.addEffect("backInRight", 1.0, 1.4);
              scene2.addChild(text4);
            } else if (
              textcontent3 != undefined &&
              textcontent3 != "" &&
              textcontent4 == ""
            ) {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 1500,
                y: 465,
              });
              scene2.addChild(text);
              text.alignCenter();
              text.setStyle({ padding: [4, 20, 6, 20] });
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInRight", 1, 0.6);
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 1500,
                y: 540,
              });
              text2.alignCenter();
              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInRight", 1.0, 1);
              scene2.addChild(text2);

              const text3 = new FFText({
                text: textcontent3,
                fontSize: fontSize1,
                x: 1500,
                y: 625,
              });
              text3.alignCenter();
              text3.setStyle({ padding: [4, 20, 6, 20] });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("backInRight", 1.0, 1.4);
              scene2.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 1500,
                y: 515,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInRight", 1, 0.6);
              text.alignCenter();
              text.setStyle({ padding: [0, 20, 10, 20] });
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 1500,
                y: 575,
              });
              text2.alignCenter();
              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInRight", 1.0, 1);
              scene2.addChild(text2);
            }
          }
          // const fcloud = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud.addAnimate({
          //   from: { x: -960 },
          //   to: { x: 960 },
          //   time: 1,
          //   delay: 5.5,
          //   ease: "Cubic.InOut",
          // });
          // scene2.addChild(fcloud);
          scene2.setTransition("fade", 0.5);
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          // scene2.setTransition("fade", 1);
          i++;
        } else if (templateBlock[i].sceneId == 29) {
          let data = templateBlock[i];
          const sevenVideo = await videoTemplate29(data);
          const scene6 = new FFScene();
          const img71 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img291.png",
            y: 280,
          });
          img71.addAnimate({
            from: { x: -1050 },
            to: { x: 500 },
            time: 2,
            delay: 0.2,
            ease: "Cubic.InOut",
          });
          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(img71);
          const img72 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img292.png",
            x: 500,
          });
          img72.addAnimate({
            from: { y: 1680 },
            to: { y: 800 },
            time: 2,
            delay: 0.8,
            ease: "Cubic.InOut",
          });
          scene6.addChild(img72);
          const img73 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img293.png",
            x: 1420,
          });
          img73.addAnimate({
            from: { y: -1400 },
            to: { y: 280 },
            time: 2,
            delay: 1,
            ease: "Cubic.InOut",
          });

          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(img73);

          scene6.addChild(img72);
          const img74 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img294.png",
            y: 800,
          });
          img74.addAnimate({
            from: { x: 2400 },
            to: { x: 1420 },
            time: 2,
            delay: 1.2,
            ease: "Cubic.InOut",
          });

          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(img74);

          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene6.addChild(watermark);
          }
          // const fcloud2 = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud2.addAnimate({
          //   from: { x: 960 },
          //   to: { x: 3200 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          // console.log("here");
          // scene6.addChild(fcloud2);
          // const fcloud3 = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud3.addAnimate({
          //   from: { x: 3200 },
          //   to: { x: 960 },
          //   time: 1,
          //   delay: 4.5,
          //   ease: "Cubic.InOut",
          // });
          // scene6.addChild(fcloud3);
          scene6.setTransition("fade", 0.5);
          scene6.setBgColor("#e04e1c");
          // scene5.addChild(fcloud2);
          scene6.setDuration(data.sceneData.time);
          creator.addChild(scene6);
          i++;
        } else if (templateBlock[i].sceneId == 30) {
          let data = templateBlock[i];
          const sixVideo = await videoTemplate30(data);
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 16) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          const scene6 = new FFScene();
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img301.png",
            y: 500,
          });
          slide1.addAnimate({
            from: { x: -1960 },
            to: { x: -200 },
            time: 3,
            delay: 0.1,
            ease: "Cubic.InOut",
          });

          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(slide1);
          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img302.png",
            y: 500,
          });
          slide2.addAnimate({
            from: { x: -1960 },
            to: { x: 960 },
            time: 3,
            delay: 0.1,
            ease: "Cubic.InOut",
          });

          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(slide2);
          const slide3 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img303.png",
            y: 500,
          });
          slide3.addAnimate({
            from: { x: -1960 },
            to: { x: 2100 },
            time: 3,
            delay: 0.1,
            ease: "Cubic.InOut",
          });

          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(slide3);
          if (data.sceneData.textAligmnet == "text-center") {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 960,
              y: 940,
            });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.alignCenter();
            textOne.setStyle({ padding: [0, 20, 10, 20] });
            textOne.addEffect("zoomInDown", 1.5, 0.6);
            scene6.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 960,
                y: 1020,
              });
              textNext.alignCenter();
              textNext.setStyle({ padding: [0, 20, 10, 20] });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("zoomInDown", 1.5, 1.0);
              scene6.addChild(textNext);
            }
          } else {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 80,
              y: 920,
            });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            // textOne.alignCenter();
            // textOne.setStyle({ padding: [0, 20, 10, 20] });
            textOne.addEffect("zoomInDown", 1.5, 0.6);
            scene6.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 80,
                y: 1000,
              });
              // textNext.alignCenter();
              // textNext.setStyle({ padding: [0, 20, 10, 20] });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("zoomInDown", 1.5, 1.0);
              scene6.addChild(textNext);
            }
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene6.addChild(watermark);
          }
          // const fcloud2 = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud2.addAnimate({
          //   from: { x: 960 },
          //   to: { x: 3200 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          // console.log("here");
          // scene6.addChild(fcloud2);
          // const fcloud3 = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud3.addAnimate({
          //   from: { x: 3200 },
          //   to: { x: 960 },
          //   time: 1,
          //   delay: 4.5,
          //   ease: "Cubic.InOut",
          // });
          // scene6.addChild(fcloud3);
          scene6.setBgColor("#e04e1c");
          scene6.setTransition("fade", 0.5);
          // scene5.addChild(fcloud2);
          scene6.setDuration(data.sceneData.time);
          creator.addChild(scene6);
          i++;
        } else if (templateBlock[i].sceneId == 31) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate16(data);
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 7) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          if (data.sceneData.media[0].type == "image") {
            const scene4 = new FFScene();
            const image = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img161.png",
            });
            image.addAnimate({
              from: { x: 350, y: 410 },
              to: { x: 460, y: 500 },
              time: 4,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image);
            const image2 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img162.png",
              x: 1530,
              y: 600,
            });
            image2.addAnimate({
              from: { x: 1620, y: 690 },
              to: { x: 1530, y: 600 },
              time: 4,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image2);
            scene4.setBgColor("#fff");
            const fimg1 = new FFImage({
              path: assetsPath + "whitebg2.png",
              x: 520,
            });
            fimg1.addAnimate({
              from: { y: 1720 },
              to: { y: 950 },
              time: 0.6,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fimg1);
            if (data.sceneData.textAligmnet == "text-center") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 520,
                y: 925,
              });
              textOne.alignCenter();
              textOne.setStyle({ padding: [0, 20, 10, 20] });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.addEffect("fadeIn", 1.5, 0.6);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 520,
                  y: 995,
                });
                textNext.alignCenter();
                textNext.setStyle({ padding: [0, 20, 10, 20] });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1.5, 1.0);
                scene4.addChild(textNext);
              }
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 100,
                y: 895,
              });

              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.addEffect("fadeIn", 1.5, 0.6);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 100,
                  y: 950,
                });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1.5, 1.0);
                scene4.addChild(textNext);
              }
            }
            scene4.setBgColor("#e04e1c");
            // const fimg2 = new FFImage({
            //   path: assetsPath + "whitebg2.png",
            //   x: 1445,
            // });
            // fimg2.addAnimate({
            //   from: { y: 1720 },
            //   to: { y: 1010 },
            //   time: 1,
            //   delay: 3.5,
            //   ease: "Cubic.InOut",
            // });
            // fimg2.addEffect("fadeInUp", 1, 3.2);
            // scene4.addChild(fimg2);
            if (user.userPlan == 0) {
              const watermark = new FFImage({
                path: assetsPath + "reveoLogo.png",
                x: 1680,
                y: 50,
              });
              watermark.setOpacity(0.7);
              watermark.setScale(0.5);
              scene4.addChild(watermark);
            }
            // const fcloud2 = new FFImage({
            //   path: assetsPath + "cropped.jpg",
            //   x: 960,
            // });
            // fcloud2.addAnimate({
            //   from: { y: 540 },
            //   to: { y: -600 },
            //   time: 1,
            //   delay: 0,
            //   ease: "Cubic.InOut",
            // });
            // scene4.addChild(fcloud2);

            // const fcloud3 = new FFImage({
            //   path: assetsPath + "cropped.jpg",
            //   x: 960,
            // });
            // fcloud3.addAnimate({
            //   from: { y: 1620 },
            //   to: { y: 540 },
            //   time: 1,
            //   delay: 6.5,
            //   ease: "Cubic.InOut",
            // });
            // scene4.addChild(fcloud3);
            scene4.setTransition("fade", 0.5);
            scene4.setDuration(data.sceneData.time);
            creator.addChild(scene4);
          }
          i++;
        } else if (templateBlock[i].sceneId == 32) {
          let data = templateBlock[i];

          fontfamily = data.sceneData.fontFamily;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          const content = data.sceneData.content;
          const contentParts = content.split("\n");
          const firstVideo15 = await videoTemplate32(data);
          const scene3 = new FFScene();
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img321.png",
            y: 540,
            x: 960,
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene3.addChild(slide1);
          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img322.png",
            y: 540,
          });
          slide2.addAnimate({
            from: { x: -1960 },
            to: { x: 960 },
            time: 1,
            delay: 2.5,
            ease: "Cubic.InOut",
          });
          slide2.addEffect("zoomingIn", 3.5, 3);
          scene3.addChild(slide2);
          scene3.setBgColor("#fff");
          const fimg2 = new FFImage({
            path: assetsPath + "brownbg3.png",
            y: 800,
          });
          fimg2.addAnimate({
            from: { x: 2660 },
            to: { x: 1450 },
            time: 1,
            delay: 0.5,
            ease: "Cubic.InOut",
          });
          fimg2.setScale(0.4);
          scene3.addChild(fimg2);
          if (contentParts[2] != undefined && contentParts[2] != "") {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 1450,
              y: 730,
            });
            scene3.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("fadeIn", 1, 1.3);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene3.addChild(text);

            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 1450,
              y: 800,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("fadeIn", 1.0, 1.4);
            scene3.addChild(text2);

            const text3 = new FFText({
              text: contentParts[2],
              fontSize: fontSize1,
              x: 1450,
              y: 870,
            });
            text3.alignCenter();
            text3.setStyle({ padding: [4, 20, 6, 20] });
            text3.setColor(titleColor);
            text3.setFont(selectedfonts);
            text3.addEffect("fadeIn", 1.0, 1.4);
            scene3.addChild(text3);
          } else {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 1450,
              y: 760,
            });
            scene3.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("fadeIn", 1, 1.3);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene3.addChild(text);

            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 1450,
              y: 830,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("fadeIn", 1.0, 1.4);
            scene3.addChild(text2);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene3.addChild(watermark);
          }

          const scene3img = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          scene3img.addAnimate({
            from: { x: 960 },
            to: { x: 3000 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene3.addChild(scene3img);
          // const fcloud2 = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   x: 960,
          // });
          // fcloud2.addAnimate({
          //   from: { y: 1620 },
          //   to: { y: 540 },
          //   time: 1,
          //   delay: 5.5,
          //   ease: "Cubic.InOut",
          // });
          // scene3.addChild(fcloud2);
          scene3.setTransition("fade", 0.5);
          scene3.setDuration(data.sceneData.time);
          creator.addChild(scene3);
          i++;
        } else if (templateBlock[i].sceneId == 33) {
          let data = templateBlock[i];
          const firstVideo = await videoTemplate33(data);
          console.log(firstVideo);
          let titleColor;
          if (data.sceneData.titleColor) {
            titleColor = data.sceneData.titleColor;
          } else {
            titleColor = data.sceneData.textColor;
          }
          let fontfamily = data.sceneData.fontFamily;
          let titlefontfamily = data.sceneData.titleFontFamily;
          let selectedfonts;
          let titlefonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
            if (font.family == titlefontfamily) {
              if (data.sceneData.titleFontWeight == "lighter") {
                titlefonts = font.lighter;
              } else if (data.sceneData.titleFontWeight == "normal") {
                titlefonts = font.file;
              } else if (data.sceneData.titleFontWeight == "bold") {
                titlefonts = font.bold;
              }
            }
          });
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var subtitleColor = data.sceneData.textColor;
          if (subtitleColor.length == "4") {
            subtitleColor = subtitleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }
          if (data.sceneData.titletextSize) {
            var titletextSize = data.sceneData.titletextSize;
          } else {
            var titletextSize = data.sceneData.textSize;
          }
          if (data.sceneData.textSize) {
            var textSize = data.sceneData.textSize;
          } else {
            var textSize = data.sceneData.textSize;
          }
          if (typeof data.sceneData.content[0].title == undefined) {
            var fieldTitle1 = "";
            var fieldText1 = "";
          } else {
            var fieldTitle1 = data.sceneData.content[0].title;
            var fieldText1 = data.sceneData.content[0].text;
          }
          if (data.sceneData.content[1] == undefined) {
            var fieldTitle2 = "";
            var fieldText2 = "";
          } else {
            var fieldTitle2 = data.sceneData.content[1].title;
            var fieldText2 = data.sceneData.content[1].text;
          }
          if (data.sceneData.content[2] == undefined) {
            var fieldTitle3 = "";
            var fieldText3 = "";
          } else {
            var fieldTitle3 = data.sceneData.content[2].title;
            var fieldText3 = data.sceneData.content[2].text;
          }
          if (data.sceneData.content[3] == undefined) {
            var fieldTitle4 = "";
            var fieldText4 = "";
          } else {
            var fieldTitle4 = data.sceneData.content[3].title;
            var fieldText4 = data.sceneData.content[3].text;
          }
          if (data.sceneData.content[4] != undefined) {
            var fieldTitle5 = data.sceneData.content[4].title;
            var fieldText5 = data.sceneData.content[4].text;
          } else {
            var fieldTitle5 = "";
            var fieldText5 = "";
          }

          const scene2 = new FFScene();
          scene2.setBgColor("#522406");

          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img331.png",
            y: 540,
            width: 1200,
            height: 1080,
          });
          slide1.addAnimate({
            from: { x: 2960 },
            to: { x: 1340 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene2.addChild(slide1);

          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img332.png",
            y: 540,
            width: 1200,
            height: 1080,
          });
          slide2.addAnimate({
            from: { x: 2960 },
            to: { x: 1340 },
            time: 1,
            delay: 3,
            ease: "Cubic.InOut",
          });
          slide2.addEffect("zoomingIn", 3.5, 4);
          scene2.addChild(slide2);
          const slidebg = new FFImage({
            path: assetsPath + "brownbg.png",
            y: 540,
            x: 400,
          });
          scene2.addChild(slidebg);
          // slidebg.addAnimate({
          //   from: { x: -250 },
          //   to: { x: 250 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          // scene2.addChild(slidebg);
          const fontSize1 = parseInt(titletextSize) + 20;
          const fontSize2 = parseInt(textSize) + 20;
          if (fieldTitle1 != "") {
            const text1 = new FFText({
              text: fieldTitle1,
              fontSize: fontSize1,
              x: 150,
              y: 170,
            });
            text1.setColor(titleColor);
            text1.setFont(titlefonts);
            text1.addEffect("zoomIn", 1, 0.5);
            scene2.addChild(text1);
          }
          if (fieldText1 != "") {
            const textField = new FFText({
              text: fieldText1,
              fontSize: fontSize1,
              x: 150,
              y: 220,
            });
            textField.setColor(subtitleColor);
            textField.setFont(selectedfonts);
            textField.addEffect("zoomIn", 1, 0.5);
            scene2.addChild(textField);
          }
          if (fieldTitle2 != "") {
            const textTitle2 = new FFText({
              text: fieldTitle2,
              fontSize: fontSize1,
              x: 150,
              y: 320,
            });
            textTitle2.setColor(titleColor);
            textTitle2.setFont(titlefonts);
            textTitle2.addEffect("zoomIn", 1, 0.7);
            scene2.addChild(textTitle2);
          }
          if (fieldText2 != "") {
            const textField2 = new FFText({
              text: fieldText2,
              fontSize: fontSize2,
              x: 150,
              y: 370,
            });
            textField2.setColor(subtitleColor);
            textField2.setFont(selectedfonts);
            textField2.addEffect("zoomIn", 1, 0.7);
            scene2.addChild(textField2);
          }
          if (fieldTitle3 != "") {
            const text5 = new FFText({
              text: fieldTitle3,
              fontSize: fontSize1,
              x: 150,
              y: 470,
            });
            text5.setColor(titleColor);
            text5.setFont(titlefonts);
            text5.addEffect("zoomIn", 1, 0.9);
            scene2.addChild(text5);
          }
          if (fieldText3) {
            const text6 = new FFText({
              text: fieldText3,
              fontSize: fontSize2,
              x: 150,
              y: 520,
            });
            text6.setColor(subtitleColor);
            text6.setFont(selectedfonts);
            text6.addEffect("zoomIn", 1, 0.9);
            scene2.addChild(text6);
          }

          if (fieldTitle4) {
            const text7 = new FFText({
              text: fieldTitle4,
              fontSize: fontSize1,
              x: 150,
              y: 620,
            });
            text7.setColor(titleColor);
            text7.setFont(titlefonts);
            text7.addEffect("zoomIn", 1, 1.1);
            scene2.addChild(text7);
          }
          if (fieldText4) {
            const text8 = new FFText({
              text: fieldText4,
              fontSize: fontSize2,
              x: 150,
              y: 670,
            });
            text8.setColor(subtitleColor);
            text8.setFont(selectedfonts);
            text8.addEffect("zoomIn", 1, 1.1);
            scene2.addChild(text8);
          }

          if (fieldTitle5) {
            const text9 = new FFText({
              text: fieldTitle5,
              fontSize: fontSize1,
              x: 150,
              y: 770,
            });
            text9.setColor(titleColor);
            text9.setFont(titlefonts);
            text9.addEffect("zoomIn", 1, 1.3);
            scene2.addChild(text9);
          }
          if (fieldText5) {
            const text10 = new FFText({
              text: fieldText5,
              fontSize: fontSize2,
              x: 150,
              y: 820,
            });
            text10.setColor(subtitleColor);
            text10.setFont(selectedfonts);
            text10.addEffect("zoomIn", 1, 1.3);
            scene2.addChild(text10);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene2.addChild(watermark);
          }
          const fcloud1 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud1.addAnimate({
            from: { x: 960 },
            to: { x: -1260 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene2.addChild(fcloud1);
          const fcloud = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud.addAnimate({
            from: { x: -960 },
            to: { x: 960 },
            time: 1,
            delay: parseFloat(data.sceneData.time) - 1,
            ease: "Cubic.InOut",
          });
          scene2.addChild(fcloud);
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          // scene2.setTransition("fade", 1);
          i++;
        } else if (templateBlock[i].sceneId == 34) {
          let data = templateBlock[i];

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          // console.log(result);
          var text = "";
          var text2 = "";
          for (var m = 0; m < result.length; m++) {
            if (m > 6) {
              text2 = text2 + result[m] + " ";
            } else {
              text = text + result[m] + " ";
            }
          }
          console.log(text2);
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          const firstVideo15 = await videoTemplate34(data);
          const scene3 = new FFScene();
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img341.png",
            y: 540,
            x: 960,
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene3.addChild(slide1);
          const fimg2 = new FFImage({
            path: assetsPath + "brownstrip.png",
            y: 1000,
          });
          fimg2.addAnimate({
            from: { x: 2660 },
            to: { x: 960 },
            time: 1,
            delay: 0.5,
            ease: "Cubic.InOut",
          });

          scene3.addChild(fimg2);
          const fimg3 = new FFImage({
            path: assetsPath + "cropped-white-3.jpg",
            y: 750,
            x: 1440,
          });
          fimg3.addAnimate({
            from: { y: 1620 },
            to: { y: 750 },
            time: 2,
            delay: 0.5,
            ease: "Cubic.InOut",
          });
          // fimg3.addEffect("fadeIn", 1.5, 1.5);
          scene3.addChild(fimg3);
          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img342.png",
            x: 1440,
          });
          slide2.addAnimate({
            from: { y: 1620 },
            to: { y: 750 },
            time: 2,
            delay: 0.5,
            ease: "Cubic.InOut",
          });
          scene3.addChild(slide2);
          scene3.setBgColor("#fff");
          const fontSize1 = parseInt(data.sceneData.textSize) + 25;
          let textOne = new FFText({
            text: text,
            fontSize: fontSize1,
            x: 80,
            y: 890,
          });
          textOne.setColor(titleColor);
          textOne.setFont(selectedfonts);
          textOne.addEffect("fadeIn", 1.5, 0.6);
          scene3.addChild(textOne);
          if (text2 != "") {
            const textNext = new FFText({
              text: text2,
              fontSize: fontSize1,
              x: 80,
              y: 950,
            });
            textNext.setColor(titleColor);
            textNext.setFont(selectedfonts);
            textNext.addEffect("fadeIn", 1.0, 1.0);
            scene3.addChild(textNext);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene3.addChild(watermark);
          }

          const scene3img = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          scene3img.addAnimate({
            from: { x: 960 },
            to: { x: 3000 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene3.addChild(scene3img);
          const fcloud2 = new FFImage({
            path: assetsPath + "cropped.jpg",
            x: 960,
          });
          fcloud2.addAnimate({
            from: { y: 1620 },
            to: { y: 540 },
            time: 1,
            delay: parseFloat(data.sceneData.time) - 1,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fcloud2);
          scene3.setTransition("fade", 0.5);
          scene3.setDuration(data.sceneData.time);
          creator.addChild(scene3);
          i++;
        } else if (templateBlock[i].sceneId == 35) {
          let data = templateBlock[i];

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          // console.log(result);
          var text = "";
          var text2 = "";
          for (var m = 0; m < result.length; m++) {
            if (m > 5) {
              text2 = text2 + result[m] + " ";
            } else {
              text = text + result[m] + " ";
            }
          }
          console.log(text2);
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          const firstVideo15 = await videoTemplate35(data);
          const scene3 = new FFScene();
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img351.png",
            y: 540,
            x: 960,
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene3.addChild(slide1);
          const fimg2 = new FFImage({
            path: assetsPath + "brownstrip.png",
            y: 1000,
          });
          fimg2.addAnimate({
            from: { x: 2660 },
            to: { x: 960 },
            time: 1,
            delay: 0.5,
            ease: "Cubic.InOut",
          });

          scene3.addChild(fimg2);
          const fimg3 = new FFImage({
            path: assetsPath + "cropped-white-3.jpg",
            y: 750,
            x: 540,
          });
          fimg3.addAnimate({
            from: { y: 1620 },
            to: { y: 750 },
            time: 2,
            delay: 0.5,
            ease: "Cubic.InOut",
          });
          // fimg3.addEffect("fadeIn", 1.5, 1.5);
          scene3.addChild(fimg3);
          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img352.png",
            x: 540,
          });
          slide2.addAnimate({
            from: { y: 1620 },
            to: { y: 750 },
            time: 2,
            delay: 0.5,
            ease: "Cubic.InOut",
          });
          scene3.addChild(slide2);
          scene3.setBgColor("#fff");
          const fontSize1 = parseInt(data.sceneData.textSize) + 25;
          let textOne = new FFText({
            text: text,
            fontSize: fontSize1,
            x: 1000,
            y: 890,
          });
          textOne.setColor(titleColor);
          textOne.setFont(selectedfonts);
          textOne.addEffect("fadeIn", 1.5, 0.6);
          scene3.addChild(textOne);
          if (text2 != "") {
            const textNext = new FFText({
              text: text2,
              fontSize: fontSize1,
              x: 1000,
              y: 950,
            });
            textNext.setColor(titleColor);
            textNext.setFont(selectedfonts);
            textNext.addEffect("fadeIn", 1.0, 1.0);
            scene3.addChild(textNext);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene3.addChild(watermark);
          }

          const scene3img = new FFImage({
            path: assetsPath + "cropped.jpg",
            x: 960,
          });
          scene3img.addAnimate({
            from: { y: 540 },
            to: { y: -2000 },
            time: 1.2,
            delay: 0.5,
            ease: "Cubic.InOut",
          });
          scene3.addChild(scene3img);
          const fcloud2 = new FFImage({
            path: assetsPath + "cropped.jpg",
            x: 960,
          });
          fcloud2.addAnimate({
            from: { y: 1620 },
            to: { y: 540 },
            time: 1,
            delay: parseFloat(data.sceneData.time) - 1,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fcloud2);
          scene3.setTransition("fade", 0.5);
          scene3.setDuration(data.sceneData.time);
          creator.addChild(scene3);
          i++;
        } else if (templateBlock[i].sceneId == 36) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate36(data);
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 10) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          if (data.sceneData.media[0].type == "image") {
            const scene4 = new FFScene();
            const image = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img361.png",
              y: 540,
            });
            image.addAnimate({
              from: { x: 1000 },
              to: { x: 960 },
              time: 3.0,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image);
            // const image2 = new FFImage({
            //   path:
            //     assetsPath +
            //     "template/videos/" +
            //     userId +
            //     "/template1/" +
            // mediaDate + "-img362.png",
            //   y: 540,
            // });
            // image2.addAnimate({
            //   from: { x: 1620 },
            //   to: { x: 1560 },
            //   time: 3,
            //   delay: 0.2,
            //   ease: "Cubic.InOut",
            // });
            // scene4.addChild(image2);
            scene4.setBgColor("#522406");
            const fimg1 = new FFImage({
              path: assetsPath + "whitestrip.jpg",
              x: 960,
            });
            fimg1.addAnimate({
              from: { y: 1720 },
              to: { y: 950 },
              time: 0.6,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            fimg1.setScale(0.6);
            scene4.addChild(fimg1);
            if (data.sceneData.textAligmnet == "text-center") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 15;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 960,
                y: 920,
              });
              textOne.alignCenter();
              textOne.setStyle({ padding: [0, 20, 10, 20] });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.addEffect("fadeIn", 1.5, 0.6);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 960,
                  y: 980,
                });
                textNext.alignCenter();
                textNext.setStyle({ padding: [0, 20, 10, 20] });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1.5, 1.0);
                scene4.addChild(textNext);
              }
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 15;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 450,
                y: 895,
              });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.addEffect("fadeIn", 1.5, 0.6);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 450,
                  y: 950,
                });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("fadeIn", 1.5, 1.0);
                scene4.addChild(textNext);
              }
            }
            if (user.userPlan == 0) {
              const watermark = new FFImage({
                path: assetsPath + "reveoLogo.png",
                x: 1680,
                y: 50,
              });
              watermark.setOpacity(0.7);
              watermark.setScale(0.5);
              scene4.addChild(watermark);
            }
            const fcloud2 = new FFImage({
              path: assetsPath + "cropped.jpg",
              x: 960,
            });
            fcloud2.addAnimate({
              from: { y: 540 },
              to: { y: -600 },
              time: 1,
              delay: 0,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud2);

            const fcloud3 = new FFImage({
              path: assetsPath + "cropped.jpg",
              x: 960,
            });
            fcloud3.addAnimate({
              from: { y: 1620 },
              to: { y: 540 },
              time: 1,
              delay: parseFloat(data.sceneData.time) - 1,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud3);

            scene4.setDuration(data.sceneData.time);
            creator.addChild(scene4);
          }
          i++;
        } else if (templateBlock[i].sceneId == 37) {
          // Resize Images for scene
          let data = templateBlock[i];
          const firstVideo = await videoTemplate37(data);
          console.log(firstVideo);
          fontfamily = data.sceneData.fontFamily;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          const content = data.sceneData.content;
          const contentParts = content.split("\n");
          console.log(contentParts);
          const scene1 = new FFScene();
          scene1.setBgColor("#fff");

          const img1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img371.png",
            y: 265,
          });
          img1.addAnimate({
            from: { x: -1050 },
            to: { x: 477 },
            time: 2,
            delay: 0.2,
            ease: "Cubic.InOut",
          });
          scene1.addChild(img1);
          const img2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img372.png",
            x: 1442,
          });
          img2.addAnimate({
            from: { y: -1400 },
            to: { y: 265 },
            time: 2,
            delay: 1,
            ease: "Cubic.InOut",
          });

          scene1.addChild(img2);
          const img3 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img373.png",
            x: 477,
          });
          img3.addAnimate({
            from: { y: 1680 },
            to: { y: 815 },
            time: 2,
            delay: 0.8,
            ease: "Cubic.InOut",
          });
          // fimg1.addEffect("slideInUp", 1.5, 1);
          scene1.addChild(img3);
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 150,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene1.addChild(watermark);
            console.log("here");
          }
          const img4 = new FFImage({
            path: assetsPath + "lightgreenbg.png",
            y: 815,
            height: 530,
            width: 950,
          });
          img4.addAnimate({
            from: { x: 2400 },
            to: { x: 1442 },
            time: 1.5,
            delay: 0.8,
            ease: "Cubic.InOut",
          });
          // fimg1.addEffect("slideInUp", 1.5, 1);

          scene1.addChild(img4);
          if (contentParts[2] != undefined && contentParts[2] != "") {
            const fontSize1 = parseInt(data.sceneData.textSize) + 30;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 1442,
              y: 730,
            });
            scene1.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("backInUp", 1, 1.6);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene1.addChild(text);

            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 1442,
              y: 800,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("backInUp", 1.0, 1.8);
            scene1.addChild(text2);

            const text3 = new FFText({
              text: contentParts[2],
              fontSize: fontSize1,
              x: 1442,
              y: 870,
            });
            text3.alignCenter();
            text3.setStyle({ padding: [4, 20, 6, 20] });
            text3.setColor(titleColor);
            text3.setFont(selectedfonts);
            text3.addEffect("backInUp", 1.0, 2);
            scene1.addChild(text3);
          } else {
            const fontSize1 = parseInt(data.sceneData.textSize) + 30;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 1442,
              y: 780,
            });
            scene1.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("backInUp", 1, 1.6);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene1.addChild(text);

            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 1442,
              y: 840,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("backInUp", 1.0, 1.8);
            scene1.addChild(text2);
          }
          // add bottom cloud
          scene1.setTransition("fade", 1.5);
          scene1.setDuration(data.sceneData.time);
          creator.addChild(scene1);
          i++;
        } else if (templateBlock[i].sceneId == 38) {
          // Resize Images for scene
          let data = templateBlock[i];
          fontfamily = data.sceneData.fontFamily;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          // const  content= data.sceneData.content;
          var content = data.sceneData.content.split(" ");
          var textcontent1 = "";
          var textcontent2 = "";
          var textcontent3 = "";
          for (var l = 0; l < content.length; l++) {
            if (l >= 11 && l <= 21) {
              textcontent2 = textcontent2 + content[l] + " ";
            } else if (l > 21) {
              textcontent3 = textcontent3 + content[l] + " ";
            } else {
              textcontent1 = textcontent1 + content[l] + " ";
            }
          }

          // console.log(contentParts);
          const scene1 = new FFScene();
          scene1.setBgColor("#7a9993");
          const img4 = new FFImage({
            path: assetsPath + "greenstirp.png",
            y: -20,
          });
          img4.addAnimate({
            from: { x: -2400 },
            to: { x: 800 },
            time: 2,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          // fimg1.addEffect("slideInUp", 1.5, 1);

          scene1.addChild(img4);
          const img5 = new FFImage({
            path: assetsPath + "greenstirp.png",
            y: 1100,
          });
          img5.addAnimate({
            from: { x: 3400 },
            to: { x: 1100 },
            time: 2,
            delay: 0.3,
            ease: "Cubic.InOut",
          });
          // fimg1.addEffect("slideInUp", 1.5, 1);

          scene1.addChild(img5);
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 150,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene1.addChild(watermark);
          }
          if (data.sceneData.textAligmnet == "text-center") {
            if (textcontent3 != undefined && textcontent3 != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 960,
                y: 465,
              });
              scene1.addChild(text);
              text.alignCenter();
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("fadeIn", 1, 0.3);
              text.alignCenter();
              text.setStyle({ padding: [0, 20, 10, 20] });
              scene1.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 960,
                y: 540,
              });
              text2.alignCenter();
              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("fadeIn", 1.0, 0.8);
              scene1.addChild(text2);

              const text3 = new FFText({
                text: textcontent3,
                fontSize: fontSize1,
                x: 960,
                y: 625,
              });
              text3.alignCenter();
              text3.setStyle({ padding: [4, 20, 6, 20] });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("fadeIn", 1.0, 1.1);
              scene1.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 960,
                y: 515,
              });
              scene1.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("fadeIn", 1, 0.3);
              text.alignCenter();
              text.setStyle({ padding: [0, 20, 10, 20] });
              scene1.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 960,
                y: 585,
              });
              text2.alignCenter();
              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("fadeIn", 1.0, 0.8);
              scene1.addChild(text2);
            }
          } else {
            if (textcontent3 != undefined && textcontent3 != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 100,
                y: 425,
              });
              scene1.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("fadeIn", 1, 0.3);

              text.setStyle({ padding: [0, 20, 10, 20] });
              scene1.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 100,
                y: 500,
              });

              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("fadeIn", 1.0, 0.8);
              scene1.addChild(text2);

              const text3 = new FFText({
                text: textcontent3,
                fontSize: fontSize1,
                x: 100,
                y: 580,
              });

              text3.setStyle({ padding: [4, 20, 6, 20] });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("fadeIn", 1.0, 1.1);
              scene1.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 100,
                y: 465,
              });
              scene1.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("fadeIn", 1, 0.3);

              text.setStyle({ padding: [0, 20, 10, 20] });
              scene1.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 100,
                y: 545,
              });

              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("fadeIn", 1.0, 0.8);
              scene1.addChild(text2);
            }
          }
          // add bottom cloud
          // const fcloud = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud.addAnimate({
          //   from: { x: -960 },
          //   to: { x: 960 },
          //   time: 1,
          //   delay: 3.5,
          //   ease: "Cubic.InOut",
          // });
          // scene1.addChild(fcloud);
          scene1.setTransition("fade", 0.5);
          scene1.setDuration(data.sceneData.time);
          creator.addChild(scene1);
          console.log(i);
          console.log("scene1");
          i++;
          console.log(i);
        } else if (templateBlock[i].sceneId == 39) {
          let data = templateBlock[i];
          const firstVideo = await videoTemplate39(data);
          let titleColor;
          if (data.sceneData.titleColor) {
            titleColor = data.sceneData.titleColor;
          } else {
            titleColor = data.sceneData.textColor;
          }
          let fontfamily = data.sceneData.fontFamily;
          let titlefontfamily = data.sceneData.titleFontFamily;
          let selectedfonts;
          let titlefonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
            if (font.family == titlefontfamily) {
              if (data.sceneData.titleFontWeight == "lighter") {
                titlefonts = font.lighter;
              } else if (data.sceneData.titleFontWeight == "normal") {
                titlefonts = font.file;
              } else if (data.sceneData.titleFontWeight == "bold") {
                titlefonts = font.bold;
              }
            }
          });
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var subtitleColor = data.sceneData.textColor;
          if (subtitleColor.length == "4") {
            subtitleColor = subtitleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }
          if (data.sceneData.titletextSize) {
            var titletextSize = data.sceneData.titletextSize;
          } else {
            var titletextSize = data.sceneData.textSize;
          }
          if (data.sceneData.textSize) {
            var textSize = data.sceneData.textSize;
          } else {
            var textSize = data.sceneData.textSize;
          }
          if (typeof data.sceneData.content[0].title == undefined) {
            var fieldTitle1 = "";
            var fieldText1 = "";
          } else {
            var fieldTitle1 = data.sceneData.content[0].title;
            var fieldText1 = data.sceneData.content[0].text;
          }
          if (data.sceneData.content[1] == undefined) {
            var fieldTitle2 = "";
            var fieldText2 = "";
          } else {
            var fieldTitle2 = data.sceneData.content[1].title;
            var fieldText2 = data.sceneData.content[1].text;
          }
          if (data.sceneData.content[2] == undefined) {
            var fieldTitle3 = "";
            var fieldText3 = "";
          } else {
            var fieldTitle3 = data.sceneData.content[2].title;
            var fieldText3 = data.sceneData.content[2].text;
          }
          if (data.sceneData.content[3] == undefined) {
            var fieldTitle4 = "";
            var fieldText4 = "";
          } else {
            var fieldTitle4 = data.sceneData.content[3].title;
            var fieldText4 = data.sceneData.content[3].text;
          }
          if (data.sceneData.content[4] != undefined) {
            var fieldTitle5 = data.sceneData.content[4].title;
            var fieldText5 = data.sceneData.content[4].text;
          } else {
            var fieldTitle5 = "";
            var fieldText5 = "";
          }

          const scene2 = new FFScene();
          scene2.setBgColor("#7a9993");

          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img391.png",
            y: 540,
            width: 1200,
            height: 1080,
          });
          slide1.addAnimate({
            from: { x: 2960 },
            to: { x: 1340 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene2.addChild(slide1);

          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img392.png",
            y: 540,
            width: 1200,
            height: 1080,
          });
          slide2.addAnimate({
            from: { x: 2960 },
            to: { x: 1340 },
            time: 1,
            delay: 3,
            ease: "Cubic.InOut",
          });
          slide2.addEffect("zoomingIn", 3.5, 4);
          scene2.addChild(slide2);
          const slidebg = new FFImage({
            path: assetsPath + "bglightbreen.png",
            y: 540,
            x: 400,
          });
          scene2.addChild(slidebg);
          // slidebg.addAnimate({
          //   from: { x: -250 },
          //   to: { x: 250 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          // scene2.addChild(slidebg);
          const fontSize1 = parseInt(titletextSize) + 20;
          const fontSize2 = parseInt(textSize) + 20;
          if (fieldTitle1 != "") {
            const text1 = new FFText({
              text: fieldTitle1,
              fontSize: fontSize1,
              x: 150,
              y: 170,
            });
            text1.setColor(titleColor);
            text1.setFont(titlefonts);
            text1.addEffect("backInUp", 1, 0.5);
            scene2.addChild(text1);
          }
          if (fieldText1 != "") {
            const textField = new FFText({
              text: fieldText1,
              fontSize: fontSize1,
              x: 150,
              y: 220,
            });
            textField.setColor(subtitleColor);
            textField.setFont(selectedfonts);
            textField.addEffect("backInUp", 1, 0.5);
            scene2.addChild(textField);
          }
          if (fieldTitle2 != "") {
            const textTitle2 = new FFText({
              text: fieldTitle2,
              fontSize: fontSize1,
              x: 150,
              y: 320,
            });
            textTitle2.setColor(titleColor);
            textTitle2.setFont(titlefonts);
            textTitle2.addEffect("backInUp", 1, 0.7);
            scene2.addChild(textTitle2);
          }
          if (fieldText2 != "") {
            const textField2 = new FFText({
              text: fieldText2,
              fontSize: fontSize2,
              x: 150,
              y: 370,
            });
            textField2.setColor(subtitleColor);
            textField2.setFont(selectedfonts);
            textField2.addEffect("backInUp", 1, 0.7);
            scene2.addChild(textField2);
          }
          if (fieldTitle3 != "") {
            const text5 = new FFText({
              text: fieldTitle3,
              fontSize: fontSize1,
              x: 150,
              y: 470,
            });
            text5.setColor(titleColor);
            text5.setFont(titlefonts);
            text5.addEffect("backInUp", 1, 0.9);
            scene2.addChild(text5);
          }
          if (fieldText3) {
            const text6 = new FFText({
              text: fieldText3,
              fontSize: fontSize2,
              x: 150,
              y: 520,
            });
            text6.setColor(subtitleColor);
            text6.setFont(selectedfonts);
            text6.addEffect("backInUp", 1, 0.9);
            scene2.addChild(text6);
          }

          if (fieldTitle4) {
            const text7 = new FFText({
              text: fieldTitle4,
              fontSize: fontSize1,
              x: 150,
              y: 620,
            });
            text7.setColor(titleColor);
            text7.setFont(titlefonts);
            text7.addEffect("backInUp", 1, 1.1);
            scene2.addChild(text7);
          }
          if (fieldText4) {
            const text8 = new FFText({
              text: fieldText4,
              fontSize: fontSize2,
              x: 150,
              y: 670,
            });
            text8.setColor(subtitleColor);
            text8.setFont(selectedfonts);
            text8.addEffect("backInUp", 1, 1.1);
            scene2.addChild(text8);
          }

          if (fieldTitle5) {
            const text9 = new FFText({
              text: fieldTitle5,
              fontSize: fontSize1,
              x: 150,
              y: 770,
            });
            text9.setColor(titleColor);
            text9.setFont(titlefonts);
            text9.addEffect("backInUp", 1, 1.3);
            scene2.addChild(text9);
          }
          if (fieldText5) {
            const text10 = new FFText({
              text: fieldText5,
              fontSize: fontSize2,
              x: 150,
              y: 820,
            });
            text10.setColor(subtitleColor);
            text10.setFont(selectedfonts);
            text10.addEffect("backInUp", 1, 1.3);
            scene2.addChild(text10);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene2.addChild(watermark);
          }
          const fcloud1 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud1.addAnimate({
            from: { x: 960 },
            to: { x: -1260 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene2.addChild(fcloud1);
          // const fcloud = new FFImage({
          //   path: assetsPath + "cropped.jpg",
          //   y: 540,
          // });
          // fcloud.addAnimate({
          //   from: { x: -960 },
          //   to: { x: 960 },
          //   time: 1,
          //   delay: 5.5,
          //   ease: "Cubic.InOut",
          // });
          // scene2.addChild(fcloud);
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          scene2.setTransition("fade", 1.5);
          // scene2.setTransition("fade", 1);
          i++;
        } else if (templateBlock[i].sceneId == 40) {
          let data = templateBlock[i];
          const firstVideo = await videoTemplate40(data);
          fontfamily = data.sceneData.fontFamily;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          // const  content= data.sceneData.content;
          var content = data.sceneData.content.split(" ");
          var textcontent1 = "";
          var textcontent2 = "";
          var textcontent3 = "";
          for (var l = 0; l < content.length; l++) {
            if (l >= 5 && l <= 11) {
              textcontent2 = textcontent2 + content[l] + " ";
            } else if (l > 11) {
              textcontent3 = textcontent3 + content[l] + " ";
            } else {
              textcontent1 = textcontent1 + content[l] + " ";
            }
          }
          const scene2 = new FFScene();
          scene2.setBgColor("#7a9993");

          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img401.png",
            x: 1200,
            width: 1400,
            height: 1080,
          });
          slide1.addAnimate({
            from: { y: -2960 },
            to: { y: 540 },
            time: 1.5,
            delay: 0,
            ease: "Cubic.InOut",
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene2.addChild(slide1);

          const slidebg = new FFImage({
            path: assetsPath + "bglightgreen.png",
            y: 540,
            x: 500,
          });
          // slidebg.addAnimate({
          //   from: { x: -250 },
          //   to: { x: 250 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          scene2.addChild(slidebg);
          if (data.sceneData.textAligmnet == "text-center") {
            if (textcontent3 != undefined && textcontent3 != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 480,
                y: 400,
              });
              scene2.addChild(text);
              text.alignCenter();
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInUp", 1, 0.3);
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 480,
                y: 490,
              });
              text2.alignCenter();
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInUp", 1.0, 0.8);
              scene2.addChild(text2);

              const text3 = new FFText({
                text: textcontent3,
                fontSize: fontSize1,
                x: 480,
                y: 580,
              });
              text3.alignCenter();
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("backInUp", 1.0, 1.1);
              scene2.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 480,
                y: 515,
              });
              text.alignCenter();
              fd;
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInUp", 1, 0.3);
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 100,
                y: 625,
              });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInUp", 1.0, 0.8);
              scene2.addChild(text2);
            }
          } else {
            if (textcontent3 != undefined && textcontent3 != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 100,
                y: 400,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInUp", 1, 0.3);
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 100,
                y: 490,
              });

              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInUp", 1.0, 0.8);
              scene2.addChild(text2);

              const text3 = new FFText({
                text: textcontent3,
                fontSize: fontSize1,
                x: 100,
                y: 580,
              });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("backInUp", 1.0, 1.1);
              scene2.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 100,
                y: 515,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInUp", 1, 0.3);
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 100,
                y: 625,
              });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInUp", 1.0, 0.8);
              scene2.addChild(text2);
            }
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene2.addChild(watermark);
          }
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          scene2.setTransition("fade", 1);
          i++;
        }
        //  else if (templateBlock[i].sceneId == 40) {
        //   console.log("textcontent1");

        //   let data = templateBlock[i];
        //   const firstVideo = await videoTemplate40(data);
        //   fontfamily = data.sceneData.fontFamily;
        //   fonts.map(function (font) {
        //     if (font.family == fontfamily) {
        //       if (data.sceneData.fontWeight == "lighter") {
        //         selectedfonts = font.lighter;
        //       } else if (data.sceneData.fontWeight == "normal") {
        //         selectedfonts = font.file;
        //       } else if (data.sceneData.fontWeight == "bold") {
        //         selectedfonts = font.bold;
        //       }
        //     }
        //   });

        //   var titleColor = data.sceneData.textColor;
        //   if (titleColor.length == "4") {
        //     titleColor = titleColor.replaceAll(
        //       "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
        //       "#$1$1$2$2$3$3"
        //     );
        //   }
        //   // const  content= data.sceneData.content;
        //   var content = data.sceneData.content.split(" ");
        //   var textcontent1 = "";
        //   var textcontent2 = "";
        //   var textcontent3 = "";
        //   for (var l = 0; l < content.length; l++) {
        //     if (l >= 5 && l <= 8) {
        //       textcontent2 = textcontent2 + content[l] + " ";
        //     } else if (l > 8) {
        //       textcontent3 = textcontent3 + content[l] + " ";
        //     } else {
        //       textcontent1 = textcontent1 + content[l] + " ";
        //     }
        //   }
        //   // console.log(textcontent1);
        //   // console.log(textcontent2);
        //   // console.log(textcontent3);
        //   const scene2 = new FFScene();
        //   scene2.setBgColor("#7a9993");

        //   // add bottom cloud
        //   const slide1 = new FFImage({
        //     path:
        //       assetsPath +
        //       "template/videos/" +
        //       userId +
        //       "/template1/" +
        //       mediaDate +
        //       "-img401.png",
        //     x: 1200,
        //     width: 1400,
        //     height: 1080,
        //   });
        //   slide1.addAnimate({
        //     from: { y: -2960 },
        //     to: { y: 540 },
        //     time: 1.5,
        //     delay: 0,
        //     ease: "Cubic.InOut",
        //   });
        //   slide1.addEffect("zoomingIn", 3.5, 1);
        //   scene2.addChild(slide1);

        //   const slidebg = new FFImage({
        //     path: assetsPath + "bglightgreen.png",
        //     y: 540,
        //     x: 500,
        //   });
        //   // slidebg.addAnimate({
        //   //   from: { x: -250 },
        //   //   to: { x: 250 },
        //   //   time: 1,
        //   //   delay: 0.1,
        //   //   ease: "Cubic.InOut",
        //   // });
        //   scene2.addChild(slidebg);
        //   if (textcontent3 != undefined && textcontent3 != "") {
        //     const fontSize1 = parseInt(data.sceneData.textSize) + 20;
        //     const text = new FFText({
        //       text: textcontent1,
        //       fontSize: fontSize1,
        //       x: 100,
        //       y: 400,
        //     });
        //     scene2.addChild(text);
        //     text.setColor(titleColor);
        //     text.setFont(selectedfonts);
        //     text.addEffect("backInUp", 1, 0.3);
        //     scene2.addChild(text);

        //     const text2 = new FFText({
        //       text: textcontent2,
        //       fontSize: fontSize1,
        //       x: 100,
        //       y: 490,
        //     });

        //     text2.setColor(titleColor);
        //     text2.setFont(selectedfonts);
        //     text2.addEffect("backInUp", 1.0, 0.8);
        //     scene2.addChild(text2);

        //     const text3 = new FFText({
        //       text: textcontent3,
        //       fontSize: fontSize1,
        //       x: 100,
        //       y: 580,
        //     });
        //     text3.setColor(titleColor);
        //     text3.setFont(selectedfonts);
        //     text3.addEffect("backInUp", 1.0, 1.1);
        //     scene2.addChild(text3);
        //   } else {
        //     const fontSize1 = parseInt(data.sceneData.textSize) + 20;
        //     const text = new FFText({
        //       text: textcontent1,
        //       fontSize: fontSize1,
        //       x: 100,
        //       y: 515,
        //     });
        //     scene2.addChild(text);
        //     text.setColor(titleColor);
        //     text.setFont(selectedfonts);
        //     text.addEffect("backInUp", 1, 0.3);
        //     scene2.addChild(text);

        //     const text2 = new FFText({
        //       text: textcontent2,
        //       fontSize: fontSize1,
        //       x: 100,
        //       y: 625,
        //     });
        //     text2.setColor(titleColor);
        //     text2.setFont(selectedfonts);
        //     text2.addEffect("backInUp", 1.0, 0.8);
        //     scene2.addChild(text2);
        //   }
        //   if (user.userPlan == 0) {
        //     const watermark = new FFImage({
        //       path: assetsPath + "reveoLogo.png",
        //       x: 1680,
        //       y: 50,
        //     });
        //     watermark.setOpacity(0.7);
        //     watermark.setScale(0.5);
        //     scene2.addChild(watermark);
        //   }
        //   scene2.setDuration(5.5);
        //   creator.addChild(scene2);
        //   scene2.setTransition("wind", 1);
        //   i++;
        // }
        else if (templateBlock[i].sceneId == 41) {
          let data = templateBlock[i];
          const firstVideo = await videoTemplate41(data);
          fontfamily = data.sceneData.fontFamily;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          // const  content= data.sceneData.content;
          var content = data.sceneData.content.split(" ");
          var textcontent1 = "";
          var textcontent2 = "";
          var textcontent3 = "";
          for (var l = 0; l < content.length; l++) {
            if (l >= 5 && l <= 9) {
              textcontent2 = textcontent2 + content[l] + " ";
            } else if (l > 9) {
              textcontent3 = textcontent3 + content[l] + " ";
            } else {
              textcontent1 = textcontent1 + content[l] + " ";
            }
          }
          const scene2 = new FFScene();
          scene2.setBgColor("#7a9993");

          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img411.png",
            x: 500,
          });
          slide1.addAnimate({
            from: { y: -2960 },
            to: { y: 540 },
            time: 1.5,
            delay: 0,
            ease: "Cubic.InOut",
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene2.addChild(slide1);

          const slidebg = new FFImage({
            path: assetsPath + "bglightgreen.png",
            y: 540,
            x: 1450,
          });
          // slidebg.addAnimate({
          //   from: { x: -250 },
          //   to: { x: 250 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          scene2.addChild(slidebg);
          if (data.sceneData.textAligmnet == "text-center") {
            if (textcontent3 != undefined && textcontent3 != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 1440,
                y: 400,
              });
              text.alignCenter();
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInUp", 1, 0.3);
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 1440,
                y: 490,
              });
              text2.alignCenter();
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInUp", 1.0, 0.8);
              scene2.addChild(text2);

              const text3 = new FFText({
                text: textcontent3,
                fontSize: fontSize1,
                x: 1440,
                y: 580,
              });
              text3.alignCenter();
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("backInUp", 1.0, 1.1);
              scene2.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 1440,
                y: 515,
              });
              scene2.addChild(text);
              text.alignCenter();
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInUp", 1, 0.3);
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 1440,
                y: 625,
              });
              text2.alignCenter();
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInUp", 1.0, 0.8);
              scene2.addChild(text2);
            }
          } else {
            if (textcontent3 != undefined && textcontent3 != "") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 1100,
                y: 400,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInUp", 1, 0.3);
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 1100,
                y: 490,
              });

              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInUp", 1.0, 0.8);
              scene2.addChild(text2);

              const text3 = new FFText({
                text: textcontent3,
                fontSize: fontSize1,
                x: 1100,
                y: 580,
              });
              text3.setColor(titleColor);
              text3.setFont(selectedfonts);
              text3.addEffect("backInUp", 1.0, 1.1);
              scene2.addChild(text3);
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              const text = new FFText({
                text: textcontent1,
                fontSize: fontSize1,
                x: 1100,
                y: 515,
              });
              scene2.addChild(text);
              text.setColor(titleColor);
              text.setFont(selectedfonts);
              text.addEffect("backInUp", 1, 0.3);
              scene2.addChild(text);

              const text2 = new FFText({
                text: textcontent2,
                fontSize: fontSize1,
                x: 1100,
                y: 625,
              });
              text2.setColor(titleColor);
              text2.setFont(selectedfonts);
              text2.addEffect("backInUp", 1.0, 0.8);
              scene2.addChild(text2);
            }
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene2.addChild(watermark);
          }
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          scene2.setTransition("Fade", 1);
          i++;
        } else if (templateBlock[i].sceneId == 42) {
          let data = templateBlock[i];
          fontfamily = data.sceneData.fontFamily;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          const content = data.sceneData.content;
          const contentParts = content.split("\n");
          const firstVideo15 = await videoTemplate42(data);
          const scene3 = new FFScene();
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img421.png",
            y: 540,
            x: 960,
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene3.addChild(slide1);
          const fimg2 = new FFImage({
            path: assetsPath + "bluebg.png",
            y: 1000,
          });
          fimg2.addAnimate({
            from: { x: 2660 },
            to: { x: 960 },
            time: 1,
            delay: 0.5,
            ease: "Cubic.InOut",
          });

          scene3.addChild(fimg2);
          const fimg3 = new FFImage({
            path: assetsPath + "cropped-white-3.jpg",
            y: 750,
            x: 540,
          });
          fimg3.addAnimate({
            from: { y: 1620 },
            to: { y: 750 },
            time: 2,
            delay: 0.5,
            ease: "Cubic.InOut",
          });
          // fimg3.addEffect("fadeIn", 1.5, 1.5);
          scene3.addChild(fimg3);
          const slide2 = new FFImage({
            path: assetsPath + "lightbluebg.png",
            x: 540,
          });
          slide2.addAnimate({
            from: { y: 1620 },
            to: { y: 750 },
            time: 2,
            delay: 0.5,
            ease: "Cubic.InOut",
          });
          scene3.addChild(slide2);
          if (contentParts[2] != undefined && contentParts[2] != "") {
            const fontSize1 = parseInt(data.sceneData.textSize) + 25;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 540,
              y: 680,
            });
            scene3.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("zoomInDown", 1, 1.8);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene3.addChild(text);

            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 540,
              y: 740,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("zoomInDown", 1.0, 1.9);
            scene3.addChild(text2);

            const text3 = new FFText({
              text: contentParts[2],
              fontSize: fontSize1,
              x: 540,
              y: 800,
            });
            text3.alignCenter();
            text3.setStyle({ padding: [4, 20, 6, 20] });
            text3.setColor(titleColor);
            text3.setFont(selectedfonts);
            text3.addEffect("zoomInDown", 1.0, 2);
            scene3.addChild(text3);
          } else {
            const fontSize1 = parseInt(data.sceneData.textSize) + 25;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 540,
              y: 720,
            });
            scene3.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("zoomInDown", 1, 1.8);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene3.addChild(text);

            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 540,
              y: 780,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("zoomInDown", 1.0, 2);
            scene3.addChild(text2);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene3.addChild(watermark);
          }

          const scene3img = new FFImage({
            path: assetsPath + "cropped.jpg",
            x: 960,
          });
          scene3img.addAnimate({
            from: { y: 540 },
            to: { y: -2000 },
            time: 1.2,
            delay: 0.5,
            ease: "Cubic.InOut",
          });
          scene3.addChild(scene3img);
          scene3.setTransition("PolkaDotsCurtain", 0.5);
          scene3.setDuration(data.sceneData.time);
          creator.addChild(scene3);
          i++;
        } else if (templateBlock[i].sceneId == 43) {
          let data = templateBlock[i];
          const firstVideo = await videoTemplate43(data);
          console.log(firstVideo);
          let titleColor;
          if (data.sceneData.titleColor) {
            titleColor = data.sceneData.titleColor;
          } else {
            titleColor = data.sceneData.textColor;
          }
          let fontfamily = data.sceneData.fontFamily;
          let titlefontfamily = data.sceneData.titleFontFamily;
          let selectedfonts;
          let titlefonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
            if (font.family == titlefontfamily) {
              if (data.sceneData.titleFontWeight == "lighter") {
                titlefonts = font.lighter;
              } else if (data.sceneData.titleFontWeight == "normal") {
                titlefonts = font.file;
              } else if (data.sceneData.titleFontWeight == "bold") {
                titlefonts = font.bold;
              }
            }
          });
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var subtitleColor = data.sceneData.textColor;
          if (subtitleColor.length == "4") {
            subtitleColor = subtitleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }
          if (data.sceneData.titletextSize) {
            var titletextSize = data.sceneData.titletextSize;
          } else {
            var titletextSize = data.sceneData.textSize;
          }
          if (data.sceneData.textSize) {
            var textSize = data.sceneData.textSize;
          } else {
            var textSize = data.sceneData.textSize;
          }
          if (typeof data.sceneData.content[0].title == undefined) {
            var fieldTitle1 = "";
            var fieldText1 = "";
          } else {
            var fieldTitle1 = data.sceneData.content[0].title;
            var fieldText1 = data.sceneData.content[0].text;
          }
          if (data.sceneData.content[1] == undefined) {
            var fieldTitle2 = "";
            var fieldText2 = "";
          } else {
            var fieldTitle2 = data.sceneData.content[1].title;
            var fieldText2 = data.sceneData.content[1].text;
          }
          if (data.sceneData.content[2] == undefined) {
            var fieldTitle3 = "";
            var fieldText3 = "";
          } else {
            var fieldTitle3 = data.sceneData.content[2].title;
            var fieldText3 = data.sceneData.content[2].text;
          }
          if (data.sceneData.content[3] == undefined) {
            var fieldTitle4 = "";
            var fieldText4 = "";
          } else {
            var fieldTitle4 = data.sceneData.content[3].title;
            var fieldText4 = data.sceneData.content[3].text;
          }
          if (data.sceneData.content[4] != undefined) {
            var fieldTitle5 = data.sceneData.content[4].title;
            var fieldText5 = data.sceneData.content[4].text;
          } else {
            var fieldTitle5 = "";
            var fieldText5 = "";
          }

          const scene2 = new FFScene();
          scene2.setBgColor("#173c66");

          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img431.png",
            y: 540,
            width: 1200,
            height: 1080,
          });
          slide1.addAnimate({
            from: { x: 2960 },
            to: { x: 1340 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene2.addChild(slide1);

          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img432.png",
            y: 540,
            width: 1200,
            height: 1080,
          });
          slide2.addAnimate({
            from: { x: 2960 },
            to: { x: 1340 },
            time: 1,
            delay: 3,
            ease: "Cubic.InOut",
          });
          slide2.addEffect("zoomingIn", 3.5, 4);
          scene2.addChild(slide2);
          const slidebg = new FFImage({
            path: assetsPath + "bgblue.png",
            y: 540,
            x: 400,
          });
          scene2.addChild(slidebg);
          // slidebg.addAnimate({
          //   from: { x: -250 },
          //   to: { x: 250 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          // scene2.addChild(slidebg);
          const fontSize1 = parseInt(titletextSize) + 20;
          const fontSize2 = parseInt(textSize) + 20;
          if (fieldTitle1 != "") {
            const text1 = new FFText({
              text: fieldTitle1,
              fontSize: fontSize1,
              x: 150,
              y: 170,
            });
            text1.setColor(titleColor);
            text1.setFont(titlefonts);
            text1.addEffect("zoomInDown", 1, 0.5);
            scene2.addChild(text1);
          }
          if (fieldText1 != "") {
            const textField = new FFText({
              text: fieldText1,
              fontSize: fontSize1,
              x: 150,
              y: 220,
            });
            textField.setColor(subtitleColor);
            textField.setFont(selectedfonts);
            textField.addEffect("zoomInDown", 1, 0.5);
            scene2.addChild(textField);
          }
          if (fieldTitle2 != "") {
            const textTitle2 = new FFText({
              text: fieldTitle2,
              fontSize: fontSize1,
              x: 150,
              y: 320,
            });
            textTitle2.setColor(titleColor);
            textTitle2.setFont(titlefonts);
            textTitle2.addEffect("zoomInDown", 1, 0.7);
            scene2.addChild(textTitle2);
          }
          if (fieldText2 != "") {
            const textField2 = new FFText({
              text: fieldText2,
              fontSize: fontSize2,
              x: 150,
              y: 370,
            });
            textField2.setColor(subtitleColor);
            textField2.setFont(selectedfonts);
            textField2.addEffect("zoomInDown", 1, 0.7);
            scene2.addChild(textField2);
          }
          if (fieldTitle3 != "") {
            const text5 = new FFText({
              text: fieldTitle3,
              fontSize: fontSize1,
              x: 150,
              y: 470,
            });
            text5.setColor(titleColor);
            text5.setFont(titlefonts);
            text5.addEffect("zoomInDown", 1, 0.9);
            scene2.addChild(text5);
          }
          if (fieldText3) {
            const text6 = new FFText({
              text: fieldText3,
              fontSize: fontSize2,
              x: 150,
              y: 520,
            });
            text6.setColor(subtitleColor);
            text6.setFont(selectedfonts);
            text6.addEffect("zoomInDown", 1, 0.9);
            scene2.addChild(text6);
          }

          if (fieldTitle4) {
            const text7 = new FFText({
              text: fieldTitle4,
              fontSize: fontSize1,
              x: 150,
              y: 620,
            });
            text7.setColor(titleColor);
            text7.setFont(titlefonts);
            text7.addEffect("zoomInDown", 1, 1.1);
            scene2.addChild(text7);
          }
          if (fieldText4) {
            const text8 = new FFText({
              text: fieldText4,
              fontSize: fontSize2,
              x: 150,
              y: 670,
            });
            text8.setColor(subtitleColor);
            text8.setFont(selectedfonts);
            text8.addEffect("zoomInDown", 1, 1.1);
            scene2.addChild(text8);
          }

          if (fieldTitle5) {
            const text9 = new FFText({
              text: fieldTitle5,
              fontSize: fontSize1,
              x: 150,
              y: 770,
            });
            text9.setColor(titleColor);
            text9.setFont(titlefonts);
            text9.addEffect("zoomInDown", 1, 1.3);
            scene2.addChild(text9);
          }
          if (fieldText5) {
            const text10 = new FFText({
              text: fieldText5,
              fontSize: fontSize2,
              x: 150,
              y: 820,
            });
            text10.setColor(subtitleColor);
            text10.setFont(selectedfonts);
            text10.addEffect("zoomInDown", 1, 1.3);
            scene2.addChild(text10);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene2.addChild(watermark);
          }
          const fcloud1 = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud1.addAnimate({
            from: { x: 960 },
            to: { x: -1260 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene2.addChild(fcloud1);
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          scene2.setTransition("PolkaDotsCurtain", 1);
          i++;
        } else if (templateBlock[i].sceneId == 44) {
          let data = templateBlock[i];
          const sixVideo = await videoTemplate44(data);
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 15) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          const scene6 = new FFScene();
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img441.png",
            y: 460,
          });
          slide1.addAnimate({
            from: { x: -1960 },
            to: { x: -200 },
            time: 3,
            delay: 0.1,
            ease: "Cubic.InOut",
          });

          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(slide1);
          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img442.png",
            y: 460,
          });
          slide2.addAnimate({
            from: { x: -1960 },
            to: { x: 960 },
            time: 3,
            delay: 0.1,
            ease: "Cubic.InOut",
          });

          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(slide2);
          const slide3 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img443.png",
            y: 460,
          });
          slide3.addAnimate({
            from: { x: -1960 },
            to: { x: 2100 },
            time: 3,
            delay: 0.1,
            ease: "Cubic.InOut",
          });

          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(slide3);
          const fimg2 = new FFImage({
            path: assetsPath + "bluebg.png",
            y: 1040,
          });
          fimg2.addAnimate({
            from: { x: 2960 },
            to: { x: 960 },
            time: 1,
            delay: 0.5,
            ease: "Cubic.InOut",
          });

          scene6.addChild(fimg2);
          if (data.sceneData.textAligmnet == "text-center") {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 960,
              y: 940,
            });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.alignCenter();
            textOne.setStyle({ padding: [0, 20, 10, 20] });
            textOne.addEffect("zoomInDown", 1.5, 0.6);
            scene6.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 960,
                y: 1020,
              });
              textNext.alignCenter();
              textNext.setStyle({ padding: [0, 20, 10, 20] });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("zoomInDown", 1.5, 1.0);
              scene6.addChild(textNext);
            }
          } else {
            const fontSize1 = parseInt(data.sceneData.textSize) + 20;
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 80,
              y: 920,
            });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            // textOne.alignCenter();
            // textOne.setStyle({ padding: [0, 20, 10, 20] });
            textOne.addEffect("zoomInDown", 1.5, 0.6);
            scene6.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 80,
                y: 1000,
              });
              // textNext.alignCenter();
              // textNext.setStyle({ padding: [0, 20, 10, 20] });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("zoomInDown", 1.5, 1.0);
              scene6.addChild(textNext);
            }
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene6.addChild(watermark);
          }
          scene6.setBgColor("#7fb9dc");
          // scene6.setTransition("zoomInDown", 0.5);
          // scene5.addChild(fcloud2);
          scene6.setDuration(data.sceneData.time);
          scene6.setTransition("PolkaDotsCurtain", 0.5);
          creator.addChild(scene6);
          i++;
        } else if (templateBlock[i].sceneId == 45) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate45(data);

          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 15) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          if (data.sceneData.media[0].type == "image") {
            const scene4 = new FFScene();
            const fcloud2 = new FFImage({
              path: assetsPath + "gradient.png",
              x: 960,
              y: 540,
            });
            scene4.addChild(fcloud2);
            const image = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img451.png",
              x: 480,
            });
            image.addAnimate({
              from: { y: -650 },
              to: { y: 540 },
              time: 2,
              delay: 0,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image);
            const image2 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img452.png",
              x: 1440,
            });
            image2.addAnimate({
              from: { y: 1600 },
              to: { y: 540 },
              time: 2,
              delay: 0,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image2);
            scene4.setBgColor("#7fb9dc");
            const fimg2 = new FFImage({
              path: assetsPath + "bluebg.png",
              y: 1040,
            });
            fimg2.addAnimate({
              from: { x: 2960 },
              to: { x: 960 },
              time: 1,
              delay: 0.5,
              ease: "Cubic.InOut",
            });

            scene4.addChild(fimg2);
            if (data.sceneData.textAligmnet == "text-center") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 960,
                y: 940,
              });
              textOne.alignCenter();
              textOne.setStyle({ padding: [0, 20, 10, 20] });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.addEffect("zoomInDown", 1.5, 1.3);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 960,
                  y: 1020,
                });
                textNext.alignCenter();
                textNext.setStyle({ padding: [0, 20, 10, 20] });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("zoomInDown", 1.5, 1.5);
                scene4.addChild(textNext);
              }
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 100,
                y: 920,
              });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.addEffect("zoomInDown", 1.5, 1.3);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 100,
                  y: 1000,
                });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("zoomInDown", 1.5, 1.5);
                scene4.addChild(textNext);
              }
            }
            if (user.userPlan == 0) {
              const watermark = new FFImage({
                path: assetsPath + "reveoLogo.png",
                x: 1680,
                y: 50,
              });
              watermark.setOpacity(0.7);
              watermark.setScale(0.5);
              scene4.addChild(watermark);
            }
            // const fcloud3 = new FFImage({
            //   path: assetsPath + "cropped.jpg",
            //   x: 960,
            // });
            // fcloud3.addAnimate({
            //   from: { y: 1620 },
            //   to: { y: 540 },
            //   time: 1,
            //   delay: 6.5,
            //   ease: "Cubic.InOut",
            // });
            // scene4.addChild(fcloud3);
            scene4.setTransition("PolkaDotsCurtain", 0.5);
            scene4.setDuration(data.sceneData.time);
            creator.addChild(scene4);
          }
          i++;
        } else if (templateBlock[i].sceneId == 46) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate46(data);
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 15) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          if (data.sceneData.media[0].type == "image") {
            const scene4 = new FFScene();
            const image1 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img461.png",
              x: 960,
            });
            image1.addAnimate({
              from: { y: 3000 },
              to: { y: 540 },
              time: 3.0,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image1);
            scene4.setBgColor("#7fb9dc");
            const fimg2 = new FFImage({
              path: assetsPath + "bluebg.png",
              y: 1040,
            });
            fimg2.addAnimate({
              from: { x: 2960 },
              to: { x: 960 },
              time: 1,
              delay: 0.5,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fimg2);
            if (data.sceneData.textAligmnet == "text-center") {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 960,
                y: 940,
              });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.alignCenter();
              textOne.setStyle({ padding: [0, 20, 10, 20] });
              textOne.addEffect("zoomInDown", 1.5, 1.6);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 960,
                  y: 1020,
                });
                textNext.alignCenter();
                textNext.setStyle({ padding: [0, 20, 10, 20] });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("zoomInDown", 1.5, 1.8);
                scene4.addChild(textNext);
              }
            } else {
              const fontSize1 = parseInt(data.sceneData.textSize) + 20;
              let textOne = new FFText({
                text: text,
                fontSize: fontSize1,
                x: 100,
                y: 920,
              });
              textOne.setColor(titleColor);
              textOne.setFont(selectedfonts);
              textOne.addEffect("zoomInDown", 1.5, 1.6);
              scene4.addChild(textOne);
              if (text2 != "") {
                const textNext = new FFText({
                  text: text2,
                  fontSize: fontSize1,
                  x: 100,
                  y: 1000,
                });
                textNext.setColor(titleColor);
                textNext.setFont(selectedfonts);
                textNext.addEffect("zoomInDown", 1.5, 1.8);
                scene4.addChild(textNext);
              }
            }
            if (user.userPlan == 0) {
              const watermark = new FFImage({
                path: assetsPath + "reveoLogo.png",
                x: 1680,
                y: 50,
              });
              watermark.setOpacity(0.7);
              watermark.setScale(0.5);
              scene4.addChild(watermark);
            }
            const fcloud2 = new FFImage({
              path: assetsPath + "cropped.jpg",
              x: 960,
            });
            fcloud2.addAnimate({
              from: { y: 540 },
              to: { y: -600 },
              time: 1,
              delay: 0,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud2);
            scene4.setTransition("DoomScreenTransition", 0.5);
            scene4.setDuration(data.sceneData.time);
            creator.addChild(scene4);
          }
          i++;
        } else if (templateBlock[i].sceneId == 47) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate47(data);

          let fontfamily = data.sceneData.textArray[0].fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.textArray[0].fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.textArray[0].fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.textArray[0].fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          var titleColor = data.sceneData.textArray[0].fontColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          const scene4 = new FFScene();
          const content = data.sceneData.textArray[0].text;
          const contentParts = content.split("\n");
          // console.log(contentParts);
          const image2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img473.png",
            x: 1445,
            y: 540,
          });
          image2.addEffect("zoomingIn", 5.5, 0);
          scene4.addChild(image2);
          const whitebgscene1 = new FFImage({
            path: assetsPath + "scene10bg.jpg",
            y: 540,
            x: 475,
          });
          scene4.addChild(whitebgscene1);
          const image = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img471.png",
            y: 270,
          });
          image.addAnimate({
            from: { x: -1060 },
            to: { x: 475 },
            time: 1,
            delay: 0.8,
            ease: "Cubic.InOut",
          });
          scene4.addChild(image);
          const img3 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img472.png",

            y: 810,
          });
          img3.addAnimate({
            from: { x: -1060 },
            to: { x: 475 },
            time: 1,
            delay: 0.7,
            ease: "Cubic.InOut",
          });
          scene4.addChild(img3);
          const fimg1 = new FFImage({
            path: assetsPath + "graydark.png",

            y: 560,
          });
          fimg1.addAnimate({
            from: { x: -1060 },
            to: { x: 475 },
            time: 1,
            delay: 0.5,
            ease: "Cubic.InOut",
          });
          scene4.addChild(fimg1);
          if (contentParts[2] != undefined && contentParts[2] != "") {
            const fontSize1 =
              parseInt(data.sceneData.textArray[0].fontSize) + 15;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 460,
              y: 510,
            });
            scene4.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("backInLeft", 1, 1.3);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene4.addChild(text);

            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 460,
              y: 560,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("backInLeft", 1.0, 1.4);
            scene4.addChild(text2);

            const text3 = new FFText({
              text: contentParts[2],
              fontSize: fontSize1,
              x: 460,
              y: 610,
            });
            text3.alignCenter();
            text3.setStyle({ padding: [4, 20, 6, 20] });
            text3.setColor(titleColor);
            text3.setFont(selectedfonts);
            text3.addEffect("backInLeft", 1.0, 1.4);
            scene4.addChild(text3);
          } else {
            const fontSize1 =
              parseInt(data.sceneData.textArray[0].fontSize) + 15;
            const text = new FFText({
              text: contentParts[0],
              fontSize: fontSize1,
              x: 460,
              y: 515,
            });
            scene4.addChild(text);
            text.setColor(titleColor);
            text.setFont(selectedfonts);
            text.addEffect("backInLeft", 1, 1.3);
            text.alignCenter();
            text.setStyle({ padding: [0, 20, 10, 20] });
            scene4.addChild(text);
            const text2 = new FFText({
              text: contentParts[1],
              fontSize: fontSize1,
              x: 460,
              y: 575,
            });
            text2.alignCenter();
            text2.setStyle({ padding: [4, 20, 6, 20] });
            text2.setColor(titleColor);
            text2.setFont(selectedfonts);
            text2.addEffect("backInLeft", 1.0, 1.4);
            scene4.addChild(text2);
          }
          scene4.setBgColor("#fff");
          const fcloud2 = new FFImage({
            path: assetsPath + "cropped.jpg",
            x: 960,
          });
          fcloud2.addAnimate({
            from: { y: 540 },
            to: { y: -600 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          scene4.addChild(fcloud2);
          scene4.setTransition("squareswire", 0.5);
          scene4.setDuration(data.sceneData.time);
          creator.addChild(scene4);
          i++;
        } else if (templateBlock[i].sceneId == 48) {
          console.log("firstVideo");
          let data = templateBlock[i];
          const firstVideo = await videoTemplate48(data);
          console.log(firstVideo);
          let titleColor;
          if (data.sceneData.titleColor) {
            titleColor = data.sceneData.titleColor;
          } else {
            titleColor = data.sceneData.textColor;
          }
          let fontfamily = data.sceneData.fontFamily;
          let titlefontfamily = data.sceneData.titleFontFamily;
          let selectedfonts;
          let titlefonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
            if (font.family == titlefontfamily) {
              if (data.sceneData.titleFontWeight == "lighter") {
                titlefonts = font.lighter;
              } else if (data.sceneData.titleFontWeight == "normal") {
                titlefonts = font.file;
              } else if (data.sceneData.titleFontWeight == "bold") {
                titlefonts = font.bold;
              }
            }
          });
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var subtitleColor = data.sceneData.textColor;
          if (subtitleColor.length == "4") {
            subtitleColor = subtitleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }
          if (data.sceneData.titletextSize) {
            var titletextSize = data.sceneData.titletextSize;
          } else {
            var titletextSize = data.sceneData.textSize;
          }
          if (data.sceneData.textSize) {
            var textSize = data.sceneData.textSize;
          } else {
            var textSize = data.sceneData.textSize;
          }
          if (typeof data.sceneData.content[0].title == undefined) {
            var fieldTitle1 = "";
            var fieldText1 = "";
          } else {
            var fieldTitle1 = data.sceneData.content[0].title;
            var fieldText1 = data.sceneData.content[0].text;
          }
          if (data.sceneData.content[1] == undefined) {
            var fieldTitle2 = "";
            var fieldText2 = "";
          } else {
            var fieldTitle2 = data.sceneData.content[1].title;
            var fieldText2 = data.sceneData.content[1].text;
          }
          if (data.sceneData.content[2] == undefined) {
            var fieldTitle3 = "";
            var fieldText3 = "";
          } else {
            var fieldTitle3 = data.sceneData.content[2].title;
            var fieldText3 = data.sceneData.content[2].text;
          }
          if (data.sceneData.content[3] == undefined) {
            var fieldTitle4 = "";
            var fieldText4 = "";
          } else {
            var fieldTitle4 = data.sceneData.content[3].title;
            var fieldText4 = data.sceneData.content[3].text;
          }
          if (data.sceneData.content[4] != undefined) {
            var fieldTitle5 = data.sceneData.content[4].title;
            var fieldText5 = data.sceneData.content[4].text;
          } else {
            var fieldTitle5 = "";
            var fieldText5 = "";
          }

          const scene2 = new FFScene();
          scene2.setBgColor("#697784");
          // scene2.setBgColor("#fff");
          // add bottom cloud
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img481.png",
            y: 540,
          });
          slide1.addAnimate({
            from: { x: -960 },
            to: { x: 680 },
            time: 1,
            delay: 0,
            ease: "Cubic.InOut",
          });
          slide1.addEffect("zoomingIn", 3.5, 1);
          scene2.addChild(slide1);

          const slide2 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img482.png",
            y: 540,
          });
          slide2.addAnimate({
            from: { x: -960 },
            to: { x: 680 },
            time: 1,
            delay: 3,
            ease: "Cubic.InOut",
          });
          slide2.addEffect("zoomingIn", 3.5, 4);
          scene2.addChild(slide2);
          const slidebg1 = new FFImage({
            path: assetsPath + "graydark2.png",
            y: 540,
            x: -80,
          });
          scene2.addChild(slide2);
          const slidebg3 = new FFImage({
            path: assetsPath + "graydrakbgh.png",
            y: -50,
            x: 960,
          });
          slidebg3.setScale(2);
          scene2.addChild(slidebg3);
          const slidebg4 = new FFImage({
            path: assetsPath + "graydrakbgh.png",
            y: 1130,
            x: 960,
          });
          slidebg4.setScale(2);
          scene2.addChild(slidebg4);
          scene2.addChild(slidebg1);
          const slidebg = new FFImage({
            path: assetsPath + "graydark2.png",
            y: 540,
            x: 1620,
          });
          // slidebg.addAnimate({
          //   from: { x: -250 },
          //   to: { x: 250 },
          //   time: 1,
          //   delay: 0.1,
          //   ease: "Cubic.InOut",
          // });
          scene2.addChild(slidebg);
          const fontSize1 = parseInt(titletextSize) + 20;
          const fontSize2 = parseInt(textSize) + 20;
          if (fieldTitle1 != "") {
            const text1 = new FFText({
              text: fieldTitle1,
              fontSize: fontSize1,
              x: 1540,
              y: 170,
            });
            text1.setColor(titleColor);
            text1.setFont(titlefonts);
            text1.addEffect("backInLeft", 1, 0.5);
            scene2.addChild(text1);
          }
          if (fieldText1 != "") {
            const textField = new FFText({
              text: fieldText1,
              fontSize: fontSize1,
              x: 1540,
              y: 220,
            });
            textField.setColor(subtitleColor);
            textField.setFont(selectedfonts);
            textField.addEffect("backInLeft", 1, 0.5);
            scene2.addChild(textField);
          }
          if (fieldTitle2 != "") {
            const textTitle2 = new FFText({
              text: fieldTitle2,
              fontSize: fontSize1,
              x: 1540,
              y: 320,
            });
            textTitle2.setColor(titleColor);
            textTitle2.setFont(titlefonts);
            textTitle2.addEffect("backInLeft", 1, 0.7);
            scene2.addChild(textTitle2);
          }
          if (fieldText2 != "") {
            const textField2 = new FFText({
              text: fieldText2,
              fontSize: fontSize2,
              x: 1540,
              y: 370,
            });
            textField2.setColor(subtitleColor);
            textField2.setFont(selectedfonts);
            textField2.addEffect("backInLeft", 1, 0.7);
            scene2.addChild(textField2);
          }
          if (fieldTitle3 != "") {
            const text5 = new FFText({
              text: fieldTitle3,
              fontSize: fontSize1,
              x: 1540,
              y: 470,
            });
            text5.setColor(titleColor);
            text5.setFont(titlefonts);
            text5.addEffect("backInLeft", 1, 0.9);
            scene2.addChild(text5);
          }
          if (fieldText3) {
            const text6 = new FFText({
              text: fieldText3,
              fontSize: fontSize2,
              x: 1540,
              y: 520,
            });
            text6.setColor(subtitleColor);
            text6.setFont(selectedfonts);
            text6.addEffect("backInLeft", 1, 0.9);
            scene2.addChild(text6);
          }

          if (fieldTitle4) {
            const text7 = new FFText({
              text: fieldTitle4,
              fontSize: fontSize1,
              x: 1540,
              y: 620,
            });
            text7.setColor(titleColor);
            text7.setFont(titlefonts);
            text7.addEffect("backInLeft", 1, 1.1);
            scene2.addChild(text7);
          }
          if (fieldText4) {
            const text8 = new FFText({
              text: fieldText4,
              fontSize: fontSize2,
              x: 1540,
              y: 670,
            });
            text8.setColor(subtitleColor);
            text8.setFont(selectedfonts);
            text8.addEffect("backInLeft", 1, 1.1);
            scene2.addChild(text8);
          }

          if (fieldTitle5) {
            const text9 = new FFText({
              text: fieldTitle5,
              fontSize: fontSize1,
              x: 1540,
              y: 770,
            });
            text9.setColor(titleColor);
            text9.setFont(titlefonts);
            text9.addEffect("backInLeft", 1, 1.3);
            scene2.addChild(text9);
          }
          if (fieldText5) {
            const text10 = new FFText({
              text: fieldText5,
              fontSize: fontSize2,
              x: 1540,
              y: 820,
            });
            text10.setColor(subtitleColor);
            text10.setFont(selectedfonts);
            text10.addEffect("backInLeft", 1, 1.3);
            scene2.addChild(text10);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene2.addChild(watermark);
          }
          scene2.setDuration(data.sceneData.time);
          creator.addChild(scene2);
          scene2.setTransition("PolkaDotsCurtain", 0.5);
          i++;
        } else if (templateBlock[i].sceneId == 49) {
          let data = templateBlock[i];
          const sixVideo = await videoTemplate49(data);
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 12) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          const scene6 = new FFScene();

          const fimg1 = new FFImage({
            path: assetsPath + "whitescenegallery.jpg",
            y: 470,
            x: 990,
            width: 1368,
            height: 768,
          });
          fimg1.addAnimate({
            from: { x: 960, y: 550 },
            to: { x: 930, y: 570 },
            time: 4.5,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          fimg1.setOpacity(0.8);
          scene6.addChild(fimg1);
          const slide1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-img491.png",
            y: 550,
            width: 1368,
            height: 768,
          });
          slide1.addAnimate({
            from: { x: 960 },
            to: { x: 900 },
            time: 4.5,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          const fcloudgray = new FFImage({
            path: assetsPath + "graybglight3.png",
            y: 150,
          });
          fcloudgray.addAnimate({
            from: { x: -960 },
            to: { x: 650 },
            time: 1,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          // slide1.addEffect("zoomingIn", 3.5, 1);
          scene6.addChild(slide1);
          scene6.addChild(fcloudgray);
          const fontSize1 = parseInt(data.sceneData.textSize) + 15;
          if (text2 != "") {
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 150,
              y: 80,
            });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.setStyle({ padding: 10 });
            textOne.addEffect("backInLeft", 1.5, 0.6);
            scene6.addChild(textOne);
            const textNext = new FFText({
              text: text2,
              fontSize: fontSize1,
              x: 150,
              y: 140,
            });
            textNext.setStyle({ padding: 10 });
            textNext.setColor(titleColor);
            textNext.setFont(selectedfonts);
            textNext.addEffect("backInLeft", 1.5, 1.0);
            scene6.addChild(textNext);
          } else {
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 150,
              y: 100,
            });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.setStyle({ padding: 10 });
            textOne.addEffect("backInLeft", 1.5, 0.6);
            scene6.addChild(textOne);
          }
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            scene6.addChild(watermark);
          }
          scene6.setBgColor("#697784");
          scene6.setTransition("PolkaDotsCurtain", 0.5);
          scene6.setDuration(data.sceneData.time);
          creator.addChild(scene6);
          i++;
        } else if (templateBlock[i].sceneId == 50) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate50(data);
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          var result = data.sceneData.content.split(" ");
          var text = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 7) {
              text2 = text2 + result[j] + " ";
            } else {
              text = text + result[j] + " ";
            }
          }
          let fontfamily = data.sceneData.fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          if (data.sceneData.media[0].type == "image") {
            const scene4 = new FFScene();
            const image = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img501.png",
              y: 540,
            });
            image.addAnimate({
              from: { x: 350 },
              to: { x: 620 },
              time: 3.5,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image);
            const image2 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img502.png",
              y: 540,
            });
            image2.addAnimate({
              from: { x: 1620 },
              to: { x: 1560 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(image2);
            scene4.setBgColor("#697784");
            const fimg1 = new FFImage({
              path: assetsPath + "grabgddark3.png",
              x: 1400,
            });
            fimg1.addAnimate({
              from: { y: 1720 },
              to: { y: 950 },
              time: 0.6,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fimg1);

            const fontSize1 = parseInt(data.sceneData.textSize) + 15;
            let textOne = new FFText({
              text: text,
              fontSize: fontSize1,
              x: 1000,
              y: 895,
            });
            textOne.setColor(titleColor);
            textOne.setFont(selectedfonts);
            textOne.addEffect("backInRight", 1.5, 0.6);
            scene4.addChild(textOne);
            if (text2 != "") {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 1000,
                y: 950,
              });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("backInRight", 1.5, 1.0);
              scene4.addChild(textNext);
            }
            if (user.userPlan == 0) {
              const watermark = new FFImage({
                path: assetsPath + "reveoLogo.png",
                x: 1680,
                y: 50,
              });
              watermark.setOpacity(0.7);
              watermark.setScale(0.5);
              scene4.addChild(watermark);
            }
            scene4.setTransition("squareswire", 0.5);
            scene4.setDuration(data.sceneData.time);
            creator.addChild(scene4);
          }
          i++;
        } else if (templateBlock[i].sceneId == 51) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate51(data);

          var result = data.sceneData.textArray[0].text.split(" ");
          let fontfamily = data.sceneData.textArray[0].fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.textArray[0].fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.textArray[0].fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.textArray[0].fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          var titleColor = data.sceneData.textArray[0].fontColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }

          let result2 = data.sceneData.textArray[1].text.split(" ");
          let fontfamily2 = data.sceneData.textArray[1].fontFamily;
          let selectedfonts2;
          fonts.map(function (font) {
            if (font.family == fontfamily2) {
              if (data.sceneData.textArray[1].fontWeight == "lighter") {
                selectedfonts2 = font.lighter;
              } else if (data.sceneData.textArray[1].fontWeight == "normal") {
                selectedfonts2 = font.file;
              } else if (data.sceneData.textArray[1].fontWeight == "bold") {
                selectedfonts2 = font.bold;
              }
            }
          });
          var titleColor2 = data.sceneData.textArray[1].fontColor;
          if (titleColor2.length == "4") {
            titleColor2 = titleColor2.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }

          if (data.sceneData.media[0].type == "image") {
            const scene51 = new FFScene();
            scene51.setBgColor("#fff");



            const image5 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img513.png",
              y: 545,
            });
            image5.addAnimate({
              from: { x: -1600 },
              to: { x: 1043 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image5);
            const image6 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img514.png",
              y: 545,
            });
            image6.addAnimate({
              from: { x: 2600 },
              to: { x: 1707 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image6);

            const image = new FFImage({
              path: assetsPath + "Darkbluebg.png",
              y: 540,
            });
            image.addAnimate({
              from: { x: -960 },
              to: { x: 300 },
              time: 1.5,
              delay: 0.1,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image);
            const image2 = new FFImage({
              path: assetsPath + "lgt-greens.png",
              x: 300,
            });
            image2.addAnimate({
              from: { y: 1560 },
              to: { y: 950 },
              time: 1.5,
              delay: 0.5,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image2);
            const imageHome = new FFImage({
              path: assetsPath + "home-con.png",
              x: 300,
            });
            imageHome.addAnimate({
              from: { y: -500 },
              to: { y: 200 },
              time: 1.5,
              delay: 0.5,
              ease: "Cubic.InOut",
            });
            scene51.addChild(imageHome);
            const imagepent1 = new FFImage({
              path: assetsPath + "pentagon.png",
              x: 550,
              height: 150,
              width: 150
            });
            imagepent1.addAnimate({
              from: { y: -400 },
              to: { y: 150 },
              time: 1.5,
              delay: 1.5,
              ease: "Cubic.InOut",
            });
            imagepent1.setOpacity(0.3);
            scene51.addChild(imagepent1);
            const imagepent2 = new FFImage({
              path: assetsPath + "pentagon.png",
              y: 250,
              height: 100,
              width: 100
            });
            imagepent2.addAnimate({
              from: { x: -560 },
              to: { x: 30 },
              time: 1.5,
              delay: 1.5,
              ease: "Cubic.InOut",
            });
            imagepent2.setOpacity(0.3);
            scene51.addChild(imagepent2);
            const image3 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img511.png",
              x: 930,
            });
            image3.addAnimate({
              from: { y: -300 },
              to: { y: 180 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image3);
            const image4 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img512.png",
              y: 180,
            });
            image4.addAnimate({
              from: { x: 2600 },
              to: { x: 1700 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image4);

            const image7 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img515.png",
              x: 825,
            });
            image7.addAnimate({
              from: { y: 1600 },
              to: { y: 910 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image7);
            const image8 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img516.png",
              y: 910,
            });
            image8.addAnimate({
              from: { x: 3200 },
              to: { x: 1490 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image8);
            const fontSize1 = parseInt(data.sceneData.textArray[0].fontSize) + 35;
            const textNext = new FFText({
              text: result[0],
              fontSize: fontSize1,
              x: 280,
              y: 530,
            });
            textNext.alignCenter();
            textNext.setStyle({ padding: [4, 20, 6, 20] });
            textNext.setColor(titleColor);
            textNext.setFont(selectedfonts);
            textNext.addEffect("backInLeft", 1.5, 1.0);
            scene51.addChild(textNext);

            const textNext2 = new FFText({
              text: result[1],
              fontSize: fontSize1,
              x: 280,
              y: 630,
            });
            textNext2.setColor(titleColor);
            textNext2.setFont(selectedfonts);
            textNext2.alignCenter();
            textNext2.setStyle({ padding: [4, 20, 6, 20] });
            textNext2.addEffect("backInLeft", 1.5, 1.0);
            scene51.addChild(textNext2);
            const fontSize2 = parseInt(data.sceneData.textArray[1].fontSize) + 25;
            const textNext3 = new FFText({
              text: result2[0],
              fontSize: fontSize2,
              x: 280,
              y: 950,
            });
            textNext3.setColor(titleColor2);
            textNext3.setFont(selectedfonts2);
            textNext3.alignCenter();
            textNext3.setStyle({ padding: [4, 20, 6, 20] });
            textNext3.addEffect("backInLeft", 1.5, 1.0);
            scene51.addChild(textNext3);
            scene51.setTransition("squareswire", 0.5);
            scene51.setDuration(data.sceneData.time);
            creator.addChild(scene51);
            console.log('data.sceneData 1')
          }
          i++;
        }
        else if (templateBlock[i].sceneId == 52) {
          console.log('here 52')
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate52(data);
          var result = data.sceneData.textArray[0].text.split(" ");
          let fontfamily = data.sceneData.textArray[0].fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.textArray[0].fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.textArray[0].fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.textArray[0].fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          var titleColor = data.sceneData.textArray[0].fontColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }

          let result2 = data.sceneData.textArray[1].text.split(" ");
          let fontfamily2 = data.sceneData.textArray[1].fontFamily;
          let selectedfonts2;
          fonts.map(function (font) {
            if (font.family == fontfamily2) {
              if (data.sceneData.textArray[1].fontWeight == "lighter") {
                selectedfonts2 = font.lighter;
              } else if (data.sceneData.textArray[1].fontWeight == "normal") {
                selectedfonts2 = font.file;
              } else if (data.sceneData.textArray[1].fontWeight == "bold") {
                selectedfonts2 = font.bold;
              }
            }
          });
          var titleColor2 = data.sceneData.textArray[1].fontColor;
          if (titleColor2.length == "4") {
            titleColor2 = titleColor2.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }

          if (data.sceneData.media[0].type == "image") {
            const scene51 = new FFScene();
            scene51.setBgColor("#fff");
            console.log(selectedfonts)
            console.log('data.sceneData')


            const image5 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img521.png",
              y: 435,
            });
            image5.addAnimate({
              from: { x: -1600 },
              to: { x: 473 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image5);
            const image6 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img522.png",
              y: 435,
            });
            image6.addAnimate({
              from: { x: 2600 },
              to: { x: 1440 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image6);

            const image = new FFImage({
              path: assetsPath + "bgdark.png",
              y: 45,
            });
            image.addAnimate({
              from: { x: -960 },
              to: { x: 960 },
              time: 1.5,
              delay: 0.1,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image);
            const image2 = new FFImage({
              path: assetsPath + "bggreenlight.png",
              y: 45,
            });
            image2.addAnimate({
              from: { x: 2600 },
              to: { x: 1600 },
              time: 1.5,
              delay: 0.5,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image2);

            const image3 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img523.png",
              x: 473,
            });
            image3.addAnimate({
              from: { y: 2600 },
              to: { y: 880 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image3);
            const image4 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img524.png",
              x: 1440,
            });
            image4.addAnimate({
              from: { y: 2600 },
              to: { y: 880 },
              time: 3,
              delay: 0.4,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image4);


            const fontSize1 = parseInt(data.sceneData.textArray[0].fontSize) + 35;
            const textNext = new FFText({
              text: data.sceneData.textArray[0].text,
              fontSize: fontSize1,
              x: 600,
              y: 120,
            });
            textNext.alignCenter();
            textNext.setStyle({ padding: [4, 20, 6, 20] });
            textNext.setColor(titleColor);
            textNext.addEffect("backInLeft", 1.5, 1.0);
            textNext.setFont(selectedfonts);
            scene51.addChild(textNext);
            const fontSize2 = parseInt(data.sceneData.textArray[1].fontSize) + 25;
            const textNext3 = new FFText({
              text: data.sceneData.textArray[1].text,
              fontSize: fontSize2,
              x: 1550,
              y: 120,
            });
            textNext3.setColor(titleColor2);
            textNext3.setFont(selectedfonts2);
            textNext3.alignCenter();
            textNext3.setStyle({ padding: [4, 20, 6, 20] });
            textNext3.addEffect("backInRight", 1.5, 1.0);
            scene51.addChild(textNext3);
            scene51.setTransition("squareswire", 0.5);
            scene51.setDuration(data.sceneData.time);
            creator.addChild(scene51);
            console.log('data.sceneData 52')
          }
          i++;
        }
        else if (templateBlock[i].sceneId == 53) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate53(data);
          var result = data.sceneData.textArray[0].text.split(" ");
          let fontfamily = data.sceneData.textArray[0].fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.textArray[0].fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.textArray[0].fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.textArray[0].fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          var titleColor = data.sceneData.textArray[0].fontColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }

          if (data.sceneData.media[0].type == "image") {
            const scene51 = new FFScene();
            scene51.setBgColor("#fff");
            console.log(selectedfonts)
            console.log('data.sceneData')




            const image = new FFImage({
              path: assetsPath + "Darkbluebg2.png",
              x: 960,
            });
            image.addAnimate({
              from: { y: 2600 },
              to: { y: 540 },
              time: 1.5,
              delay: 0.1,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image);
            const imagepent1 = new FFImage({
              path: assetsPath + "pentagon.png",
              y: 540,
              height: 100,
              width: 100
            });
            imagepent1.addAnimate({
              from: { x: -2600 },
              to: { x: 820 },
              time: 1.5,
              delay: 1.5,
              ease: "Cubic.InOut",
            });

            imagepent1.setOpacity(0.3);
            scene51.addChild(imagepent1);
            const imagepent2 = new FFImage({
              path: assetsPath + "pentagon.png",
              y: 150,
              height: 150,
              width: 150
            });
            imagepent2.addAnimate({
              from: { x: 2600 },
              to: { x: 1100 },
              time: 1.5,
              delay: 1.5,
              ease: "Cubic.InOut",
            });
            imagepent2.setRotate(-40)
            imagepent2.setOpacity(0.3);
            scene51.addChild(imagepent2);

            const imagepent3 = new FFImage({
              path: assetsPath + "pentagon.png",
              x: 960,
              height: 100,
              width: 100
            });
            imagepent3.addAnimate({
              from: { y: 1200 },
              to: { y: 1060 },
              time: 1.5,
              delay: 1.5,
              ease: "Cubic.InOut",
            });
            imagepent3.setRotate(96)
            imagepent3.setOpacity(0.3);
            scene51.addChild(imagepent3);

            const fontSize1 = parseInt(data.sceneData.textArray[0].fontSize) + 20;
            console.log(result[0])
            console.log('result[0]')
            const textNext = new FFText({
              text: result[0],
              fontSize: fontSize1,
              x: 960,
              y: 450,
            });
            textNext.alignCenter();
            textNext.setStyle({ padding: [4, 20, 6, 20] });
            textNext.setColor(titleColor);
            textNext.setFont(selectedfonts);
            textNext.addEffect("backInUp", 1.5, 1.0);
            scene51.addChild(textNext);
            console.log(result[1])
            console.log('result[1]')
            const textNext1 = new FFText({
              text: result[1],
              fontSize: fontSize1,
              x: 960,
              y: 530,
            });
            textNext1.alignCenter();
            textNext1.setStyle({ padding: [4, 20, 6, 20] });
            textNext1.setColor(titleColor);
            textNext1.setFont(selectedfonts);
            textNext1.addEffect("backInUp", 1.5, 1.0);
            scene51.addChild(textNext1);
            console.log(result[2])
            console.log('result[2]')
            if (result[2] !== undefined) {
              const textNext1 = new FFText({
                text: result[2],
                fontSize: fontSize1,
                x: 960,
                y: 610,
              });
              textNext1.alignCenter();
              textNext1.setStyle({ padding: [4, 20, 6, 20] });
              textNext1.setColor(titleColor);
              textNext1.setFont(selectedfonts);
              textNext1.addEffect("backInUp", 1.5, 1.0);
              scene51.addChild(textNext1);
            }
            console.log(result[3])
            console.log('result[3]')
            if (result[3] !== undefined) {
              const textNext1 = new FFText({
                text: result[3],
                fontSize: fontSize1,
                x: 960,
                y: 690,
              });
              textNext1.alignCenter();
              textNext1.setStyle({ padding: [4, 20, 6, 20] });
              textNext1.setColor(titleColor);
              textNext1.setFont(selectedfonts);
              textNext1.addEffect("backInUp", 1.5, 1.0);
              scene51.addChild(textNext1);
            }
            if (result[4] !== undefined) {
              const textNext1 = new FFText({
                text: result[4],
                fontSize: fontSize1,
                x: 960,
                y: 770,
              });
              textNext1.alignCenter();
              textNext1.setStyle({ padding: [4, 20, 6, 20] });
              textNext1.setColor(titleColor);
              textNext1.setFont(selectedfonts);
              textNext1.addEffect("backInUp", 1.5, 1.0);
              scene51.addChild(textNext1);
            }

            const image5 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img531.png",
              x: 395,
            });
            image5.addAnimate({
              from: { y: -1600 },
              to: { y: 540 },
              time: 3,
              delay: 0.1,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image5);
            const image6 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img532.png",
              x: 1525,
            });
            image6.addAnimate({
              from: { y: -1600 },
              to: { y: 540 },
              time: 3,
              delay: 0.0,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image6);
            scene51.setTransition("squareswire", 0.5);
            scene51.setDuration(data.sceneData.time);
            creator.addChild(scene51);
            console.log('data.sceneData 53')
          }
          i++;
        }
        else if (templateBlock[i].sceneId == 54) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate54(data);
          var result = data.sceneData.textArray[0].text.split(" ");
          let fontfamily = data.sceneData.textArray[0].fontFamily;
          let selectedfonts;
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.textArray[0].fontWeight == "lighter") {
                selectedfonts = font.lighter;
              } else if (data.sceneData.textArray[0].fontWeight == "normal") {
                selectedfonts = font.file;
              } else if (data.sceneData.textArray[0].fontWeight == "bold") {
                selectedfonts = font.bold;
              }
            }
          });
          var titleColor = data.sceneData.textArray[0].fontColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }

          var text1 = "";
          var text2 = "";
          for (var j = 0; j < result.length; j++) {
            if (j >= 2) {
              text2 = text2 + result[j] + " ";
            } else {
              text1 = text1 + result[j] + " ";
            }
          }
          let result2 = data.sceneData.textArray[1].text.split(" ");
          let fontfamily2 = data.sceneData.textArray[1].fontFamily;
          let selectedfonts2;
          fonts.map(function (font) {
            if (font.family == fontfamily2) {
              if (data.sceneData.textArray[1].fontWeight == "lighter") {
                selectedfonts2 = font.lighter;
              } else if (data.sceneData.textArray[1].fontWeight == "normal") {
                selectedfonts2 = font.file;
              } else if (data.sceneData.textArray[1].fontWeight == "bold") {
                selectedfonts2 = font.bold;
              }
            }
          });

          var titleColor2 = data.sceneData.textArray[1].fontColor;
          console.log('here2')
          console.log(titleColor2)
          if (titleColor2.length == "4") {
            titleColor2 = titleColor2.split("").map((item) => {
              if (item == "#") { return item }
              return item + item;
            }).join("")
          }
          console.log(titleColor2)
          console.log('here2')
          console.log(data.sceneData)

          if (data.sceneData.media[0].type == "image") {
            const scene51 = new FFScene();
            scene51.setBgColor("#fff");


            const image5 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img541.png",
              x: 345,
            });
            image5.addAnimate({
              from: { y: -1600 },
              to: { y: 340 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image5);
            const image6 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img542.png",
              x: 345,
            });
            image6.addAnimate({
              from: { y: 2600 },
              to: { y: 885 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image6);

            const image = new FFImage({
              path: assetsPath + "Darkbluebg.png",
              y: 540,
            });
            image.addAnimate({
              from: { x: 2600 },
              to: { x: 1680 },
              time: 1.5,
              delay: 0.1,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image);
            const image2 = new FFImage({
              path: assetsPath + "lgt-greens.png",
              x: 1682,
            });
            image2.addAnimate({
              from: { y: 1560 },
              to: { y: 950 },
              time: 1.5,
              delay: 0.5,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image2);
            const imageHome = new FFImage({
              path: assetsPath + "home-con.png",
              x: 1640,
            });
            imageHome.addAnimate({
              from: { y: -500 },
              to: { y: 200 },
              time: 1.5,
              delay: 0.5,
              ease: "Cubic.InOut",
            });
            scene51.addChild(imageHome);
            const imagepent1 = new FFImage({
              path: assetsPath + "pentagon.png",
              y: 250,
              height: 120,
              width: 120
            });
            imagepent1.addAnimate({
              from: { x: -2600 },
              to: { x: 1400 },
              time: 1.5,
              delay: 1.5,
              ease: "Cubic.InOut",
            });

            imagepent1.setOpacity(0.3);
            scene51.addChild(imagepent1);
            const image3 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img543.png",
              x: 1035,
            });
            image3.addAnimate({
              from: { y: 2600 },
              to: { y: 192 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image3);
            const image4 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img544.png",
              x: 1035,
            });
            image4.addAnimate({
              from: { y: 2600 },
              to: { y: 740 },
              time: 3,
              delay: 0.4,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image4);

            const imagepent2 = new FFImage({
              path: assetsPath + "pentagon.png",
              y: 150,
              height: 150,
              width: 150
            });
            imagepent2.addAnimate({
              from: { x: 2600 },
              to: { x: 1900 },
              time: 1.5,
              delay: 1.5,
              ease: "Cubic.InOut",
            });
            imagepent2.setOpacity(0.3);
            scene51.addChild(imagepent2);


            const fontSize1 = parseInt(data.sceneData.textArray[0].fontSize) + 25;
            const textNext = new FFText({
              text: text1,
              fontSize: fontSize1,
              x: 1650,
              y: 560,
            });
            textNext.alignCenter();
            textNext.setStyle({ padding: [4, 20, 6, 20] });
            textNext.setColor(titleColor);
            textNext.setFont(selectedfonts);
            textNext.addEffect("backInRight", 1.5, 1.0);
            scene51.addChild(textNext);
            if (text2 != '') {
              const textNext = new FFText({
                text: text2,
                fontSize: fontSize1,
                x: 1650,
                y: 650,
              });
              textNext.alignCenter();
              textNext.setStyle({ padding: [4, 20, 6, 20] });
              textNext.setColor(titleColor);
              textNext.setFont(selectedfonts);
              textNext.addEffect("backInRight", 1.5, 1.0);
              scene51.addChild(textNext);
            }

            const fontSize2 = parseInt(data.sceneData.textArray[1].fontSize) + 25;
            const textNext3 = new FFText({
              text: data.sceneData.textArray[1].text,
              fontSize: fontSize2,
              x: 1650,
              y: 950,
            });
            textNext3.setColor(titleColor2);
            textNext3.setFont(selectedfonts2);
            textNext3.alignCenter();
            textNext3.setStyle({ padding: [4, 20, 6, 20] });
            textNext3.addEffect("backInRight", 1.5, 1.0);
            scene51.addChild(textNext3);
            scene51.setTransition("squareswire", 0.5);
            scene51.setDuration(data.sceneData.time);
            creator.addChild(scene51);
            console.log('data.sceneData 54')
          }
          i++;
        }
        else if (templateBlock[i].sceneId == 'last2') {
          let data = templateBlock[i];
          console.log('data');
          const lastVideo = await videoTemplateLast2(data);
          if (data.sceneData.textArray[0] != undefined) {
            var titleColor1 = data.sceneData.textArray[0].fontColor;
            let fontfamily = data.sceneData.textArray[0].fontFamily;
            var fontSize1 = parseFloat(data.sceneData.textArray[0].fontSize) + 15;
            var selectedfonts1 = "";
            fonts.map(function (font) {
              if (font.family == fontfamily) {
                if (data.sceneData.textArray[0].fontWeight == "lighter") {
                  selectedfonts1 = font.lighter;
                } else if (data.sceneData.textArray[0].fontWeight == "normal") {
                  selectedfonts1 = font.file;
                } else if (data.sceneData.textArray[0].fontWeight == "bold") {
                  selectedfonts1 = font.bold;
                }
              }
            });
            if (titleColor1.length == "4") {
              var $hex = titleColor1;
              titleColor1 =
                "#" + $hex[1] + $hex[1] + $hex[2] + $hex[2] + $hex[3] + $hex[3];
            }
            var fieldText1 = data.sceneData.textArray[0].text;
            if (selectedfonts1 == "") {
              selectedfonts1 = fonts[0].file;
            }
          } else {
            var fieldText1 = "";
            var titleColor1 = "#00000";
            var selectedfonts1 = fonts[0].file;
            var fontSize1 = "20";
          }
          console.log('data1');
          if (data.sceneData.textArray[1] != undefined) {
            var fieldText2 = data.sceneData.textArray[1].text;
            var titleColor2 = data.sceneData.textArray[1].fontColor;
            let fontfamily = data.sceneData.textArray[1].fontFamily;
            var fontSize2 = parseFloat(data.sceneData.textArray[1].fontSize) + 15;
            var selectedfonts2 = "";
            fonts.map(function (font) {
              if (font.family == fontfamily) {
                if (data.sceneData.textArray[1].fontWeight == "lighter") {
                  selectedfonts2 = font.lighter;
                } else if (data.sceneData.textArray[1].fontWeight == "normal") {
                  selectedfonts2 = font.file;
                } else if (data.sceneData.textArray[1].fontWeight == "bold") {
                  selectedfonts2 = font.bold;
                }
              }
            });
            if (titleColor2.length == "4") {
              var $hex = titleColor2;
              titleColor2 =
                "#" + $hex[1] + $hex[1] + $hex[2] + $hex[2] + $hex[3] + $hex[3];
            }
            if (selectedfonts2 == "") {
              selectedfonts2 = fonts[0].file;
            }
          } else {
            var fieldText2 = "";
            var titleColor2 = "#00000";
            var selectedfonts2 = fonts[0].file;
            let fontSize2 = "20";
          }
          if (data.sceneData.textArray[2] != undefined) {
            var fieldText3 = data.sceneData.textArray[2].text;
            var titleColor3 = data.sceneData.textArray[2].fontColor;
            let fontfamily = data.sceneData.textArray[2].fontFamily;
            var fontSize3 = parseFloat(data.sceneData.textArray[2].fontSize) + 15;
            var selectedfonts3 = "";
            fonts.map(function (font) {
              if (font.family == fontfamily) {
                if (data.sceneData.textArray[2].fontWeight == "lighter") {
                  selectedfonts3 = font.lighter;
                } else if (data.sceneData.textArray[2].fontWeight == "normal") {
                  selectedfonts3 = font.file;
                } else if (data.sceneData.textArray[2].fontWeight == "bold") {
                  selectedfonts3 = font.bold;
                }
              }
            });
            if (titleColor3.length == "4") {
              var $hex = titleColor3;
              titleColor3 =
                "#" + $hex[1] + $hex[1] + $hex[2] + $hex[2] + $hex[3] + $hex[3];
            }
            if (selectedfonts3 == "") {
              selectedfonts3 = fonts[0].file;
            }
          } else {
            var fieldText3 = "";
            var titleColor3 = "#00000";
            var selectedfonts3 = fonts[0].file;
            var fontSize3 = "30";
          }
          if (data.sceneData.textArray[3] != undefined) {
            var fieldText4 = data.sceneData.textArray[3].text;
            var titleColor4 = data.sceneData.textArray[3].fontColor;
            let fontfamily = data.sceneData.textArray[3].fontFamily;
            var fontSize4 = parseFloat(data.sceneData.textArray[3].fontSize) + 15;
            var selectedfonts4 = "";
            fonts.map(function (font) {
              if (font.family == fontfamily) {
                if (data.sceneData.textArray[3].fontWeight == "lighter") {
                  selectedfonts4 = font.lighter;
                } else if (data.sceneData.textArray[3].fontWeight == "normal") {
                  selectedfonts4 = font.file;
                } else if (data.sceneData.textArray[3].fontWeight == "bold") {
                  selectedfonts4 = font.bold;
                }
              }
            });
            if (titleColor4.length == "4") {
              var $hex = titleColor4;
              titleColor4 =
                "#" + $hex[1] + $hex[1] + $hex[2] + $hex[2] + $hex[3] + $hex[3];
            }
            if (selectedfonts4 == "") {
              selectedfonts4 = fonts[0].file;
            }
          } else {
            var fieldText4 = "";
            var titleColor4 = "#00000";
            var fontSize4 = "40";
            var selectedfonts4 = fonts[0].file;
          }
          const sceneLast = new FFScene();
          sceneLast.setBgColor("#fff");
          const fbg1 = new FFImage({
            path:
              assetsPath +
              "scenebglast2.jpg",
            x: 980,
            y: 540,
          });
          sceneLast.addChild(fbg1);
          const fbgblue = new FFImage({
            path:
              assetsPath +
              "bglastblue.png",
            x: 490,
            y: 540,
          });
          fbgblue.setOpacity(0.9);
          sceneLast.addChild(fbgblue);
          const fbggreen = new FFImage({
            path:
              assetsPath +
              "bglastgreen.png",
            x: 1470,
            y: 540,
          });
          fbggreen.setOpacity(0.9);
          sceneLast.addChild(fbggreen);
          const fbgcircle = new FFImage({
            path:
              assetsPath +
              "new-moon2.png",
            x: 980,
            y: 10,
          });
          sceneLast.addChild(fbgcircle);
          const fbg = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-imglast21.png",
            x: 660,
            y: 480,
          });
          fbg.addEffect("fadeInLeft", 0.6, 0.2);
          sceneLast.addChild(fbg);
          const fimg1 = new FFImage({
            path:
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/" +
              mediaDate +
              "-imglast22.png",
            x: 1650,
            y: 80,
          });

          fimg1.addEffect("fadeIn", 1.5, 0.5);
          sceneLast.addChild(fimg1);
          const text = new FFText({
            text: fieldText1,
            fontSize: fontSize1,
            x: 1060,
            y: 360,
          });
          text.setColor(titleColor1);
          text.setFont(selectedfonts1);
          text.addEffect("fadeInRight", 1.1, 0.8);
          sceneLast.addChild(text);

          const text2 = new FFText({
            text: fieldText2,
            fontSize: fontSize2,
            x: 1060,
            y: 430,
          });
          text2.setColor(titleColor2);
          text.setFont(selectedfonts2);
          text2.addEffect("fadeInRight", 1.2, 0.9);
          sceneLast.addChild(text2);

          const text3 = new FFText({
            text: fieldText3,
            fontSize: fontSize3,
            x: 1060,
            y: 490,
          });
          text3.setColor(titleColor3);
          text.setFont(selectedfonts3);
          text3.addEffect("fadeInRight", 1.3, 1.0);
          sceneLast.addChild(text3);

          const text4 = new FFText({
            text: fieldText4,
            fontSize: fontSize4,
            x: 1060,
            y: 550,
          });
          text4.setColor(titleColor3);
          text.setFont(selectedfonts4);
          text4.addEffect("fadeInRight", 1.4, 1.1);
          sceneLast.addChild(text4);
          if (user.userPlan == 0) {
            const watermark = new FFImage({
              path: assetsPath + "reveoLogo.png",
              x: 1680,
              y: 50,
            });
            watermark.setOpacity(0.7);
            watermark.setScale(0.5);
            sceneLast.addChild(watermark);
          }
          sceneLast.setDuration(3);
          creator.addChild(sceneLast);
          console.log('data2');
          i++;
        }
        else if (templateBlock[i].sceneId == 55) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate55(data);

          //var result = data.sceneData.textArray[0].text.split(" ");
          let selectedfonts1;
          selectedfonts1 = await getselectedFontFamily(data.sceneData.textArray[0].fontWeight, data.sceneData.textArray[0].fontFamily)
          var titleColor1 = data.sceneData.textArray[0].fontColor;
          if (titleColor1.length == "4") {
            titleColor1 = getColor(titleColor);
          }
          let selectedfonts2 = '';
          selectedfonts2 = await getselectedFontFamily(data.sceneData.textArray[1].fontWeight, data.sceneData.textArray[1].fontFamily)
          var titleColor2 = data.sceneData.textArray[1].fontColor;
          if (titleColor2.length == "4") {
            titleColor2 = getColor(titleColor2);
          }
          let selectedfonts3;
          selectedfonts3 = await getselectedFontFamily(data.sceneData.textArray[2].fontWeight, data.sceneData.textArray[2].fontFamily)
          var titleColor3 = data.sceneData.textArray[2].fontColor;
          if (titleColor3.length == "4") {
            titleColor3 = getColor(titleColor3);
          }

          const content = data.sceneData.textArray[3].text;
          const contentParts = content.split("\n");
          let selectedfonts4;
          selectedfonts4 = await getselectedFontFamily(data.sceneData.textArray[3].fontWeight, data.sceneData.textArray[3].fontFamily)
          var titleColor4 = data.sceneData.textArray[3].fontColor;
          if (titleColor4.length == "4") {
            titleColor4 = getColor(titleColor4);
          }

          let selectedfonts5;
          selectedfonts5 = await getselectedFontFamily(data.sceneData.textArray[4].fontWeight, data.sceneData.textArray[4].fontFamily)
          var titleColor5 = data.sceneData.textArray[4].fontColor;
          if (titleColor5.length == "4") {
            titleColor5 = getColor(titleColor5);
          }



          if (data.sceneData.media[0].type == "image") {
            const scene51 = new FFScene();
            scene51.setBgColor("#fff");
            const image5 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img551.png",
              y: 180,
            });
            image5.addAnimate({
              from: { x: -1600 },
              to: { x: 1340 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image5);


            const image = new FFImage({
              path: assetsPath + "bgopenhouses.png",
              y: 540,
            });
            image.addAnimate({
              from: { x: -960 },
              to: { x: 325 },
              time: 1.5,
              delay: 0.1,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image);
            const image2 = new FFImage({
              path: assetsPath + "brownbgOpenhouses.png",
              x: 325,
            });
            image2.addAnimate({
              from: { y: 1560 },
              to: { y: 700 },
              time: 1.5,
              delay: 0.5,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image2);

            const image3 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img552.png",
              x: 1050,
            });
            image3.addAnimate({
              from: { y: -300 },
              to: { y: 545 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image3);
            const image4 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img553.png",
              y: 545,
            });
            image4.addAnimate({
              from: { x: 2600 },
              to: { x: 1710 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image4);

            const image7 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img554.png",
              x: 1340,
            });
            image7.addAnimate({
              from: { y: 1600 },
              to: { y: 910 },
              time: 3,
              delay: 0.2,
              ease: "Cubic.InOut",
            });
            scene51.addChild(image7);
            const imageline = new FFImage({
              path: assetsPath + "brownline.png",
              y: 350,
            });
            imageline.addAnimate({
              from: { x: -1560 },
              to: { x: 340 },
              time: 1.5,
              delay: 0.5,
              ease: "Cubic.InOut",
            });
            scene51.addChild(imageline);


            const fontSize1 = parseInt(data.sceneData.textArray[0].fontSize) + 35;
            const textOne = new FFText({
              text: data.sceneData.textArray[0].text,
              fontSize: fontSize1,
              x: 340,
              y: 100,
            });
            textOne.alignCenter();
            textOne.setStyle({ padding: [4, 20, 6, 20] });
            textOne.setColor(titleColor1);
            textOne.setFont(selectedfonts1);
            textOne.addEffect("backInLeft", 1.5, 1.0);
            scene51.addChild(textOne);

            console.log('herersss')


            const fontSize2 = parseInt(data.sceneData.textArray[1].fontSize) + 15;
            const textTwo = new FFText({
              text: data.sceneData.textArray[1].text,
              fontSize: fontSize2,
              x: 340,
              y: 300,
            });
            textTwo.alignCenter();
            textTwo.setStyle({ padding: [4, 20, 20, 20] });
            textTwo.setStyle({ height: 50 });
            textTwo.setColor(titleColor2);
            textTwo.setFont(selectedfonts2);
            textTwo.addEffect("backInLeft", 1.5, 1.0);
            scene51.addChild(textTwo);
            console.log('therersss')


            const fontSize3 = parseInt(data.sceneData.textArray[2].fontSize) + 15;
            const text3o = new FFText({
              text: data.sceneData.textArray[2].text,
              fontSize: fontSize3,
              x: 340,
              y: 400,
            });
            text3o.alignCenter();
            text3o.setStyle({ padding: [4, 20, 6, 20] });
            text3o.setColor(titleColor3);
            text3o.setFont(selectedfonts3);
            text3o.addEffect("backInLeft", 1.5, 1.0);
            scene51.addChild(text3o);


            if (contentParts[2] != undefined && contentParts[2] != "") {
              const fontSize4 = parseInt(data.sceneData.textArray[3].fontSize) + 20;
              const text = new FFText({
                text: contentParts[0],
                fontSize: fontSize4,
                x: 340,
                y: 630,
              });
              text.setColor(titleColor4);
              text.setFont(selectedfonts4);
              text.addEffect("fadeIn", 1, 1.3);
              text.alignCenter();
              text.setStyle({ padding: [0, 20, 10, 20] });
              scene51.addChild(text);

              const text2 = new FFText({
                text: contentParts[1],
                fontSize: fontSize4,
                x: 340,
                y: 700,
              });
              text2.alignCenter();
              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor4);
              text2.setFont(selectedfonts4);
              text2.addEffect("fadeIn", 1.0, 1.4);
              scene51.addChild(text2);

              const text3 = new FFText({
                text: contentParts[2],
                fontSize: fontSize4,
                x: 340,
                y: 770,
              });
              text3.alignCenter();
              text3.setStyle({ padding: [4, 20, 6, 20] });
              text3.setColor(titleColor4);
              text3.setFont(selectedfonts4);
              text3.addEffect("fadeIn", 1.0, 1.4);
              scene51.addChild(text3);
            } else {
              const fontSize4 = parseInt(data.sceneData.textArray[3].fontSize) + 20;
              console.log(fontSize4)
              const text = new FFText({
                text: contentParts[0],
                fontSize: fontSize4,
                x: 340,
                y: 670,
              });
              text.setColor(titleColor4);
              text.setFont(selectedfonts4);
              text.addEffect("fadeIn", 1, 1.3);
              text.alignCenter();
              text.setStyle({ padding: [0, 20, 10, 20] });
              scene51.addChild(text);

              const text2 = new FFText({
                text: contentParts[1],
                fontSize: fontSize4,
                x: 340,
                y: 730,
              });
              text2.alignCenter();
              text2.setStyle({ padding: [4, 20, 6, 20] });
              text2.setColor(titleColor4);
              text2.setFont(selectedfonts4);
              text2.addEffect("fadeIn", 1.0, 1.4);
              scene51.addChild(text2);
            }

            const fontSize5 = parseInt(data.sceneData.textArray[4].fontSize) + 15;
            const text5 = new FFText({
              text: data.sceneData.textArray[4].text,
              fontSize: fontSize5,
              x: 340,
              y: 1000,
            });
            text5.alignCenter();
            text5.setStyle({ padding: [4, 20, 6, 20] });
            text5.setColor(titleColor5);
            text5.setFont(selectedfonts5);
            text5.addEffect("backInLeft", 1.5, 1.0);
            scene51.addChild(text5);

            console.log('herer')
            scene51.setTransition("fade", 0.5);
            scene51.setDuration(data.sceneData.time);
            creator.addChild(scene51);
            console.log('data.sceneData 1')
          }
          i++;
        }

      }
      if (lastScene) {
        //  `console.log(lastScene.sceneData.textArray);

        let data = lastScene;
        const lastVideo = await videoTemplateLast(data);

        if (data.sceneData.textArray[0] != undefined) {
          var titleColor1 = data.sceneData.textArray[0].fontColor;
          let fontfamily = data.sceneData.textArray[0].fontFamily;
          var fontSize1 = parseFloat(data.sceneData.textArray[0].fontSize) + 15;
          var selectedfonts1 = "";
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.textArray[0].fontWeight == "lighter") {
                selectedfonts1 = font.lighter;
              } else if (data.sceneData.textArray[0].fontWeight == "normal") {
                selectedfonts1 = font.file;
              } else if (data.sceneData.textArray[0].fontWeight == "bold") {
                selectedfonts1 = font.bold;
              }
            }
          });
          if (titleColor1.length == "4") {
            var $hex = titleColor1;
            titleColor1 =
              "#" + $hex[1] + $hex[1] + $hex[2] + $hex[2] + $hex[3] + $hex[3];
          }
          var fieldText1 = data.sceneData.textArray[0].text;
          if (selectedfonts1 == "") {
            selectedfonts1 = fonts[0].file;
          }
        } else {
          var fieldText1 = "";
          var titleColor1 = "#00000";
          var selectedfonts1 = fonts[0].file;
          var fontSize1 = "20";
        }
        if (data.sceneData.textArray[1] != undefined) {
          var fieldText2 = data.sceneData.textArray[1].text;
          var titleColor2 = data.sceneData.textArray[1].fontColor;
          let fontfamily = data.sceneData.textArray[1].fontFamily;
          var fontSize2 = parseFloat(data.sceneData.textArray[1].fontSize) + 15;
          var selectedfonts2 = "";
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.textArray[1].fontWeight == "lighter") {
                selectedfonts2 = font.lighter;
              } else if (data.sceneData.textArray[1].fontWeight == "normal") {
                selectedfonts2 = font.file;
              } else if (data.sceneData.textArray[1].fontWeight == "bold") {
                selectedfonts2 = font.bold;
              }
            }
          });
          if (titleColor2.length == "4") {
            var $hex = titleColor2;
            titleColor2 =
              "#" + $hex[1] + $hex[1] + $hex[2] + $hex[2] + $hex[3] + $hex[3];
          }
          if (selectedfonts2 == "") {
            selectedfonts2 = fonts[0].file;
          }
        } else {
          var fieldText2 = "";
          var titleColor2 = "#00000";
          var selectedfonts2 = fonts[0].file;
          let fontSize2 = "20";
        }
        if (data.sceneData.textArray[2] != undefined) {
          var fieldText3 = data.sceneData.textArray[2].text;
          var titleColor3 = data.sceneData.textArray[2].fontColor;
          let fontfamily = data.sceneData.textArray[2].fontFamily;
          var fontSize3 = parseFloat(data.sceneData.textArray[2].fontSize) + 15;
          var selectedfonts3 = "";
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.textArray[2].fontWeight == "lighter") {
                selectedfonts3 = font.lighter;
              } else if (data.sceneData.textArray[2].fontWeight == "normal") {
                selectedfonts3 = font.file;
              } else if (data.sceneData.textArray[2].fontWeight == "bold") {
                selectedfonts3 = font.bold;
              }
            }
          });
          if (titleColor3.length == "4") {
            var $hex = titleColor3;
            titleColor3 =
              "#" + $hex[1] + $hex[1] + $hex[2] + $hex[2] + $hex[3] + $hex[3];
          }
          if (selectedfonts3 == "") {
            selectedfonts3 = fonts[0].file;
          }
        } else {
          var fieldText3 = "";
          var titleColor3 = "#00000";
          var selectedfonts3 = fonts[0].file;
          var fontSize3 = "30";
        }
        if (data.sceneData.textArray[3] != undefined) {
          var fieldText4 = data.sceneData.textArray[3].text;
          var titleColor4 = data.sceneData.textArray[3].fontColor;
          let fontfamily = data.sceneData.textArray[3].fontFamily;
          var fontSize4 = parseFloat(data.sceneData.textArray[3].fontSize) + 15;
          var selectedfonts4 = "";
          fonts.map(function (font) {
            if (font.family == fontfamily) {
              if (data.sceneData.textArray[3].fontWeight == "lighter") {
                selectedfonts4 = font.lighter;
              } else if (data.sceneData.textArray[3].fontWeight == "normal") {
                selectedfonts4 = font.file;
              } else if (data.sceneData.textArray[3].fontWeight == "bold") {
                selectedfonts4 = font.bold;
              }
            }
          });
          if (titleColor4.length == "4") {
            var $hex = titleColor4;
            titleColor4 =
              "#" + $hex[1] + $hex[1] + $hex[2] + $hex[2] + $hex[3] + $hex[3];
          }
          if (selectedfonts4 == "") {
            selectedfonts4 = fonts[0].file;
          }
        } else {
          var fieldText4 = "";
          var titleColor4 = "#00000";
          var fontSize4 = "40";
          var selectedfonts4 = fonts[0].file;
        }
        const sceneLast = new FFScene();
        sceneLast.setBgColor("#fff");

        const fbg = new FFImage({
          path:
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-imglast1.png",
          x: 720,
          y: 480,
        });
        fbg.addEffect("fadeInLeft", 0.6, 0.2);
        sceneLast.addChild(fbg);
        const fimg1 = new FFImage({
          path:
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-imglast2.png",
          x: 1240,
          y: 620,
        });
        fimg1.addEffect("fadeIn", 1.5, 0.5);
        sceneLast.addChild(fimg1);
        const text = new FFText({
          text: fieldText1,
          fontSize: fontSize1,
          x: 1060,
          y: 300,
        });
        text.setColor(titleColor1);
        text.setFont(selectedfonts1);
        text.addEffect("fadeInRight", 1.1, 0.8);
        sceneLast.addChild(text);

        const text2 = new FFText({
          text: fieldText2,
          fontSize: fontSize2,
          x: 1060,
          y: 370,
        });
        text2.setColor(titleColor2);
        text.setFont(selectedfonts2);
        text2.addEffect("fadeInRight", 1.2, 0.9);
        sceneLast.addChild(text2);

        const text3 = new FFText({
          text: fieldText3,
          fontSize: fontSize3,
          x: 1060,
          y: 430,
        });
        text3.setColor(titleColor3);
        text.setFont(selectedfonts3);
        text3.addEffect("fadeInRight", 1.3, 1.0);
        sceneLast.addChild(text3);

        const text4 = new FFText({
          text: fieldText4,
          fontSize: fontSize4,
          x: 1060,
          y: 490,
        });
        text4.setColor(titleColor3);
        text.setFont(selectedfonts4);
        text4.addEffect("fadeInRight", 1.4, 1.1);
        sceneLast.addChild(text4);
        if (user.userPlan == 0) {
          const watermark = new FFImage({
            path: assetsPath + "reveoLogo.png",
            x: 1680,
            y: 50,
          });
          watermark.setOpacity(0.7);
          watermark.setScale(0.5);
          sceneLast.addChild(watermark);
        }
        sceneLast.setDuration(3);
        creator.addChild(sceneLast);
      }
      creator.start();
      creator.on("error", (e) => {
        //  console.log(`FFCreator error: ${JSON.stringify(e)}`);
      });
      creator.on("progress", (e) => {
        // console.log(`FFCreatorLite progress: ${(e.percent * 100) >> 0}%`);
      });

      creator.on("complete", (e) => {
        const templateTitle = template.title.split(" ").join("-");
        const videoName = templateTitle + Date.now();
        fs.rename(
          e.output,
          "./src/Assets/template/videos/" +
          userId +
          "/template1/" +
          videoName +
          ".mp4",
          () => {
            var finalvideo1 =
              "template/videos/" + userId + "/template1/" + videoName + ".mp4";
            console.log("lastscene here");
            // const result = [finalvideo1];
            saveVideoDb(template.title, finalvideo1, template.templateImage);
            // res.status(200).json({
            //   message: "successfull",
            //   data: result,
            // });
          }
        );
      });
    } else {
      res.status(200).json({ message: "Video failed 1" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  async function saveVideoDb(videoTitle, path, templateImage) {
    try {
      console.log(templatemainId);
      const user = await User.findOne({ _id: userId });
      console.log(user.email);
      const newUpload = new UserVideos({
        userId: userId,
        videoTitle: videoTitle,
        templateImage: templateImage,
        path: path,
        templateId: templatemainId,
      });
      const uploadData = await newUpload.save();
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img1.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img2.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img3.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img4.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img41.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img42.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img43.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img44.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img101.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img102.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img103.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img61.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img71.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img72.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img73.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img74.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img131.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img132.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img151.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img152.png"
      );
      // deleteFiles(
      //   "./src/Assets/template/videos/" + userId + "/template1/" +
      //    mediaDate +
      //   "-img153.png"
      // );
      // deleteFiles(
      //   "./src/Assets/template/videos/" + userId + "/template1/" +
      //   mediaDate +
      //   "-img154.png"
      // );

      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img161.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img162.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img171.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img172.png"
      );

      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img181.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img182.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img191.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img192.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img201.png"
      );

      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img301.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img302.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img303.png"
      );

      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img291.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img292.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img293.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img294.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img281.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img282.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img283.png"
      );

      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img271.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img272.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img261.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img262.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img263.png"
      );

      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img251.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img241.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img242.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img221.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img222.png"
      );

      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img222.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img331.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img332.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-361.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img322.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img321.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img341.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img342.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img351.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img352.png"
      );

      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-imglast1.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-imglast2.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img371.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img372.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img373.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img391.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-img392.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-401.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-411.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-421.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-431.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-432.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-441.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-442.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-443.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-451.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-452.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-461.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-471.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-472.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-473.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-491.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-481.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-482.png"
      );

      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-511.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-512.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-513.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-514.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-515.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-516.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-521.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-522.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-523.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-524.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-531.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-532.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-541.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-542.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-543.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-544.png"
      );


      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-551.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-552.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-553.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-554.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-imglast21.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-imglast22.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-imglast1.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
        userId +
        "/template1/" +
        mediaDate +
        "-imglast2.png"
      );
      console.log("herer");
      const msg = {
        to: user.email,
        from: "Reveo <" + process.env.FROM_EMAIL + ">",
        templateId: "d-d430cab6ce0543de8d8e3537679bdae1",
        dynamic_template_data: {
          sender_name: user.firstName,
        },
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log("Email sent");
        })
        .catch((error) => {
          console.error(error.response.body);
        });
      res.status(200).json({
        message: "successfull",
        data: path,
        uploadData: uploadData,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

global.videoTemplate1 = async function videoTemplate1(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            950,
            530,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img1.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                950,
                530,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img2.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["2"].url)
              .then((img) => {
                img
                  .quality(60)
                  .cover(
                    950,
                    530,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img3.png"
                  ); // save
                Jimp.read(assetsPath + data.sceneData.media["3"].url)
                  .then((img) => {
                    img
                      .quality(60)
                      .cover(
                        950,
                        530,
                        Jimp.HORIZONTAL_ALIGN_CENTER |
                        Jimp.VERTICAL_ALIGN_CENTER
                      )
                      .write(
                        assetsPath +
                        "template/videos/" +
                        userId +
                        "/template1/" +
                        mediaDate +
                        "-img4.png"
                      ); // save
                    setTimeout(function () {
                      resolve("done");
                    }, 500);
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

// Video Scene 4
global.videoTemplate4 = async function videoTemplate4(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            960,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img41.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                960,
                1080,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img42.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["2"].url)
              .then((img) => {
                img
                  .quality(60)
                  .cover(
                    960,
                    1080,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img43.png"
                  ); // save
                Jimp.read(assetsPath + data.sceneData.media["3"].url)
                  .then((img) => {
                    img
                      .quality(60)
                      .cover(
                        960,
                        1080,
                        Jimp.HORIZONTAL_ALIGN_CENTER |
                        Jimp.VERTICAL_ALIGN_CENTER
                      )
                      .write(
                        assetsPath +
                        "template/videos/" +
                        userId +
                        "/template1/" +
                        mediaDate +
                        "-img44.png"
                      ); // save
                    setTimeout(function () {
                      resolve("done");
                    }, 500);
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};


global.videoTemplate2 = async function videoTemplate2(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .scaleToFit(
            1920,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img21.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .scaleToFit(
                1920,
                1080,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img22.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

global.videoTemplate10 = async function videoTemplate10(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            960,
            540,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img101.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                960,
                540,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img102.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["2"].url)
              .then((img) => {
                img
                  .quality(60)
                  .cover(
                    960,
                    1080,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img103.png"
                  ); // save
                setTimeout(function () {
                  resolve("done");
                }, 500);
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

global.videoTemplateLast = async function videoTemplateLast(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .scaleToFit(
            450,
            300,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-imglast1.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .scaleToFit(
                350,
                120,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-imglast2.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplateLast2 = async function videoTemplateLast2(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .scaleToFit(
            450,
            300,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-imglast21.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .scaleToFit(
                350,
                120,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-imglast22.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

global.videoTemplate12 = async function videoTemplate12(data, req, res) {
  return new Promise((resolve) => {
    getVideoDurationInSeconds(assetsPath + data.sceneData.media[0].url).then(
      (duration) => {
        resolve(duration);
      }
    );
  });
};

global.videoTemplate6 = async function videoTemplate6(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(80)
          .cover(
            1368,
            768,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img61.png"
          ); // save
        setTimeout(function () {
          resolve("done");
        }, 500);
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
// Video Scene 7
global.videoTemplate7 = async function videoTemplate7(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            640,
            360,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img71.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                640,
                360,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img72.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["2"].url)
              .then((img) => {
                img
                  .quality(60)
                  .cover(
                    640,
                    360,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img73.png"
                  ); // save
                Jimp.read(assetsPath + data.sceneData.media["3"].url)
                  .then((img) => {
                    img
                      .quality(60)
                      .cover(
                        640,
                        360,
                        Jimp.HORIZONTAL_ALIGN_CENTER |
                        Jimp.VERTICAL_ALIGN_CENTER
                      )
                      .write(
                        assetsPath +
                        "template/videos/" +
                        userId +
                        "/template1/" +
                        mediaDate +
                        "-img74.png"
                      ); // save
                    setTimeout(function () {
                      resolve("done");
                    }, 500);
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

global.videoTemplate13 = async function videoTemplate13(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1368,
            768,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img131.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                1368,
                768,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img132.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate15 = async function videoTemplate15(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1920,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img151.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                1920,
                1080,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img152.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate16 = async function videoTemplate16(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            920,
            1030,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img161.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                920,
                1030,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img162.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

global.videoTemplate17 = async function videoTemplate17(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1140,
            1000,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img171.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                620,
                1000,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img172.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate18 = async function videoTemplate18(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1200,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img181.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                1200,
                1080,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img182.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

global.videoTemplate19 = async function videoTemplate19(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1200,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img191.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                1200,
                1080,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img192.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

global.videoTemplate20 = async function videoTemplate20(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1860,
            1020,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img201.png"
          ); // save
        setTimeout(function () {
          resolve("done");
        }, 500);
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

global.videoTemplate22 = async function videoTemplate22(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1200,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img221.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                1200,
                1080,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img222.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate25 = async function videoTemplate25(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(80)
          .cover(
            1550,
            850,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img251.png"
          ); // save
        setTimeout(function () {
          resolve("done");
        }, 500);
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate24 = async function videoTemplate24(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            960,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img241.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                960,
                1080,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img242.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate26 = async function videoTemplate26(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .grayscale()
          .cover(
            900,
            506,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img261.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["0"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                900,
                506,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img262.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["0"].url)
              .then((img) => {
                img
                  .quality(60)
                  .grayscale()
                  .cover(
                    900,
                    506,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img263.png"
                  ); // save
                setTimeout(function () {
                  resolve("done");
                }, 500);
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate27 = async function videoTemplate27(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1368,
            768,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img271.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                1368,
                768,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img272.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate28 = async function videoTemplate28(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .grayscale()
          .cover(
            900,
            506,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img281.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["0"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                900,
                506,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img282.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["0"].url)
              .then((img) => {
                img
                  .quality(60)
                  .grayscale()
                  .cover(
                    900,
                    506,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img283.png"
                  ); // save
                setTimeout(function () {
                  resolve("done");
                }, 500);
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate29 = async function videoTemplate29(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            840,
            470,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img291.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                840,
                470,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img292.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["2"].url)
              .then((img) => {
                img
                  .quality(60)
                  .cover(
                    840,
                    470,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img293.png"
                  ); // save
                Jimp.read(assetsPath + data.sceneData.media["3"].url)
                  .then((img) => {
                    img
                      .quality(60)
                      .cover(
                        840,
                        470,
                        Jimp.HORIZONTAL_ALIGN_CENTER |
                        Jimp.VERTICAL_ALIGN_CENTER
                      )
                      .write(
                        assetsPath +
                        "template/videos/" +
                        userId +
                        "/template1/" +
                        mediaDate +
                        "-img294.png"
                      ); // save
                    setTimeout(function () {
                      resolve("done");
                    }, 500);
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate30 = async function videoTemplate30(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .grayscale()
          .cover(
            1000,
            720,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img301.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["0"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                1000,
                720,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img302.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["0"].url)
              .then((img) => {
                img
                  .quality(60)
                  .grayscale()
                  .cover(
                    1000,
                    720,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img303.png"
                  ); // save
                setTimeout(function () {
                  resolve("done");
                }, 500);
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate33 = async function videoTemplate33(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1200,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img331.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                1200,
                1080,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img332.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

global.videoTemplate36 = async function videoTemplate36(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1860,
            1020,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img361.png"
          ); // save
        setTimeout(function () {
          resolve("done");
        }, 500);
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate32 = async function videoTemplate32(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1920,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img321.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                1920,
                1080,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img322.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate34 = async function videoTemplate34(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1920,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img341.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                650,
                365,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img342.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate35 = async function videoTemplate35(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1920,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img351.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                650,
                365,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img352.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate37 = async function videoTemplate37(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            950,
            530,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img371.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                950,
                530,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img372.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["2"].url)
              .then((img) => {
                img
                  .quality(60)
                  .cover(
                    950,
                    530,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img373.png"
                  ); // save
                setTimeout(function () {
                  resolve("done");
                }, 500);
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate39 = async function videoTemplate39(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1200,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img391.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                1200,
                1080,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img392.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate40 = async function videoTemplate40(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            960,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img401.png"
          ); // save
        setTimeout(function () {
          resolve("done");
        }, 500);
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate41 = async function videoTemplate41(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1200,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img411.png"
          ); // save
        setTimeout(function () {
          resolve("done");
        }, 500);
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

global.videoTemplate42 = async function videoTemplate42(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1920,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img421.png"
          ); // save
        setTimeout(function () {
          resolve("done");
        }, 500);
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

global.videoTemplate43 = async function videoTemplate43(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1200,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img431.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                1200,
                1080,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img432.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate44 = async function videoTemplate44(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .grayscale()
          .cover(
            1000,
            720,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img441.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["0"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                1000,
                720,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img442.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["0"].url)
              .then((img) => {
                img
                  .quality(60)
                  .grayscale()
                  .cover(
                    1000,
                    720,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img443.png"
                  ); // save
                setTimeout(function () {
                  resolve("done");
                }, 500);
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate45 = async function videoTemplate45(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            960,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img451.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                960,
                1080,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img452.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate46 = async function videoTemplate46(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1860,
            1020,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img461.png"
          ); // save
        setTimeout(function () {
          resolve("done");
        }, 500);
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate47 = async function videoTemplate47(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            960,
            540,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img471.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                960,
                540,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img472.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["2"].url)
              .then((img) => {
                img
                  .quality(60)
                  .cover(
                    960,
                    1080,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img473.png"
                  ); // save
                setTimeout(function () {
                  resolve("done");
                }, 500);
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate48 = async function videoTemplate48(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1368,
            768,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img481.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                1368,
                768,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img482.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate49 = async function videoTemplate49(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(80)
          .cover(
            1368,
            768,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img491.png"
          ); // save
        setTimeout(function () {
          resolve("done");
        }, 500);
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate50 = async function videoTemplate50(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1140,
            1000,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img501.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                620,
                1000,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img502.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate51 = async function videoTemplate51(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            655,
            360,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img511.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                655,
                360,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img512.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["2"].url)
              .then((img) => {
                img
                  .quality(60)
                  .cover(
                    880,
                    360,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img513.png"
                  ); // save
                Jimp.read(assetsPath + data.sceneData.media["3"].url)
                  .then((img) => {
                    img
                      .quality(60)
                      .cover(
                        440,
                        360,
                        Jimp.HORIZONTAL_ALIGN_CENTER |
                        Jimp.VERTICAL_ALIGN_CENTER
                      )
                      .write(
                        assetsPath +
                        "template/videos/" +
                        userId +
                        "/template1/" +
                        mediaDate +
                        "-img514.png"
                      ); // save
                    // setTimeout(function () {
                    //   resolve("done");
                    // }, 500);
                    Jimp.read(assetsPath + data.sceneData.media["4"].url)
                      .then((img) => {
                        img
                          .quality(60)
                          .cover(
                            440,
                            360,
                            Jimp.HORIZONTAL_ALIGN_CENTER |
                            Jimp.VERTICAL_ALIGN_CENTER
                          )
                          .write(
                            assetsPath +
                            "template/videos/" +
                            userId +
                            "/template1/" +
                            mediaDate +
                            "-img515.png"
                          ); // save
                        Jimp.read(assetsPath + data.sceneData.media["5"].url)
                          .then((img) => {
                            img
                              .quality(60)
                              .cover(
                                880,
                                360,
                                Jimp.HORIZONTAL_ALIGN_CENTER |
                                Jimp.VERTICAL_ALIGN_CENTER
                              )
                              .write(
                                assetsPath +
                                "template/videos/" +
                                userId +
                                "/template1/" +
                                mediaDate +
                                "-img516.png"
                              ); // save
                            setTimeout(function () {
                              resolve("done");
                            }, 500);
                          })
                          .catch((err) => {
                            console.error(err);
                          });
                      })
                      .catch((err) => {
                        console.error(err);
                      });
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate52 = async function videoTemplate52(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            960,
            440,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img521.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                960,
                440,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img522.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["2"].url)
              .then((img) => {
                img
                  .quality(60)
                  .cover(
                    960,
                    440,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img523.png"
                  ); // save
                Jimp.read(assetsPath + data.sceneData.media["3"].url)
                  .then((img) => {
                    img
                      .quality(60)
                      .cover(
                        960,
                        440,
                        Jimp.HORIZONTAL_ALIGN_CENTER |
                        Jimp.VERTICAL_ALIGN_CENTER
                      )
                      .write(
                        assetsPath +
                        "template/videos/" +
                        userId +
                        "/template1/" +
                        mediaDate +
                        "-img524.png"
                      ); // save
                    setTimeout(function () {
                      resolve("done");
                    }, 500);
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate53 = async function videoTemplate53(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            800,
            1080,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img531.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                800,
                1080,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img532.png"
              ); // save
            setTimeout(function () {
              resolve("done");
            }, 500);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate54 = async function videoTemplate54(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            680,
            680,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img541.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                680,
                400,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img542.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["2"].url)
              .then((img) => {
                img
                  .quality(60)
                  .cover(
                    680,
                    400,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img543.png"
                  ); // save
                Jimp.read(assetsPath + data.sceneData.media["3"].url)
                  .then((img) => {
                    img
                      .quality(60)
                      .cover(
                        680,
                        680,
                        Jimp.HORIZONTAL_ALIGN_CENTER |
                        Jimp.VERTICAL_ALIGN_CENTER
                      )
                      .write(
                        assetsPath +
                        "template/videos/" +
                        userId +
                        "/template1/" +
                        mediaDate +
                        "-img544.png"
                      ); // save
                    setTimeout(function () {
                      resolve("done");
                    }, 500);
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
global.videoTemplate55 = async function videoTemplate55(data, req, res) {
  return new Promise((resolve) => {
    Jimp.read(assetsPath + data.sceneData.media["0"].url)
      .then((img) => {
        img
          .quality(60)
          .cover(
            1220,
            360,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
          )
          .write(
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/" +
            mediaDate +
            "-img551.png"
          ); // save
        Jimp.read(assetsPath + data.sceneData.media["1"].url)
          .then((img) => {
            img
              .quality(60)
              .cover(
                640,
                335,
                Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
              )
              .write(
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/" +
                mediaDate +
                "-img552.png"
              ); // save
            Jimp.read(assetsPath + data.sceneData.media["2"].url)
              .then((img) => {
                img
                  .quality(60)
                  .cover(
                    640,
                    335,
                    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER
                  )
                  .write(
                    assetsPath +
                    "template/videos/" +
                    userId +
                    "/template1/" +
                    mediaDate +
                    "-img553.png"
                  ); // save
                Jimp.read(assetsPath + data.sceneData.media["3"].url)
                  .then((img) => {
                    img
                      .quality(60)
                      .cover(
                        1220,
                        360,
                        Jimp.HORIZONTAL_ALIGN_CENTER |
                        Jimp.VERTICAL_ALIGN_CENTER
                      )
                      .write(
                        assetsPath +
                        "template/videos/" +
                        userId +
                        "/template1/" +
                        mediaDate +
                        "-img554.png"
                      ); // save
                    setTimeout(function () {
                      resolve("done");
                    }, 500);
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};



// Comon Functions
const getselectedFontFamily = (selectedfontWeight, fontfamily) => {
  var fontsSelected;
  fonts.map(function (font) {
    if (font.family == fontfamily) {
      if (selectedfontWeight == "lighter") {
        fontsSelected = font.lighter;
      } else if (selectedfontWeight == "normal") {
        fontsSelected = font.file;
      } else if (selectedfontWeight == "bold") {

        fontsSelected = font.bold;
      }
    }
  });
  return fontsSelected
}
const getColor = (titleColor) => {
  titleColor = titleColor.split("").map((item) => {
    if (item == "#") { return item }
    return item + item;
  }).join("")
  return titleColor;
}

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
const path = require("path");
const Jimp = require("jimp");
const Template = require("../models/templates");
const Block = require("../models/templateBlocks");
const Scene = require("../models/lastBlock");
const UserVideos = require("../models/userVideos");
const fs = require("fs");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("ffprobe-static");
ffmpeg.setFfprobePath(ffprobe.path);
ffmpeg.setFfmpegPath(ffmpegPath);
let userId;
const concat = require("ffmpeg-concat");
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
  try {
    const templateBlock = await Block.find({ templateId: templateId }).sort({
      order: 1,
    });
    const template = await Template.findOne({ _id: templateId });
    // console.log(template);
    const lastScene = await Scene.findOne({ templateId: templateId });
    const data = {
      templateBlock: templateBlock,
      template: template,
    };
    userId = template.userId;
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
      const { FFScene, FFText, FFImage, FFCreator } = require("ffcreator");
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
          const firstVideo = await videoTemplate1(data);
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
            titleColor = titleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }
          const content = data.sceneData.content;
          const contentParts = content.split("\n");
          const scene1 = new FFScene();
          scene1.setBgColor("#fff");

          const img1 = new FFImage({
            path:
              assetsPath + "template/videos/" + userId + "/template1/img1.png",
            x: 477,
            y: 265,
          });
          scene1.addChild(img1);
          const img2 = new FFImage({
            path:
              assetsPath + "template/videos/" + userId + "/template1/img2.png",
            x: 1442,
            y: 265,
          });
          scene1.addChild(img2);
          const img3 = new FFImage({
            path:
              assetsPath + "template/videos/" + userId + "/template1/img3.png",
            x: 477,
            y: 815,
          });
          // fimg1.addEffect("slideInUp", 1.5, 1);
          scene1.addChild(img3);
          const img4 = new FFImage({
            path:
              assetsPath + "template/videos/" + userId + "/template1/img4.png",
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
          const fontSize1 = parseInt(data.sceneData.textSize) + 20;
          const text = new FFText({
            text: contentParts[0],
            fontSize: fontSize1,
            x: 960,
            y: 515,
          });
          text.setColor(titleColor);
          text.setFont(selectedfonts);
          text.addEffect("fadeIn", 1, 1.3);
          const text2 = new FFText({
            text: contentParts[1],
            fontSize: fontSize1,
            x: 960,
            y: 575,
          });
          text.alignCenter();
          text.setStyle({ padding: [0, 20, 10, 20] });

          text2.alignCenter();
          text2.setStyle({ padding: [4, 20, 6, 20] });

          scene1.addChild(text);
          text2.setColor(titleColor);
          text2.setFont(selectedfonts);
          text2.addEffect("fadeIn", 1.0, 1.4);
          scene1.addChild(text2);

          // add bottom cloud
          const fcloud = new FFImage({
            path: assetsPath + "cropped.jpg",
            y: 540,
          });
          fcloud.addAnimate({
            from: { x: -960 },
            to: { x: 960 },
            time: 1,
            delay: 3.5,
            ease: "Cubic.InOut",
          });
          scene1.addChild(fcloud);
          scene1.setDuration(4.5);
          creator.addChild(scene1);
          console.log(i);
          console.log("scene1");
          i++;
          console.log(i);
        } else if (templateBlock[i].sceneId == 2) {
          const data = templateBlock[i];
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
            titleColor = titleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
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
            path: assetsPath + data.sceneData.media[0].url,
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
          scene2.addChild(fcloud);
          scene2.setDuration(6.5);
          creator.addChild(scene2);
          // scene2.setTransition("fade", 1);
          i++;
        } else if (templateBlock[i].sceneId == 3) {
          let data = templateBlock[i];
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
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
          const fontSize1 = parseInt(data.sceneData.textSize) + 25;
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
            delay: 4.5,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fcloud2);
          scene3.setDuration(5.5);
          creator.addChild(scene3);
          i++;
        } else if (templateBlock[i].sceneId == 4) {
          let data = templateBlock[i];
          const fourthVideo = await videoTemplate4(data);
          var result = data.sceneData.textArray[0].text.split(" ");
          var text1 = "";
          var text2 = "";
          for (var l = 0; l < result.length; l++) {
            if (l >= 6) {
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
            titleColor = titleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }

          let result2 = data.sceneData.textArray[1].text.split(" ");
          let text3 = "";
          let text4 = "";
          for (var k = 0; k < result2.length; k++) {
            if (k >= 6) {
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
            titleColor2 = titleColor2.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }

          if (data.sceneData.media[0].type == "image") {
            const scene4 = new FFScene();
            const image = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/img41.png",
              x: 475,
              y: 540,
            });
            scene4.addChild(image);
            const image2 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/img43.png",
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
            const fontSize1 =
              parseInt(data.sceneData.textArray[0].fontSize) + 15;
            const fontSize2 =
              parseInt(data.sceneData.textArray[1].fontSize) + 15;
            const text = new FFText({
              text: text1,
              fontSize: fontSize1,
              x: 50,
              y: 955,
              height: 100,
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
            const img3 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/img42.png",
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
                "/template1/img44.png",
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
              delay: 6.5,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud3);

            scene4.setDuration(7.5);
            creator.addChild(scene4);
          }
          i++;
        } else if (templateBlock[i].sceneId == 8) {
          let data = templateBlock[i];
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }
          var result = data.sceneData.content.split(" ");
          console.log(result);
          var text = "";
          var text2 = "";
          for (var m = 0; m < result.length; m++) {
            if (m >= 10) {
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
            delay: 5,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fcloud2);
          scene3.setDuration(6);
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
          scene3.setDuration(5);
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
            }
            else if (p > 13 ) {
              text3 = text3 + result[p] + " ";
            }
            else {
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
            titleColor = titleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
          }
          if (data.sceneData.media[0].type == "image") {
            const scene4 = new FFScene();
            const image2 = new FFImage({
              path:
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/img103.png",
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
                "/template1/img101.png",
              x: 475,
              y: 270,
            });
            scene4.addChild(image);
            const img3 = new FFImage({
              path:
                assetsPath + "template/videos/" + userId + "/template1/img102.png",
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
              delay: 6.5,
              ease: "Cubic.InOut",
            });
            scene4.addChild(fcloud3);

            scene4.setDuration(7.5);
            creator.addChild(scene4);
          }
          i++;
        }
        else if (templateBlock[i].sceneId == 11) {
          let data = templateBlock[i];
          var titleColor = data.sceneData.textColor;
          if (titleColor.length == "4") {
            titleColor = titleColor.replaceAll(
              "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
              "#$1$1$2$2$3$3"
            );
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
            to: { y: 1040},
            time: 1,
            delay: 0.1,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fimg1);
          const fontSize1 = parseInt(data.sceneData.textSize) + 25;
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
            delay: 5,
            ease: "Cubic.InOut",
          });
          scene3.addChild(fcloud2);
          scene3.setDuration(6);
          creator.addChild(scene3);
          i++;
        }
      }

      if (lastScene) {
        console.log("lastcsne");
        let data = lastScene;
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
          path: assetsPath + data.sceneData.media[0].url,
          x: 720,
          y: 480,
        });
        fbg.addEffect("fadeInLeft", 0.6, 1.2);
        sceneLast.addChild(fbg);
        const fimg1 = new FFImage({
          path: assetsPath + data.sceneData.media[1].url,
          x: 1160,
          y: 600,
        });
        fimg1.addEffect("fadeIn", 1.5, 1.5);
        sceneLast.addChild(fimg1);

        const text = new FFText({
          text: fieldText1,
          fontSize: fontSize1,
          x: 1060,
          y: 300,
        });
        text.setColor(titleColor1);
        text.setFont(selectedfonts1);
        text.addEffect("fadeInRight", 1.1, 1.1);
        sceneLast.addChild(text);

        const text2 = new FFText({
          text: fieldText2,
          fontSize: fontSize2,
          x: 1060,
          y: 370,
        });
        text2.setColor(titleColor2);
        text.setFont(selectedfonts2);
        text2.addEffect("fadeInRight", 1.2, 1.2);
        sceneLast.addChild(text2);

        const text3 = new FFText({
          text: fieldText3,
          fontSize: fontSize3,
          x: 1060,
          y: 420,
        });
        text3.setColor(titleColor3);
        text.setFont(selectedfonts3);
        text3.addEffect("fadeInRight", 1.3, 1.3);
        sceneLast.addChild(text3);

        const text4 = new FFText({
          text: fieldText4,
          fontSize: fontSize4,
          x: 1060,
          y: 470,
        });
        text4.setColor(titleColor3);
        text.setFont(selectedfonts4);
        text4.addEffect("fadeInRight", 1.4, 1.4);
        sceneLast.addChild(text4);

        sceneLast.setDuration(3);
        creator.addChild(sceneLast);
      }
      console.log("here");
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
      const newUpload = new UserVideos({
        userId: userId,
        videoTitle: videoTitle,
        templateImage: templateImage,
        path: path,
      });
      const uploadData = await newUpload.save();
      deleteFiles(
        "./src/Assets/template/videos/" +
          userId +
          "/template1/img1.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
          userId +
          "/template1/img2.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
          userId +
          "/template1/img3.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
          userId +
          "/template1/img4.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
          userId +
          "/template1/img41.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
          userId +
          "/template1/img42.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
          userId +
          "/template1/img43.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
          userId +
          "/template1/img44.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
          userId +
          "/template1/img101.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
          userId +
          "/template1/img102.png"
      );
      deleteFiles(
        "./src/Assets/template/videos/" +
          userId +
          "/template1/img103.png"
      );
      res.status(200).json({
        message: "successfull",
        data: path,
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
            assetsPath + "template/videos/" + userId + "/template1/img1.png"
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
                assetsPath + "template/videos/" + userId + "/template1/img2.png"
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
                      "/template1/img3.png"
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
                          "/template1/img4.png"
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
            assetsPath + "template/videos/" + userId + "/template1/img41.png"
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
                  "/template1/img42.png"
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
                      "/template1/img43.png"
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
                          "/template1/img44.png"
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
            assetsPath + "template/videos/" + userId + "/template1/img101.png"
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
                  "/template1/img102.png"
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
                      "/template1/img103.png"
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

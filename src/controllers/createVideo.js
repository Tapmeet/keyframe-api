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
const {
  FFCreatorCenter,
  FFScene,
  FFImage,
  FFText,
  FFCreator,
} = require("ffcreatorlite");
const Template = require("../models/templates");
const Block = require("../models/templateBlocks");
const Scene = require("../models/lastBlock");
const UserVideos = require("../models/userVideos");
const fs = require("fs");
const gl = require("gl")(10, 10);
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const ffmpegProbe = require("ffmpeg-probe");
const ffprobe = require("ffprobe-static");
ffmpeg.setFfprobePath(ffprobe.path);
ffmpeg.setFfmpegPath(ffmpegPath);
let userId;
const concat = require("ffmpeg-concat");
const glob = require("glob");
const { title } = require("process");
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
  //console.log(req.body.videos);
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
      duration:1000,
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
    transitions: transitionsvideo,
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
    const lastScene = await Scene.findOne({ templateId: templateId });
    const data = {
      templateBlock: templateBlock,
      template: template,
    };
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
      const folderNames =
        "./src/Assets/template/videos/" + userId + "/template1";
      try {
        if (!fs.existsSync(folderNames)) {
          fs.mkdirSync(folderNames);
        }
      } catch (err) {
        console.error(err);
      }
      // const functionName = "videoTemplate" + template.templateNumber;

      const lastVideo = await lastSceneVideo(lastScene);
      const promises = templateBlock.map(async (data) => {
        const functionName = "videoTemplate" + data.sceneId;
        const response = await global[functionName](data, req, res);
        return response;
      });

      Promise.all(promises)
        .then((results) => {
          const result = [...results, lastVideo];
          res.status(200).json({
            message: "successfull",
            data: result,
          });
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      res.status(200).json({ message: "Video failed 1" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
global.videoTemplate1 = async function videoTemplate1(data, req, res) {
  return new Promise((resolve) => {
    var command = new ffmpeg();
    var fontfamily;
    var selectedfonts;
    var container1 = "";
    var container2 = "";
    var container3 = "";
    var container4 = "";
    var videoCheck = "";
    data.sceneData.media.map(async function (block, index) {
      if (container1 == "") {
        container1 = "./src/Assets/" + block.url;
      } else if (container2 == "") {
        container2 = "./src/Assets/" + block.url;
      } else if (container3 == "") {
        container3 = "./src/Assets/" + block.url;
      } else if (container4 == "") {
        container4 = "./src/Assets/" + block.url;
      }
      if (block.type != "image") {
        videoCheck = 1;
      }
      if (index + 1 == data.sceneData.media.length) {
        await block1Video(
          [container1, container2, container3, container4],
          videoCheck,
          data
        );
      }
    });

    async function block1Video(inputs, videoCheck, block) {
      const videoChecks = videoCheck;
      const folderName =
        "./src/Assets/template/videos/" + userId + "/template1";
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
            if (block.sceneData.content) {
              var datas = {
                block: block.sceneData,
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
                  "template/videos/" +
                  userId +
                  "/template1/block-1-video-1.mp4",
              });
            }
          });
      } else {
        command
          .complexFilter(
            "[0:v]  setpts=PTS-STARTPTS, scale=950:530,pad=960:540:5:5:white [a0];[1:v] setpts=PTS-STARTPTS, scale=950:530,pad=960:540:5:5:white [a1];[2:v] setpts=PTS-STARTPTS,  scale=950:530,pad=960:540:5:5:white [a2];[3:v] setpts=PTS-STARTPTS,  scale=950:530,pad=960:540:5:5:white [a3];[a0][a1][a2][a3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0[out]"
          )
          .loop("6")
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
            if (block.sceneData.content) {
              var datas = {
                block: block.sceneData,
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
                  "template/videos/" +
                  userId +
                  "/template1/block-1-video-1.mp4",
              });
              return;
            }
          });
      }

      function block1VideoTxt(datas, req, res) {
        fontfamily = datas.block.fontFamily;
        fonts.map(function (font) {
          if (font.family == fontfamily) {
            if (datas.block.fontWeight == "lighter") {
              selectedfonts = font.lighter;
            } else if (datas.block.fontWeight == "normal") {
              selectedfonts = font.file;
            } else if (datas.block.fontWeight == "bold") {
              selectedfonts = font.bold;
            }
          }
        });
        var commands = ffmpeg();
        var titleColor = datas.block.textColor;
        if (titleColor.length == "4") {
          titleColor = titleColor.replaceAll(
            "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
            "#$1$1$2$2$3$3"
          );
        }
        const content = datas.block.content;
        const contentParts = content.split("\n");
        const {
          FFScene,
          FFText,
          FFVideo,
          FFAlbum,
          FFImage,
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
        });
        const scene1 = new FFScene();
        scene1.setBgColor("#fff");

        const video = new FFVideo({
          path: datas.file,
          x: 960,
          y: 540,
          width: 1920,
          height: 1080,
        });
        video.addEffect("zoomIn", 1, 0);
        scene1.addChild(video);

        const fimg1 = new FFImage({
          path: assetsPath + "whitebg.png",
          x: 960,
          y: 540,
        });
        fimg1.addEffect("fadeInUp", 1, 1);
        //fimg1.setScale(0.5);

        scene1.addChild(fimg1);
        const fontSize1 = parseInt(datas.block.textSize) + 20;
        const text = new FFText({
          text: contentParts[0],
          fontSize: fontSize1,
          x: 960,
          y: 500,
        });
        text.setColor(titleColor);
        text.setFont(selectedfonts);
        text.addEffect("fadeInDown", 1.5, 1.5);
        const text2 = new FFText({
          text: contentParts[1],
          fontSize: fontSize1,
          x: 960,
          y: 560,
        });
        text.alignCenter();
        text.setStyle({ padding: [0, 20, 10, 20] });

        text2.alignCenter();
        text2.setStyle({ padding: [4, 20, 6, 20] });

        scene1.addChild(text);
        text2.setColor(titleColor);
        text2.setFont(selectedfonts);
        text2.addEffect("fadeInDown", 1.5, 1.5);
        scene1.addChild(text2);

        scene1.setDuration(5);
        creator.addChild(scene1);
        //creator.output(path.join(__dirname, "./src/Assets/template/videos/" + userId + "/template1/block-1-text-video.mp4"));
        creator.start();
        creator.on("error", (e) => {
          //  console.log(`FFCreator error: ${JSON.stringify(e)}`);
        });
        creator.on("progress", (e) => {
          // console.log(`FFCreatorLite progress: ${(e.percent * 100) >> 0}%`);
        });

        creator.on("complete", (e) => {
          console.log("herer");
          fs.rename(
            e.output,
            "./src/Assets/template/videos/" +
              userId +
              "/template1/block-1-text-video.mp4",
            () => {
              console.log("\nFile Renamed hreee!\n");
              var finalvideo1 =
                assetsPath +
                "template/videos/" +
                userId +
                "/template1/block-1-text-video.mp4";
              deleteFiles(
                "./src/Assets/template/videos/" +
                  userId +
                  "/template1/block-1-video-1.mp4"
              );
              resolve(finalvideo1);
            }
          );

          // deleteFiles(
          //   "./src/Assets/template/videos/" +
          //     userId +
          //     "/template1/block-1-video-1.mp4"
          // );
          //resolve(finalvideo1);
        });
        // ffmpeg(datas.file)
        //   .complexFilter(
        //     [
        //       "scale=1920:1080[rescaled]",
        //       {
        //         filter: "drawbox",
        //         options: {
        //           x: "(iw/2 - iw/5 - 35)",
        //           y: "(ih/2 - ih/6)",
        //           height: 340,
        //           width: 840,
        //           color: "white",
        //           t: "fill",
        //           enable: "between(t,0.50,60000)",
        //         },
        //         inputs: "rescaled",
        //         outputs: "output2",
        //       },
        //       {
        //         filter: "drawtext",
        //         options: {
        //           fontfile: selectedfonts,
        //           text: contentParts[0],
        //           fontsize: parseInt(datas.block.textSize) + 20,
        //           fontcolor: titleColor,
        //           x: "(w-tw)/2",
        //           y: "((h-text_h)/2)-(text_h-(th/4))",
        //           box: 1,
        //           boxcolor: "white@0.0",
        //           boxborderw: "50",
        //           bordercolor: "white",
        //           // enable: "between(t,1.1,10000)",
        //           alpha:
        //             "if(lt(t,1),0,if(lt(t,3),(t-1)/2,if(lt(t,4),1,if(lt(t,504),(500-(t-4))/500,0))))",
        //         },
        //         inputs: "output2",
        //         outputs: "output4",
        //       },
        //       {
        //         filter: "drawtext",
        //         options: {
        //           fontfile: selectedfonts,
        //           text: contentParts[1],
        //           fontsize: parseInt(datas.block.textSize) + 20,
        //           fontcolor: titleColor,
        //           x: "(w-tw)/2",
        //           y: "((h-text_h)/2)+(text_h-(th/4))",
        //           box: 1,
        //           boxcolor: "white@0.0",
        //           boxborderw: "50",
        //           bordercolor: "white",
        //           // enable: "between(t,2,10000)",
        //           alpha:
        //             "if(lt(t,1),0,if(lt(t,3),(t-1)/2,if(lt(t,4),1,if(lt(t,504),(500-(t-4))/500,0))))",
        //         },
        //         inputs: "output4",
        //         outputs: "output",
        //       },
        //     ],
        //     "output"
        //   )
        //   .addOption("-c:v", "libx264")
        //   .save(
        //     "./src/Assets/template/videos/" +
        //       userId +
        //       "/template1/block-1-text-video.mp4"
        //   )
        //   .on("start", function (commandLine) {
        //     console.log("step2");
        //   })
        //   .on("error", function (er) {
        //     console.log(er);
        //     return;
        //   })
        //   .on("end", function (commandLine) {
        //     console.log("success");
        //     var finalvideo1 =
        //       assetsPath +
        //       "template/videos/" +
        //       userId +
        //       "/template1/block-1-text-video.mp4";
        //     deleteFiles(
        //       "./src/Assets/template/videos/" +
        //         userId +
        //         "/template1/block-1-video-1.mp4"
        //     );
        //     resolve(finalvideo1);
        //   });
      }
    }
  });
};

// Video Scene 2
global.videoTemplate2 = async function videoTemplate2(data, req, res) {
  return new Promise((resolve) => {
    var i = 1;
    var k = 1;
    var video1, video2;
    inputs = [data.sceneData.media[0].url, data.sceneData.media[1].url];
    inputs.forEach((input) => {
      var commands = new ffmpeg();
      if (
        data.sceneData.media[0].type == "image" ||
        data.sceneData.media[1].type == "image"
      ) {
        commands
          .input(assetsPath + input)
          .complexFilter(
            [
              "scale=1920:1080[rescaled]",
              {
                filter: "zoompan",
                options: "z='zoom+0.0009'",
                inputs: "rescaled",
                outputs: "padded",
              },
            ],
            "padded"
          )
          .loop(3.5)
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
                let datas = {
                  video1: video1,
                  video2: video2,
                };
                mergeBlock2Videos(datas, data);
                console.log("there");
              }, 500);
            }
            i = i + 1;
          });
      } else {
        commands
          .input(assetsPath + input)
          .complexFilter(["scale=1280:720[rescaled]"], "rescaled")
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
            // res.status(200).json({ message: "Video failed 5" });
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
                let datas = {
                  video1: video1,
                  video2: video2,
                };
                console.log("here");
                mergeBlock2Videos(datas, data);
              }, 500);
            }

            i = i + 1;
          });
      }
      k = k + 1;
    });
    async function mergeBlock2Videos(datas, data) {
      try {
        const createdvideo = await concat({
          output:
            "./src/Assets/template/videos/" +
            userId +
            "/template1/blockmerged.mp4",
          videos: [datas.video1, datas.video2],
          transitions: [
            {
              name: "directional",
              params: { direction: [1.0, 0.0] },
              duration: 1000,
            },
          ],
        });
        if (typeof createdvideo == "undefined") {
          block2VideoTxt();
        }
      } catch {
        console.log("failed heres");
        //block2VideoTxt();
      }
    }
    function block2VideoTxt() {
      var commands = new ffmpeg();
      if (data.sceneData.titleColor) {
        var titleColor = data.sceneData.titleColor;
      } else {
        var titleColor = data.sceneData.textColor;
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
      if (typeof data.sceneData.content[0].title != undefined) {
        var fieldTitle1 = data.sceneData.content[0].title;
        var fieldText1 = data.sceneData.content[0].text;
      } else {
        var fieldTitle1 = "";
        var fieldText1 = "";
      }
      if (data.sceneData.content[1] != undefined) {
        var fieldTitle2 = data.sceneData.content[1].title;
        var fieldText2 = data.sceneData.content[1].text;
      } else {
        var fieldTitle2 = "";
        var fieldText2 = "";
      }
      if (data.sceneData.content[2] != undefined) {
        var fieldTitle3 = data.sceneData.content[2].title;
        var fieldText3 = data.sceneData.content[2].text;
      } else {
        var fieldTitle3 = "";
        var fieldText3 = "";
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
                fontfile: selectedfonts,
                text: fieldTitle1,
                fontsize: parseInt(titletextSize) + 15,
                fontcolor: titleColor,
                line_spacing: "20",
                x: "120",
                y: "150",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "50",
                bordercolor: "white",
                alpha:
                  "if(lt(t,0),0,if(lt(t,1),(t-0)/1,if(lt(t,2),1,if(lt(t,30002),(30000-(t-2))/30000,0))))",
              },
              inputs: "firstOne",
              outputs: "output2",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts,
                text: fieldText1,
                fontsize: parseInt(data.sceneData.textSize) + 15,
                fontcolor: subtitleColor,
                x: "120",
                y: "220",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "50",
                bordercolor: "white",
                alpha:
                  "if(lt(t,0),0,if(lt(t,1),(t-0)/1,if(lt(t,2),1,if(lt(t,30002),(30000-(t-2))/30000,0))))",
              },
              inputs: "output2",
              outputs: "output3",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts,
                text: fieldTitle2,
                fontsize: parseInt(titletextSize) + 15,
                fontcolor: titleColor,
                x: "120",
                y: "320",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "50",
                bordercolor: "white",
                alpha:
                  "if(lt(t,1),0,if(lt(t,2),(t-1)/1,if(lt(t,4),1,if(lt(t,30004),(30000-(t-4))/30000,0))))",
              },
              inputs: "output3",
              outputs: "output4",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts,
                text: fieldText2,
                fontsize: parseInt(data.sceneData.textSize) + 15,
                fontcolor: subtitleColor,
                x: "120",
                y: "370",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "50",
                bordercolor: "white",
                alpha:
                  "if(lt(t,1),0,if(lt(t,2),(t-1)/1,if(lt(t,4),1,if(lt(t,30004),(30000-(t-4))/30000,0))))",
              },
              inputs: "output4",
              outputs: "output5",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts,
                text: fieldTitle3,
                fontsize: parseInt(titletextSize) + 15,
                fontcolor: titleColor,
                x: "120",
                y: "470",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "50",
                bordercolor: "white",
                enable: "between(t,2,10000)",
                alpha:
                  "if(lt(t,2),0,if(lt(t,3),(t-2)/1,if(lt(t,5.5),1,if(lt(t,30005.5),(30000-(t-5.5))/30000,0))))",
              },
              inputs: "output5",
              outputs: "output6",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts,
                text: fieldText3,
                fontsize: parseInt(data.sceneData.textSize) + 15,
                fontcolor: subtitleColor,
                x: "120",
                y: "520",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "50",
                bordercolor: "white",
                alpha:
                  "if(lt(t,2),0,if(lt(t,3),(t-2)/1,if(lt(t,5.5),1,if(lt(t,30005.5),(30000-(t-5.5))/30000,0))))",
              },
              inputs: "output6",
              outputs: "output7",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts,
                text: fieldTitle4,
                fontsize: parseInt(titletextSize) + 15,
                fontcolor: titleColor,
                x: "120",
                y: "620",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "50",
                bordercolor: "white",
                alpha:
                  "if(lt(t,3),0,if(lt(t,4),(t-3)/1,if(lt(t,7),1,if(lt(t,30007),(30000-(t-7))/30000,0))))",
              },
              inputs: "output7",
              outputs: "output8",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts,
                text: fieldText4,
                fontsize: parseInt(data.sceneData.textSize) + 15,
                fontcolor: subtitleColor,
                x: "120",
                y: "670",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "50",
                bordercolor: "white",
                alpha:
                  "if(lt(t,3),0,if(lt(t,4),(t-3)/1,if(lt(t,7),1,if(lt(t,30007),(30000-(t-7))/30000,0))))",
              },
              inputs: "output8",
              outputs: "output9",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts,
                text: fieldTitle5,
                fontsize: parseInt(titletextSize) + 15,
                fontcolor: titleColor,
                x: "120",
                y: "770",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "50",
                bordercolor: "white",
                alpha:
                  "if(lt(t,4),0,if(lt(t,5),(t-4)/1,if(lt(t,9),1,if(lt(t,30009),(30000-(t-9))/30000,0))))",
              },
              inputs: "output9",
              outputs: "output10",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts,
                text: fieldText5,
                fontsize: parseInt(data.sceneData.textSize) + 15,
                fontcolor: subtitleColor,
                x: "120",
                y: "820",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "50",
                bordercolor: "white",
                alpha:
                  "if(lt(t,4),0,if(lt(t,5),(t-4)/1,if(lt(t,9),1,if(lt(t,30009),(30000-(t-9))/30000,0))))",
              },
              inputs: "output10",
              outputs: "output",
            },
          ],
          "output"
        )
        .addOption("-c:v", "libx264")
        .save(
          "./src/Assets/template/videos/" + userId + "/template1/block2text.mp4"
        )
        .on("start", function (commandLine) {
          console.log(commandLine);
        })
        .on("error", function (er) {
          res.status(200).json({ message: " 7" });
          console.log(er);
          // console.log("error occured: " + er.message);
          return;
        })
        .on("end", function (commandLine) {
          console.log("here");
          let finalvideo2 =
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/block2text.mp4";

          deleteFiles(
            "./src/Assets/template/videos/" +
              userId +
              "/template1/block-2-2.mp4"
          );
          deleteFiles(
            "./src/Assets/template/videos/" +
              userId +
              "/template1/block-2-1.mp4"
          );
          deleteFiles(
            "./src/Assets/template/videos/" +
              userId +
              "/template1/blockmerged.mp4"
          );
          resolve(finalvideo2);
        });
    }
  });
};

// Video Scene 3
global.videoTemplate3 = async function videoTemplate3(data, req, res) {
  return new Promise((resolve) => {
    var commands = new ffmpeg();
    var i = 1;
    var k = 1;
    var video1, video2;
    inputs = [data.sceneData.media[0].url, data.sceneData.media[1].url];
    inputs.forEach((input) => {
      var commands = new ffmpeg();
      if (
        data.sceneData.media[0].type == "image" ||
        data.sceneData.media[0].type == "image"
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
              "/template1/block-3-" +
              k +
              ".mp4"
          )
          .on("start", function (commandLine) {
            console.log("step4");
          })
          .on("error", function (er) {
            res.status(200).json({ message: "Video failed 9" });
            console.log(er);
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
      } else {
        commands
          .input(assetsPath + input)
          .complexFilter(["scale=1280:720[rescaled]"], "rescaled")
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
        const createdvideo = await concat({
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
        if (typeof createdvideo == "undefined") {
          setTimeout(function () {
            block3VideoTxt();
          }, 600);
        }
      } catch {
        console.log("failed here");
        // res.status(500).json({ message: "Video failed 11" });
      }
    }

    function block3VideoTxt() {
      var commands = new ffmpeg();
      var titleColor = data.sceneData.textColor;
      if (titleColor.length == "4") {
        titleColor = titleColor.replaceAll(
          "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
          "#$1$1$2$2$3$3"
        );
      }
      var result = data.sceneData.content.split(" ");
      var text = "";
      for (var i = 0; i < result.length; i++) {
        if (i == 7) {
          text = text + result[i] + " \n ";
        } else {
          text = text + result[i] + " ";
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
      setTimeout(function () {
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
                  fontsize: parseInt(data.sceneData.textSize) + 25,
                  fontcolor: titleColor,
                  line_spacing: 30,
                  x: "min(4*(tw+10)-(abs(4-2*(t-1)))*(tw+10)-tw,10)",
                  y: "H-th-100",
                  box: 1,
                  boxcolor: "white@1",
                  boxborderw: "50",
                  bordercolor: "white",
                  // alpha:
                  //   "if(lt(t,0),0,if(lt(t,2),(t-0)/2,if(lt(t,3),1,if(lt(t,503),(500-(t-3))/500,0))))",
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
            console.log("step6 start");
          })
          .on("error", function (er) {
            res.status(200).json({ message: "Video failed 12" });
            console.log(er);
            return;
          })
          .on("end", function (commandLine) {
            console.log("step6 end");
            let finalvideo3 =
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/block3FinalVideo.mp4";
            deleteFiles(
              "./src/Assets/template/videos/" +
                userId +
                "/template1/block-3-2.mp4"
            );
            deleteFiles(
              "./src/Assets/template/videos/" +
                userId +
                "/template1/block-3-1.mp4"
            );
            deleteFiles(
              "./src/Assets/template/videos/" +
                userId +
                "/template1/block3merged.mp4"
            );
            resolve(finalvideo3);
          });
      }, 600);
    }
  });
};
// Video Scene 4
global.videoTemplate4 = async function videoTemplate4(data, req, res) {
  return new Promise((resolve) => {
    var commands = new ffmpeg();
    var result = data.sceneData.textArray[0].text.split(" ");
    var text1 = "";
    var text2 = "";
    for (var i = 0; i < result.length; i++) {
      if (i >= 6) {
        //  text1= text1 + result[i] + " \n ";
        text2 = text2 + result[i] + " ";
      } else {
        text1 = text1 + result[i] + " ";
      }
    }
    // console.log(text2);
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
      const {
        FFScene,
        FFText,
        FFVideo,
        FFAlbum,
        FFImage,
        FFCreator,
      } = require("ffcreator");
      const outputDir = path.join(
        __dirname,
        "./src/Assets/template/videos/" + userId + "/template1"
      );
      const creator = new FFCreator({
        //  cacheDir,
        outputDir,
        width: 960,
        height: 1080,
        log: true,
      });
      const scene1 = new FFScene();
      const image = new FFImage({
        path: assetsPath + data.sceneData.media[0].url,
        x: 480,
        y: 540,
      });
      image.addEffect("moveInUp", 1, 1);
      scene1.addChild(image);
      scene1.setBgColor("#fff");
      const fimg1 = new FFImage({
        path: assetsPath + "whitebg2.png",
        x: 480,
        y: 1010,
      });
      fimg1.addEffect("fadeInUp", 1, 1);
      //fimg1.setScale(0.5);

      scene1.addChild(fimg1);
      const fontSize1 = parseInt(data.sceneData.textArray[0].fontSize) + 15;
      const text = new FFText({
        text: text1,
        fontSize: fontSize1,
        x: 50,
        y: 960,
      });
      text.setColor(titleColor);
      text.setFont(selectedfonts);
      text.addEffect("fadeInUp", 1.5, 1.5);
      scene1.addChild(text);
      if (text2 != "") {
        const textNext = new FFText({
          text: text2,
          fontSize: fontSize1,
          x: 50,
          y: 1010,
        });
        textNext.setColor(titleColor);
        textNext.setFont(selectedfonts);
        textNext.addEffect("fadeInUp", 1.5, 1.5);
        scene1.addChild(textNext);
      }
      scene1.setDuration(4);
      creator.addChild(scene1);
      //creator.output(path.join(__dirname, "./src/Assets/template/videos/" + userId + "/template1/block-1-text-video.mp4"));
      creator.start();
      creator.on("error", (e) => {
        //  console.log(`FFCreator error: ${JSON.stringify(e)}`);
      });
      creator.on("progress", (e) => {
        // console.log(`FFCreatorLite progress: ${(e.percent * 100) >> 0}%`);
      });

      creator.on("complete", (e) => {
        fs.rename(
          e.output,
          "./src/Assets/template/videos/" +
            userId +
            "/template1/block4video1.mp4",
          () => {
            console.log("\nFile Renamed hreee!\n");
            block4video2();
          }
        );
      });
      // commands
      //   .input(assetsPath + data.sceneData.media[0].url)
      //   .complexFilter(
      //     [
      //       "crop=iw-700:ih-200, scale=960:1080[checked]",
      //       {
      //         filter: "drawbox",
      //         options: {
      //           x: 0,
      //           y: "920",
      //           height: 200,
      //           width: 960,
      //           color: "white",
      //           t: "fill",
      //         },
      //         inputs: "checked",
      //         outputs: "output1",
      //       },
      //       {
      //         filter: "drawtext",
      //         options: {
      //           fontfile: selectedfonts,
      //           text: text,
      //           fontsize: parseInt(data.sceneData.textArray[0].fontSize) + 15,
      //           fontcolor: titleColor,
      //           line_spacing: 20,
      //           x: "50",
      //           y: "h - th- 25 - min(4*(th+10)-(abs(4-2*(t-1)))*(th+10)-th,10)",
      //           box: 1,
      //           boxcolor: "white@1",
      //           boxborderw: "30",
      //           bordercolor: "white",
      //           enable: "gte(t,1)",
      //         },
      //         inputs: "output1",
      //         outputs: "output",
      //       },
      //     ],
      //     "output"
      //   )
      //   .loop(4)
      //   .addOption("-pix_fmt", "yuv420p")
      //   .addOption("-framerate", "50")
      //   .addOption("-c:v", "libx264")
      //   .save(
      //     "./src/Assets/template/videos/" +
      //       userId +
      //       "/template1/block4video1.mp4"
      //   )
      //   .on("start", function (commandLine) {
      //     console.log("step62");
      //   })
      //   .on("error", function (er) {
      //     res.status(200).json({ message: "Video failed 14" });
      //     console.log(er);
      //     // console.log("error occured: " + er.message);
      //     return;
      //   })
      //   .on("end", function (commandLine) {
      //     block4video2();
      //   });
    } else {
      commands
        .input(assetsPath + data.sceneData.media[0].url)
        .complexFilter(
          [
            "crop=iw-700:ih-200,scale=960:1080[checked]",
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
                fontfile: selectedfonts,
                text: text,
                fontsize: parseInt(data.sceneData.textArray[0].fontSize) + 15,
                fontcolor: titleColor,
                line_spacing: 20,
                x: "50",
                y: "h - th- 25 - min(4*(th+10)-(abs(4-2*(t-1)))*(th+10)-th,10)",
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
          block4video2();
        });
    }

    function block4video2() {
      var commands = new ffmpeg();
      if (data.sceneData.media[1].type == "image") {
        console.log("here");
        commands
          .input(assetsPath + data.sceneData.media[1].url)
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
            return;
          })
          .on("end", function (commandLine) {
            let datas = {
              video1:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video1.mp4",
              video2:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video2.mp4",
            };
            mergeBlock4Videos1(datas, req, res);
          });
      } else {
        commands
          .input(assetsPath + data.sceneData.media[1].url)
          .complexFilter(
            ["crop=iw-700:ih-40,scale=960:1080[checked]"],
            "checked"
          )
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
            return;
          })
          .on("end", function (commandLine) {
            let datas = {
              video1:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video1.mp4",
              video2:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video2.mp4",
            };
            mergeBlock4Videos1(datas, req, res);
          });
      }
    }
    async function mergeBlock4Videos1(data) {
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
          block4video3();
        }
      } catch {
        console.log("failed 18");
        // res.status(500).json({ message: "Video failed 18" });
      }
    }

    function block4video3() {
      var commands = new ffmpeg();
      if (data.sceneData.media[2].type == "image") {
        commands
          .input(assetsPath + data.sceneData.media[2].url)
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
            block4video4();
          });
      } else {
        commands
          .input(assetsPath + data.sceneData.media[2].url)
          .complexFilter(
            ["crop=iw-700:ih-200,scale=960:1080[checked]"],
            "checked"
          )
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
            block4video4();
          });
      }
    }

    function block4video4() {
      var commands = new ffmpeg();
      var result = data.sceneData.textArray[1].text.split(" ");
      var text1 = "";
      var text2 = "";
      for (var i = 0; i < result.length; i++) {
        if (i >= 6) {
          //  text1= text1 + result[i] + " \n ";
          text2 = text2 + result[i] + " ";
        } else {
          text1 = text1 + result[i] + " ";
        }
      }
      // for (var i = 0; i < result.length; i++) {
      //   if (i == 6) {
      //     text = text + result[i] + " \n ";
      //   } else {
      //     text = text + result[i] + " ";
      //   }
      // }
      let fontfamily = data.sceneData.textArray[1].fontFamily;
      let selectedfonts;
      fonts.map(function (font) {
        if (font.family == fontfamily) {
          if (data.sceneData.textArray[1].fontWeight == "lighter") {
            selectedfonts = font.lighter;
          } else if (data.sceneData.textArray[1].fontWeight == "normal") {
            selectedfonts = font.file;
          } else if (data.sceneData.textArray[1].fontWeight == "bold") {
            selectedfonts = font.bold;
          }
        }
      });
      var titleColor = data.sceneData.textArray[1].fontColor;
      if (titleColor.length == "4") {
        titleColor = titleColor.replaceAll(
          "#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])",
          "#$1$1$2$2$3$3"
        );
      }
      if (data.sceneData.media[3].type == "image") {
        const {
          FFScene,
          FFText,
          FFVideo,
          FFAlbum,
          FFImage,
          FFCreator,
        } = require("ffcreator");
        const outputDir = path.join(
          __dirname,
          "./src/Assets/template/videos/" + userId + "/template1"
        );
        const creator = new FFCreator({
          //  cacheDir,
          outputDir,
          width: 960,
          height: 1080,
          log: true,
        });
        const scene1 = new FFScene();
        const image = new FFImage({
          path: assetsPath + data.sceneData.media[0].url,
          x: 480,
          y: 540,
        });
        image.addEffect("moveInUp", 1, 1);
        image.addEffect("fadeOutDown", 1, 4);
        scene1.addChild(image);
        scene1.setBgColor("#fff");
        const fimg1 = new FFImage({
          path: assetsPath + "whitebg2.png",
          x: 480,
          y: 1010,
        });
        fimg1.addEffect("fadeInUp", 1, 1);
        //fimg1.setScale(0.5);

        scene1.addChild(fimg1);
        const fontSize1 = parseInt(data.sceneData.textArray[0].fontSize) + 15;
        const text = new FFText({
          text: text1,
          fontSize: fontSize1,
          x: 50,
          y: 960,
        });
        text.setColor(titleColor);
        text.setFont(selectedfonts);
        text.addEffect("fadeInUp", 1.5, 1.5);
        scene1.addChild(text);
        if (text2 != "") {
          const textNext = new FFText({
            text: text2,
            fontSize: fontSize1,
            x: 50,
            y: 1010,
          });
          textNext.setColor(titleColor);
          textNext.setFont(selectedfonts);
          textNext.addEffect("fadeInUp", 1.5, 1.5);
          scene1.addChild(textNext);
        }
        scene1.setDuration(4);
        creator.addChild(scene1);
        //creator.output(path.join(__dirname, "./src/Assets/template/videos/" + userId + "/template1/block-1-text-video.mp4"));
        creator.start();
        creator.on("error", (e) => {
          //  console.log(`FFCreator error: ${JSON.stringify(e)}`);
        });
        creator.on("progress", (e) => {
          // console.log(`FFCreatorLite progress: ${(e.percent * 100) >> 0}%`);
        });

        creator.on("complete", (e) => {
          fs.rename(
            e.output,
            "./src/Assets/template/videos/" +
              userId +
              "/template1/block4video4.mp4",
            () => {
              console.log("\nFile Renamed hreee!\n");
              let datas = {
                video1:
                  "./src/Assets/template/videos/" +
                  userId +
                  "/template1/block4video3.mp4",
                video2:
                  "./src/Assets/template/videos/" +
                  userId +
                  "/template1/block4video4.mp4",
              };
              mergeBlock4Videos2(datas);
            }
          );
        });
        // commands
        //   .input(assetsPath + data.sceneData.media[3].url)
        //   .complexFilter(
        //     [
        //       "crop=iw-700:ih-200,scale=960:1080[checked]",
        //       {
        //         filter: "drawbox",
        //         options: {
        //           x: 0,
        //           y: "920",
        //           height: 200,
        //           width: 960,
        //           color: "white",
        //           t: "fill",
        //         },
        //         inputs: "checked",
        //         outputs: "output1",
        //       },
        //       {
        //         filter: "drawtext",
        //         options: {
        //           fontfile: selectedfonts,
        //           text: text,
        //           fontsize: parseInt(data.sceneData.textArray[1].fontSize) + 15,
        //           fontcolor: titleColor,
        //           line_spacing: 20,
        //           x: "50",
        //           y:
        //             "h - th- 25 - min(4*(th+10)-(abs(4-2*(t-1)))*(th+10)-th,10)",
        //           box: 1,
        //           boxcolor: "white@1",
        //           boxborderw: "30",
        //           bordercolor: "white",
        //           enable: "gte(t,1)",
        //         },
        //         inputs: "output1",
        //         outputs: "output",
        //       },
        //     ],
        //     "output"
        //   )
        //   .loop(4)
        //   .addOption("-pix_fmt", "yuv420p")
        //   .addOption("-framerate", "50")
        //   .addOption("-c:v", "libx264")
        //   .save(
        //     "./src/Assets/template/videos/" +
        //       userId +
        //       "/template1/block4video4.mp4"
        //   )
        //   .on("start", function (commandLine) {
        //     console.log("step62");
        //   })
        //   .on("error", function (er) {
        //     res.status(200).json({ message: "Video failed 21" });
        //     console.log(er);
        //     // console.log("error occured: " + er.message);
        //     return;
        //   })
        //   .on("end", function (commandLine) {
        //     let datas = {
        //       video1:
        //         "./src/Assets/template/videos/" +
        //         userId +
        //         "/template1/block4video3.mp4",
        //       video2:
        //         "./src/Assets/template/videos/" +
        //         userId +
        //         "/template1/block4video4.mp4",
        //     };
        //     mergeBlock4Videos2(datas);
        //   });
      } else {
        commands
          .input(assetsPath + data.sceneData.containerFour)
          .complexFilter(
            [
              "scale=crop=iw-700:ih-200,960:1080[checked]",
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
                  fontfile: selectedfonts,
                  text: text,
                  fontsize: parseInt(data.sceneData.textArray[1].fontSize) + 15,
                  fontcolor: titleColor,
                  line_spacing: 20,
                  x: "50",
                  y:
                    "h - th- 25 - min(4*(th+10)-(abs(4-2*(t-1)))*(th+10)-th,10)",
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
            let datas = {
              video1:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video3.mp4",
              video2:
                "./src/Assets/template/videos/" +
                userId +
                "/template1/block4video4.mp4",
            };
            mergeBlock4Videos2(datas);
          });
      }
    }
    async function mergeBlock4Videos2(datas) {
      try {
        const Createdvideo4 = await concat({
          output:
            "./src/Assets/template/videos/" +
            userId +
            "/template1/block4merged2.mp4",
          videos: [datas.video1, datas.video2],
          transitions: [
            {
              name: "directional",
              params: { direction: [0, 1] },
              duration: 1000,
            },
          ],
        });
        if (typeof Createdvideo4 == "undefined") {
          block4Finalmerged();
        }
      } catch {
        res.status(500).json({ message: "Video failed 23" });
      }
    }

    function block4Finalmerged() {
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
          //  res.status(200).json({ message: "Video failed 24" });
          //return;
        })
        .on("end", function () {
          const finalvideo =
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/block4Finalvideo.mp4";
          deleteFiles(
            "./src/Assets/template/videos/" +
              userId +
              "/template1/block4video1.mp4"
          );
          deleteFiles(
            "./src/Assets/template/videos/" +
              userId +
              "/template1/block4video2.mp4"
          );
          deleteFiles(
            "./src/Assets/template/videos/" +
              userId +
              "/template1/block4merged1.mp4"
          );
          deleteFiles(
            "./src/Assets/template/videos/" +
              userId +
              "/template1/block4video3.mp4"
          );
          deleteFiles(
            "./src/Assets/template/videos/" +
              userId +
              "/template1/block4video4.mp4"
          );
          deleteFiles(
            "./src/Assets/template/videos/" +
              userId +
              "/template1/block4merged2.mp4"
          );
          resolve(finalvideo);
        });
    }
  });
};

function lastSceneVideo(data) {
  return new Promise((resolve) => {
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

    const {
      FFScene,
      FFText,
      FFVideo,
      FFAlbum,
      FFImage,
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
    });
    const scene1 = new FFScene();
    scene1.setBgColor("#fff");

    const fbg = new FFImage({
      path: assetsPath + data.sceneData.media[0].url,
      x: 720,
      y: 480,
    });
    fbg.addEffect("fadeInLeft", 0.6, 1.2);
    scene1.addChild(fbg);
    const fimg1 = new FFImage({
      path: assetsPath + data.sceneData.media[1].url,
      x: 1160,
      y: 600,
    });
    fimg1.addEffect("fadeInUp", 1.5, 1.8);
    scene1.addChild(fimg1);

    const text = new FFText({
      text: fieldText1,
      fontSize: fontSize1,
      x: 1060,
      y: 300,
    });
    text.setColor(titleColor1);
    text.setFont(selectedfonts1);
    text.addEffect("fadeInRight", 1.1, 1.1);
    scene1.addChild(text);

    const text2 = new FFText({
      text: fieldText2,
      fontSize: fontSize2,
      x: 1060,
      y: 370,
    });
    text2.setColor(titleColor2);
    text.setFont(selectedfonts2);
    text2.addEffect("fadeInRight", 1.2, 1.2);
    scene1.addChild(text2);

    const text3 = new FFText({
      text: fieldText3,
      fontSize: fontSize3,
      x: 1060,
      y: 420,
    });
    text3.setColor(titleColor3);
    text.setFont(selectedfonts3);
    text3.addEffect("fadeInRight", 1.3, 1.3);
    scene1.addChild(text3);

    const text4 = new FFText({
      text: fieldText4,
      fontSize: fontSize4,
      x: 1060,
      y: 470,
    });
    text4.setColor(titleColor3);
    text.setFont(selectedfonts4);
    text4.addEffect("fadeInRight", 1.4, 1.4);
    scene1.addChild(text4);

    scene1.setDuration(4);
    creator.addChild(scene1);
    creator.start();
    creator.on("error", (e) => {
      //  console.log(`FFCreator error: ${JSON.stringify(e)}`);
    });
    creator.on("progress", (e) => {
      // console.log(`FFCreatorLite progress: ${(e.percent * 100) >> 0}%`);
    });

    creator.on("complete", (e) => {
      fs.rename(
        e.output,
        "./src/Assets/template/videos/" +
          userId +
          "/template1/lastvideoFinal.mp4",
        () => {
          console.log("\nFile Renamed!\n");
          var finalvideoLast =
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/lastvideoFinal.mp4";
          resolve(finalvideoLast);
        }
      );
      console.log(e);
    });
    // var commands = new ffmpeg();
    // commands
    //   .input(assetsPath + "whitebgVideo.mp4")
    //   .input(assetsPath + data.sceneData.media[0].url)
    //   .complexFilter(
    //     "overlay=x=(main_w-overlay_w-100):y=(main_h-overlay_h)/2[outs]"
    //   )
    //   .addOption("-map", "[outs]")
    //   .addOption("-c:v", "libx264")
    //   .addOption("-pix_fmt", "yuv420p")
    //   .addOption("-framerate", "50")
    //   .addOption("-c:v", "libx264")
    //   .save(
    //     "./src/Assets/template/videos/" +
    //       userId +
    //       "/template1/lastvideoLeft.mp4"
    //   )
    //   .on("start", function (commandLine) {
    //     console.log("leastVideo1");
    //   })
    //   .on("error", function (er) {
    //     console.log(er);
    //     //return;
    //   })
    //   .on("end", function (commandLine) {
    //     console.log("here");
    //     lastVideoText();
    //   });
    function lastVideoText() {
      var commands = new ffmpeg();
      // console.log(data.sceneData.textArray)
      if (data.sceneData.textArray[0] != undefined) {
        var titleColor1 = data.sceneData.textArray[0].fontColor;
        let fontfamily = data.sceneData.textArray[0].fontFamily;
        var fontSize1 = data.sceneData.textArray[0].fontSize;
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
        var fontSize2 = data.sceneData.textArray[1].fontSize;
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
        var fontSize3 = data.sceneData.textArray[2].fontSize;
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
        var fontSize3 = "20";
      }
      if (data.sceneData.textArray[3] != undefined) {
        var fieldText4 = data.sceneData.textArray[3].text;
        var titleColor4 = data.sceneData.textArray[3].fontColor;
        let fontfamily = data.sceneData.textArray[3].fontFamily;
        var fontSize4 = data.sceneData.textArray[3].fontSize;
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
        var fontSize4 = "20";
        var selectedfonts4 = fonts[0].file;
      }
      commands
        .input(assetsPath + "whitebgVideo.mp4")
        .complexFilter(
          [
            "scale=960:1080[checked]",
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts1,
                text: fieldText1,
                fontsize: parseInt(fontSize1) + 15,
                fontcolor: titleColor1,
                line_spacing: 20,
                x: "100",
                y: "((h-text_h)/2)-(text_h-(th/6)) - 100",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "30",
                bordercolor: "white",
                alpha:
                  "if(lt(t,0),0,if(lt(t,2),(t-0)/2,if(lt(t,3),1,if(lt(t,503),(500-(t-3))/500,0))))",
              },
              inputs: "checked",
              outputs: "output1",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts2,
                text: fieldText2,
                fontsize: parseInt(fontSize2) + 15,
                fontcolor: titleColor2,
                line_spacing: 20,
                x: "100",
                y: "((h-text_h)/2)+(text_h-(th/4))- 100",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "30",
                bordercolor: "white",
                alpha:
                  "if(lt(t,0),0,if(lt(t,2),(t-0)/2,if(lt(t,3),1,if(lt(t,503),(500-(t-3))/500,0))))",
              },
              inputs: "output1",
              outputs: "output2",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts3,
                text: fieldText3,
                fontsize: parseInt(fontSize3) + 15,
                fontcolor: titleColor3,
                line_spacing: 20,
                x: "100",
                y: "((h-text_h)/2)+(text_h-(th/4))+50- 100",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "30",
                bordercolor: "white",
                alpha:
                  "if(lt(t,0),0,if(lt(t,2),(t-0)/2,if(lt(t,3),1,if(lt(t,503),(500-(t-3))/500,0))))",
              },
              inputs: "output2",
              outputs: "output3",
            },
            {
              filter: "drawtext",
              options: {
                fontfile: selectedfonts4,
                text: fieldText4,
                fontsize: parseInt(fontSize4) + 15,
                fontcolor: titleColor4,
                line_spacing: 20,
                x: "100",
                y: "((h-text_h)/2)+(text_h-(th/4))+ 110 - 100",
                box: 1,
                boxcolor: "white@0.0",
                boxborderw: "30",
                bordercolor: "white",
                alpha:
                  "if(lt(t,0),0,if(lt(t,2),(t-0)/2,if(lt(t,3),1,if(lt(t,503),(500-(t-3))/500,0))))",
              },
              inputs: "output3",
              outputs: "output",
            },
          ],
          "output"
        )
        .save(
          "./src/Assets/template/videos/" +
            userId +
            "/template1/lastvideoRight.mp4"
        )
        .on("start", function (commandLine) {
          console.log("leastVideo1");
        })
        .on("error", function (er) {
          console.log(er);
          //return;
        })
        .on("end", function (commandLine) {
          addLogo();
        });
      function addLogo() {
        var commands = new ffmpeg();
        commands
          .input(
            assetsPath +
              "template/videos/" +
              userId +
              "/template1/lastvideoRight.mp4"
          )
          .input(assetsPath + data.sceneData.media[1].url)
          .complexFilter("overlay=x=(100):y=(main_h + 220 -overlay_h )/2[outs]")
          .addOption("-map", "[outs]")
          .addOption("-c:v", "libx264")
          .addOption("-pix_fmt", "yuv420p")
          .addOption("-framerate", "50")
          .addOption("-c:v", "libx264")
          .save(
            "./src/Assets/template/videos/" +
              userId +
              "/template1/lastvideoLeftFinal.mp4"
          )
          .on("start", function (commandLine) {
            console.log("leastVideo1");
          })
          .on("error", function (er) {
            console.log(er);
            return;
          })
          .on("end", function (commandLine) {
            lastVideoFinalmerged();
          });
      }
      function lastVideoFinalmerged() {
        var command = new ffmpeg();
        command.input(
          "./src/Assets/template/videos/" +
            userId +
            "/template1/lastvideoLeft.mp4"
        );
        command.input(
          "./src/Assets/template/videos/" +
            userId +
            "/template1/lastvideoLeftFinal.mp4"
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
              "/template1/lastvideoFinal.mp4"
          )
          .on("start", function (commandLine) {
            console.log(commandLine);
          })
          .on("error", function (er) {
            console.log(er);
            res.status(200).json({ message: "Video failed 24" });
            //  return;
          })
          .on("end", function () {
            var finalvideoLast =
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/lastvideoFinal.mp4";
            deleteFiles(
              "./src/Assets/template/videos/" +
                userId +
                "/template1/lastvideoLeft.mp4"
            );
            deleteFiles(
              "./src/Assets/template/videos/" +
                userId +
                "/template1/lastvideoLeftFinal.mp4"
            );
            deleteFiles(
              "./src/Assets/template/videos/" +
                userId +
                "/template1/lastvideoRight.mp4"
            );

            resolve(finalvideoLast);
            // console.log("done");
          });
      }
    }
  });
}

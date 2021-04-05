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
const Template = require("../models/templates");
const Block = require("../models/templateBlocks");
const Scene = require("../models/lastBlock");
const fs = require("fs");
const gl = require("gl")(10, 10);
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("ffprobe-static");
ffmpeg.setFfprobePath(ffprobe.path);
ffmpeg.setFfmpegPath(ffmpegPath);
let userId;
const concat = require("ffmpeg-concat");
const glob = require("glob");
const assetsPath = "./src/Assets/";
var fonts = [
  {
    family: "Montserrat",
    file: "./src/Assets/fonts/Montserrat-Regular.ttf",
    light: "./src/Assets/fonts/Montserrat-Light.ttf",
    bold: "./src/Assets/fonts/Montserrat-Bold.ttf",
  },
  {
    family: "Lato",
    file: "./src/Assets/fonts/Lato-Regular.ttf",
    light: "./src/Assets/fonts/Lato-Light.ttf",
    bold: "./src/Assets/fonts/Lato-Bold.ttf",
  },
  {
    family: "Oswald",
    file: "./src/Assets/fonts/Oswald-Regular.ttf",
    light: "./src/Assets/fonts/Oswald-Light.ttf",
    bold: "./src/Assets/fonts/Oswald-Bold.ttf",
  },
  {
    family: "Roboto",
    file: "./src/Assets/fonts/Roboto-Regular.ttf",
    light: "./src/Assets/fonts/Roboto-Light.ttf",
    bold: "./src/Assets/fonts/Roboto-Bold.ttf",
  },
  {
    family: "Noto Serif",
    file: "./src/Assets/fonts/NotoSerif-Regular.ttf",
    light: "./src/Assets/fonts/NotoSerif-Regular.ttf",
    bold: "./src/Assets/fonts/NotoSerif-Bold.ttf",
  },
  {
    family: "Josefin Sans",
    file: "./src/Assets/fonts/JosefinSans-Regular.ttf",
    light: "./src/Assets/fonts/JosefinSans-Light.ttf",
    bold: "./src/Assets/fonts/JosefinSans-Bold.ttf",
  },
  {
    family: "Arimo",
    file: "./src/Assets/fonts/Arimo-Regular.ttf",
    light: "./src/Assets/fonts/Arimo-Medium.ttf",
    bold: "./src/Assets/fonts/Arimo-Bold.ttf",
  },
  {
    family: "Barlow",
    file: "./src/Assets/fonts/Barlow-Regular.ttf",
    light: "./src/Assets/fonts/Barlow-Light.ttf",
    bold: "./src/Assets/fonts/Barlow-Bold.ttf",
  },
  {
    family: "Open Sans",
    file: "./src/Assets/fonts/OpenSans-Regular.ttf",
    light: "./src/Assets/fonts/OpenSans-Light.ttf",
    bold: "./src/Assets/fonts/OpenSans-Bold.ttf",
  },
];
/**
 * @function  "createVideo" used to create new Event
 * @route POST /api/template/create-videos
 * @desc Add Event
 * @access Admin
 */
exports.mergeVideo = async (req, res, next) => {
  //console.log(req.body.videos);
  var i = 1;
  console.log("here");
  console.log(i);
  const { templateId } = req.body;
  const template = await Template.findOne({ _id: templateId });
  const videos = req.body.videos;
  const userId = template.userId;

  var array1 = [];
  var array2 = [];
  var array3 = [];
  var transitions1 = [];
  var transitions2 = [];
  var transitions3 = [];
  req.body.videos.map((data, index) => {
    if (index < 3) {
      array1.push(data);
    }
    if (index < 6 && index > 2) {
      array2.push(data);
    }
    if (index < 9 && index > 5) {
      array3.push(data);
    }
  });
  if (array1.length > 0) {
    array1.map((data, index) => {
      if (index > 0) {
        transitions1.push({
          name: "fade",
          duration: 500,
        });
      }
    });
  }
  if (array2.length > 0) {
    array2.map((data, index) => {
      transitions2.push({
        name: "fade",
        duration: 500,
      });
    });
  }
  if (array3.length > 0) {
    array3.map((data, index) => {
      transitions3.push({
        name: "fade",
        duration: 500,
      });
    });
  }
  const promise = await getVideo();
  Promise.all(promise)
    .then((results) => {
      console.log(results);
    })
    .catch((e) => {
      console.error(e);
    });
  async function getVideo() {
    return new Promise(async (resolve) => {
      const promise1 = await concat({
        output:
          "./src/Assets/template/videos/" +
          userId +
          "/template1/finalVideos1.mp4",
        videos: array1,
        transitions: transitions1,
      });
      if (typeof promise1 == "undefined") {
        i++;
        if (array2.length === 0) {
          resolve(
            "./src/Assets/template/videos/" +
              userId +
              "/template1/finalVideos1.mp4"
          );
          // res.status(200).json({
          //   message: "successful",
          //   data:
          //     "./src/Assets/template/videos/" +
          //     userId +
          //     "/template1/finalVideos1.mp4",
          // });
        } else {
          const newArray = [
            "./src/Assets/template/videos/" +
              userId +
              "/template1/finalVideos1.mp4",
          ].concat(array2);
          console.log(newArray);
          const promise2 = await concat({
            output:
              "./src/Assets/template/videos/" +
              userId +
              "/template1/finalVideos2.mp4",
            videos: newArray,
            transitions: transitions2,
          });
          if (typeof promise2 == "undefined") {
            i++;
            if (array3.length === 0) {
              resolve(
                "./src/Assets/template/videos/" +
                  userId +
                  "/template1/finalVideos2.mp4"
              );
              // res.status(200).json({
              //   message: "successful",
              //   data:
              //     "./src/Assets/template/videos/" +
              //     userId +
              //     "/template1/finalVideos2.mp4",
              // });
            } else {
              const newArray1 = [
                "./src/Assets/template/videos/" +
                  userId +
                  "/template1/finalVideos2.mp4",
              ].concat(array3);
              console.log(newArray1);
              const promise3 = await concat({
                output:
                  "./src/Assets/template/videos/" +
                  userId +
                  "/template1/finalVideos3.mp4",
                videos: newArray1,
                transitions: transitions3,
              });
              if (typeof promise3 == "undefined") {
                resolve(
                  "./src/Assets/template/videos/" +
                    userId +
                    "/template1/finalVideos3.mp4"
                );
                // res.status(200).json({
                //   message: "successful",
                //   data:
                //     "./src/Assets/template/videos/" +
                //     userId +
                //     "/template1/finalVideos3.mp4",
                // });
              }
            }
          }
        }
      }
    });
  }
  // req.body.videos.map((data, index) => {
  //   if (index > 0) {
  //     transitions.push({
  //       name: "fade",
  //       duration: 500,
  //     });
  //   }
  // });

  // const promises = await concat({
  //   output:
  //     "./src/Assets/template/videos/" + userId + "/template1/finalVideos.mp4",
  //   videos: videos,
  //   transitions: transitions,
  //   concurrency: videos.length,
  // });
  // if (typeof promises == "undefined") {
  //   res.status(200).json({
  //     message: "successfull",
  //     data: "./src/Assets/template/videos/" + userId + "/template1/finalVideos.mp4",
  //   });
  // }
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
            if (datas.block.fontWeight == "light") {
              selectedfonts = font.light;
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
        ffmpeg(datas.file)
          .complexFilter(
            [
              "scale=1920:1080[rescaled]",
              {
                filter: "drawbox",
                options: {
                  x: "(iw/2 - iw/5 - 35)",
                  y: "(ih/2 - ih/6)",
                  height: 340,
                  width: 840,
                  color: "white",
                  t: "fill",
                  enable: "between(t,0.50,60000)",
                },
                inputs: "rescaled",
                outputs: "output2",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfonts,
                  text: contentParts[0],
                  fontsize: parseInt(datas.block.textSize) + 20,
                  fontcolor: titleColor,
                  x: "(w-tw)/2",
                  y: "((h-text_h)/2)-(text_h-(th/4))",
                  box: 1,
                  boxcolor: "white@0.0",
                  boxborderw: "50",
                  bordercolor: "white",
                  // enable: "between(t,1.1,10000)",
                  alpha:
                    "if(lt(t,1),0,if(lt(t,3),(t-1)/2,if(lt(t,4),1,if(lt(t,504),(500-(t-4))/500,0))))",
                },
                inputs: "output2",
                outputs: "output4",
              },
              {
                filter: "drawtext",
                options: {
                  fontfile: selectedfonts,
                  text: contentParts[1],
                  fontsize: parseInt(datas.block.textSize) + 20,
                  fontcolor: titleColor,
                  x: "(w-tw)/2",
                  y: "((h-text_h)/2)+(text_h-(th/4))",
                  box: 1,
                  boxcolor: "white@0.0",
                  boxborderw: "50",
                  bordercolor: "white",
                  // enable: "between(t,2,10000)",
                  alpha:
                    "if(lt(t,1),0,if(lt(t,3),(t-1)/2,if(lt(t,4),1,if(lt(t,504),(500-(t-4))/500,0))))",
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
            console.log(er);
            return;
          })
          .on("end", function (commandLine) {
            console.log("success");
            var finalvideo1 =
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/block-1-text-video.mp4";
            resolve(finalvideo1);
          });
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
        const Createdvideo = await concat({
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

        if (typeof Createdvideo == "undefined") {
          setTimeout(function () {
            block2VideoTxt();
          }, 200);
        }
      } catch {
        res.status(500).json({ message: "video failed 6" });
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
          if (data.sceneData.fontWeight == "light") {
            selectedfonts = font.light;
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
                enable: "between(t,1.1,10000)",
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
                enable: "between(t,1.3,10000)",
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
                enable: "between(t,1.5,10000)",
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
                enable: "between(t,1.8,10000)",
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
                enable: "between(t,2.2,10000)",
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
                enable: "between(t,2.4,10000)",
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
                enable: "between(t,2.6,10000)",
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
                enable: "between(t,2.8,10000)",
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
          "./src/Assets/template/videos/" + userId + "/template1/block2text.mp4"
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
          let finalvideo2 =
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/block2text.mp4";
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
            block3VideoTxt();
          }, 600);
        }
      } catch {
        res.status(500).json({ message: "Video failed 11" });
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
          if (data.sceneData.fontWeight == "light") {
            selectedfonts = font.light;
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
                  x: "20",
                  y: "H-th-100",
                  box: 1,
                  boxcolor: "white@1",
                  boxborderw: "50",
                  bordercolor: "white",
                  alpha:
                    "if(lt(t,0),0,if(lt(t,2),(t-0)/2,if(lt(t,3),1,if(lt(t,503),(500-(t-3))/500,0))))",
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
            return;
          })
          .on("end", function (commandLine) {
            console.log("step6");
            let finalvideo3 =
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/block3FinalVideo.mp4";
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
    var text = "";
    for (var i = 0; i < result.length; i++) {
      if (i == 6) {
        text = text + result[i] + " \n ";
      } else {
        text = text + result[i] + " ";
      }
    }
    let fontfamily = data.sceneData.textArray[0].fontFamily;
    let selectedfonts;
    fonts.map(function (font) {
      if (font.family == fontfamily) {
        if (data.sceneData.textArray[0].fontWeight == "light") {
          selectedfonts = font.light;
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
      commands
        .input(assetsPath + data.sceneData.media[0].url)
        .complexFilter(
          [
            "crop=iw-700:ih-200, scale=960:1080[checked]",
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
          block4video2();
        });
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
        res.status(500).json({ message: "Video failed 18" });
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
      var text = "";
      for (var i = 0; i < result.length; i++) {
        if (i == 6) {
          text = text + result[i] + " \n ";
        } else {
          text = text + result[i] + " ";
        }
      }
      let fontfamily = data.sceneData.textArray[1].fontFamily;
      let selectedfonts;
      fonts.map(function (font) {
        if (font.family == fontfamily) {
          if (data.sceneData.textArray[1].fontWeight == "light") {
            selectedfonts = font.light;
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
        commands
          .input(assetsPath + data.sceneData.media[3].url)
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
                  fontsize: parseInt(data.sceneData.textArray[1].fontSize) + 15,
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
          res.status(200).json({ message: "Video failed 24" });
          return;
        })
        .on("end", function () {
          const finalvideo =
            assetsPath +
            "template/videos/" +
            userId +
            "/template1/block4Finalvideo.mp4";
          resolve(finalvideo);
        });
    }
  });
};

function lastSceneVideo(data) {
  return new Promise((resolve) => {
    var commands = new ffmpeg();
    commands
      .input(assetsPath + "whitebgVideo.mp4")
      .input(assetsPath + data.sceneData.media[0].url)
      .complexFilter(
        "overlay=x=(main_w-overlay_w-100):y=(main_h-overlay_h)/2[outs]"
      )
      .addOption("-map", "[outs]")
      .addOption("-c:v", "libx264")
      .addOption("-pix_fmt", "yuv420p")
      .addOption("-framerate", "50")
      .addOption("-c:v", "libx264")
      .save(
        "./src/Assets/template/videos/" +
          userId +
          "/template1/lastvideoLeft.mp4"
      )
      .on("start", function (commandLine) {
        console.log("leastVideo1");
      })
      .on("error", function (er) {
        console.log(er);
        return;
      })
      .on("end", function (commandLine) {
        console.log("here");
        lastVideoText();
      });
    function lastVideoText() {
      var commands = new ffmpeg();
      // console.log(data.sceneData.textArray)
      if (data.sceneData.textArray[0] != undefined) {
        var titleColor1 = data.sceneData.textArray[0].fontColor;
        let fontfamily = data.sceneData.textArray[0].fontFamily;
        var fontSize1 = data.sceneData.textArray[0].fontSize;
        var selectedfonts1;
        fonts.map(function (font) {
          if (font.family == fontfamily) {
            if (data.sceneData.textArray[0].fontWeight == "light") {
              selectedfonts1 = font.light;
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
        var selectedfonts2;
        fonts.map(function (font) {
          if (font.family == fontfamily) {
            if (data.sceneData.textArray[1].fontWeight == "light") {
              selectedfonts2 = font.light;
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
        var selectedfonts3;
        fonts.map(function (font) {
          if (font.family == fontfamily) {
            if (data.sceneData.textArray[2].fontWeight == "light") {
              selectedfonts3 = font.light;
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
        var selectedfonts4;
        fonts.map(function (font) {
          if (font.family == fontfamily) {
            if (data.sceneData.textArray[3].fontWeight == "light") {
              selectedfonts4 = font.light;
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
                enable: "gte(t,1)",
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
                enable: "gte(t,1)",
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
                enable: "gte(t,1)",
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
                enable: "gte(t,1)",
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
          return;
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
            return;
          })
          .on("end", function () {
            var finalvideoLast =
              assetsPath +
              "template/videos/" +
              userId +
              "/template1/lastvideoFinal.mp4";
            resolve(finalvideoLast);
            // console.log("done");
          });
      }
    }
  });
}

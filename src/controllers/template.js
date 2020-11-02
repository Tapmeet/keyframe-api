
const Template = require('../models/templates');
const Block = require('../models/templateBlocks');
const fs = require('fs')
var gl = require('gl')(10, 10)
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
var ffprobe = require('ffprobe-static');
ffmpeg.setFfprobePath(ffprobe.path);
ffmpeg.setFfmpegPath(ffmpegPath);

var userId;
// const ffprobe = require('node-ffprobe')
// const ffprobeInstaller = require('@ffprobe-installer/ffprobe')

// //console.log(ffprobeInstaller.path, ffprobeInstaller.version)

// ffprobe.FFPROBE_PATH = ffprobeInstaller.path
const concat = require('ffmpeg-concat')
const glob = require('glob')

var assetsPath = './src/Assets/';
var fonts = [
    { family: "'Montserrat', sans-serif", file: "./src/Assets/fonts/Montserrat-Regular.ttf", light: "./src/Assets/fonts/Montserrat-Light.ttf" },
    { family: "'Lato', sans-serif", file: "./src/Assets/fonts/Lato-Regular.ttf", light: "./src/Assets/fonts/Lato-Light.ttf" },
    { family: "'Oswald', sans-serif", file: "./src/Assets/fonts/Oswald-Regular.ttf", light: "./src/Assets/fonts/Oswald-Light.ttf" },
    { family: "'Roboto', sans-serif", file: "./src/Assets/fonts/Roboto-Regular.ttf", light: "./src/Assets/fonts/Roboto-Light.ttf" },
    { family: "'Noto Serif', serif", file: "./src/Assets/fonts/NotoSerif-Regular.ttf", light: "./src/Assets/fonts/NotoSerif-Regular.ttf" },
]
//Upload
exports.upload = async (req, res, next) => {
    try {

        const file = req.file;
        //console.log(file)
        if (file) {
            const filePath = file.path;
            //Save Event Image
            if (filePath) {
                res.status(200).json({ message: filePath });
            }
        }
        else {
            res.status(500).json({ message: error.message });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        const template = await Template.findOne({ userId: userId, templateNumber: templateNumber });
        var tempateData;
        if (!template) {
            const newTemplate = new Template({ ...req.body });
            tempateData = await newTemplate.save();
            res.status(200).json({ message: 'Template successfully created', data: tempateData });
        }
        else {
            tempateData = await Template.findOneAndUpdate({ templateNumber: templateNumber, userId: userId }, { $set: req.body }, { new: true, useFindAndModify: false });
            const datas = Template.aggregate([
                {
                    $match: { userId: userId, templateNumber: templateNumber }
                },
                {
                    "$project": {
                        "_id": {
                            "$toString": "$_id"
                        },
                        "userId": "$userId",
                        "templateNumber": "$templateNumber",
                        "globalFontTitle": "$globalFontTitle",
                        "globalFontSubTitle": "$globalFontSubTitle",
                        "globaltitleColor": "$globaltitleColor",
                        "globalsubtitleColor": "$globalsubtitleColor",
                        "globalfontFamily": "$globalfontFamily",

                    }

                },
                {
                    $lookup:
                    {
                        from: `templateblocks`,
                        localField: "_id",
                        foreignField: "templateId",
                        as: "blocks"
                    }
                }
            ], function (err, data) {
                if (err)
                    throw err;
                res.status(200).json({ message: 'Template successfully created', data: data });
            });
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
        const templateBlock = await Block.findOne({ templateId: templateId, blockId: blockId });
        await Template.findOneAndUpdate({ templateNumber: templateNumber, userId: userId }, { $set: req.body }, { new: true, useFindAndModify: false });
        var tempateData;
        if (!templateBlock) {
            const newTemplate = new Block({ ...req.body, templateId: templateId });
            tempateData = await newTemplate.save();
        }
        else {
            tempateData = await Block.findOneAndUpdate({ templateId: templateId, blockId: blockId }, { $set: req.body }, { new: true, useFindAndModify: false });
        }
        res.status(200).json({ message: 'Template successfully created', data: tempateData });
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
    const { templateId } = req.body;
    try {
        const templateBlock = await Block.find({ templateId: templateId });
        const template = await Template.findOne({ _id: templateId });
        const data = {
            templateBlock: templateBlock,
            template: template
        }
        // console.log(template)
        userId = template.userId
        if (templateBlock) {
            const folderName = './src/Assets/template/videos/' + userId
            try {
                if (!fs.existsSync(folderName)) {
                    fs.mkdirSync(folderName)
                }
            } catch (err) {
                console.error(err)
            }
            let functionName = 'videoTemplate' + template.templateNumber;
            await global[functionName](data, req, res);
        } else {
            res.status(200).json({ message: 'Video failed 1' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

global.videoTemplate1 = async function videoTemplate1(data, req, res) {
    var block2, block3, block4
    var command = new ffmpeg();
    var fontfamily = data.template.globalfontFamily;


    var selectedfonts;
    var selectedfontsLight;
    fonts.map(function (font) {
        if (font.family == fontfamily) {
            selectedfonts = font.file;
            selectedfontsLight = font.light;
        }
    })

    var numberOfBlocks = data.templateBlock.length;
    data.templateBlock.map(function (block) {
        if (block.blockId == 1) {
            var container1, container2, container3, container4, videoCheck;
            if (block.blockData.containerOne) {
                container1 = './src/Assets/' + block.blockData.containerOne;
            }
            if (block.blockData.containerTwo) {
                container2 = './src/Assets/' + block.blockData.containerTwo;
            }
            if (block.blockData.containerOne) {
                container3 = './src/Assets/' + block.blockData.containerThree;
            }
            if (block.blockData.containerFour) {
                container4 = './src/Assets/' + block.blockData.containerFour;
            }
            if (block.blockData.imageFour == '' && block.blockData.containerFour != '') {
                videoCheck = 1;
            }
            block1Video([container1, container2, container3, container4], videoCheck, block)
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
        const folderName = './src/Assets/template/videos/' + userId + '/template1'
        try {
            if (!fs.existsSync(folderName)) {
                fs.mkdirSync(folderName)
            }
        } catch (err) {
            console.error(err)
        }
        inputs.forEach(input => {
            command.input(input);
        })
        if (videoChecks == 1) {
            command
                .complexFilter('[0:v]  setpts=PTS-STARTPTS, scale=950:530,pad=960:540:5:5:white [a0];[1:v] setpts=PTS-STARTPTS, scale=950:530,pad=960:540:5:5:white [a1];[2:v] setpts=PTS-STARTPTS,  scale=950:530,pad=960:540:5:5:white [a2];[3:v] setpts=PTS-STARTPTS,  scale=950:530,pad=960:540:5:5:white [a3];[a0][a1][a2][a3]xstack=inputs=4:layout=0_0|0_h0|w0_0|w0_h0[out]')
                .addOption('-map', '[out]',)
                .addOption('-c:v', 'libx264')
                .save('./src/Assets/template/videos/' + userId + '/template1/block-1-video-1.mp4')
                .on('start', function (commandLine) {
                    console.log('step1');
                })
                .on("error", function (er) {
                    console.log(er);
                    console.log("error occured: " + er.message);
                })
                .on("end", function () {
                    if (block.blockData.blockTitle) {
                        var datas = {
                            block: block,
                            file: './src/Assets/template/videos/' + userId + '/template1/block-1-video-1.mp4'
                        }
                        block1VideoTxt(datas, req, res)
                    }
                    else {
                        return res.status(200).json({ message: 'Video created', data: 'template/videos/' + userId + '/template1/block-1-video-1.mp4' });
                    }
                })
        } else {
            command
                .complexFilter('[0:v]  setpts=PTS-STARTPTS, scale=630:470,pad=640:480:5:5:white [a0];[1:v] setpts=PTS-STARTPTS, scale=630:470,pad=640:480:5:5:white [a1];[2:v] setpts=PTS-STARTPTS,  scale=630:470,pad=640:480:5:5:white [a2];[3:v] setpts=PTS-STARTPTS,  scale=630:470,pad=640:480:5:5:white [a3];[a0][a1][a2][a3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0[out]')
                .loop('5')
                .addOption('-map', '[out]',)
                .addOption('-t', '5')
                .addOption('-c:v', 'libx264')
                .save('./src/Assets/template/videos/' + userId + '/template1/block-1-video-1.mp4')
                .on('start', function (commandLine) {
                    console.log('step1');
                })
                .on("error", function (er) {
                    res.status(200).json({ message: 'Video failed 2' });
                    return
                })
                .on("end", function () {
                    if (block.blockData.blockTitle) {
                        var datas = {
                            block: block,
                            file: './src/Assets/template/videos/' + userId + '/template1/block-1-video-1.mp4'
                        }
                        block1VideoTxt(datas, req, res)
                    }
                    else {
                        res.status(200).json({ message: 'Video created', data: 'template/videos/' + userId + '/template1/block-1-video-1.mp4' });
                        return;
                    }
                })
        }

        function block1VideoTxt(datas, req, res) {
            var commands = ffmpeg();
            var titleColor = datas.block.blockData.titleColor;
            if (titleColor.lenth == '4') {
                titleColor = titleColor.replaceAll("#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])", "#$1$1$2$2$3$3");
            }
            var subtitleColor = datas.block.blockData.subtitleColor;
            if (subtitleColor.lenth == '4') {
                subtitleColor = subtitleColor.replaceAll("#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])", "#$1$1$2$2$3$3");
            }
            ffmpeg(datas.file)
                .complexFilter([
                    'scale=1920:1080[rescaled]',
                    {
                        filter: 'drawbox',
                        options: {
                            x: 0,
                            y: 0,
                            color: 'white',
                            t: 'fill',
                            enable: 'between(t,0,0.30)'
                        },
                        inputs: 'rescaled',
                        outputs: 'output1',

                    },
                    {
                        filter: 'drawbox',
                        options: {
                            x: '(w - 120)',
                            y: '(h - 60)',
                            height: 400,
                            width: 720,
                            color: 'white',
                            t: 'fill',
                            enable: 'between(t,0.50,60000)'
                        },
                        inputs: 'output1',
                        outputs: 'output2'
                    },
                    {
                        filter: 'drawbox',
                        options: {
                            x: '(w - 240)',
                            y: '(h - 180)',
                            height: 480,
                            width: 800,
                            color: 'white',
                            t: '2',
                            enable: 'between(t,0.40,60000)'
                        },
                        inputs: 'output2',
                        outputs: 'output3'
                    },
                    {
                        filter: 'drawtext',
                        options: {
                            fontfile: selectedfonts,
                            text: datas.block.blockData.blockTitle,
                            fontsize: parseInt(datas.block.blockData.blocktitleFontsize) + 20,
                            fontcolor: titleColor,
                            line_spacing: "20",
                            x: '(w-text_w)/2',
                            y: '(h-text_h-50)/2',
                            box: 1,
                            boxcolor: 'white@0.0',
                            boxborderw: "50",
                            bordercolor: 'white',
                            enable: 'between(t,1.1,10000)'

                        },
                        inputs: 'output3',
                        outputs: 'output4'

                    },
                    {
                        filter: 'drawtext',
                        options: {
                            fontfile: selectedfonts,
                            text: datas.block.blockData.blocksubTitle,
                            fontsize: parseInt(datas.block.blockData.blocksubTitleFontsize) + 20,
                            fontcolor: subtitleColor,
                            x: '(w-text_w )/2',
                            y: '(h-text_h + 70)/2',
                            box: 1,
                            boxcolor: 'white@0.0',
                            boxborderw: "50",
                            bordercolor: 'white',
                            enable: 'between(t,2,10000)',
                        },
                        inputs: 'output4',
                        outputs: 'output'
                    },
                ], 'output')
                .addOption('-c:v', 'libx264')
                .save('./src/Assets/template/videos/' + userId + '/template1/block-1-text-video.mp4')
                .on('start', function (commandLine) {
                    console.log('step2');
                })
                .on("error", function (er) {
                    res.status(200).json({ message: 'Video failed 3' });
                    console.log(er);
                    return;
                })
                .on("end", function (commandLine) {
                    if (typeof block2 != 'undefined') {
                        block2Video(block2, req, res)
                    } else {
                        res.status(200).json({ message: 'Video created', data: 'template/videos/' + userId + '/template1/block-1-text-video.mp4' });
                        console.log("success");
                        return;
                    }

                })
        }
    }

    function block2Video(block2, req, res) {
        var i = 1;
        var k = 1;
        var video1, video2;
        inputs = [block2.blockData.containerOne, block2.blockData.containerTwo]
        inputs.forEach(input => {
            var commands = new ffmpeg();
            if (input == block2.blockData.imageOne || input == block2.blockData.imageTwo) {
                commands.input(assetsPath + input)
                    .complexFilter([
                        "scale=1080:720:force_original_aspect_ratio=decrease[rescaled]",
                        {
                            filter: 'zoompan',
                            options: "z='zoom+0.0009'",
                            inputs: "rescaled",
                            outputs: "padded"
                        },

                    ], 'padded'
                    )
                    .loop(3)
                    .addOption('-pix_fmt', 'yuv420p')
                    .addOption('-framerate', '50')
                    .addOption('-c:v', 'libx264')
                    .save('./src/Assets/template/videos/' + userId + '/template1/block-2-' + k + '.mp4')
                    .on('start', function (commandLine) {
                        console.log('step3');
                    })
                    .on("error", function (er) {
                        res.status(200).json({ message: 'Video failed 4' });
                        console.log(er);
                        return;
                    })
                    .on("end", function (commandLine) {

                        if (typeof video1 == 'undefined') {
                            // console.log(i)
                            video1 = './src/Assets/template/videos/' + userId + '/template1/block-2-1.mp4';
                        }
                        else if (typeof video2 == 'undefined') {
                            // console.log(i)
                            video2 = './src/Assets/template/videos/' + userId + '/template1/block-2-2.mp4';
                        }
                        if (i == 2 && typeof video1 != 'undefined' && typeof video2 != 'undefined') {
                            //    console.log('heres');
                            setTimeout(function () {
                                let data = {
                                    video1: video1,
                                    video2: video2
                                }
                                mergeBlock2Videos(data, req, res)
                            }, 500);
                        }
                        i = i + 1;
                    })
            } else {
                commands.input(assetsPath + input)
                    .complexFilter([
                        // Rescale input stream into stream 'rescaled'
                        'scale=1280:720[rescaled]',
                    ], 'rescaled')
                    .addOption('-c:v', 'libx264')
                    .save('./src/Assets/template/videos/' + userId + '/template1/block-2-' + k + '.mp4')
                    .on('start', function (commandLine) {
                        console.log('step4');
                    })
                    .on("error", function (er) {
                        res.status(200).json({ message: 'Video failed 5' });
                        console.log(er);
                        // console.log("error occured: " + er.message);
                        return;
                    })
                    .on("end", function (commandLine) {
                        if (typeof video1 == 'undefined') {
                            video1 = './src/Assets/template/videos/' + userId + '/template1/block-2-1.mp4';
                        }
                        else if (typeof video2 == 'undefined') {
                            video2 = './src/Assets/template/videos/' + userId + '/template1/block-2-2.mp4';
                        }
                        if (i == 2 && typeof video1 != 'undefined' && typeof video2 != 'undefined') {
                            setTimeout(function () {
                                let data = {
                                    video1: video1,
                                    video2: video2
                                }
                                mergeBlock2Videos(data, req, res)
                            }, 500);
                        }

                        i = i + 1;
                    })
            }
            k = k + 1;
        })
        async function mergeBlock2Videos(data, req, res) {
            try {
                const Createdvideo = await concat({
                    output: './src/Assets/template/videos/' + userId + '/template1/blockmerged.mp4',
                    videos: [
                        data.video1,
                        data.video2,
                    ],
                    transitions: [
                        {
                            name: 'directional',
                            params: { direction: [1.0, 0.0] },
                            duration: 1000
                        },
                    ]
                })

                if (typeof Createdvideo == 'undefined') {
                    setTimeout(function () {
                        const datas = {
                            block: block2
                        }
                        block2VideoTxt(datas, req, res)
                        // res.status(200).json({ message: 'Video created', data: 'template/videos/' + userId + '/template1/blockmerged.mp4' });
                        // // console.log(commandLine);
                        // console.log("successhere");
                        // return;
                    }, 600);
                }
            }
            catch {
                res.status(500).json({ message: 'video failed 6' });
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
            if (titleColor.lenth == '4') {
                titleColor = titleColor.replaceAll("#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])", "#$1$1$2$2$3$3");
            }
            var subtitleColor = datas.block.blockData.subtitleColor;
            if (subtitleColor.lenth == '4') {
                subtitleColor = subtitleColor.replaceAll("#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])", "#$1$1$2$2$3$3");
            }
            setTimeout(function () {
                commands.input('./src/Assets/template/videos/' + userId + '/template1/blockmerged.mp4')
                    .complexFilter([
                        'scale=1920:1080[checked]',
                        {
                            filter: 'drawbox',
                            options: {
                                x: 0,
                                y: 0,
                                width: 480,
                                color: 'white',
                                t: 'fill',
                            },
                            inputs: 'checked',
                            outputs: 'firstOne',
                        },
                        {
                            filter: 'drawtext',
                            options: {
                                fontfile: selectedfontsLight,
                                text: datas.block.blockData.squareFeetTitle,
                                fontsize: parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                                fontcolor: titleColor,
                                line_spacing: "20",
                                x: '120',
                                y: '150',
                                box: 1,
                                boxcolor: 'white@0.0',
                                boxborderw: "50",
                                bordercolor: 'white',
                                enable: 'between(t,1.1,10000)'
                            },
                            inputs: 'firstOne',
                            outputs: 'output2'
                        },
                        {
                            filter: 'drawtext',
                            options: {
                                fontfile: selectedfonts,
                                text: datas.block.blockData.squareFeet,
                                fontsize: parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                                fontcolor: subtitleColor,
                                x: '120',
                                y: '220',
                                box: 1,
                                boxcolor: 'white@0.0',
                                boxborderw: "50",
                                bordercolor: 'white',
                                enable: 'between(t,1.3,10000)',
                            },
                            inputs: 'output2',
                            outputs: 'output3'
                        },
                        {
                            filter: 'drawtext',
                            options: {
                                fontfile: selectedfontsLight,
                                text: datas.block.blockData.acersTitle,
                                fontsize: parseInt(datas.block.blockData.blocktitleFontsize) + 15,
                                fontcolor: titleColor,
                                x: '120',
                                y: '320',
                                box: 1,
                                boxcolor: 'white@0.0',
                                boxborderw: "50",
                                bordercolor: 'white',
                                enable: 'between(t,1.5,10000)',
                            },
                            inputs: 'output3',
                            outputs: 'output4'
                        },
                        {
                            filter: 'drawtext',
                            options: {
                                fontfile: selectedfonts,
                                text: datas.block.blockData.acers,
                                fontsize: parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                                fontcolor: subtitleColor,
                                x: '120',
                                y: '370',
                                box: 1,
                                boxcolor: 'white@0.0',
                                boxborderw: "50",
                                bordercolor: 'white',
                                enable: 'between(t,1.8,10000)',
                            },
                            inputs: 'output4',
                            outputs: 'output5'
                        },
                        {
                            filter: 'drawtext',
                            options: {
                                fontfile: selectedfontsLight,
                                text: datas.block.blockData.bedroomTitle,
                                fontsize: parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                                fontcolor: titleColor,
                                x: '120',
                                y: '470',
                                box: 1,
                                boxcolor: 'white@0.0',
                                boxborderw: "50",
                                bordercolor: 'white',
                                enable: 'between(t,2,10000)',
                            },
                            inputs: 'output5',
                            outputs: 'output6'
                        },
                        {
                            filter: 'drawtext',
                            options: {
                                fontfile: selectedfonts,
                                text: datas.block.blockData.bedroom,
                                fontsize: parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                                fontcolor: subtitleColor,
                                x: '120',
                                y: '520',
                                box: 1,
                                boxcolor: 'white@0.0',
                                boxborderw: "50",
                                bordercolor: 'white',
                                enable: 'between(t,2.2,10000)',
                            },
                            inputs: 'output6',
                            outputs: 'output7'
                        },
                        {
                            filter: 'drawtext',
                            options: {
                                fontfile: selectedfontsLight,
                                text: datas.block.blockData.bathroomTitle,
                                fontsize: parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                                fontcolor: titleColor,
                                x: '120',
                                y: '620',
                                box: 1,
                                boxcolor: 'white@0.0',
                                boxborderw: "50",
                                bordercolor: 'white',
                                enable: 'between(t,2.4,10000)',
                            },
                            inputs: 'output7',
                            outputs: 'output8'
                        },
                        {
                            filter: 'drawtext',
                            options: {
                                fontfile: selectedfonts,
                                text: datas.block.blockData.price,
                                fontsize: parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                                fontcolor: subtitleColor,
                                x: '120',
                                y: '670',
                                box: 1,
                                boxcolor: 'white@0.0',
                                boxborderw: "50",
                                bordercolor: 'white',
                                enable: 'between(t,2.6,10000)',
                            },
                            inputs: 'output8',
                            outputs: 'output9'
                        },
                        {
                            filter: 'drawtext',
                            options: {
                                fontfile: selectedfontsLight,
                                text: datas.block.blockData.priceTitle,
                                fontsize: parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                                fontcolor: titleColor,
                                x: '120',
                                y: '770',
                                box: 1,
                                boxcolor: 'white@0.0',
                                boxborderw: "50",
                                bordercolor: 'white',
                                enable: 'between(t,2.8,10000)',
                            },
                            inputs: 'output9',
                            outputs: 'output10'
                        },
                        {
                            filter: 'drawtext',
                            options: {
                                fontfile: selectedfonts,
                                text: datas.block.blockData.price,
                                fontsize: parseInt(datas.block.blockData.blocksubTitleFontsize) + 15,
                                fontcolor: subtitleColor,
                                x: '120',
                                y: '820',
                                box: 1,
                                boxcolor: 'white@0.0',
                                boxborderw: "50",
                                bordercolor: 'white',
                                enable: 'between(t,3,10000)',
                            },
                            inputs: 'output10',
                            outputs: 'output'
                        },
                    ], 'output')
                    .addOption('-c:v', 'libx264')
                    .save('./src/Assets/template/videos/' + userId + '/template1/block2text.mp4')
                    .on('start', function (commandLine) {
                        console.log('step6');
                    })
                    .on("error", function (er) {
                        res.status(200).json({ message: ' 7' });
                        console.log(er);
                        // console.log("error occured: " + er.message);
                        return;
                    })
                    .on("end", function (commandLine) {
                        setTimeout(function () {
                            let data = [
                                './src/Assets/template/videos/' + userId + '/template1/block-1-text-video.mp4',
                                './src/Assets/template/videos/' + userId + '/template1/block2text.mp4',
                            ]
                            mergeVideos(data, req, res)
                        }, 800);
                    })
            }, 600);
        }
        async function mergeVideos(data, req, res) {
            try {
                const Createdvideo = await concat({
                    output: './src/Assets/template/videos/' + userId + '/template1/block2final.mp4',
                    videos: data,
                    transitions: [
                        {
                            name: 'directional',
                            params: { direction: [1.0, 0.0] },
                            duration: 1000
                        },
                    ]
                })
                if (typeof Createdvideo == 'undefined') {
                    if (block3) {
                        block3Video(block3, req, res)
                    }
                    else {
                        res.status(200).json({ message: 'Video created', data: 'template/videos/' + userId + '/template1/block2final.mp4' });
                        return;
                    }
                }
            }
            catch {
                res.status(500).json({ message: 'video failed 8' });
            }

        }
    }


    function block3Video(block2, req, res) {
        var commands = new ffmpeg();
        var i = 1;
        var k = 1;
        var video1, video2;
        inputs = [block2.blockData.containerOne, block2.blockData.containerTwo]
        inputs.forEach(input => {
            var commands = new ffmpeg();
            if (input == block2.blockData.imageOne || input == block2.blockData.imageTwo) {
                console.log(k)
                commands.input(assetsPath + input)
                    .complexFilter([
                        "scale=1080:720:force_original_aspect_ratio=decrease[rescaled]",
                        {
                            filter: 'zoompan',
                            options: "z='zoom+0.0009'",
                            inputs: "rescaled",
                            outputs: "padded"
                        },

                    ], 'padded'
                    )
                    .loop(3)
                    .addOption('-pix_fmt', 'yuv420p')
                    .addOption('-framerate', '50')
                    .addOption('-c:v', 'libx264')
                    .save('./src/Assets/template/videos/' + userId + '/template1/block-3-' + k + '.mp4')
                    .on('start', function (commandLine) {
                        console.log('step3');
                    })
                    .on("error", function (er) {
                        res.status(200).json({ message: 'Video failed 9' });
                        console.log(er);
                        return;
                    })
                    .on("end", function (commandLine) {
                        if (typeof video1 == 'undefined') {
                            console.log(i)
                            video1 = './src/Assets/template/videos/' + userId + '/template1/block-3-1.mp4';
                        }
                        else if (typeof video2 == 'undefined') {
                            console.log(i)
                            video2 = './src/Assets/template/videos/' + userId + '/template1/block-3-2.mp4';
                        }
                        if (i == 2 && typeof video1 != 'undefined' && typeof video2 != 'undefined') {
                            console.log('heres');
                            setTimeout(function () {
                                let data = {
                                    video1: video1,
                                    video2: video2
                                }
                                mergeBlock3Videos(data, req, res)
                            }, 800);
                        }
                        i = i + 1;
                    })
            } else {
                commands.input(assetsPath + input)
                    .complexFilter([
                        // Rescale input stream into stream 'rescaled'
                        'scale=1280:720[rescaled]',
                    ], 'rescaled')
                    .addOption('-c:v', 'libx264')
                    .save('./src/Assets/template/videos/' + userId + '/template1/block-3-' + k + '.mp4')
                    .on('start', function (commandLine) {
                        console.log('step4');
                    })
                    .on("error", function (er) {
                        res.status(200).json({ message: 'Video failed 10' });
                        console.log(er);
                        // console.log("error occured: " + er.message);
                        return;
                    })
                    .on("end", function (commandLine) {
                        if (typeof video1 == 'undefined') {
                            video1 = './src/Assets/template/videos/' + userId + '/template1/block-3-1.mp4';
                        }
                        else if (typeof video2 == 'undefined') {
                            video2 = './src/Assets/template/videos/' + userId + '/template1/block-3-2.mp4';
                        }
                        if (i == 2 && typeof video1 != 'undefined' && typeof video2 != 'undefined') {
                            setTimeout(function () {
                                let data = {
                                    video1: video1,
                                    video2: video2
                                }
                                mergeBlock3Videos(data, req, res)
                            }, 800);
                        }

                        i = i + 1;
                    })
            }
            k = k + 1;
        })
        async function mergeBlock3Videos(data, req, res) {
            try {
                const Createdvideo = await concat({
                    output: './src/Assets/template/videos/' + userId + '/template1/block3merged.mp4',
                    videos: [
                        data.video1,
                        data.video2,
                    ],
                    transitions: [
                        {
                            name: 'fade',
                            duration: 1000
                        },
                    ]
                })
                if (typeof Createdvideo == 'undefined') {
                    setTimeout(function () {
                        const datas = {
                            block: block3
                        }
                        block3VideoTxt(datas, req, res)
                    }, 600);
                }
            }
            catch {
                res.status(500).json({ message: 'Video failed 11' });
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
            if (titleColor.lenth == '4') {
                titleColor = titleColor.replaceAll("#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])", "#$1$1$2$2$3$3");
            }
            var subtitleColor = datas.block.blockData.subtitleColor;
            if (subtitleColor.lenth == '4') {
                subtitleColor = subtitleColor.replaceAll("#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])", "#$1$1$2$2$3$3");
            }
            var result = datas.block.blockData.blockTitle.split(" ");
            var text = '';
            for (var i = 0; i < result.length; i++) {
                if (i == 3) {
                    text = text + result[i] + ' \n ';
                }
                else {
                    text = text + result[i] + ' ';
                }

            }
            setTimeout(function () {
                //console.log(datas);
                commands.input('./src/Assets/template/videos/' + userId + '/template1/block3merged.mp4')
                    .complexFilter([
                        'scale=1920:1080[checked]',
                        {
                            filter: 'drawtext',
                            options: {
                                fontfile: selectedfonts,
                                text: text,
                                fontsize: parseInt(datas.block.blockData.blocktitleFontsize) + 15,
                                fontcolor: titleColor,
                                line_spacing: 30,
                                x: '20',
                                y: 'H-th-100',
                                box: 1,
                                boxcolor: 'white@1',
                                boxborderw: "50",
                                bordercolor: 'white',
                            },
                            inputs: 'checked',
                            outputs: 'output'
                        },
                    ], 'output')
                    .addOption('-c:v', 'libx264')
                    .save('./src/Assets/template/videos/' + userId + '/template1/block3FinalVideo.mp4')
                    .on('start', function (commandLine) {
                        console.log('step6');
                    })
                    .on("error", function (er) {
                        res.status(200).json({ message: 'Video failed 12' });
                        console.log(er);
                        // console.log("error occured: " + er.message);
                        return;
                    })
                    .on("end", function (commandLine) {
                        // res.status(200).json({ message: 'Video created', data: 'template/videos/' + userId + '/template1/block3FinalVideo.mp4' });
                        console.log('step6');
                        setTimeout(function () {
                            let data = {
                                video1: './src/Assets/template/videos/' + userId + '/template1/block2final.mp4',
                                video2: './src/Assets/template/videos/' + userId + '/template1/block3FinalVideo.mp4'
                            }
                            merge3Videos(data, req, res)

                        }, 600);


                    })
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
                .on('start', function (commandLine) {
                    console.log('step5');
                })
                .on("error", function (er) {
                    console.log(er);
                    res.status(200).json({ message: 'Video failed 13' });
                    return
                })
                .on("end", function () {
                    // console.log('yhn success');
                    // setTimeout(function () {
                    //     const datas = {
                    //         block: block2
                    //     }
                    //     block2VideoTxt(datas, req, res)

                    // }, 600);
                    if (block4) {
                        setTimeout(function () {
                            block4Video(block4, req, res)
                        }, 600);
                    }
                    else {
                        res.status(200).json({ message: 'Video created', data: 'template/videos/' + userId + '/template1/block3video.mp4' });
                        //             return;
                    }
                })
                .mergeToFile('./src/Assets/template/videos/' + userId + '/template1/block3video.mp4');
        }
    }
    function block4Video(block4, req, res) {

        console.log('step1log')
        var commands = new ffmpeg();
        var result = block4.blockData.blockTitle.split(" ");
        var text = '';
        for (var i = 0; i < result.length; i++) {
            if (i == 4) {
                text = text + result[i] + ' \n ';
            }
            else {
                text = text + result[i] + ' ';
            }

        }
        var titleColor = block4.blockData.titleColor;
        if (titleColor.lenth == '4') {
            titleColor = titleColor.replaceAll("#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])", "#$1$1$2$2$3$3");
        }
        var subtitleColor = block4.blockData.subtitleColor;
        if (subtitleColor.lenth == '4') {
            subtitleColor = subtitleColor.replaceAll("#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])", "#$1$1$2$2$3$3");
        }
        if (block4.blockData.containerOne == block4.blockData.imageOne) {

            commands.input(assetsPath + block4.blockData.containerOne)
                .complexFilter([
                    'scale=960:1080[checked]',
                    {
                        filter: 'drawbox',
                        options: {
                            x: 0,
                            y: '920',
                            height: 200,
                            width: 960,
                            color: 'white',
                            t: 'fill',

                        },
                        inputs: 'checked',
                        outputs: 'output1',

                    },
                    {
                        filter: 'drawtext',
                        options: {
                            fontfile: selectedfontsLight,
                            text: text,
                            fontsize: parseInt(block4.blockData.blocktitleFontsize) + 15,
                            fontcolor: titleColor,
                            line_spacing: 20,
                            x: '50',
                            y: 'H-th - 20',
                            box: 1,
                            boxcolor: 'white@1',
                            boxborderw: "30",
                            bordercolor: 'white',
                            enable: 'gte(t,1)'
                        },
                        inputs: 'output1',
                        outputs: 'output'
                    },
                ], 'output')
                .loop(4)
                .addOption('-pix_fmt', 'yuv420p')
                .addOption('-framerate', '50')
                .addOption('-c:v', 'libx264')
                .save('./src/Assets/template/videos/' + userId + '/template1/block4video1.mp4')
                .on('start', function (commandLine) {
                    console.log('step62');
                })
                .on("error", function (er) {
                    res.status(200).json({ message: 'Video failed 14' });
                    console.log(er);
                    // console.log("error occured: " + er.message);
                    return;
                })
                .on("end", function (commandLine) {
                    block4video2(block4, req, res)
                })
        }
        else {
            commands.input(assetsPath + block4.blockData.containerOne)
                .complexFilter([
                    'scale=960:1080[checked]',
                    {
                        filter: 'drawbox',
                        options: {
                            x: 0,
                            y: '920',
                            height: 200,
                            width: 960,
                            color: 'white',
                            t: 'fill',

                        },
                        inputs: 'checked',
                        outputs: 'output1',

                    },
                    {
                        filter: 'drawtext',
                        options: {
                            fontfile: selectedfontsLight,
                            text: text,
                            fontsize: parseInt(block4.blockData.blocktitleFontsize) + 15,
                            fontcolor: titleColor,
                            line_spacing: 20,
                            x: '50',
                            y: 'H-th - 20',
                            box: 1,
                            boxcolor: 'white@1',
                            boxborderw: "30",
                            bordercolor: 'white',
                            enable: 'gte(t,1)'
                        },
                        inputs: 'output1',
                        outputs: 'output'
                    },
                ], 'output')
                .addOption('-pix_fmt', 'yuv420p')
                .addOption('-framerate', '50')
                .addOption('-c:v', 'libx264')
                .save('./src/Assets/template/videos/' + userId + '/template1/block4video1.mp4')
                .on('start', function (commandLine) {
                    console.log('step6 here');
                })
                .on("error", function (er) {
                    res.status(200).json({ message: 'Video failed 15' });
                    console.log(er);
                    // console.log("error occured: " + er.message);
                    return;
                })
                .on("end", function (commandLine) {
                    block4video2(block4, req, res)
                })
        }

        function block4video2(block4, req, res) {
            console.log('step2log')
            var commands = new ffmpeg();
            if (block4.blockData.containerTwo == block4.blockData.imageTwo) {
                console.log('here')
                commands.input(assetsPath + block4.blockData.imageTwo)
                    .complexFilter([
                        'scale=960:1080[checked]',
                    ], 'checked')
                    .loop(4)
                    .addOption('-pix_fmt', 'yuv420p')
                    .addOption('-framerate', '50')
                    .addOption('-c:v', 'libx264')
                    .save('./src/Assets/template/videos/' + userId + '/template1/block4video2.mp4')
                    .on('start', function (commandLine) {
                        console.log('step7');
                    })
                    .on("error", function (er) {
                        res.status(200).json({ message: 'Video failed 16' });
                        console.log(er);
                        // console.log("error occured: " + er.message);
                        return;
                    })
                    .on("end", function (commandLine) {
                        let data = {
                            video1: './src/Assets/template/videos/' + userId + '/template1/block4video1.mp4',
                            video2: './src/Assets/template/videos/' + userId + '/template1/block4video2.mp4'
                        }
                        mergeBlock4Videos1(data, req, res)
                    })
            }
            else {
                commands.input(assetsPath + block4.blockData.imageTwo)
                    .complexFilter([
                        'scale=960:1080[checked]',
                    ], 'checked')
                    .loop(4)
                    .addOption('-pix_fmt', 'yuv420p')
                    .addOption('-framerate', '50')
                    .addOption('-c:v', 'libx264')
                    .save('./src/Assets/template/videos/' + userId + '/template1/block4video2.mp4')
                    .on('start', function (commandLine) {
                        console.log('step7');
                    })
                    .on("error", function (er) {
                        res.status(200).json({ message: 'Video failed 17' });
                        console.log(er);
                        // console.log("error occured: " + er.message);
                        return;
                    })
                    .on("end", function (commandLine) {

                        let data = {
                            video1: './src/Assets/template/videos/' + userId + '/template1/block4video1.mp4',
                            video2: './src/Assets/template/videos/' + userId + '/template1/block4video2.mp4'
                        }
                        mergeBlock4Videos1(data, req, res)
                    })
            }
        }
        async function mergeBlock4Videos1(data) {
            console.log('step3log')
            try {
                const Createdvideo3 = await concat({
                    output: './src/Assets/template/videos/' + userId + '/template1/block4merged1.mp4',
                    videos: [
                        data.video1,
                        data.video2,
                    ],
                    transitions: [
                        {
                            name: 'directional',
                            params: { direction: [0, 1] },
                            duration: 1000
                        },
                    ]
                })
                if (typeof Createdvideo3 == 'undefined') {
                    block4video3(block4, req, res)
                }
            }
            catch {
                res.status(500).json({ message: 'Video failed 18' });
            }
        }
        function block4video3(block4, req, res) {
            console.log('step4log')
            var commands = new ffmpeg();
            if (block4.blockData.containerThree == block4.blockData.imageThree) {
                commands.input(assetsPath + block4.blockData.containerThree)
                    .complexFilter([
                        'scale=960:1080[checked]',
                    ], 'checked')
                    .loop(5)
                    .addOption('-pix_fmt', 'yuv420p')
                    .addOption('-framerate', '50')
                    .addOption('-c:v', 'libx264')
                    .save('./src/Assets/template/videos/' + userId + '/template1/block4video3.mp4')
                    .on('start', function (commandLine) {
                        console.log('step7');
                    })
                    .on("error", function (er) {
                        res.status(200).json({ message: 'Video failed 19' });
                        console.log(er);
                        // console.log("error occured: " + er.message);
                        return;
                    })
                    .on("end", function (commandLine) {
                        block4video4(block4, req, res)
                    })
            }
            else {
                commands.input(assetsPath + block4.blockData.containerThree)
                    .complexFilter([
                        'scale=960:1080[checked]',
                    ], 'checked')
                    .loop(4)
                    .addOption('-pix_fmt', 'yuv420p')
                    .addOption('-framerate', '50')
                    .addOption('-c:v', 'libx264')
                    .save('./src/Assets/template/videos/' + userId + '/template1/block4video3.mp4')
                    .on('start', function (commandLine) {
                        console.log('step7');
                    })
                    .on("error", function (er) {
                        res.status(200).json({ message: 'Video failed 20' });
                        console.log(er);
                        // console.log("error occured: " + er.message);
                        return;
                    })
                    .on("end", function (commandLine) {
                        block4video4(block4, req, res)
                    })
            }
        }
        function block4video4(block4, req, res) {
            var commands = new ffmpeg();
            var result = block4.blockData.blocksubTitle.split(" ");
            var text = '';
            for (var i = 0; i < result.length; i++) {
                if (i == 5) {
                    text = text + result[i] + ' \n ';
                }
                else {
                    text = text + result[i] + ' ';
                }

            }
            var titleColor = block4.blockData.titleColor;
            if (titleColor.lenth == '4') {
                titleColor = titleColor.replaceAll("#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])", "#$1$1$2$2$3$3");
            }
            var subtitleColor = block4.blockData.subtitleColor;
            if (subtitleColor.lenth == '4') {
                subtitleColor = subtitleColor.replaceAll("#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])", "#$1$1$2$2$3$3");
            }
            if (block4.blockData.containerFour == block4.blockData.imageFour) {

                commands.input(assetsPath + block4.blockData.containerFour)
                    .complexFilter([
                        'scale=960:1080[checked]',
                        {
                            filter: 'drawbox',
                            options: {
                                x: 0,
                                y: '920',
                                height: 200,
                                width: 960,
                                color: 'white',
                                t: 'fill',

                            },
                            inputs: 'checked',
                            outputs: 'output1',

                        },
                        {
                            filter: 'drawtext',
                            options: {
                                fontfile: selectedfontsLight,
                                text: text,
                                fontsize: parseInt(block4.blockData.blocksubTitleFontsize) + 15,
                                fontcolor: titleColor,
                                line_spacing: 20,
                                x: '50',
                                y: 'H-th - 20',
                                box: 1,
                                boxcolor: 'white@1',
                                boxborderw: "30",
                                bordercolor: 'white',
                                enable: 'gte(t,1)'
                            },
                            inputs: 'output1',
                            outputs: 'output'
                        },
                    ], 'output')
                    .loop(4)
                    .addOption('-pix_fmt', 'yuv420p')
                    .addOption('-framerate', '50')
                    .addOption('-c:v', 'libx264')
                    .save('./src/Assets/template/videos/' + userId + '/template1/block4video4.mp4')
                    .on('start', function (commandLine) {
                        console.log('step62');
                    })
                    .on("error", function (er) {
                        res.status(200).json({ message: 'Video failed 21' });
                        console.log(er);
                        // console.log("error occured: " + er.message);
                        return;
                    })
                    .on("end", function (commandLine) {
                        let data = {
                            video1: './src/Assets/template/videos/' + userId + '/template1/block4video3.mp4',
                            video2: './src/Assets/template/videos/' + userId + '/template1/block4video4.mp4'
                        }
                        mergeBlock4Videos2(data, req, res)
                    })
            }
            else {
                commands.input(assetsPath + block4.blockData.containerFour)
                    .complexFilter([
                        'scale=960:1080[checked]',
                        {
                            filter: 'drawbox',
                            options: {
                                x: 0,
                                y: '920',
                                height: 200,
                                width: 960,
                                color: 'white',
                                t: 'fill',

                            },
                            inputs: 'checked',
                            outputs: 'output1',

                        },
                        {
                            filter: 'drawtext',
                            options: {
                                fontfile: selectedfontsLight,
                                text: text,
                                fontsize: parseInt(block4.blockData.blocksubTitleFontsize) + 15,
                                fontcolor: titleColor,
                                line_spacing: 20,
                                x: '50',
                                y: 'H-th - 20',
                                box: 1,
                                boxcolor: 'white@1',
                                boxborderw: "30",
                                bordercolor: 'white',
                                enable: 'gte(t,1)'
                            },
                            inputs: 'output1',
                            outputs: 'output'
                        },
                    ], 'output')
                    .addOption('-pix_fmt', 'yuv420p')
                    .addOption('-framerate', '50')
                    .addOption('-c:v', 'libx264')
                    .save('./src/Assets/template/videos/' + userId + '/template1/block4video4.mp4')
                    .on('start', function (commandLine) {
                        console.log('step6 here');
                    })
                    .on("error", function (er) {
                        res.status(200).json({ message: 'Video failed 22' });
                        console.log(er);
                        // console.log("error occured: " + er.message);
                        return;
                    })
                    .on("end", function (commandLine) {
                        let data = {
                            video1: './src/Assets/template/videos/' + userId + '/template1/block4video3.mp4',
                            video2: './src/Assets/template/videos/' + userId + '/template1/block4video4.mp4'
                        }
                        mergeBlock4Videos2(data, req, res)
                    })
            }
        }
        async function mergeBlock4Videos2(data) {
            try {
                const Createdvideo4 = await concat({
                    output: './src/Assets/template/videos/' + userId + '/template1/block4merged2.mp4',
                    videos: [
                        data.video1,
                        data.video2,
                    ],
                    transitions: [
                        {
                            name: 'directional',
                            params: { direction: [0, 1] },
                            duration: 1000
                        },
                    ]
                })
                if (typeof Createdvideo4 == 'undefined') {
                    block4Finalmerged(block4, req, res)
                }
            }
            catch {
                res.status(500).json({ message: 'Video failed 23' });
            }
        }
        function block4Finalmerged(block4, req, res) {
            var command = new ffmpeg();
            command.input('./src/Assets/template/videos/' + userId + '/template1/block4merged1.mp4');
            command.input('./src/Assets/template/videos/' + userId + '/template1/block4merged2.mp4');
            command
                .complexFilter('[0:v]  setpts=PTS-STARTPTS, scale=950:1070,pad=960:1080:5:5:white [a0];[1:v] setpts=PTS-STARTPTS, scale=950:1070,pad=960:1080:5:5:white [a1];[a0][a1]xstack=inputs=2:layout=0_0|w0_0[out]')
                .addOption('-map', '[out]',)
                .addOption('-c:v', 'libx264')
                .save('./src/Assets/template/videos/' + userId + '/template1/block4Finalvideo.mp4')
                .on('start', function (commandLine) {
                    console.log(commandLine);
                })
                .on("error", function (er) {
                    console.log(er);
                    res.status(200).json({ message: 'Video failed 24' });
                    return
                })
                .on("end", function () {
                    setTimeout(function () {
                        finalmerged(block4, req, res)
                    }, 600);
                })
        }
        async function finalmerged(block4, req, res) {
            try {
                const Createdvideos = await concat({
                    output: './src/Assets/template/videos/' + userId + '/template1/mergedBlock4.mp4',
                    videos: [
                        './src/Assets/template/videos/' + userId + '/template1/block3video.mp4',
                        './src/Assets/template/videos/' + userId + '/template1/block4Finalvideo.mp4',
                    ],
                    transitions: [
                        {
                            name: 'fade',
                            duration: 1000
                        },
                    ]
                })
                if (typeof Createdvideos == 'undefined') {
                    res.status(200).json({ message: 'Video created', data: 'template/videos/' + userId + '/template1/mergedBlock4.mp4' });
                }
            }
            catch {
                res.status(500).json({ message: 'Video failed 25' });
            }

        }
    }
}  


const Template = require('../models/templates');
const Block = require('../models/templateBlocks');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
var ffprobe = require('ffprobe-static');
ffmpeg.setFfprobePath(ffprobe.path);
ffmpeg.setFfmpegPath(ffmpegPath);

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
    console.log('here')
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
        //console.log(template);
        const data = {
            templateBlock: templateBlock,
            template: template
        }
        if (templateBlock) {
            await videoTemplate1(data, req, res)
        } else {
            res.status(200).json({ message: 'Video failed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

function videoTemplate1(data, req, res) {
    var command = new ffmpeg();
    var fontfamily = data.template.globalfontFamily;
    const fonts = [
        { family: "'Montserrat', sans-serif", file: "./src/Assets/fonts/Montserrat-Regular.ttf" },
        { family: "'Lato', sans-serif", file: "./src/Assets/fonts/Lato-Regular.ttf" },
        { family: "'Oswald', sans-serif", file: "./src/Assets/fonts/Oswald-Regular.ttf" },
        { family: "'Roboto', sans-serif", file: "./src/Assets/fonts/Roboto-Regular.ttf" },
        { family: "'Noto Serif', serif", file: "./src/Assets/fonts/NotoSerif-Regular.ttf" },
    ]
    var selectedfonts;
    fonts.map(function (font) {
        if (font.family == fontfamily) {
            selectedfonts = font.file;
        }
    })
    data.templateBlock.map(function (block) {
        if (block.blockId == 1) {
            var container1, container2, container3, container4, videoCheck;
            if (block.blockData.containerOne) {
                container1 = process.env.APIURL + block.blockData.containerOne;
            }
            if (block.blockData.containerTwo) {
                container2 = process.env.APIURL + block.blockData.containerTwo;
            }
            if (block.blockData.containerOne) {
                container3 = process.env.APIURL + block.blockData.containerThree;
            }
            if (block.blockData.containerFour) {
                container4 = process.env.APIURL + block.blockData.containerFour;
            }
            if (block.blockData.imageFour == '' && block.blockData.containerFour != '') {
                videoCheck = 1;
            }

            recordCall([container1, container2, container3, container4], videoCheck, block)

        }
    });
    function recordCall(inputs, videoCheck, block) {
        let videoChecks = videoCheck;
        inputs.forEach(input => {
            command.input(input);
        })
        if (videoChecks == 1) {
            command
                .complexFilter('[0:v]  setpts=PTS-STARTPTS, scale=630:470,pad=640:480:5:5:white [a0];[1:v] setpts=PTS-STARTPTS, scale=630:470,pad=640:480:5:5:white [a1];[2:v] setpts=PTS-STARTPTS,  scale=630:470,pad=640:480:5:5:white [a2];[3:v] setpts=PTS-STARTPTS,  scale=630:470,pad=640:480:5:5:white [a3];[a0][a1][a2][a3]xstack=inputs=4:layout=0_0|0_h0|w0_0|w0_h0[out]')
                .addOption('-map', '[out]',)
                .addOption('-c:v', 'libx264')
                .save('./src/Assets/template/videos/server-generated.mp4')
                .on('start', function (commandLine) {
                    console.log('start');
                })
                .on("error", function (er) {
                    console.log(er);
                    console.log("error occured: " + er.message);
                    return res.status(200).json({ message: 'Video failed' });

                })
                .on("end", function () {
                    if (block.blockData.blockTitle) {
                        var datas = {
                            block: block,
                            file: process.env.APIURL + 'template/videos/server-generated.mp4'
                        }
                        addTextTovideo(datas, req, res)
                         console.log("success");
                    }
                    else {
                        return res.status(200).json({ message: 'Video created', data: 'template/videos/server-generated.mp4' });
                        //  console.log("success");
                    }
                })
        } else {
            command
                .complexFilter('[0:v]  setpts=PTS-STARTPTS, scale=630:470,pad=640:480:5:5:white [a0];[1:v] setpts=PTS-STARTPTS, scale=630:470,pad=640:480:5:5:white [a1];[2:v] setpts=PTS-STARTPTS,  scale=630:470,pad=640:480:5:5:white [a2];[3:v] setpts=PTS-STARTPTS,  scale=630:470,pad=640:480:5:5:white [a3];[a0][a1][a2][a3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0[out]')
                .loop(5)
                .addOption('-map', '[out]',)
                .addOption('-t', '5')
                .addOption('-c:v', 'libx264')
                .save('./src/Assets/template/videos/server-generated.mp4')
                .on('start', function (commandLine) {
                    console.log('start');
                })
                .on("error", function (er) {
                    res.status(200).json({ message: 'Video failed' });
                    console.log(er);
                    console.log("error occured: " + er.message);
                    return
                })
                .on("end", function () {
                    if (block.blockData.blockTitle) {
                        var datas = {
                            block: block,
                            file: process.env.APIURL + 'template/videos/server-generated.mp4'
                        }
                        addTextTovideo(datas, req, res)
                         console.log("success");
                        // command.kill();
                    }
                    else {
                        res.status(200).json({ message: 'Video created', data: 'template/videos/server-generated.mp4' });
                        //  console.log("success");
                        return;
                    }
                })
        }
    }

    function addTextTovideo(datas, req, res) {
        var commands = ffmpeg();
        var titleColor = datas.block.blockData.titleColor;
        if (titleColor.lenth == '4') {
            titleColor = titleColor.replaceAll("#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])", "#$1$1$2$2$3$3");
        }
        var subtitleColor = datas.block.blockData.subtitleColor;
        if (subtitleColor.lenth == '4') {
            subtitleColor = subtitleColor.replaceAll("#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])", "#$1$1$2$2$3$3");
        }
        console.log(datas.file);
        //commands.addInput(datas.file)
            ffmpeg(datas.file)
            .complexFilter([
                'scale=1080:720[rescaled]',
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
                        x: '(w + 120)/2',
                        y: '(h + 220)/2',
                        height: 240,
                        width: 480,
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
                        x: '(w + 40)/2',
                        y: '(h + 140)/2',
                        height: 280,
                        width: 520,
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
                        fontsize: parseInt(datas.block.blockData.blocktitleFontsize) + 5,
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
                        fontsize: parseInt(datas.block.blockData.blocksubTitleFontsize) + 5,
                        fontcolor: subtitleColor,
                        x: '(w-text_w )/2',
                        y: '(h-text_h + 50)/2',
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
            .save('./src/Assets/template/videos/server-generated1.mp4')
            .on('start', function (commandLine) {
                console.log('start');
            })
            .on("error", function (er) {
                res.status(200).json({ message: 'Video failed' });
                console.log(er);
                // console.log("error occured: " + er.message);
                return;
            })
            .on("end", function (commandLine) {
                res.status(200).json({ message: 'Video created', data: 'template/videos/server-generated1.mp4' });
                // console.log(commandLine);
                console.log("success");
                return;
            })
    }
}
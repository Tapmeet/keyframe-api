
const Template = require('../models/templates');
const Block = require('../models/templateBlocks');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
var ffprobe = require('ffprobe-static');
ffmpeg.setFfprobePath(ffprobe.path);
ffmpeg.setFfmpegPath(ffmpegPath);
var command = ffmpeg();
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
                        localField: "templateNumber",
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
        const templateBlock = await Block.findOne({ templateId: templateNumber, blockId: blockId });
        await Template.findOneAndUpdate({ templateNumber: templateNumber, userId: userId }, { $set: req.body }, { new: true, useFindAndModify: false });
        var tempateData;
        if (!templateBlock) {
            const newTemplate = new Block({ ...req.body, templateId: templateNumber });
            tempateData = await newTemplate.save();
        }
        else {
            tempateData = await Block.findOneAndUpdate({ templateId: templateNumber, blockId: blockId }, { $set: req.body }, { new: true, useFindAndModify: false });
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
        if (templateBlock) {
            videoTemplate1(templateBlock, req, res)
        } else {
            res.status(200).json({ message: 'Video failed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

function videoTemplate1(templateBlock, req, res) {
    templateBlock.map(function (block) {
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
            recordCall([container1, container2, container3, container4])
            function recordCall(inputs) {
                inputs.forEach(input => {
                    command.addInput(input);
                })
                if (videoCheck == 1) {
                    command
                        .complexFilter('[0:v]  setpts=PTS-STARTPTS, scale=630:470,pad=640:480:5:5:white [a0];[1:v] setpts=PTS-STARTPTS, scale=630:470,pad=640:480:5:5:white [a1];[2:v] setpts=PTS-STARTPTS,  scale=630:470,pad=640:480:5:5:white [a2];[3:v] setpts=PTS-STARTPTS,  scale=630:470,pad=640:480:5:5:white [a3];[a0][a1][a2][a3]xstack=inputs=4:layout=0_0|0_h0|w0_0|w0_h0[out]')
                        .addOption('-map', '[out]',)
                        .addOption('-c:v', 'libx264')
                        .save('./src/Assets/template/videos/server-generated.mp4')
                        .on('start', function (commandLine) {
                            console.log(commandLine);
                        })
                        .on("error", function (er) {
                            res.status(200).json({ message: 'Video failed' });
                            console.log(er);
                            console.log("error occured: " + er.message);
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
                                res.status(200).json({ message: 'Video failed', data: './server-generated.mp4' });
                                console.log("success");
                            }
                        })
                } else {
                    command
                        .complexFilter('[0:v]  setpts=PTS-STARTPTS, scale=630:470,pad=640:480:5:5:white [a0];[1:v] setpts=PTS-STARTPTS, scale=630:470,pad=640:480:5:5:white [a1];[2:v] setpts=PTS-STARTPTS,  scale=630:470,pad=640:480:5:5:white [a2];[3:v] setpts=PTS-STARTPTS,  scale=630:470,pad=640:480:5:5:white [a3];[a0][a1][a2][a3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0[out]')
                        .loop(1)
                        .addOption('-map', '[out]',)
                        .addOption('-t', '5')
                        .addOption('-c:v', 'libx264')
                        .save('./src/Assets/template/videos/server-generated.mp4')
                        .on('start', function (commandLine) {
                            console.log('staring');
                        })
                        .on("error", function (er) {
                            res.status(200).json({ message: 'Video failed' });
                            console.log(er);
                            console.log("error occured: " + er.message);
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
                                res.status(200).json({ message: 'Video failed', data: './server-generated.mp4' });
                                console.log("success");
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
                commands.addInput(process.env.APIURL + datas.block.blockData.containerFour)
                ffmpeg(process.env.APIURL + datas.block.blockData.containerFour)
                    .complexFilter([
                        // Rescale input stream into stream 'rescaled'
                        'scale=640:480[rescaled]',

                        // Duplicate rescaled stream 3 times into streams a, b, and c
                        {
                            filter: 'split', options: '3',
                            inputs: 'rescaled', outputs: ['a', 'b', 'c']
                        },

                        // Create stream 'red' by removing green and blue channels from stream 'a'
                        {
                            filter: 'lutrgb', options: { g: 0, b: 0 },
                            inputs: 'a', outputs: 'red'
                        },

                        // Create stream 'green' by removing red and blue channels from stream 'b'
                        {
                            filter: 'lutrgb', options: { r: 0, b: 0 },
                            inputs: 'b', outputs: 'green'
                        },

                        // Create stream 'blue' by removing red and green channels from stream 'c'
                        {
                            filter: 'lutrgb', options: { r: 0, g: 0 },
                            inputs: 'c', outputs: 'blue'
                        },

                        // Pad stream 'red' to 3x width, keeping the video on the left,
                        // and name output 'padded'
                        {
                            filter: 'pad', options: { w: 'iw*3', h: 'ih' },
                            inputs: 'red', outputs: 'padded'
                        },

                        // Overlay 'green' onto 'padded', moving it to the center,
                        // and name output 'redgreen'
                        {
                            filter: 'overlay', options: { x: 'w', y: 0 },
                            inputs: ['padded', 'green'], outputs: 'redgreen'
                        },

                        // Overlay 'blue' onto 'redgreen', moving it to the right
                        {
                            filter: 'overlay', options: { x: '2*w', y: 0 },
                            inputs: ['redgreen', 'blue'], outputs: 'output'
                        },
                    ], 'output')
                    .addOption('-c:v', 'libx264')
                    .save('./server-generated1.mp4')
                    .on('start', function (commandLine) {
                        console.log(commandLine);
                    })
                    .on("error", function (er) {
                        res.status(200).json({ message: 'Video failed' });
                        console.log(er);
                        console.log("error occured: " + er.message);
                    })
                    .on("end", function (commandLine) {
                        res.status(200).json({ message: 'Video failed', data: './server-generated1.mp4' });
                        console.log(commandLine);
                        console.log("success");
                    })
            }
        }
    });
}
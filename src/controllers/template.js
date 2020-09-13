
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
    try {
        const { templateId } = req.body;
        const { userId } = req.body;
        const { blockId } = req.body;
        const { templateNumber } = req.body;
        const templateBlock = await Block.findOne({ templateId: templateId, blockId: blockId });
        await Template.findOneAndUpdate({ templateNumber: templateNumber, userId: userId }, { $set: req.body }, { new: true, useFindAndModify: false });
        var tempateData;
        if (!templateBlock) {
            const newTemplate = new Block({ ...req.body });
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
    var command = ffmpeg();
    try {
        const templateBlock = await Block.findOne({ templateId: templateId });
        if (templateBlock) {
            console.log(templateBlock)
            function recordCall(inputs) {
                inputs.forEach(input => {
                    command.addInput(input);
                })
                command
                    .complexFilter('[0:v]  scale=640:480 [a0];[1:v]  scale=640:480 [a1];[2:v]  scale=640:480 [a2];[3:v]  scale=640:480 [a3];[a0][a1][a2][a3]xstack=inputs=4:layout=0_0|0_h0|w0_0|w0_h0[out]')
                    .loop(1)
                    .addOption('-map', '[out]',)
                    .addOption('-c:v', 'libx264')
                    .addOption('-t', '10')
                    .save('./server-generated.mp4')
                    .on('start', function (commandLine) {
                        console.log(commandLine);
                    })
                    .on("error", function (er) {
                        console.log(er);
                        console.log("error occured: " + er.message);
                    })
                    .on("end", function () {
                        console.log("success");
                    })
            }
            recordCall([
                'http://localhost:2000/' + templateBlock.blockData.containerOne,
                'http://localhost:2000/' + templateBlock.blockData.containerTwo,
                'http://localhost:2000/' + templateBlock.blockData.containerThree,
                'http://localhost:2000/' + templateBlock.blockData.containerFour,
            ])
            res.status(200).json({ message: 'Video failed', data: templateBlock });
        } else {
            res.status(200).json({ message: 'Video failed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
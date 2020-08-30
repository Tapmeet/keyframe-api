
const Template = require('../models/templates');
const Block = require('../models/templateBlocks');
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
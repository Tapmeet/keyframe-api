const User = require('../models/user');
const Divison = require('../models/division');

/**
 * @function  addDivision used to new division
 * @route POST api/division/add-division
 * @desc Add Division 
 * @access Admin
*/
exports.addDivision = async (req, res) => {
  try {
    const { userId } = req.body;
    const { number } = req.body;
    const { title } = req.body;
    // Make sure this account exist and have admin access
    const user = await User.findOne({ _id: userId, userRole: true });
    if (!user) { return res.status(200).json({ message: 'Access Denied' }); }

    // Check Already existed divison 
    const divison = await Divison.findOne({ number: number, title: title });
    if (divison) { return res.status(200).json({ message: 'Divison already exists' }) }

    //Save Divison
    const newDivision = new Divison({ ...req.body });
    await newDivision.save();
    res.status(200).json({ message: 'Divison successfully saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
};


/** @route GET api/division
*   @desc Returns all division
*   @access Public
*   @returns return all divisions
*/
exports.index = async function (req, res) {
  const divisions = await Divison.find({});
  res.status(200).json({ divisions });
};

/** @route GET api/division/{id}
* @desc Returns a specific division
* @access Public
*/
exports.show = async function (req, res) {
  try {
    const id = req.params.id;

    const division = await Divison.findById({ _id: id });

    if (!division) return res.status(200).json({ message: 'Division does not exist' });
    res.status(200).json({ division });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
};

/** @route PUT api/division/{id}
*   @desc Update division details
*   @access Public
*/
exports.update = async function (req, res) {
  try {
    const { id } = req.body;
    const { userId } = req.body;

    //Make sure the passed userId is that of the logged in user and have admin access
    const user = await User.findOne({ _id: userId, userRole: true });
    if (!user) { return res.status(200).json({ message: 'Access Denied' }); }

    //Make sure to update existing division 
    const divison = await Divison.findOne({ _id: id });
    if (!divison) { return res.status(200).json({ message: 'Divison not found' }); }

    // Update existing division  
    const divisonUpdate = await Divison.findOneAndUpdate({ _id: id }, { $set: req.body }, { new: true, useFindAndModify: false });
    res.status(200).json({ divisonUpdate, message: 'Divison has been updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** @route Delete api/division/{id}
*   @desc Delete Division
*   @access Public
*/
exports.destroy = async function (req, res) {
  try {
    const id = req.params.id;
    // Delete existing division  
    await Divison.findOneAndDelete(id);
    res.status(200).json({ message: 'Divison has been deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
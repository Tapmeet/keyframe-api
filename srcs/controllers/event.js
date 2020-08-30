const User = require('../models/user');
const Event = require('../models/event');

/**
 * @function  addEvent used to create new Event
 * @route POST api/event/add-event
 * @desc Add Event 
 * @access Admin
*/
exports.addEvent = async (req, res, next) => {
  try {
    const file = req.file;
    const { userId } = req.body;
    // Make sure this account exist and have admin access
    const user = await User.findOne({ _id: userId, userRole: true });
    if (!user) { return res.status(200).json({ message: 'Access Denied' }); }
    if (!file) {
      const newEvent = new Event({ ...req.body });
      await newEvent.save();
    }
    else {
      const filePath = file.path;
      //Save Event
      if (filePath) {
        const newEvent = new Event({ ...req.body, eventImage: filePath });
        await newEvent.save();
      }
    }

    res.status(200).json({ message: 'Event successfully created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/** @route GET api/event
*   @desc Returns Event list
*   @access Public
*   @returns return all events array
*/
exports.index = async function (req, res) {
  const events = await Event.find({});
  res.status(200).json({ events });
};

/** @route GET api/event/{id}
* @desc Returns a specific Event
* @access Public
*/
exports.show = async function (req, res) {
  try {
    const id = req.params.id;

    const event = await Event.findById({ _id: id });

    if (!event) return res.status(200).json({ message: 'Event does not exist' });
    res.status(200).json({ event });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
};

// /** @route PUT api/event/{id}
// *   @desc Update event details
// *   @access Public
// */
// exports.update = async function (req, res) {
//   try {
//     const { id } = req.body;
//     const { userId } = req.body;

//     //Make sure the passed userId is that of the logged in user and have admin access
//     const user = await User.findOne({ _id: userId, userRole: true });
//     if (!user) { return res.status(200).json({ message: 'Access Denied' }); }

//     //Make sure to update existing division 
//     const divison = await Divison.findOne({ _id: id });
//     if (!divison) { return res.status(200).json({ message: 'Divison not found' }); }

//     // Update existing division  
//     const divisonUpdate = await Divison.findOneAndUpdate({ _id: id }, { $set: req.body }, { new: true, useFindAndModify: false });
//     res.status(200).json({ divisonUpdate, message: 'Divison has been updated' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

/** @route Delete api/event/{id}
*   @desc Delete Event
*   @access Public
*/
exports.destroy = async function (req, res) {
  try {
    const id = req.params.id;
    const { userId } = req.body;

    //Make sure the passed userId is that of the logged in user and have admin access
    const user = await User.findOne({ _id: userId, userRole: true });
    if (!user) { return res.status(200).json({ message: 'Access Denied' }); }

    // Delete existing Event  
    await Event.findOneAndDelete(id);
    res.status(200).json({ message: 'Event has been deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const Group = require('../models/groups.models')
const User = require('../models/user.model')

exports.create_group = async (req, res, next) => {
    try {
        const id = req.query.id;

        const { group }= req.body;
        const checkExistingUser = await User.findById(id);
        if(!checkExistingUser){
          return res.status(404).json({message: "User not found"});
        }
        const newGroup = new Group({group})
        const saveNewGroup = await newGroup.save();
        return res.status(200).json({
            message: "Group Created successfully",
            saveNewGroup,
          });
    } catch (error) {
        return res.status(500).json({ error });
    }
}

exports.add_participant = async (req, res, next) =>{
    try {
        const id = req.query.id;
        const checkExistingGroup = await Group.findById(id);
        if(!checkExistingGroup){
          return res.status(404).json({message: "Group not found"});
        }
        let amount = 1
// let participants = checkExistingGroup.participants++
const updateGroup = await Group.findByIdAndUpdate(
    id,
   { participants: Number(checkExistingGroup.participants) + Number(amount),},
   { new: true }
)
return res
.status(200)
.json({ message: "1 participant added", updateGroup });
    } catch (error) {
        next(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
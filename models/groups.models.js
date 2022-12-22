const mongoose =require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
   group: {
    type: String,
    enum: ["Silver", "Gold", "Platinum"]
   },
   groupName: {
    type: String,
    unique: true,
   },
    group_balance: {
        type: mongoose.Decimal128,
        required: true,
        default: 0.00
    },
    participants: {
        type: Number,
        default: 0
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
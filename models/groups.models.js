const mongoose =require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
   groupName: {
    type: String,
    unique: true,
    required: true,
   },
   savingsTarget: {
    type: String,
    required: true,
   },
   savingsDuration: {
    type: String,
    required: true,
   },
    groupBalance: {
        type: mongoose.Decimal128,
        required: true,
        default: 0.00
    },
    participants: {
        type: Number,
        default: 0
    },
    participantsId: {
        type: [String]
    },
    max_no_of_participants: {
        type: Number,
        required: true,
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
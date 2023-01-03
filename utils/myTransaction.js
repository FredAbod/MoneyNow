// const Group = require('../models/groups.models')
const User = require("../models/user.model");

const Transactions = require("../models/transactions");

exports.creditAccount = async ({
  tx_ref,
  amount,
  currency,
  // redirect_url,
  purpose,
  trnxSummary,
  email,
  firstName,
  session,
  summary,
}) => {
  const user = await User.findOne({ firstName });
  if (!user) {
    return {
      status: false,
      statusCode: 404,
      message: `The ${firstName} doesn\'t exist`,
    };
  }

  const updatedUser = await User.findOneAndUpdate(
    { firstName },
    { $inc: { userBalance: amount } },
    { session }
  );

  const transaction = await Transactions.create(
    [
      {
        trnxType: "CR",
        tx_ref,
        purpose,
        amount,
        currency,
        email,
        firstName,
        balanceBefore: Number(User.userBalance),
        balanceAfter: Number(User.userBalance) + Number(amount),
        summary,
        trnxSummary,
      },
    ],
    // { session }
  );

  console.log(`Credit successful`);
  return {
    status: true,
    statusCode: 201,
    message: "Credit successful",
    data: { updatedUser, transaction },
  };
};

exports.debitAccount = async ({
  amount,
  purpose,
  reference,
  firstName,
  summary,
  trnxSummary,
  session,
}) => {
  const user = await User.findOne({ firstName });
  if (!user) {
    return {
      status: false,
      statusCode: 404,
      message: `The ${firstName} doesn\'t exist`,
    };
  }

  if (Number(User.userBalance) < amount) {
    return {
      status: false,
      statusCode: 400,
      message: `User ${firstName} has insufficient balance`,
    };
  }

  const updatedUser = await User.findOneAndUpdate(
    { username },
    { $inc: { Balance: -amount } },
    { session }
  );
  const transaction = await Transactions.create(
    [
      {
        trnxType: "DR",
        purpose,
        amount,
        firstName,
        reference,
        groupUsername,
        balanceBefore: Number(User.userBalance),
        balanceAfter: Number(User.userBalance) - Number(amount),
        summary,
        trnxSummary,
      },
    ],
    { session }
  );

  console.log(`Debit successful`);
  return {
    status: true,
    statusCode: 201,
    message: "Debit successful",
    data: { updatedUser, transaction },
  };
};

const Group = require('../models/groups.models')
const Transactions = require("../models/transactions");


exports.creditAccount = async ({
  tx_ref,
  amount,
  currency,
  redirect_url,
  purpose,
  trnxSummary,
  email,
 groupName,
  session,
  summary,
}) => {
  const group = await Group.findOne({ groupName });
  if (!group) {
    return {
      status: false,
      statusCode: 404,
      message: `The ${groupName} doesn\'t exist, redirect_url ${redirect_url}`,
    };
  }

  const updatedGroup = await Group.findOneAndUpdate(
    { groupName },
    { $inc: { group_balance: amount } },
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
    groupName,
    balanceBefore: Number(group.group_balance),
    balanceAfter: Number(group.group_balance) + Number(amount),
        summary,
        trnxSummary,
      },
    ],
    { session }
  );

  console.log(`Credit successful`);
  return {
    status: true,
    statusCode: 201,
    message: "Credit successful",
    data: { updatedGroup, transaction },
  };
};

exports.debitAccount = async ({
  amount,
  username,
  purpose,
  reference,
groupName,
  summary,
  trnxSummary,
  session,
}) => {
  const group = await Group.findOne({ groupName });
  if (!group) {
    return {
      status: false,
      statusCode: 404,
      message: `The ${groupName} doesn\'t exist`,
    };
  }

  if (Number(group.group_balance) < amount) {
    return {
      status: false,
      statusCode: 400,
      message: `User ${groupName} has insufficient balance`,
    };
  }

  const updatedgroup = await Groups.findOneAndUpdate(
    { username },
    { $inc: { group_balance: -amount } },
    { session }
  );
  const transaction = await Transactions.create(
    [
      {
        trnxType: "DR",
        purpose,
        amount,
        username,
        reference,
        groupUsername,
        balanceBefore: Number(group.group_balance),
        balanceAfter: Number(group.group_balance) - Number(amount),
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
    data: { updatedgroup, transaction },
  };
};

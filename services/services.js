const User = require('../models/user.model');


exports.Services = {
  find: () => Admin.find({}),

  findUserByEmail: (id) => User.findOne(id),

  findUserById: async (id) => {
    const user = await User.findById(id);

    if (!user) throw new Error('User not found');
    return user;
  },
  signUp: async (data) => {
    const user = new User({ ...data });
    await user.save();
    if (!user) throw new Error('User not found');
    return user;
  },
};

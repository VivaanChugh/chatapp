const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Channel', channelSchema);

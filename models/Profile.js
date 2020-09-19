var mongoose = require("mongoose")

const profileSchema = new mongoose.Schema({
  email: String,
  name: String,
  dateOfBirth: Date,
  gender: String,
  country: String,
  goal: String,
  shareWithNetWork: Boolean
})

module.exports = mongoose.model("Profile", profileSchema)

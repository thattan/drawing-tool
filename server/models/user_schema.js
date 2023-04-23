const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'name field is required'],
    },
    password: {
      type: String,
      required: [true, 'name field is required'],
    },
    // age: {
    //   type: Number,
    //   required: [true, 'age field is required'],
    // },
  },
  { timestamps: true, writeConcern: { w: 'majority' } }
);

module.exports = model('users', userSchema);

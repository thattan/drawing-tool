const { Schema, model } = require('mongoose');

const drawingSchema = new Schema(
  {
    name: {
        type: String,
        required: [true, 'name field is required'],
    },
    drawingJson: {
      type: String,
      required: [true, 'drawing json is required'],
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
    // age: {
    //   type: Number,
    //   required: [true, 'age field is required'],
    // },
  },
  { timestamps: true, writeConcern: { w: 'majority' } }
);

module.exports = model('drawings', drawingSchema);

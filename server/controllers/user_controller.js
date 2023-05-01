'use strict';

const User = require('../models/user_schema');
const Drawing = require('../models/drawing_schema');

exports.createData = (req, res) => {
  console.log('hit');

  const user = new User(req.body);
  user.save();

  User.create(req.body)
    .then((data) => {
      console.log('New User Created!', data);

      const drawing = new Drawing({
        drawingJson: '<json> lol',
        name: 'test',
        user: data._id
      });

      Drawing.create(drawing);

      res.status(201).json(data);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        console.error('Error Validating!', err);
        res.status(422).json(err);
      } else {
        console.error(err);
        res.status(500).json(err);
      }
    });
};

exports.readData = (req, res) => {
  console.log('hit');
  User.find()
    .then((data) => {


      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
};

exports.updateData = (req, res) => {
  User.findByIdAndUpdate(req.params.id, req.body, {
    useFindAndModify: false,
    new: true,
  })
    .then((data) => {
      console.log('User updated!');
      res.status(201).json(data);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        console.error('Error Validating!', err);
        res.status(422).json(err);
      } else {
        console.error(err);
        res.status(500).json(err);
      }
    });
};

exports.deleteData = (req, res) => {
  User.findById(req.params.id)
    .then((data) => {
      if (!data) {
        throw new Error('User not available');
      }
      return data.remove();
    })
    .then((data) => {
      console.log('User removed!');
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
};

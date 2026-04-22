import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll Number is required'],
      trim: true,
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
      trim: true,
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
    },
    aboutProject: {
      type: String,
      required: [true, 'About Project is required'],
      trim: true,
    },
    hobbies: {
      type: [String],
      default: [],
    },
    certificate: {
      type: String,
      trim: true,
      default: '',
    },
    internship: {
      type: String,
      trim: true,
      default: '',
    },
    aboutYourAim: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Member = mongoose.model('Member', memberSchema);
export default Member;

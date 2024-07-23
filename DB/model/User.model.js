import mongoose, { model, Schema, Types } from 'mongoose';

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, 'userName is required'],
      min: [2, 'Minimum length 2 char'],
      max: [20, 'Maximum length 20 char'],
      lowercase: true,
    },
    email: {
      type: String,
      unique: [true, 'Email must be unique value'],
      required: [true, 'Email is required'],
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    forgetCode: { type: String },
    categories: [
      {
        type: Types.ObjectId,
        ref: 'Category',
      },
    ],
    status: {
      type: String,
      default: 'Offline',
      enum: ['Offline', 'Online'],
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    changePasswordTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const userModel = mongoose.model.User || model('User', userSchema);

export default userModel;

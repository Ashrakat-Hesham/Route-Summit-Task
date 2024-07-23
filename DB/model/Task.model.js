import mongoose, { model, Schema, Types } from 'mongoose';

const taskSchema = new Schema(
  {
    title: { type: String, required: true, lowercase: true },
    taskType: { type: String, enum: ['ListTask', 'TextTask'], required: true },
    items: [{ type: String }],
    content: { type: String },
    categoryId: {
      type: Types.ObjectId,
      ref: 'Category',
    },
    owner: {
      type: Types.ObjectId,
      ref: 'User',
    },
    taskStatus: {
      type: String,
      default: 'Private',
      enum: ['Private', 'Public'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

taskSchema.virtual('user',{
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
})
taskSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
})
const taskModel = mongoose.models.Task || model('Task', taskSchema);

export default taskModel;

import mongoose, { model, Schema, Types } from 'mongoose';

const categorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
      lowercase: true,
    },
    owner: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listTasks: [{ type: Types.ObjectId, ref: 'Task', required: false }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, //this redeclare the id of category again
    toObject: { virtuals: true },
  }
);
categorySchema.virtual('user',{
  ref: 'User',
  localField: 'owner',
  foreignField: '_id',
})
categorySchema.virtual('task', {
  ref: 'Task',
  localField: 'listTasks',
  foreignField: '_id',
})



const categoryModel =
  mongoose.models.Category || model('Category', categorySchema);

export default categoryModel;

import { asyncHandler } from './errorHandling.js';

export const deleteOne = (model, name) => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let userId = req.user._id;
    let record = await model.findOne({
      $and: [{ _id: id }, { owner: userId }],
    });
    if (!record) {
      return next(new Error(`${name} does not exist OR You are not the owner`));
    }
    let document = await model.findByIdAndDelete(id);
    !document && next(new Error(`${name} not found`, 404));
    let response = {};
    response[name] = document;
    return document && res.status(200).json({ message: 'Done', response });
  });
};

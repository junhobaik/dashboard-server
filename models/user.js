import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  googleId: { type: String, required: true },
  picture: String,
  hideCategoryList: { type: [String], default: [] },
  feedList: [
    {
      feedId: String,
      title: String,
      category: String,
      readedItem: [String],
      isHideItems: { type: Boolean, default: false }
    }
  ]
});

export default mongoose.model('user', UserSchema);

// UserSchema.pre('save', async next => {
//   try {
//     const user = this;
//     console.log('userSchema pre:', user);
//     return next();
//   } catch (error) {
//     return next(error);
//   }
// });

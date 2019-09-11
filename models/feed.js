import mongoose from 'mongoose';

const { Schema } = mongoose;

const FeedSchema = new Schema({
  feedUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  link: String,
  pubDate: Date,
  items: [{ title: String, contentSnippet: String, link: String, isoDate: Date }]
});

export default mongoose.model('feed', FeedSchema);

/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
import _ from 'lodash';
import { ObjectID } from 'mongodb';
import Parser from 'rss-parser';

const getFeed = async url => {
  const parser = new Parser();
  return await parser.parseURL(url);
};

export default {
  Query: {
    feeds: async (parent, args, { feedModel }) => {
      return await feedModel.find({}, (err, feeds) => feeds);
    },

    feed: async (parent, { _id }, { feedModel }) => {
      return await feedModel.findOne({ _id: ObjectID(_id) }, (err, feed) => feed);
    },

    feedsByIds: async (parent, { ids }, { feedModel }) => {
      const result = await feedModel.findOne({ _id: { $in: [...ids] } }, { items: 1 });
      return result.items;
    }
  },

  Mutation: {
    addFeed: async (parent, { url, category }, { userModel, feedModel, user }) => {
      const userUpdate = (feedId, title, category) => {
        userModel.updateOne(
          { googleId: user.id, 'feedList.feedId': { $ne: feedId } },
          {
            $push: {
              feedList: {
                feedId,
                title,
                category
              }
            }
          },
          (error, update) => {
            if (error) console.log(error);
          }
        );
      };

      const result = await feedModel
        .findOne({ feedUrl: url })
        .then(feedData => {
          if (feedData) {
            const { _id, title } = feedData;
            userUpdate(_id, title, category);
          }

          if (!feedData) {
            getFeed(url).then(feed => {
              const { items, title, pubDate, lastBuildDate, link } = feed;

              feedModel
                .create({
                  feedUrl: url,
                  title,
                  items,
                  pubDate: pubDate || lastBuildDate,
                  link
                })
                .then(created => {
                  userUpdate(created._id, title, category);
                });
            });
          }
        })
        .then(() => {
          return true;
        })
        .catch(err => {
          return false;
        });

      return {
        response: result
      };
    }
  }
};

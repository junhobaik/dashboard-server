/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
const toggleFeedItem = async (isRead, feedId, itemId, userId, userModel) => {
  const readedItemQuery = isRead ? { $nin: [itemId] } : { $in: [itemId] };

  const result = await userModel
    .findOne(
      {
        googleId: userId,
        feedList: { $elemMatch: { feedId, readedItem: readedItemQuery } }
      },
      {
        feedList: { $elemMatch: { feedId, readedItem: readedItemQuery } },
        'feedList.readedItem': true
      }
    )
    .then(async data => {
      if (data) {
        const { readedItem } = data.feedList[0];

        if (isRead) {
          if (readedItem.length >= 50) readedItem.shift();
          readedItem.push(itemId);
        } else {
          readedItem.splice(readedItem.indexOf(itemId), 1);
        }

        const updateReadedItem = await userModel
          .updateOne(
            { googleId: userId, 'feedList.feedId': feedId },
            {
              $set: {
                'feedList.$.readedItem': readedItem
              }
            }
          )
          .then(updateResult => {
            return { response: true };
          })
          .catch(updateError => {
            return { response: false };
          });
        return updateReadedItem;
      }
      return { response: false };
    })
    .catch(err => {
      return { response: false };
    });

  return result;
};

export default {
  Query: {
    users: async (parent, args, { userModel }) => {
      return await userModel.find({}, (err, users) => users);
    },

    user: async (parent, args, { userModel, user }) => {
      if (user) {
        return await userModel.findOne({ googleId: user.id });
      }
    }
  },

  feedListItem: {
    link: async (parent, args, { feedModel }) => {
      const result = await feedModel.findOne({ _id: parent.feedId }, { link: 1 });
      return result.link;
    },

    items: async (parent, args, { feedModel }) => {
      const result = await feedModel.findOne({ _id: parent.feedId }, { items: 1 });
      return result.items;
    }
  },

  Mutation: {
    unreadFeedItem: async (parent, { feedId, itemId }, { userModel, user }) => {
      return await toggleFeedItem(false, feedId, itemId, user.id, userModel);
    },

    readFeedItem: async (parent, { feedId, itemId }, { userModel, user }) => {
      return await toggleFeedItem(true, feedId, itemId, user.id, userModel);
    },

    toggleHideFeedItems: async (parent, { feedId, isHide }, { userModel, user }) => {
      const result = await userModel
        .updateOne(
          { googleId: user.id, 'feedList.feedId': feedId },
          {
            $set: {
              'feedList.$.isHideItems': isHide
            }
          },
          (error, update) => {
            // if (update.nModifed) console.log(`${update.nModifed}개 수정`)
          }
        )
        .then(res => {
          return { response: isHide };
        });

      return result;
    },

    deleteFeedListItem: async (parent, { id }, { userModel, user }) => {
      const result = await userModel
        .updateOne(
          { googleId: user.id },
          {
            $pull: {
              feedList: { feedId: id }
            }
          },
          (error, update) => {
            console.log(update);
            // if (update.nModifed) console.log(`${update.nModifed}개 수정`)
          }
        )
        .then(res => {
          return { response: true };
        });

      return result;
    },

    toggleHideCategory: async (parent, { category, isHide }, { userModel, user }) => {
      let updateQuery;
      if (!isHide) {
        updateQuery = { $pull: { hideCategoryList: category } };
      } else {
        updateQuery = { $push: { hideCategoryList: category } };
      }

      const result = await userModel
        .updateOne({ googleId: user.id }, updateQuery, (error, update) => {
          // if (update) console.log(`${update.nModified}개 수정`);
        })
        .then(res => {
          return { response: true };
        })
        .catch(err => {
          return { response: false };
        });

      return result;
    },

    changeFeedTitle: async (parent, { feedId, title }, { userModel, user }) => {
      console.log(feedId, title);

      const result = await userModel
        .updateOne(
          { googleId: user.id, 'feedList.feedId': feedId },
          {
            $set: {
              'feedList.$.title': title
            }
          },
          (error, update) => {
            // if (update) console.log(`${update.nModified}개 수정`)
          }
        )
        .then(res => {
          return { response: true };
        })
        .catch(err => {
          return { response: false };
        });

      return result;
    },

    deleteCategory: async (parent, { category }, { userModel, user }) => {
      const result = await userModel
        .updateMany(
          { googleId: user.id, 'feedList.category': category },
          {
            $set: { 'feedList.$[element].category': 'root' }
          },
          { arrayFilters: [{ 'element.category': category }] }
        )
        .then(res => {
          return { response: true };
        })
        .catch(err => {
          if (err) return { response: false };
        });

      return result;
    },

    changeCategoryName: async (
      parent,
      { oldCategoryName, newCategoryName },
      { userModel, user }
    ) => {
      const result = await userModel
        .updateMany(
          { googleId: user.id, 'feedList.category': oldCategoryName },
          {
            $set: { 'feedList.$[element].category': newCategoryName }
          },
          { arrayFilters: [{ 'element.category': oldCategoryName }] }
        )
        .then(res => {
          return { response: true };
        })
        .catch(err => {
          if (err) return { response: false };
        });

      return result;
    },

    changeFeedCategory: async (parent, { feedId, category }, { userModel, user }) => {
      const result = await userModel
        .updateOne(
          { googleId: user.id, 'feedList.feedId': feedId },
          {
            $set: {
              'feedList.$.category': category
            }
          },
          (error, update) => {
            // if (update) console.log(`${update.nModified}개 수정`)
          }
        )
        .then(res => {
          return { response: true };
        })
        .catch(err => {
          return { response: false };
        });

      return result;
    }
  }
};

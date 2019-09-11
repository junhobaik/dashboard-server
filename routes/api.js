/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */

import express from 'express';
import Parser from 'rss-parser';
import moment from 'moment';

import { feedModel } from '../models';
import isAuthenticated from './util';

const router = express.Router();
const parser = new Parser();

router.get('/account', isAuthenticated, (req, res, next) => {
  res.json({
    title: 'Account',
    name: req.user.displayName,
    user: req.user
  });
});

const getFeed = async url => {
  return await parser.parseURL(url);
};

router.get('/getfeed', (req, res, next) => {
  const { url } = req.query;

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  getFeed(url)
    .then(feed => {
      res.sendStatus(200);
    })
    .catch(err => {
      res.sendStatus(204);
    });
});

const updateFeed = () => {
  console.log('interval');
  feedModel
    .find({}, { feedUrl: true, pubDate: true, syncDate: true })
    .then(pubDates => {
      const feedList = [];
      for (const { pubDate, feedUrl, _id } of pubDates) {
        feedList.push({ feedUrl, pubDate });
      }
      return feedList;
    })
    .then(feedList => {
      const pipe = (...funcs) => argument => funcs.reduce((acc, func) => func(acc), argument);

      const updateList = async ({ feedUrl, pubDate }) => {
        const result = await parser.parseURL(feedUrl).then(f => {
          const rPubDate = f.pubDate ? new Date(f.pubDate) : null || f.lastBuildDate;

          if (rPubDate > pubDate) {
            console.log('');
            console.log(`- ${f.title}: 업데이트 필요`);
            console.log(`  - SITE: ${moment(rPubDate).fromNow()}`);
            console.log(`  - DATA: ${moment(pubDate).fromNow()}`);

            feedModel
              .updateOne(
                { feedUrl },
                {
                  $set: {
                    pubDate: rPubDate,
                    items: f.items
                  }
                }
              )
              .then(res => {
                console.log(`${res.nModified}개 업데이트`);
              });

            return feedUrl;
          }
          console.log('');
          console.log(`- ${f.title}: 업데이트 불필요`);
          return feedUrl;
        });
        return result;
      };

      const fns = [];
      for (const { feedUrl, pubDate } of feedList) {
        fns.push(async () => await updateList({ feedUrl, pubDate }));
      }

      const checkAndUpdate = pipe(...fns);
      checkAndUpdate();
    });
};
// updateFeed();
const interval = setInterval(() => {
  updateFeed();
}, 10 * 60 * 1000);

export default router;

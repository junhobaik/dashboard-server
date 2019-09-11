import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    feeds: [Feed] # feed resolver
    feed(_id: String!): Feed # feed resolver
    feedsByIds(ids: [String]!): [feedItems] # feed resolver
  }

  type Feed {
    _id: String
    title: String
    link: String
    feedUrl: String
    pubDate: String
    items: [feedItems] # feed schema
  }

  type feedItems {
    _id: String
    title: String
    contentSnippet: String
    link: String
    isoDate: String
  }

  type response {
    response: Boolean
  }

  extend type Mutation {
    addFeed(url: String, category: String): response
  }
`;

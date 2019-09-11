import { gql } from 'apollo-server-express';

import userSchema from './user';
import feedSchema from './feed';

const linkSchema = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

export default [linkSchema, userSchema, feedSchema];

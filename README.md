# hackernews-node

[![build status](https://img.shields.io/travis/tanem/hackernews-node/master.svg?style=flat-square)](https://travis-ci.com/tanem/hackernews-node)
[![coverage status](https://img.shields.io/codecov/c/github/tanem/hackernews-node.svg?style=flat-square)](https://codecov.io/gh/tanem/hackernews-node)

> A GraphQL API for a Hacker News clone.

## Table of Contents

- [Background](#background)
- [Getting Started](#getting-started)
- [Using the GraphQL API](#using-the-graphql-api)
- [Running Tests](#running-tests)
- [Credits](#credits)
- [License](#license)

## Background

This project was created so I could become more familiar with [GraphQL](https://graphql.org/). It was originally based off [the code](https://github.com/howtographql/graphql-js) for [How to GraphQL](https://www.howtographql.com/)'s [GraphQL.js tutorial](https://www.howtographql.com/graphql-js/0-introduction/), and evolved as follows:

- Integration tests added to facilitate refactoring.
- Conversion to TypeScript.
- Switched to constructing the GraphQL schema with [Nexus Schema](https://github.com/graphql-nexus/schema).

## Getting Started

Clone this repository:

```
$ git clone git@github.com:tanem/hackernews-node.git --depth=1
```

Install dependencies:

```
$ cd hackernews-node
$ npm install
```

> This also generates Prisma Client JS into `node_modules/@prisma/client` via a `postinstall` hook of the `@prisma/client` package.

Start the server:

```
$ npm run dev
```

Point a browser at [http://localhost:4000](http://localhost:4000) to explore the GraphQL API in a [GraphQL Playground](https://github.com/prisma/graphql-playground). The app uses a SQLite database, [`./prisma/dev.db`](./prisma/dev.db), which was created and seeded with dummy data as follows:

```
$ npx cross-env-shell DATABASE_URL=file:./dev.db "npm run migrate && ts-node prisma/seed.ts"
```

## Using the GraphQL API

The schema that specifies the API operations of the GraphQL server is defined in [`./src/schema.graphql`](./src/schema.graphql). Below are a number of operations that you can send to the API using the GraphQL Playground.

Feel free to adjust any operation by adding or removing fields. The GraphQL Playground helps you with its auto-completion and query validation features.

<details>
<summary>Return all links</summary>
<p>

```graphql
query {
  feed {
    count
    links {
      id
      description
      url
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
          name
        }
      }
    }
  }
}
```

</p>
</details>

<details>
<summary>Search for links whose description or url contains a filter string</summary>
<p>

```graphql
query {
  feed(filter: "graphql") {
    count
    links {
      id
      description
      url
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
          name
        }
      }
    }
  }
}
```

</p>
</details>

<details>
<summary>Paginate the links query using offset pagination</summary>
<p>

> 📍 The Prisma documentation on offset pagination can be found [here](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/pagination#offset-pagination).

```graphql
query {
  feed(take: 3, skip: 1) {
    count
    links {
      id
      description
      url
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
          name
        }
      }
    }
  }
}
```

</p>
</details>

<details>
<summary>Sort the links query</summary>
<p>

> 📍 Links can be sorted by `description`, `url` or `createdAt`.

```graphql
query {
  feed(orderBy: { description: asc }) {
    count
    links {
      id
      description
      url
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
          name
        }
      }
    }
  }
}
```

</p>
</details>

<details>
<summary>Register a new user</summary>
<p>

```graphql
mutation {
  signup(name: "Sarah", email: "sarah@prisma.io", password: "graphql") {
    token
  }
}
```

</p>
</details>

<details>
<summary>Log in an existing user</summary>
<p>

```graphql
mutation {
  login(email: "sarah@prisma.io", password: "graphql") {
    token
  }
}
```

</p>
</details>

<details>
<summary>Post a link</summary>
<p>

> 📍 You need to be logged in for this query to work. One way to do this is
> to retrieve an authentication token via a `signup` or `login` mutation, and
> then add it along with the `Bearer`-prefix to the `Authorization` header in
> the bottom-left corner of the GraphQL Playground:
>
> ```json
> {
>   "Authorization": "Bearer __YOUR_TOKEN__"
> }
> ```

```graphql
mutation {
  post(
    url: "https://graphql.org/"
    description: "GraphQL is a query language for your API, and a server-side runtime for executing queries by using a type system you define for your data."
  ) {
    id
  }
}
```

</p>
</details>

<details>
<summary>Vote for a link</summary>
<p>

> 📍 You need to be logged in for this query to work. One way to do this is
> to retrieve an authentication token via a `signup` or `login` mutation, and
> then add it along with the `Bearer`-prefix to the `Authorization` header in
> the bottom-left corner of the GraphQL Playground:
>
> ```json
> {
>   "Authorization": "Bearer __YOUR_TOKEN__"
> }
> ```

> 📍 You need to replace the `__LINK_ID__`-placeholder with an actual `Link` `id`. You can find one using a `feed`-query.

```graphql
mutation {
  vote(linkId: "__LINK_ID__") {
    id
  }
}
```

<p>
</details>

<details>
<summary>Subscribe to new links</summary>
<p>

> 📍 Open two GraphQL Playground tabs, run the subscription in one tab, post a
> link in the other tab, and view the result in the subscription tab in
> real-time.

```graphql
subscription {
  newLink {
    id
    description
    url
    postedBy {
      id
      name
    }
  }
}
```

</p>
</details>

<details>
<summary>Subscribe to new votes</summary>
<p>

> 📍 Open two GraphQL Playground tabs, run the subscription in one tab, post a
> vote in the other tab, and view the result in the subscription tab in
> real-time.

```graphql
subscription {
  newVote {
    id
    link {
      url
      description
    }
    user {
      name
      email
    }
  }
}
```

</p>
</details>

## Running Tests

Run all tests:

```
$ npm test
```

Run in watch mode:

```
$ npm run test:watch
```

Run with test coverage information:

```
$ npm run test:coverage
```

## Credits

- [prisma-examples](https://github.com/prisma/prisma-examples) for the documentation content and layout.

## License

MIT

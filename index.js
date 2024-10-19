const express = require("express")
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require("graphql")
const bodyParser = require('body-parser');
const app = express()
const { mongoose } = require("mongoose")
const Event = require("./schema/Event")
app.use(bodyParser.json());


const schema = buildSchema(`
   type Event {
     _id:ID!
     title:String!
     description:String!
     price:Float!
     date:String!
    }
    input EventInput{
      title:String!
      description:String!
      price:Float!
      date:String!
    }
    type RootQuery{
        events:[Event!]!
    }
    type RootMutation{
     createEvent(eventInput:EventInput):Event
    } 
        schema {
            query: RootQuery
            mutation: RootMutation
        }
`)
// The root provides a resolver function for each API endpoint
const root = {
  events: () => {
    return events;
  },
   createEvent: (args) => {
    const events = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date)
    })
    events.save().then(result => {
      console.log(result)
      return {...result.doc};
    }).catch(err => {
      console.log(err)
    })
    //  return events;
  },
  graphql: true
}

app.all(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
)

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.nr8ol.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true`)
  .then().catch(err => {
    app.listen(4000)
  });

// Start the server at port
console.log("Running a GraphQL API server at http://localhost:4000/graphql")
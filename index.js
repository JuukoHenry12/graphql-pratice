const express = require("express")
const{graphqlHTTP} = require('express-graphql');
const { buildSchema } = require("graphql")
const bodyParser = require('body-parser');
const app = express()

const events=[]

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
    events:()=>{
        return events;
    },
    createEvent:(args)=>{
     const event ={
        _id:Math.random().toString(),
        title:args.eventInput.title,
        description:args.eventInput.description,
        price:+args.eventInput.price,
        date:new Date().toISOString()
     }
     events.push(event)
     console.log(event)
     return event;
   },
   graphql:true
}
app.all(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
)
 // Start the server at port
app.listen(4000)
console.log("Running a GraphQL API server at http://localhost:4000/graphql")
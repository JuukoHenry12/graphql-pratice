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
  events: async() => {
    try{
       const events =await Event.find();
       return events.map(event=>({
        ...event._doc,
        _id:event.id
       }));
    }catch(error){
       throw error
    }
  },
   createEvent: async(args) => {
    const events = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date)
    })
    try{
      const result =await events.save();
      return {
        ...result._doc,
        _id:result.id,
        title:result.title,
        description:result.description,
        price:result.price,
        date:result.date
      }
    }catch(error){
      console.log(error)
      throw error
    }
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

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.nr8ol.mongodb.net/${process.env.MONGO_DATABASE}`
  )
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
});
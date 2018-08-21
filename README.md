## AMQP Modern

A small `amqplib` wrapper for nodejs that simplifies interactions with queue systems.

- Consuming a channel
- Async / Await based
- Publishing to a channel
- Passing off JS objects, so you don't have to
- It handles rejections and acknowledgments automatically

## Install

```
npm install amqp-modern
```

## Usage

```js
import amqp from 'amqp-modern';

let client = amqp('amqp://connection string here');

//catch and log any time a queue has an error
client.onError(error => console.log(error));

//consume a channel
client.consume({
  channel: 'message',
  process: async message => {
    await sendAnEmail(message.description);
    //if this promise rejects, the queue will retry
  },
});

//somewhere in your app, publish to a channel

client.publish('message', { description: 'hello!' });
```

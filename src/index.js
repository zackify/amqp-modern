export default url => {
  //in test mode, dont connect
  let configOptions = {};

  if (process.env.NODE_ENV === 'test')
    return { consume: () => true, publish: () => true };

  const open = require('amqplib').connect(url);

  const consume = async consumer => {
    let connection = await open;
    let ok = await connection.createChannel();
    let channel = await ok;

    channel.assertQueue(consumer.channel);

    channel.consume(consumer.channel, async msg => {
      if (!msg) return console.warn('empty message received');

      try {
        //if it fails to process, it will reject the message so it can be retried

        let message = JSON.parse(msg.content.toString());
        await consumer.process(message);
        channel.ack(msg);
      } catch (e) {
        console.error(e);
        if (configOptions.onError) configOptions.onError(e);
        setTimeout(() => channel.nack(msg), configOptions.rejectionDelay || 0);
      }
    });
  };

  const publish = async (name, message) => {
    let connection = await open;
    let ok = await connection.createChannel();
    let channel = await ok;

    channel.assertQueue(name);
    channel.sendToQueue(name, new Buffer(JSON.stringify(message)));
  };

  return { consume, publish, config: options => (configOptions = options) };
};

import { Kafka, Message, Producer, TopicMessages } from 'kafkajs'

// Creates a single producer, used in ProducerList
class DummyProducer {
  private clientId: string;
  private brokers: string[];
  private producer: Producer;
  private interval: number;
  private activeInterval: NodeJS.Timeout | null;

  constructor(clientId: string, brokers: string[], interval: number) {
    this.clientId = clientId;
    this.brokers = brokers;
    this.producer = this.createProducer();
    this.interval = interval;
    this.activeInterval = null;
  }

  private createProducer(): Producer {
    // Connect to cluster
    const kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.brokers
    })
    // Create producer
    return kafka.producer();
  }

  public async start(): Promise<void> {
    try {
      // Connect producer
      await this.producer.connect();
    } catch (error) {
      console.log('Error connecting producer', error);
    }
  }

  public async sendMessage(topic: string, messages: Array<Message>) {
    this.activeInterval = setInterval(async (): Promise<void> => {
      try {
        // Start sending messages to a topic
        await this.producer.send({
          topic,
          messages
        })
      } catch (error) {
        console.log('Error sending message', error)
      }
    }, this.interval);
  }

  public async stop() {
    try {
      // Disconnect the producer
      if (this.interval !== null) clearInterval(this.activeInterval || 0);
      await this.producer.disconnect();
    } catch (error) {
      console.log('Error disconnecting producer', error);
    }
  }
}

// Allows dynamically starting/sending messages from/stopping multiple producers.
export default class ProducerList {
  private producers: Record<string, DummyProducer>;

  constructor() {
    this.producers = {};
  }

  public async startProducer(producerName: string, interval: number, clientId: string, brokers: string[]): Promise<void> {
    try {
      // If user entered a name for a producer that already exists
      if (Object.hasOwn(this.producers, producerName)) {
        throw new Error("Producer name already exists, choose new producer name.");
      }
      const newProducer = new DummyProducer(clientId, brokers, interval);
      await newProducer.start();
      // Add producer to producers object
      this.producers[producerName] = newProducer;
    } catch (error) {
      console.log('Error instantiating new dummy producer', error);
    }
  }

  public async sendMessage(producerName: string, topic: string, messages: Array<Message> = [{ value: `Hello, this is a message from ${producerName}`}]): Promise<void> {
    try {
      // Check if producer exists, if not throw error
      if (!Object.hasOwn(this.producers, producerName)) {
        throw new Error('Producer does not exist.')
      }

      await this.producers[producerName].sendMessage(topic, messages);
    } catch (error) {
      console.log('Error sending messsage', error);
    }
  }

  public async stopProducer(producerName: string): Promise<void> {
    try {
      // Check if producer exists, if not throw error
      if (!Object.hasOwn(this.producers, producerName)) {
        throw new Error('Producer does not exist.')
      }
      // Disconnect producer
      await this.producers[producerName].stop();
      // Delete producer from cache
      delete this.producers[producerName];
    } catch (error) {
      console.log('Error stopping dummy producer', error);
    }
  }

  public listProducers(): string[] {
    return Object.keys(this.producers);
  }
}
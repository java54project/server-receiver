
import { createLogger, format, transports } from 'winston';
import { CloudWatchLogsClient, DescribeLogStreamsCommand, CreateLogStreamCommand, PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { Writable } from 'stream';
import dotenv from 'dotenv'; 


dotenv.config();


const region = process.env.AWS_REGION;
if (!region) {
  throw new Error('AWS_REGION environment variable is required');
}


const cloudwatchlogs = new CloudWatchLogsClient({ region });

const logGroupName = 'chessAI';
const logStreamName = 'server-consumer';


async function createLogStream() {
  try {
    const describeCommand = new DescribeLogStreamsCommand({
      logGroupName,
      logStreamNamePrefix: logStreamName,
    });

    const describeResponse = await cloudwatchlogs.send(describeCommand);

    if (describeResponse.logStreams && describeResponse.logStreams.length > 0) {
      console.log(`Log stream "${logStreamName}" already exists.`);
    } else {
      const params = {
        logGroupName,
        logStreamName,
      };
      const command = new CreateLogStreamCommand(params);
      await cloudwatchlogs.send(command);
      console.log(`Log stream "${logStreamName}" created successfully.`);
    }
  } catch (error) {
    console.error('Error creating CloudWatch log stream:', error);
  }
}


async function sendLogToCloudWatch(message) {
  const params = {
    logGroupName,
    logStreamName,
    logEvents: [
      {
        message,
        timestamp: Date.now(),
      },
    ],
  };

  try {
    const command = new PutLogEventsCommand(params);
    await cloudwatchlogs.send(command);
  } catch (error) {
    console.error('Error sending log to CloudWatch:', error);
  }
}


class CloudWatchStream extends Writable {
	_write(chunk, encoding, callback) {
	  sendLogToCloudWatch(chunk.toString().trim())
		.then(() => {
		 
		  callback();
		})
		.catch((err) => {
		  
		  console.error('Error sending log to CloudWatch:', err);
		  callback(err); 
		});
	}
  }
  

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.Stream({
      stream: new CloudWatchStream(),  
    }),
  ],
});


createLogStream().then(() => {
  logger.info('Log stream check completed.');
}).catch((error) => {
  logger.error('Error during log stream initialization:', error);
});


export default logger;
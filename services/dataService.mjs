import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import logger from '../middleware/logger.mjs';

// Configure connection to DynamoDB
const dynamoDB = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const tableName = process.env.DYNAMODB_TABLE_NAME;

// Save data with retry logic
export const saveWithRetry = async (params, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            logger.info(`Attempt ${i + 1} to save data to DynamoDB.`);
            const command = new PutItemCommand(params);
            await dynamoDB.send(command);
            logger.info('Data successfully saved to DynamoDB.', { item: params.Item });
            return; // Successful save, exit the loop
        } catch (error) {
            logger.error(`Attempt ${i + 1} failed. Error: ${error.message}`);
            if (i === maxRetries - 1) {
                logger.error('All attempts to save data to DynamoDB have failed.');
                throw error; // All attempts exhausted, throw the error
            }
        }
    }
};

// Main function to save data to DynamoDB
export const saveDataToDatabase = async (data) => {
    const id = `${data.deviceId}_${data.board}`;
    const timestamp = data.timestamp;

    logger.info(`Processing data for saving. Generated ID: ${id}, Timestamp: ${timestamp}`);

    // Parameters for saving
    const params = {
        TableName: tableName,
        Item: {
            id: { S: id }, // Partition key
            timestamp: { N: timestamp.toString() }, // Sort key
            deviceId: { S: data.deviceId },
            board: { N: data.board.toString() },
            START_FEN: { S: data.START_FEN },
            moves: { S: data.moves },
            fen: { S: data.fen },
            lastMove: { S: data.lastMove },
            greedy: { BOOL: data.greedy },
            createdAt: { S: new Date().toISOString() },
        },
    };

    logger.info(`Saving data to DynamoDB with ID: ${id}, Timestamp: ${timestamp}`);
    try {
        await saveWithRetry(params);
        logger.info(`Data successfully saved with ID: ${id}, Timestamp: ${timestamp}`);
    } catch (error) {
        logger.error(`Failed to save data with ID: ${id}, Timestamp: ${timestamp}. Error: ${error.message}`);
        throw error;
    }
};
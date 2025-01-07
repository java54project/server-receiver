
import net from 'net';
import logger from './middleware/logger.mjs';
import { validateData } from './validation/validation.mjs';
import { saveDataToDatabase } from './services/dataService.mjs';
import { ValidationError, DuplicateError, DatabaseError } from './errors.mjs';
import dotenv from 'dotenv';



dotenv.config();



const region = process.env.AWS_REGION;
if (!region) {
	throw new Error('AWS_REGION environment variable is required');
}


const PORT = process.env.PORT || 3000;
const CONNECTION_TIMEOUT = Number(process.env.CONNECTION_TIMEOUT) || 60000;


const server = net.createServer((socket) => {
	logger.info('Client connected');


	socket.setTimeout(CONNECTION_TIMEOUT);


	socket.on('data', async (data) => {
    	try {
        	const parsedData = JSON.parse(data.toString());
        	logger.info('Data received, validating...');
        	await validateData(parsedData);
        	logger.info('Data validation successful');
        	logger.info('Saving data to DynamoDB...');
        	await saveDataToDatabase(parsedData);
        	logger.info('Data successfully saved to DynamoDB', { data: parsedData }); 
		    socket.write('OK');
		    socket.end();


    	} catch (error) {
        	if (error instanceof ValidationError) {
            	logger.warn('Validation error occurred', { error: error.message });
        	} else if (error instanceof DuplicateError) {
            	logger.warn('Duplicate entry error', { error: error.message });
        	} else if (error instanceof DatabaseError) {
            	logger.error('Database error occurred', { error: error.message });
        	} else {
            	logger.error('Unexpected error occurred', { error: error.message });
        	}
        	socket.end();
    	}
	});


	socket.on('end', () => {
    	logger.info('Client disconnected');
	});


	socket.on('timeout', () => {
    	logger.warn('Connection timed out');
    	socket.end();
	});


	socket.on('error', (err) => {
    	logger.error('Socket error', { error: err.message });
	});
});


server.listen(PORT, '0.0.0.0', () => {
	logger.info(`TCP Server is running on port ${PORT}`);
});




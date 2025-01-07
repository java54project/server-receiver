import Joi from 'joi';
import { ValidationError } from '../errors.mjs';


// Schema for the new data structure
const dataSchema = Joi.object({
	deviceId: Joi.string().required(), // Device ID (chessclub ID)
	board: Joi.number().integer().min(1).required(), // Board number in chessclub
	START_FEN: Joi.string().required(), // Starting FEN position
	moves: Joi.string().required(), // Moves as a string
	fen: Joi.string().required(), // Current FEN position
	lastMove: Joi.string().required(), // Last move in algebraic notation
	greedy: Joi.boolean().required(), // Boolean flag indicating greedy behavior
	timestamp: Joi.number().integer().min(0).required(), // Timestamp in milliseconds
});


// Validation function
export const validateData = async (data) => {
	const { error } = await dataSchema.validateAsync(data);
	if (error) {
    	throw new ValidationError(`Validation failed: ${error.details.map((x) => x.message).join(', ')}`);
	}
};

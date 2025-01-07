export class ValidationError extends Error {
	constructor(message) {
    	super(message);
    	this.name = 'ValidationError';
	}
}


export class DuplicateError extends Error {
	constructor(message) {
    	super(message);
    	this.name = 'DuplicateError';
	}
}


export class DatabaseError extends Error {
	constructor(message) {
    	super(message);
    	this.name = 'DatabaseError';
	}
}

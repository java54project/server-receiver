const net = await import('net');


const message = JSON.stringify({
	deviceId: "chessclubID123",
	board: 1,
	START_FEN: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
	moves: "e2e4 e7e5 g1f3",
	fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
	lastMove: "g1f3",
	greedy: true,
	timestamp: 1672531199000
});


const client = net.createConnection({ host: '18.116.115.19', port: 3000 }, () => {
	console.log('Connected to server!');
	console.log('Sending message:', message);
	client.write(message, 'utf8', () => {
    	console.log('Message sent');
	});
});


client.on('data', (data) => {
	console.log('Received from server:', data.toString());
	client.end();
});


client.on('end', () => {
	console.log('Disconnected from server');
});


client.on('error', (err) => {
	console.error('Error in connection:', err.message);
});



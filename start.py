import lobby
server = lobby.Object()
started = 1		
while 1:
	try:
		if started:
			print('start server')
		started = server.start(sock) 
		if started:
			print('game stopped')
	except KeyboardInterrupt:
		for conn in server.conns:
			conn.close()
		break
	del server.conns[:]
print('Goodbye')
	
	
import lobby
server = lobby.Object()
started = 1
while 1:
	try:
		if started:
			print('start server')
		started = server.start() 
		if started:
			print('game stopped')
	except KeyboardInterrupt:
		break
print('Goodbye')
	
	
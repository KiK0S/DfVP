import socket
import handler
import time
import constants
num_players = int(input())
ports = range(9090, 9090 + num_players)
conns = []
for port in ports:
	sock = socket.socket()
	print('binding')
	sock.bind(('', port))
	sock.settimeout(None)
	sock.listen(1)
	print('accepting')
	conn = sock.accept()[0]
	print('OK')
	conns.append(conn)
hand = handler.Object()
data = ''    
while True:
    for conn in conns:
    	data = conn.recv(1024).decode('ascii')
    	if not data == '\n' and not data == '': 
    		for s in data.split('\n'):
    			if s == constants.STR_K:
    				break
    			#print(s)	
    			a, b, c = s.split(';')
    			hand.handle(a, b, c)
    hand.update()
    for conn in conns:
    	conn.send((hand.get() + constants.STR_K).encode('ascii'))
    if hand.end == 2:
    	break
    hand.clear()
    time.sleep(1 / constants.FPS)
for conn in conns:	
	conn.close()

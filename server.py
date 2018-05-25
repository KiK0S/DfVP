import socket
import handler
import time
import constants
sock = socket.socket()
ports = [9090]
conns = []
for port in ports:
	sock.bind(('localhost', int(port)))
	sock.listen(1)
	conn = sock.accept()[0]
	conns.append(conn)
hand = handler.Object()
data = ''    
while True:
    for conn in conns:
    	print('get query')
    	data = conn.recv(1024).decode('ascii')
    	print('got query')
    	if not data == '\n' and not data == '': 
    		print('process query')	
    		for s in data.split('\n'):
    			if s == '':
    				continue
    			#print(s)	
    			a, b, c = s.split(';')
    			hand.handle(a, b, c)
    print('draw')
    hand.update()
    for conn in conns:
    	print('send query')
    	conn.send(hand.get().encode('ascii'))
    time.sleep(1 / constants.FPS)
	
conn.close()

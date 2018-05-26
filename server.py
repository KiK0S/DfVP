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
    	data = conn.recv(1024).decode('ascii')
    	if not data == '\n' and not data == '': 
    		for s in data.split('\n'):
    			if s == 'kek':
    				break
    			#print(s)	
    			a, b, c = s.split(';')
    			hand.handle(a, b, c)
    hand.update()
    for conn in conns:
    	conn.send((hand.get() + 'kek').encode('ascii'))
    time.sleep(1 / constants.FPS)
	
conn.close()

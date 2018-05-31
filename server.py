import socket
import handler
import time
import constants
import pygame
import sys
port = 9090
num_of_players = int(sys.argv[1])
conns = []
sock = socket.socket()
sock.bind(('', port))	
sock.listen(num_of_players)  
sock.settimeout(None)
for i in range(num_of_players):
	conn = sock.accept()[0]
	conn.send(str(i).encode('ascii'))
	conns.append(conn)
hand = handler.Object()
data = ''    
clock = pygame.time.Clock()
while True:              
    for conn in conns:
    	data = conn.recv(1024).decode('ascii')
    	if not data == '\n' and not data == '': 
    		for s in data.split('\n'):
    			if s == constants.STR_K:
    				break
    			a, b, c = s.split(';')
    			hand.handle(a, b, c)
    hand.update()
    for conn in conns:
    	conn.send((hand.get() + constants.STR_K).encode('ascii'))
    if hand.end == 2:
    	break
    hand.clear()
    clock.tick(constants.FPS)
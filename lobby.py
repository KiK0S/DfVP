import pygame
import constants
import socket
import server
import sys

port = 9090
sock = socket.socket()
sock.bind(('', port))	
sock.listen(constants.MAXPLAYER)  
sock.settimeout(None)
conns = []
conn = sock.accept()[0]
conns.append(conn)
conn.send(str(len(conns) - 1).encode('ascii'))
while len(conns) < constants.MAXPLAYER:
	sock.settimeout(0.1)
	try:
		conn = sock.accept()[0]
		conns.append(conn)
		conn.send(str(len(conns) - 1).encode('ascii'))
	except Exception:
		pass
	start = 0
	for conn in conns:
		s = conn.recv(1024).decode('ascii')
		if s == constants.START:
			start = 1
			break
	if start:
		for conn in conns:
			conn.send(constants.START.encode('ascii'))
		break	
	for conn in conns:
		conn.send('check'.encode('ascii'))
	                       
server.run(conns)
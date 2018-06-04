import pygame
import constants
import socket
import server
import sys

class Object:
	def __init__(self):
		pass

	def start(self):
		port = constants.PORT
		sock = socket.socket()
		sock.bind(('', port))	
		sock.listen(constants.MAXPLAYER)  
		sock.settimeout(0.1)
		conns = []
		got = 0
		while not got:
			try:
				conn = sock.accept()[0]
				conns.append(conn)
				conn.send(str(len(conns) - 1).encode('ascii'))
				got = 1
			except socket.timeout:
				return 0
		while len(conns) < constants.MAXPLAYER:
			try:
				conn = sock.accept()[0]
				conns.append(conn)
				conn.send(str(len(conns) - 1).encode('ascii'))
			except socket.timeout:
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
		for conn in conns:
			conn.close()
		return 1	

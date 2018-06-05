import pygame
import constants
import socket
import server
import sys

class Object:
	def __init__(self):
		self.sock = socket.socket()
		port = constants.PORT
		self.sock.bind(('', port))	
		self.sock.listen(constants.MAXPLAYER)  
		self.sock.settimeout(1)
	
	def start(self):
		self.conns = []
		got = 0
		while not got:
			try:
				conn = self.sock.accept()[0]
				self.conns.append(conn)
				conn.send(str(len(self.conns) - 1).encode('ascii'))
				got = 1
			except socket.timeout:
				return 0
		while len(self.conns) < constants.MAXPLAYER:
			try:
				conn = self.sock.accept()[0]
				self.conns.append(conn)
				conn.send(str(len(self.conns) - 1).encode('ascii'))
			except socket.timeout:
				pass
			start = 0
			_del = []
			iter = 0
			for conn in self.conns:
				s = conn.recv(1024).decode('ascii')
				if s == constants.START:
					start = 1
					break
				if s == constants.STR_END:
					_del.append(iter)
				iter += 1
			for it in _del:
				conns[it].close()
				dell conns[it]
			if start:
				for conn in self.conns:
					conn.send(constants.START.encode('ascii'))
				break	
			for conn in self.conns:
				conn.send(constants.STR_CHECK.encode('ascii'))
		server.run(self.conns)
		for conn in self.conns:
			conn.close()
		return 1	
